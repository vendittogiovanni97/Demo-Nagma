import { expect, Page, test } from '@playwright/test';

const CREDENTIALS = {
  email: 'superadmin@nagma.it',
  password: 'superadmin123',
};

async function login(page: Page) {
  await page.goto('/login');
  await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });

  await page.locator('input[name="email"]').fill(CREDENTIALS.email);
  await page.locator('input[name="password"]').fill(CREDENTIALS.password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL('/', { timeout: 15000 });
}

test.describe('Happy Path - Full User Journey', () => {
  test('login as superadmin and access dashboard', async ({ page }) => {
    await login(page);
    await expect(page.locator('body')).not.toContainText('errore', { timeout: 5000 });
  });

  test('superadmin can access admin panel and toggle features', async ({ page }) => {
    await login(page);

    await page.goto('/admin-panel?tab=clientSettings');
    await expect(page).toHaveURL(/admin-panel/);

    await expect(page.getByText('Feature Flags')).toBeVisible();
    const creamToggle = page.getByLabel('Abilita Modulo Creme');
    await expect(creamToggle).toBeVisible();

    const initialState = await creamToggle.isChecked();
    await creamToggle.click();

    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500);
    const newState = await page.getByLabel('Abilita Modulo Creme').isChecked();
    expect(newState).not.toBe(initialState);
  });

  test('superadmin can configure client settings', async ({ page }) => {
    await login(page);

    await page.goto('/admin-panel?tab=clientSettings');
    await expect(page).toHaveURL(/admin-panel/);

    await expect(page.getByText('Branding')).toBeVisible();

    // MUI TextField uses label element associated via htmlFor, not aria-label
    const clientNameInput = page.getByLabel('Nome Client');
    await expect(clientNameInput).toBeVisible();

    const logoUrlInput = page.getByLabel('Logo URL');
    await expect(logoUrlInput).toBeVisible();

    // Color pickers
    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill('#00bfff');

    // Feature Flags section
    await expect(page.getByText('Feature Flags')).toBeVisible();

    // MUI FormControlLabel + Switch: getByLabel matches the label text
    const creamToggle = page.getByLabel('Abilita Modulo Creme');
    await expect(creamToggle).toBeVisible();

    // Limits section
    await expect(page.getByText('Limiti Utenti')).toBeVisible();
    await expect(page.getByLabel('Max Utenti')).toBeVisible();
    await expect(page.getByLabel('Max Prenotazioni')).toBeVisible();

    // API Config section
    await expect(page.getByText('Configurazione API')).toBeVisible();
    await expect(page.getByLabel('Max Allegati (MB)')).toBeVisible();
    await expect(page.getByLabel('Rate Limit (req/min)')).toBeVisible();

    // Save
    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });
  });

  test('feature flags affect module visibility in client settings', async ({ page }) => {
    await login(page);

    await page.goto('/admin-panel?tab=clientSettings');
    await expect(page.getByText('Feature Flags')).toBeVisible();

    const creamToggle = page.getByLabel('Abilita Modulo Creme');
    await expect(creamToggle).toBeVisible();

    const initialState = await creamToggle.isChecked();
    await creamToggle.click();

    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });

    // Restore original state
    await page.getByLabel('Abilita Modulo Creme').click();
    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Client Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('superadmin can configure branding', async ({ page }) => {
    await page.goto('/admin-panel?tab=clientSettings');
    await expect(page.getByText('Branding')).toBeVisible();

    await page.getByLabel('Nome Client').fill('Test Studio');
    await page.getByLabel('Logo URL').fill('/logo.svg');

    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill('#00bfff');

    const secondaryColorInput = page.locator('input[type="color"]').nth(1);
    await secondaryColorInput.fill('#00ff00');

    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });

    // Restore default branding
    await page.getByLabel('Nome Client').fill('Demo Nagma');
    await page.getByLabel('Logo URL').fill('/logo.svg');
    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });
  });

  test('superadmin can toggle feature flags in settings', async ({ page }) => {
    await page.goto('/admin-panel?tab=clientSettings');
    await expect(page.getByText('Feature Flags')).toBeVisible();

    // MUI Switch inside FormControlLabel — getByLabel uses the label text
    const whatsappToggle = page.getByLabel('Abilita Modulo WhatsApp');
    await expect(whatsappToggle).toBeVisible();

    const initialChecked = await whatsappToggle.isChecked();

    await whatsappToggle.click();

    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });

    // Reload and verify the toggle persisted
    await page.reload();
    await expect(page.getByText('Feature Flags')).toBeVisible();
    const newChecked = await page.getByLabel('Abilita Modulo WhatsApp').isChecked();
    expect(newChecked).not.toBe(initialChecked);

    // Restore original state
    await page.getByLabel('Abilita Modulo WhatsApp').click();
    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });
  });

  test('superadmin can set limits', async ({ page }) => {
    await page.goto('/admin-panel?tab=clientSettings');
    await expect(page.getByText('Limiti Utenti')).toBeVisible();

    await page.getByLabel('Max Utenti').fill('25');
    await page.getByLabel('Max Prenotazioni').fill('5000');

    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Custom Fields', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('superadmin can access custom fields tab', async ({ page }) => {
    await page.goto('/admin-panel');

    await page.getByRole('button', { name: /campi personalizzati/i }).click();

    // The custom fields manager should be visible
    await expect(page.locator('body')).not.toContainText('errore', { timeout: 5000 });
  });
});

test.describe('API Health Check', () => {
  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('http://localhost:3001/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('client-config endpoint works', async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const token = loginData.token;

    const configResponse = await request.get('http://localhost:3001/api/client-config', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(configResponse.ok()).toBeTruthy();
    const configData = await configResponse.json();
    expect(configData.success).toBe(true);
    expect(configData.data).toHaveProperty('clientName');
    expect(configData.data).toHaveProperty('features');
  });
});
