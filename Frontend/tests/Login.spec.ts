import { expect, test } from '@playwright/test';

test.describe('CinePass login', () => {
	test.beforeEach(async ({ page }) => {
		// Ensure predictable auth and seeded users for each test run.
		await page.goto('/');
		await page.evaluate(() => {
			window.localStorage.clear();
		});
		await page.reload();
	});

	test('logs in with valid user credentials', async ({ page }) => {
		await page.goto('/login');

		await page.locator('input[placeholder="name@example.com"]').fill('user@cinepass.com');
		await page.locator('input[placeholder="••••••••"]').first().fill('user123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/');
		await expect(page.getByText('John Doe')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
	});

	test('shows error for invalid credentials', async ({ page }) => {
		await page.goto('/login');

		await page.locator('input[placeholder="name@example.com"]').fill('invalid@cinepass.com');
		await page.locator('input[placeholder="••••••••"]').first().fill('wrong-password');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByText('Invalid email or password')).toBeVisible();
		await expect(page).toHaveURL('/login');
	});
});

