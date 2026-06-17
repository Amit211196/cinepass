import { test, expect } from '@playwright/test';

const demoUser = {
  token: 'fake-token-123',
  user: {
    id: 'user-123',
    email: 'user@cinepass.com',
    name: 'John Doe',
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
};

test.describe('Bookings pages', () => {
  test('redirects unauthenticated users from My Bookings to login', async ({ page }) => {
    await page.goto('/my-bookings');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('authenticated users can access My Bookings and see bookings', async ({ page }) => {
    await page.context().addInitScript((user) => {
      window.localStorage.setItem('cinepass_current_user', JSON.stringify(user));
    }, demoUser);

    await page.route('**/bookings/mine', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'booking-1',
            userId: 'user-123',
            showtimeId: 'st-interstellar-1',
            bookedAt: new Date().toISOString(),
            status: 'CONFIRMED',
            totalPrice: 500,
            seatCodes: ['A4', 'A5'],
            movieTitle: 'Interstellar',
            moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
            theatreName: 'PVR Cinemas',
            showDate: new Date().toISOString().split('T')[0],
            showTime: '18:30',
          },
        ]),
      });
    });

    await page.goto('/my-bookings');

    await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
    await expect(page.getByText('Interstellar')).toBeVisible();
    await expect(page.getByText('PVR Cinemas')).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel reservation/i })).toBeVisible();
  });
});
