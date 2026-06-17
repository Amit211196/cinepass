import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => {
		window.localStorage.clear();
	});
	await page.reload();
	await expect(page.getByRole('heading', { name: 'CinePass' })).toBeVisible();
	await expect(page.locator('.movie-card').first()).toBeVisible();
});

test('shows landing page filter options', async ({ page }) => {
	await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Sci-Fi' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Animation' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Action' })).toBeVisible();
	await expect(page.locator('input[placeholder="Search movies or genres..."]')).toBeVisible();
});

test('filters movie cards by genre selection', async ({ page }) => {
	await page.getByRole('button', { name: 'Animation' }).click();

	const cards = page.locator('.movie-card');
	await expect(cards).toHaveCount(2);

	const genres = page.locator('.movie-card .movie-card-genre');
	await expect(genres).toHaveText(['Animation', 'Animation']);
});

test('filters movie cards by search input', async ({ page }) => {
	const searchInput = page.locator('input[placeholder="Search movies or genres..."]');
	await searchInput.fill('inception');

	const cards = page.locator('.movie-card');
	await expect(cards).toHaveCount(1);
	await expect(page.locator('.movie-card-title')).toContainText('Inception');
});

test('applies combined genre and search filters', async ({ page }) => {
	await page.getByRole('button', { name: 'Sci-Fi' }).click();

	const searchInput = page.locator('input[placeholder="Search movies or genres..."]');
	await searchInput.fill('interstellar');

	const cards = page.locator('.movie-card');
	await expect(cards).toHaveCount(1);
	await expect(page.locator('.movie-card-title')).toContainText('Interstellar');
	await expect(page.locator('.movie-card-genre')).toContainText('Sci-Fi');
});

test('shows empty state when no movies match filters', async ({ page }) => {
	const searchInput = page.locator('input[placeholder="Search movies or genres..."]');
	await searchInput.fill('zzzz-non-existent-movie');

	await expect(page.getByRole('heading', { name: 'No Movies Found' })).toBeVisible();
	await expect(page.getByText('zzzz-non-existent-movie')).toBeVisible();
	await expect(page.locator('.movie-card')).toHaveCount(0);
});
