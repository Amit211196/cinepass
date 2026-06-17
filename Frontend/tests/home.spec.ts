import { test, expect } from '@playwright/test';

test('Home page loads', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByRole('heading', { name: 'CinePass' })).toBeVisible();
});