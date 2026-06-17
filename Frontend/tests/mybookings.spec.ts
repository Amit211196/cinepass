import { expect, test, type Page } from '@playwright/test';

async function loginAsUser(page: Page) {
	await page.goto('/login');
	await page.locator('input[placeholder="name@example.com"]').fill('user@cinepass.com');
	await page.locator('input[placeholder="••••••••"]').first().fill('user123');
	await page.getByRole('button', { name: 'Sign In' }).click();
	await expect(page).toHaveURL('/');
}

async function createSingleBooking(page: Page) {
	await page.goto('/');
	await page.getByRole('button', { name: 'Book Tickets' }).first().click();
	await expect(page).toHaveURL(/\/movies\//);

	await page.locator('.showtime-card').first().click();
	await expect(page).toHaveURL(/\/book\//);

	const seat = page.locator('button.seat.seat-available').first();
	await expect(seat).toBeVisible();
	await seat.click();

	await page.getByRole('button', { name: 'Book Seats' }).click();
	await expect(page).toHaveURL('/confirm-booking');

	await page.getByRole('button', { name: 'Confirm & Book' }).click();
	await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible();
}

test.describe('My Bookings page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => {
			window.localStorage.clear();
		});
		await page.reload();
	});

	test('redirects unauthenticated users to login when opening my bookings', async ({ page }) => {
		await page.goto('/my-bookings');

		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
	});

	test('shows empty-state for logged-in user with no bookings', async ({ page }) => {
		await loginAsUser(page);
		await page.goto('/my-bookings');

		await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'No Bookings Found' })).toBeVisible();
		await expect(page.getByText("You haven't booked any movie tickets yet.")).toBeVisible();
	});

	test('displays booking cards and allows cancelling a confirmed booking', async ({ page }) => {
		await loginAsUser(page);
		await createSingleBooking(page);

		await page.goto('/my-bookings');
		await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();

		const firstBookingCard = page.locator('.booking-card').first();
		await expect(firstBookingCard).toBeVisible();
		await expect(firstBookingCard.locator('.booking-status-badge.confirmed')).toBeVisible();
		await expect(firstBookingCard.getByRole('button', { name: 'Cancel Reservation' })).toBeVisible();

		page.once('dialog', (dialog) => dialog.accept());
		await firstBookingCard.getByRole('button', { name: 'Cancel Reservation' }).click();

		await expect(firstBookingCard.locator('.booking-status-badge.cancelled')).toBeVisible();
		await expect(firstBookingCard.getByRole('button', { name: 'Cancel Reservation' })).toHaveCount(0);
	});
});
