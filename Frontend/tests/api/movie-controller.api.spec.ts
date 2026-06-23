import { expect, test, type APIRequestContext } from '@playwright/test';

type AuthResponse = {
	token: string;
};

type MovieSummary = {
	id: string;
	title: string;
	genre: string;
	releaseDate: string;
	posterUrl?: string;
};

type MovieDetail = {
	id: string;
	title: string;
	description: string;
	genre: string;
	releaseDate: string;
	showTimes: unknown[];
};

const TEST_PASSWORD = 'playwright123';

async function registerAndLoginUser(request: APIRequestContext, namePrefix = 'Viewer User') {
	const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const email = `playwright.movies.${suffix}@cinepass.test`;

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

	return { token: loginBody.token, email };
}

async function loginAsAdmin(request: APIRequestContext) {
	const loginResponse = await request.post('/api/auth/login', {
		data: {
			email: 'admin@cinepass.com',
			password: 'admin123',
		},
	});

	expect(loginResponse.ok()).toBeTruthy();
	const loginBody = (await loginResponse.json()) as AuthResponse;
	expect(loginBody.token).toBeTruthy();

	return loginBody.token;
}

async function getAnyMovieId(request: APIRequestContext) {
	const response = await request.get('/api/movies');
	expect(response.ok()).toBeTruthy();

	const movies = (await response.json()) as MovieSummary[];
	expect(movies.length).toBeGreaterThan(0);
	return movies[0].id;
}

function buildMoviePayload() {
	const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
	return {
		title: `Playwright Movie ${suffix}`,
		description: 'Movie created by Playwright API test',
		genre: 'ACTION',
		releaseDate: '2027-01-15',
		posterUrl: 'https://example.com/poster.jpg',
	};
}

test.describe('Movie controller API contract tests', () => {
	test('GET /api/movies returns array payload', async ({ request }) => {
		const response = await request.get('/api/movies');

		expect(response.status()).toBe(200);
		const body = (await response.json()) as unknown;
		expect(Array.isArray(body)).toBeTruthy();
	});

	test('GET /api/movies/{id} returns movie details', async ({ request }) => {
		const movieId = await getAnyMovieId(request);

		const response = await request.get(`/api/movies/${movieId}`);
		expect(response.status()).toBe(200);

		const movie = (await response.json()) as MovieDetail;
		expect(movie.id).toBe(movieId);
		expect(movie.title).toBeTruthy();
		expect(typeof movie.description).toBe('string');
		expect(Array.isArray(movie.showTimes)).toBeTruthy();
	});

	test('POST /api/movies rejects non-admin user', async ({ request }) => {
		const user = await registerAndLoginUser(request);

		const response = await request.post('/api/movies', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
			data: buildMoviePayload(),
		});

		expect(response.status()).toBe(403);
	});

	test('POST /api/movies creates movie for admin', async ({ request }) => {
		const adminToken = await loginAsAdmin(request);
		const payload = buildMoviePayload();

		const response = await request.post('/api/movies', {
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			data: payload,
		});

		expect(response.status()).toBe(200);
		const created = (await response.json()) as MovieSummary;
		expect(created.id).toBeTruthy();
		expect(created.title).toBe(payload.title);
		expect(created.genre).toBe(payload.genre);
		expect(created.releaseDate).toBe(payload.releaseDate);
	});

	test('PUT /api/movies/{id} updates movie for admin', async ({ request }) => {
		const adminToken = await loginAsAdmin(request);

		const createPayload = buildMoviePayload();
		const createResponse = await request.post('/api/movies', {
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			data: createPayload,
		});

		expect(createResponse.status()).toBe(200);
		const created = (await createResponse.json()) as MovieSummary;

		const updatePayload = {
			title: `${createPayload.title} Updated`,
			description: 'Updated by Playwright API test',
			genre: 'THRILLER',
			releaseDate: '2027-02-20',
		};

		const updateResponse = await request.put(`/api/movies/${created.id}`, {
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			data: updatePayload,
		});

		expect(updateResponse.status()).toBe(200);
		const updated = (await updateResponse.json()) as MovieDetail;
		expect(updated.id).toBe(created.id);
		expect(updated.title).toBe(updatePayload.title);
		expect(updated.description).toBe(updatePayload.description);
		expect(updated.genre).toBe(updatePayload.genre);
		expect(updated.releaseDate).toBe(updatePayload.releaseDate);
	});

	test('DELETE /api/movies/{id} soft-deletes movie for admin', async ({ request }) => {
		const adminToken = await loginAsAdmin(request);

		const createResponse = await request.post('/api/movies', {
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
			data: buildMoviePayload(),
		});

		expect(createResponse.status()).toBe(200);
		const created = (await createResponse.json()) as MovieSummary;

		const deleteResponse = await request.delete(`/api/movies/${created.id}`, {
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});

		expect(deleteResponse.status()).toBe(200);

		const listResponse = await request.get('/api/movies');
		expect(listResponse.status()).toBe(200);
		const movies = (await listResponse.json()) as MovieSummary[];

		const deletedMovie = movies.find((movie) => movie.id === created.id);
		expect(deletedMovie).toBeFalsy();
	});
});
