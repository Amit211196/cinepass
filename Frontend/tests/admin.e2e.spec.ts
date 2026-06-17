import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();
});

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.locator('input[placeholder="name@example.com"]').fill('admin@cinepass.com');
  await page.locator('input[placeholder="••••••••"]').first().fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/');
}

test('admin user can access admin dashboard', async ({ page }) => {
  await loginAsAdmin(page);

  await expect(page.getByText('Admin Panel')).toBeVisible();
  await page.getByText('Admin Panel').click();

  await expect(page).toHaveURL('/admin');
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
});

test('admin can add and delete a movie', async ({ page }) => {
  const uniqueTitle = `Playwright Admin Movie ${Date.now()}`;

  await loginAsAdmin(page);
  await page.goto('/admin');

  await page.getByRole('button', { name: 'Add New Movie' }).click();
  await expect(page.getByRole('heading', { name: 'Add New Movie' })).toBeVisible();

  await page.locator('input[placeholder="e.g. Interstellar"]').fill(uniqueTitle);
  await page.locator('input[type="url"]').fill('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop');
  await page.locator('input[placeholder="Leonardo DiCaprio, Tom Hardy, Elliot Page"]').fill('Playwright Actor 1, Playwright Actor 2');
  await page.locator('textarea[placeholder="Enter synopsis here..."]').fill('Automated test movie created by Playwright admin suite.');
  await page.locator('input[type="number"]').first().fill('123');

  await page.getByRole('button', { name: 'Save Movie' }).click();
  await expect(page.getByText(uniqueTitle)).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  const row = page.locator('tr', { hasText: uniqueTitle });
  await row.getByRole('button', { name: 'Delete movie' }).click();

  await expect(page.getByText(uniqueTitle)).toHaveCount(0);
});
