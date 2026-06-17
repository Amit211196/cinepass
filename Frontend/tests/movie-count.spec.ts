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
  {
    id: 'movie-inception',
    title: 'Inception',
    genre: 'SCI_FI',
    durationMins: 148,
    rating: 'U/A',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
    synopsis: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    castText: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy',
    createdAt: new Date().toISOString(),
  },
];

test('renders the correct number of movies on the homepage', async ({ page }) => {
  await page.route('**/api/movies', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sampleMovies),
    });
  });

  await page.goto('/');

  await expect(page.locator('.movie-card')).toHaveCount(sampleMovies.length);
  await expect(page.getByText('Interstellar')).toBeVisible();
  await expect(page.getByText('The Lion King')).toBeVisible();
  await expect(page.getByText('Inception')).toBeVisible();
});
