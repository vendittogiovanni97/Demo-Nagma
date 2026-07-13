import { test, expect, Page } from '@playwright/test';

const CREDENTIALS = {
  email: 'superadmin@nagma.it',
  password: 'superadmin123',
};

async function login(page: Page) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /benvenuto/i })).toBeVisible();

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

    await page.goto('/admin-panel');
    await expect(page).toHaveURL(/admin-panel/);

    await expect(page.getByText('Attivazione Moduli e Feature Flags')).toBeVisible();
    await expect(page.getByText('Archivio Consensi')).toBeVisible();
    await expect(page.getByText('Mappa Corporea')).toBeVisible();

    const consensiSwitch = page
      .getByText('📄 Archivio Consensi')
      .locator('xpath=ancestor::div[contains(@style,"display") or contains(@class,"MuiBox")]')
      .locator('[role="switch"]')
      .first();

    // Fallback: find the switch nearest to the label
    const switchEl = page.locator('[role="switch"]').first();
    const initialState = await switchEl.getAttribute('aria-checked');

    await switchEl.click();

    await expect(page.getByText('Configurazione aggiornata con successo')).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500);
    const newState = await switchEl.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });

  test('superadmin can configure client settings', async ({ page }) => {
    await login(page);

    await page.goto('/admin-panel/settings');
    await expect(page).toHaveURL(/admin-panel\/settings/);

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

  test('feature flags affect module visibility in user menu', async ({ page }) => {
    await login(page);

    // Go to admin panel, get current state of Consensi toggle
    await page.goto('/admin-panel');
    await expect(page.getByText('Attivazione Moduli e Feature Flags')).toBeVisible();

    const switches = page.locator('[role="switch"]');
    const consensiSwitch = switches.first();

    // Disable Archivio Consensi if enabled
    const initialState = await consensiSwitch.getAttribute('aria-checked');
    if (initialState === 'true') {
      await consensiSwitch.click();
      await expect(page.getByText('Configurazione aggiornata con successo')).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(500);
    }

    // Go to home page, open user menu, check "Archivio Consensi" is NOT there
    await page.goto('/');
    const userMenuBtn = page.getByLabel('Menu utente');
    await userMenuBtn.click();
    await expect(page.getByRole('menuitem', { name: /archivio consensi/i })).not.toBeVisible({ timeout: 3000 });

    // Close menu
    await page.keyboard.press('Escape');

    // Re-enable Consensi
    await page.goto('/admin-panel');
    await expect(page.getByText('Attivazione Moduli e Feature Flags')).toBeVisible();

    const consensiSwitch2 = page.locator('[role="switch"]').first();
    const currentState = await consensiSwitch2.getAttribute('aria-checked');
    if (currentState === 'false') {
      await consensiSwitch2.click();
      await expect(page.getByText('Configurazione aggiornata con successo')).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(500);
    }

    // Verify it shows in user menu now
    await page.goto('/');
    await page.getByLabel('Menu utente').click();
    await expect(page.getByText('Archivio Consensi')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Client Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('superadmin can configure branding', async ({ page }) => {
    await page.goto('/admin-panel/settings');
    await expect(page.getByText('Branding')).toBeVisible();

    await page.getByLabel('Nome Client').fill('Test Studio');
    await page.getByLabel('Logo URL').fill('/logo-test.svg');

    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill('#00bfff');

    const secondaryColorInput = page.locator('input[type="color"]').nth(1);
    await secondaryColorInput.fill('#00ff00');

    await page.getByRole('button', { name: /salva configurazione/i }).click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible({ timeout: 10000 });
  });

  test('superadmin can toggle feature flags in settings', async ({ page }) => {
    await page.goto('/admin-panel/settings');
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
    await page.goto('/admin-panel/settings');
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
