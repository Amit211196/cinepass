import { test, expect } from '@playwright/test';

const sampleMovies = [
  {
    id: 'movie-interstellar',
    title: 'Interstellar',
    genre: 'SCI_FI',
    durationMins: 169,
    rating: 'U/A',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    castText: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'movie-lionking',
    title: 'The Lion King',
    genre: 'ANIMATION',
    durationMins: 118,
    rating: 'U',
    posterUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=600&auto=format&fit=crop',
    synopsis: 'A young lion prince, Simba, flees his kingdom after his father\'s death and learns bravery.',
    castText: 'Donald Glover, Beyoncé Knowles-Carter, James Earl Jones, Seth Rogen',
    createdAt: new Date().toISOString(),
  },
];

test.describe('Home genre filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/movies', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleMovies),
      });
    });
  });

  test('shows all movies when All is selected', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'All' })).toHaveClass(/active/);
    await expect(page.getByText('Interstellar')).toBeVisible();
    await expect(page.getByText('The Lion King')).toBeVisible();
  });

  test('filters movies by genre button selection', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Animation' }).click();
    await expect(page.getByText('The Lion King')).toBeVisible();
    await expect(page.getByText('Interstellar')).toBeHidden();
  });
});
