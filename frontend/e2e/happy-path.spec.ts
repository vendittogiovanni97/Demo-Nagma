import { test, expect } from '@playwright/test';

test.describe('Happy Path', () => {
  test('login and view dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading')).toContainText(/accedi|login|nagma/i);

    await page.fill('input[name="email"]', 'superadmin@nagma.it');
    await page.fill('input[name="password"]', 'superadmin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    await expect(page.locator('body')).not.toContainText('errore', { timeout: 5000 });
  });
});
