import { expect, test, type Page } from '@playwright/test';

async function loginAsUser(page: Page) {
	await page.locator('input[placeholder="name@example.com"]').fill('user@cinepass.com');
	await page.locator('input[placeholder="••••••••"]').first().fill('user123');
	await page.getByRole('button', { name: 'Sign In' }).click();
}

async function goToSeatSelection(page: Page) {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'CinePass' })).toBeVisible();

	await page.getByRole('button', { name: 'Book Tickets' }).first().click();
	await expect(page).toHaveURL(/\/movies\//);

	await page.locator('.showtime-card').first().click();
	await expect(page).toHaveURL(/\/book\//);
}

async function selectFirstAvailableSeat(page: Page) {
	const seat = page.locator('button.seat.seat-available').first();
	await expect(seat).toBeVisible();
	const title = (await seat.getAttribute('title')) || '';

	await seat.click();

	const seatCode = title.replace('Seat ', '').trim();
	if (seatCode) {
		await expect(page.locator('.seat-badge', { hasText: seatCode })).toBeVisible();
	}
}

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => {
		window.localStorage.clear();
	});
	await page.reload();
});

test('redirects unauthenticated user to login before booking and returns to seat page', async ({ page }) => {
	await goToSeatSelection(page);
	await selectFirstAvailableSeat(page);

	await page.getByRole('button', { name: 'Login to Book' }).click();
	await expect(page).toHaveURL(/\/login$/);

	await loginAsUser(page);
	await expect(page).toHaveURL(/\/book\//);

	await expect(page.getByRole('button', { name: 'Book Seats' })).toBeVisible();
	await expect(page.locator('.selected-seats-badge-list .seat-badge')).toHaveCount(1);
});

test('authenticated user can complete booking and view it in booking history', async ({ page }) => {
	await goToSeatSelection(page);
	await selectFirstAvailableSeat(page);

	await page.getByRole('button', { name: 'Login to Book' }).click();
	await expect(page).toHaveURL(/\/login$/);

	await loginAsUser(page);
	await expect(page).toHaveURL(/\/book\//);

	await page.getByRole('button', { name: 'Book Seats' }).click();
	await expect(page).toHaveURL('/confirm-booking');

	await expect(page.getByRole('heading', { name: 'Review Your Order' })).toBeVisible();
	await page.getByRole('button', { name: 'Confirm & Book' }).click();

	await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible();
	await page.getByRole('link', { name: 'View My Bookings' }).click();

	await expect(page).toHaveURL('/my-bookings');
	await expect(page.locator('.booking-card').first()).toBeVisible();
	await expect(page.locator('.booking-status-badge.confirmed').first()).toBeVisible();
});
