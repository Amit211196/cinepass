import { test, expect } from '@playwright/test';

test('Logout logs out user and shows login link', async ({ page }) => {
  // Seed a fake logged-in session before the app loads
  await page.addInitScript(() => {
    localStorage.setItem('cinepass_current_user', JSON.stringify({
      token: 'fake-token',
      user: {
        id: 'user-1',
        email: 'user@cinepass.com',
        name: 'John Doe',
        isAdmin: false,
        createdAt: new Date().toISOString(),
      }
    }));
  });

  await page.goto('/');
  // Confirm logout button is visible for authenticated user
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  await page.getByRole('button', { name: /logout/i }).click();
  // After logout, login link should be visible again
  await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
});
