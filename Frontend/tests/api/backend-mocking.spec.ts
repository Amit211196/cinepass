import { expect, test } from '@playwright/test';

test.describe('API-mocking style checks for backend-connected mode', () => {
  test('can mock auth and movies endpoints with Playwright routes', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'mock-jwt-token' }),
      });
    });

    await page.route('**/api/movies', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 101,
            title: 'Mocked API Movie',
            genre: 'ACTION',
            releaseDate: '2026-10-20',
          },
        ]),
      });
    });

    await page.goto('/');

    const token = await page.evaluate(async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'mock@cinepass.com', password: 'mock123' }),
      });
      const data = await response.json();
      return data.token;
    });

    expect(token).toBe('mock-jwt-token');

    const moviePayload = await page.evaluate(async () => {
      const response = await fetch('/api/movies');
      return response.json();
    });

    expect(moviePayload).toEqual([
      {
        id: 101,
        title: 'Mocked API Movie',
        genre: 'ACTION',
        releaseDate: '2026-10-20',
      },
    ]);
  });
});
