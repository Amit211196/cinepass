import { expect, test } from '@playwright/test';

test.describe('Backend API contract tests', () => {
  test('register and login returns JWT token', async ({ request }) => {
    const email = `playwright.user.${Date.now()}@cinepass.test`;
    const password = 'playwright123';

    const registerResponse = await request.post('/api/auth/register', {
      data: {
        name: 'Playwright User',
        email,
        password,
      },
    });

    expect(registerResponse.ok()).toBeTruthy();
    const registerBody = (await registerResponse.json()) as { token?: string };
    expect(registerBody.token).toBeTruthy();

    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email,
        password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginBody = (await loginResponse.json()) as { token?: string };
    expect(loginBody.token).toBeTruthy();
  });

  test('movies list endpoint responds and returns array payload', async ({ request }) => {
    const response = await request.get('/api/movies');

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('movie create endpoint rejects missing admin authorization', async ({ request }) => {
    const response = await request.post('/api/movies', {
      data: {
        title: `Playwright Movie ${Date.now()}`,
        description: 'Created during API test',
        genre: 'ACTION',
        releaseDate: '2026-12-25',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('non-admin token cannot create movies', async ({ request }) => {
    const email = `playwright.viewer.${Date.now()}@cinepass.test`;
    const password = 'playwright123';

    await request.post('/api/auth/register', {
      data: {
        name: 'Viewer User',
        email,
        password,
      },
    });

    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email,
        password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginBody = (await loginResponse.json()) as { token: string };

    const createResponse = await request.post('/api/movies', {
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
      data: {
        title: `Playwright Restricted ${Date.now()}`,
        description: 'This should fail for non-admin user',
        genre: 'THRILLER',
        releaseDate: '2026-12-20',
      },
    });

    expect(createResponse.status()).toBe(403);
  });
});
