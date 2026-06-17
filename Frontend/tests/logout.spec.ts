import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
	await page.goto('/login');
	await page.locator('input[placeholder="name@example.com"]').fill(email);
	await page.locator('input[placeholder="••••••••"]').first().fill(password);
	await page.getByRole('button', { name: 'Sign In' }).click();
	await expect(page).toHaveURL('/');
}

test.describe('CinePass logout', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => {
			window.localStorage.clear();
		});
		await page.reload();
	});

	test('logs out standard user and shows logged-out navigation state', async ({ page }) => {
		await login(page, 'user@cinepass.com', 'user123');

		await expect(page.getByText('John Doe')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

		await page.getByRole('button', { name: 'Logout' }).click();

		await expect(page).toHaveURL('/');
		await expect(page.getByRole('button', { name: 'Logout' })).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Login / Register' })).toBeVisible();
		await expect(page.getByText('John Doe')).toHaveCount(0);
	});

	test('blocks protected route after logout', async ({ page }) => {
		await login(page, 'user@cinepass.com', 'user123');
		await expect(page.getByRole('link', { name: 'My Bookings' })).toBeVisible();

		await page.getByRole('button', { name: 'Logout' }).click();
		await expect(page.getByRole('link', { name: 'Login / Register' })).toBeVisible();

		await page.goto('/my-bookings');
		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
	});

	test('logs out admin user and hides admin access', async ({ page }) => {
		await login(page, 'admin@cinepass.com', 'admin123');

		await expect(page.getByText('Admin User')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Admin Panel' })).toBeVisible();

		await page.getByRole('button', { name: 'Logout' }).click();

		await expect(page).toHaveURL('/');
		await expect(page.getByRole('link', { name: 'Admin Panel' })).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Logout' })).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Login / Register' })).toBeVisible();

		await page.goto('/admin');
		await expect(page).toHaveURL(/\/login$/);
	});
});
