import { test, expect } from '@playwright/test';

test('homepage title and heading are correct', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/CinePass/i);
  await expect(page.getByRole('heading', { name: 'CinePass' })).toBeVisible();
});
