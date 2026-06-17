import { test, expect } from '@playwright/test';

const sampleMovie = {
  id: 'movie-interstellar',
  title: 'Interstellar',
  genre: 'SCI_FI',
  durationMins: 169,
  rating: 'U/A',
  posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
  castText: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
  createdAt: new Date().toISOString(),
};

const sampleShowtimes = [
  {
    id: 'st-interstellar-1',
    movieId: 'movie-interstellar',
    theatreName: 'PVR Cinemas',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '18:30',
    ticketPrice: 250,
    createdAt: new Date().toISOString(),
  },
];

test.describe('Navigation flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/movies', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([sampleMovie]),
      });
    });

    await page.route('**/api/movies/movie-interstellar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleMovie),
      });
    });

    await page.route('**/api/showtimes/movie/movie-interstellar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleShowtimes),
      });
    });
  });

  test('navbar links navigate correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Movies' })).toBeVisible();
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();

    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    await page.getByRole('link', { name: 'Movies' }).click();
    await expect(page).toHaveURL(/\//);
    await expect(page.getByRole('heading', { name: 'CinePass' })).toBeVisible();
  });

  test('movie card opens detail page and back navigation works', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /book tickets/i }).click();
    await expect(page).toHaveURL(/\/movies\/movie-interstellar/);
    await expect(page.getByText('Available Showtimes')).toBeVisible();

    await page.getByRole('link', { name: /back to movies/i }).click();
    await expect(page).toHaveURL(/\//);
    await expect(page.getByRole('heading', { name: 'CinePass' })).toBeVisible();
  });
});
