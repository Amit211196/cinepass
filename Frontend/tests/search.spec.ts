import { test, expect } from '@playwright/test';

test('Search shows results', async ({ page }) => {
	await page.goto('/');
	await page.getByPlaceholder('Search movies or genres...').fill('Interstellar');
	await expect(page.getByText('Interstellar')).toBeVisible();
});