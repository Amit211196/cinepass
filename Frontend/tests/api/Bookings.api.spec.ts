import { expect, test, type APIRequestContext } from '@playwright/test';

type AuthResponse = {
	token: string;
};

type MovieResponse = {
	id: string;
};

type ShowtimeResponse = {
	id: string;
};

type BookingResponse = {
	id: string;
	userId: string;
	showtimeId: string;
	status: 'CONFIRMED' | 'CANCELLED';
	totalPrice: number | string;
	seatCodes: string[];
	customerEmail: string;
};

type CancelBookingResponse = {
	bookingId: string;
	status: 'CANCELLED';
	cancelledAt: string;
	message: string;
};

const TEST_PASSWORD = 'playwright123';

function generateSeatCode(prefix: string) {
	const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
	return `${prefix}${randomPart}`.slice(0, 10);
}

function generateUniqueSeatCodes(count: number) {
	const seats = new Set<string>();
	while (seats.size < count) {
		seats.add(generateSeatCode('S'));
	}
	return [...seats];
}

async function registerAndLogin(request: APIRequestContext, namePrefix = 'Playwright User') {
	const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const email = `playwright.booking.${suffix}@cinepass.test`;

	const registerResponse = await request.post('/api/auth/register', {
		data: {
			name: `${namePrefix} ${suffix}`,
			email,
			password: TEST_PASSWORD,
		},
	});

	expect(registerResponse.ok()).toBeTruthy();

	const loginResponse = await request.post('/api/auth/login', {
		data: {
			email,
			password: TEST_PASSWORD,
		},
	});

	expect(loginResponse.ok()).toBeTruthy();
	const loginBody = (await loginResponse.json()) as AuthResponse;
	expect(loginBody.token).toBeTruthy();

	return { email, token: loginBody.token };
}

async function getAnyShowtimeId(request: APIRequestContext) {
	const moviesResponse = await request.get('/api/movies');
	expect(moviesResponse.ok()).toBeTruthy();

	const movies = (await moviesResponse.json()) as MovieResponse[];
	expect(movies.length).toBeGreaterThan(0);

	for (const movie of movies) {
		const showtimesResponse = await request.get(`/api/showtimes/movie/${movie.id}`);
		expect(showtimesResponse.ok()).toBeTruthy();

		const showtimes = (await showtimesResponse.json()) as ShowtimeResponse[];
		if (showtimes.length > 0) {
			return showtimes[0].id;
		}
	}

	throw new Error('No showtimes are available for booking tests');
}

test.describe('Bookings API contract tests', () => {
	test('GET /api/showtimes/{showtimeId}/seats returns booked seats array', async ({ request }) => {
		const showtimeId = await getAnyShowtimeId(request);

		const response = await request.get(`/api/showtimes/${showtimeId}/seats`);
		expect(response.status()).toBe(200);

		const body = (await response.json()) as unknown;
		expect(Array.isArray(body)).toBeTruthy();
		for (const seat of body as unknown[]) {
			expect(typeof seat).toBe('string');
		}
	});

	test('GET /api/bookings/mine returns bookings for authenticated user', async ({ request }) => {
		const user = await registerAndLogin(request, 'Mine User');
		const showtimeId = await getAnyShowtimeId(request);
		const seatCode = generateSeatCode('M');

		const createResponse = await request.post('/api/bookings', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
			data: {
				showtimeId,
				seatCodes: [seatCode],
			},
		});

		expect(createResponse.status()).toBe(201);
		const createdBooking = (await createResponse.json()) as BookingResponse;

		const mineResponse = await request.get('/api/bookings/mine', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		expect(mineResponse.status()).toBe(200);
		const mineBookings = (await mineResponse.json()) as BookingResponse[];
		expect(Array.isArray(mineBookings)).toBeTruthy();

		const target = mineBookings.find((booking) => booking.id === createdBooking.id);
		expect(target).toBeTruthy();
		expect(target?.showtimeId).toBe(showtimeId);
		expect(target?.customerEmail).toBe(user.email);
		expect(target?.seatCodes).toContain(seatCode);
		expect(target?.status).toBe('CONFIRMED');
	});

	test('GET /api/bookings rejects unauthenticated access', async ({ request }) => {
		const response = await request.get('/api/bookings');
		expect([401, 403]).toContain(response.status());
	});

	test('GET /api/bookings forbids non-admin users', async ({ request }) => {
		const user = await registerAndLogin(request, 'Viewer User');

		const response = await request.get('/api/bookings', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		expect(response.status()).toBe(403);
	});

	test('POST /api/bookings creates booking and GET endpoints reflect it', async ({ request }) => {
		const user = await registerAndLogin(request, 'Booking User');
		const showtimeId = await getAnyShowtimeId(request);

		const seatCodes = generateUniqueSeatCodes(2);

		const createResponse = await request.post('/api/bookings', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
			data: {
				showtimeId,
				seatCodes,
			},
		});

		expect(createResponse.status()).toBe(201);
		const created = (await createResponse.json()) as BookingResponse;

		expect(created.id).toBeTruthy();
		expect(created.showtimeId).toBe(showtimeId);
		expect(created.status).toBe('CONFIRMED');
		expect(created.customerEmail).toBe(user.email);
		expect(created.seatCodes).toEqual([...seatCodes].sort());

		const myBookingsResponse = await request.get('/api/bookings/mine', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		expect(myBookingsResponse.ok()).toBeTruthy();
		const myBookings = (await myBookingsResponse.json()) as BookingResponse[];

		const createdInMine = myBookings.find((booking) => booking.id === created.id);
		expect(createdInMine).toBeTruthy();
		expect(createdInMine?.status).toBe('CONFIRMED');

		const seatsResponse = await request.get(`/api/showtimes/${showtimeId}/seats`);
		expect(seatsResponse.ok()).toBeTruthy();
		const bookedSeats = (await seatsResponse.json()) as string[];

		for (const seat of seatCodes) {
			expect(bookedSeats).toContain(seat);
		}
	});

	test('DELETE /api/bookings/{bookingId} cancels own booking', async ({ request }) => {
		const user = await registerAndLogin(request, 'Cancel User');
		const showtimeId = await getAnyShowtimeId(request);
		const seatCodes = generateUniqueSeatCodes(1);

		const createResponse = await request.post('/api/bookings', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
			data: {
				showtimeId,
				seatCodes,
			},
		});

		expect(createResponse.status()).toBe(201);
		const created = (await createResponse.json()) as BookingResponse;

		const cancelResponse = await request.delete(`/api/bookings/${created.id}`, {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		expect(cancelResponse.ok()).toBeTruthy();
		const cancelBody = (await cancelResponse.json()) as CancelBookingResponse;

		expect(cancelBody.bookingId).toBe(created.id);
		expect(cancelBody.status).toBe('CANCELLED');
		expect(cancelBody.cancelledAt).toBeTruthy();
		expect(cancelBody.message).toContain('cancelled');

		const myBookingsResponse = await request.get('/api/bookings/mine', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		expect(myBookingsResponse.ok()).toBeTruthy();
		const myBookings = (await myBookingsResponse.json()) as BookingResponse[];
		const cancelledBooking = myBookings.find((booking) => booking.id === created.id);

		expect(cancelledBooking).toBeTruthy();
		expect(cancelledBooking?.status).toBe('CANCELLED');
	});
});
