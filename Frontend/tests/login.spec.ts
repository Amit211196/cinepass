import { test, expect } from '@playwright/test';

test('Login page opens', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.getByRole('link', { name: /login/i }).click();
  await expect(page).toHaveURL(/.*/);
});
