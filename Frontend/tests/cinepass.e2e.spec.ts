import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Reset mock DB/session once, then reload so seed data is deterministic for each test.
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();
});

test('loads home page and displays movie catalog', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'CinePass' })).toBeVisible();
  await expect(page.locator('.movie-card')).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Book Tickets' }).first()).toBeVisible();
});

test('redirects unauthenticated users to login for protected route', async ({ page }) => {
  await page.goto('/my-bookings');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
});

test('allows standard user login and blocks admin route access', async ({ page }) => {
  await page.goto('/login');

  await page.locator('input[placeholder="name@example.com"]').fill('user@cinepass.com');
  await page.locator('input[placeholder="••••••••"]').first().fill('user123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('John Doe')).toBeVisible();

  await page.goto('/admin');
  await expect(page).toHaveURL('/');
  await expect(page.getByText('Admin Panel')).toHaveCount(0);
});

test('completes booking flow from seat selection to booking history', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Book Tickets' }).first().click();
  await expect(page).toHaveURL(/\/movies\//);

  await page.locator('.showtime-card').first().click();
  await expect(page).toHaveURL(/\/book\//);

  const seatA1 = page.locator('button[title="Seat A1"]');
  await expect(seatA1).toBeVisible();
  await seatA1.click();

  await page.getByRole('button', { name: 'Login to Book' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator('input[placeholder="name@example.com"]').fill('user@cinepass.com');
  await page.locator('input[placeholder="••••••••"]').first().fill('user123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/book\//);
  await expect(page.locator('.seat-badge', { hasText: 'A1' })).toBeVisible();

  await page.getByRole('button', { name: 'Book Seats' }).click();
  await expect(page).toHaveURL('/confirm-booking');

  await page.getByRole('button', { name: 'Confirm & Book' }).click();
  await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible();

  await page.getByRole('link', { name: 'View My Bookings' }).click();
  await expect(page).toHaveURL('/my-bookings');

  const latestBookingCard = page.locator('.booking-card').first();
  await expect(latestBookingCard).toBeVisible();
  await expect(latestBookingCard.locator('.booking-status-badge.confirmed')).toBeVisible();
  await expect(latestBookingCard.locator('.seat-badge', { hasText: 'A1' })).toBeVisible();
});
