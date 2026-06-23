import { expect, test, type Page } from '@playwright/test';

async function openRegisterTab(page: Page) {
	await page.goto('/login');
	await page.locator('.auth-tab', { hasText: 'Register' }).click();
	await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
}

async function fillRegisterForm(page: Page, data: {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}) {
	await page.locator('input[placeholder="John Doe"]').fill(data.name);
	await page.locator('input[placeholder="name@example.com"]').fill(data.email);

	const passwordInputs = page.locator('input[placeholder="••••••••"]');
	await passwordInputs.nth(0).fill(data.password);
	await passwordInputs.nth(1).fill(data.confirmPassword);
}

test.describe('CinePass registration', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => {
			window.localStorage.clear();
		});
		await page.reload();
	});

	test('registers a new user and signs in automatically', async ({ page }) => {
		const email = `register.${Date.now()}@cinepass.com`;
		const name = 'Playwright Register User';

		await openRegisterTab(page);
		await fillRegisterForm(page, {
			name,
			email,
			password: 'register123',
			confirmPassword: 'register123',
		});

		await page.getByRole('button', { name: 'Register Account' }).click();

		await expect(page).toHaveURL('/');
		await expect(page.getByText(name)).toBeVisible();
		await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
	});

	test('shows validation error when passwords do not match', async ({ page }) => {
		await openRegisterTab(page);
		await fillRegisterForm(page, {
			name: 'Mismatch User',
			email: `mismatch.${Date.now()}@cinepass.com`,
			password: 'register123',
			confirmPassword: 'register999',
		});

		await page.getByRole('button', { name: 'Register Account' }).click();

		await expect(page.getByText('Passwords do not match')).toBeVisible();
		await expect(page).toHaveURL('/login');
	});

	test('shows validation error when password is too short', async ({ page }) => {
		await openRegisterTab(page);
		await fillRegisterForm(page, {
			name: 'Short Password User',
			email: `short.${Date.now()}@cinepass.com`,
			password: '12345',
			confirmPassword: '12345',
		});

		await page.getByRole('button', { name: 'Register Account' }).click();

		await expect(page.getByText('Password must be at least 6 characters long')).toBeVisible();
		await expect(page).toHaveURL('/login');
	});

	test('shows error when email is already registered', async ({ page }) => {
		await openRegisterTab(page);
		await fillRegisterForm(page, {
			name: 'Existing User',
			email: 'user@cinepass.com',
			password: 'user123',
			confirmPassword: 'user123',
		});

		await page.getByRole('button', { name: 'Register Account' }).click();

		await expect(page.getByText('Email already registered')).toBeVisible();
		await expect(page).toHaveURL('/login');
	});
});
