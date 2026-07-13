import { test, expect } from '@playwright/test';

test.describe('Happy Path - Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login as superadmin and access dashboard', async ({ page }) => {
    await expect(page.getByRole('heading')).toContainText(/benvenuto|welcome/i);

    await page.fill('input[name="email"]', 'superadmin@nagma.it');
    await page.fill('input[name="password"]', 'superadmin123');

    const loginPromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.status() === 200
    );
    await page.click('button[type="submit"]');
    await loginPromise;

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    await expect(page.locator('body')).not.toContainText('errore', { timeout: 5000 });
  });

  test('superadmin can access admin panel and toggle features', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'superadmin@nagma.it');
    await page.fill('input[name="password"]', 'superadmin123');

    const loginPromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.status() === 200
    );
    await page.click('button[type="submit"]');
    await loginPromise;

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    // Navigate to admin panel
    await page.goto('/admin-panel');
    await expect(page).toHaveURL(/admin-panel/);

    // Check feature flags section is visible
    await expect(page.getByText('Attivazione Moduli e Feature Flags')).toBeVisible();

    // Check feature toggles are present
    await expect(page.getByText('Archivio Consensi')).toBeVisible();
    await expect(page.getByText('Mappa Corporea')).toBeVisible();

    // Test toggling a feature flag
    const consensiToggle = page.getByText('Archivio Consensi').locator('..').getByRole('switch');
    const initialState = await consensiToggle.getAttribute('aria-checked');

    await consensiToggle.click();
    await expect(page.getByText('Configurazione aggiornata con successo')).toBeVisible();

    // Verify state changed
    const newState = await consensiToggle.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });

  test('superadmin can configure client settings', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'superadmin@nagma.it');
    await page.fill('input[name="password"]', 'superadmin123');

    const loginPromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.status() === 200
    );
    await page.click('button[type="submit"]');
    await loginPromise;

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    // Navigate to settings
    await page.goto('/admin-panel/settings');
    await expect(page).toHaveURL(/admin-panel\/settings/);

    // Check branding section
    await expect(page.getByText('Branding')).toBeVisible();
    await expect(page.getByLabel('Nome Client')).toBeVisible();
    await expect(page.getByLabel('Logo URL')).toBeVisible();

    // Test color pickers
    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill('#ff0000');

    // Test feature flags
    await expect(page.getByText('Feature Flags')).toBeVisible();
    const creamToggle = page.getByLabel('Abilita Modulo Creme');
    await expect(creamToggle).toBeVisible();

    // Test limits section
    await expect(page.getByText('Limiti Utenti')).toBeVisible();
    await expect(page.getByLabel('Max Utenti')).toBeVisible();
    await expect(page.getByLabel('Max Prenotazioni')).toBeVisible();

    // Test API config
    await expect(page.getByText('Configurazione API')).toBeVisible();
    await expect(page.getByLabel('Max Allegati (MB)')).toBeVisible();
    await expect(page.getByLabel('Rate Limit (req/min)')).toBeVisible();

    // Save configuration
    await page.click('button:has-text("Salva Configurazione")');
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible();
  });

  test('feature flags affect module visibility', async ({ page }) => {
    // Login as superadmin
    await page.fill('input[name="email"]', 'superadmin@nagma.it');
    await page.fill('input[name="password"]', 'superadmin123');

    const loginPromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.status() === 200
    );
    await page.click('button[type="submit"]');
    await loginPromise;

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    // Disable Cream feature
    await page.goto('/admin-panel');
    const creamToggle = page.getByText('Creme').locator('..').getByRole('switch');
    const initialState = await creamToggle.getAttribute('aria-checked');
    if (initialState === 'true') {
      await creamToggle.click();
      await expect(page.getByText('Configurazione aggiornata con successo')).toBeVisible();
    }

    // Verify cream module is hidden in navbar
    await page.goto('/dashboard');
    await expect(page.getByText('Creme')).not.toBeVisible();

    // Re-enable cream feature
    await page.goto('/admin-panel');
    const creamToggle2 = page.getByText('Creme').locator('..').getByRole('switch');
    await creamToggle2.click();
    await expect(page.getByText('Configurazione aggiornata con successo')).toBeVisible();

    // Verify cream module is visible again
    await page.goto('/dashboard');
    await expect(page.getByText('Creme')).toBeVisible();
  });
});

test.describe('Client Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'superadmin@nagma.it');
    await page.fill('input[name="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('superadmin can configure branding', async ({ page }) => {
    await page.goto('/admin-panel/settings');

    // Update client name
    await page.fill('input[label="Nome Client"]', 'Test Studio');
    await page.fill('input[label="Logo URL"]', '/logo-test.svg');

    // Update colors
    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill('#ff0000');

    const secondaryColorInput = page.locator('input[type="color"]').nth(1);
    await secondaryColorInput.fill('#00ff00');

    // Save
    await page.click('button:has-text("Salva Configurazione")');
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible();
  });

  test('superadmin can toggle feature flags', async ({ page }) => {
    await page.goto('/admin-panel/settings');

    // Toggle WhatsApp feature
    const whatsappToggle = page.getByLabel('Abilita Modulo WhatsApp');
    const initialState = await whatsappToggle.getAttribute('aria-checked');

    await whatsappToggle.click();
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible();

    const newState = await whatsappToggle.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });

  test('superadmin can set limits', async ({ page }) => {
    await page.goto('/admin-panel/settings');

    await page.fill('input[label="Max Utenti"]', '25');
    await page.fill('input[label="Max Prenotazioni"]', '5000');

    await page.click('button:has-text("Salva Configurazione")');
    await expect(page.getByText('Configurazione salvata con successo')).toBeVisible();
  });
});

test.describe('Custom Fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'superadmin@nagma.it');
    await page.fill('input[name="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('superadmin can create custom field for customers', async ({ page }) => {
    await page.goto('/admin-panel');
    await page.click('button:has-text("Campi Personalizzati")');

    await page.click('button:has-text("Nuovo Campo")');

    await page.fill('input[label="Etichetta Visualizzata (Label)"]', 'Codice Fiscale');
    await page.fill('input[label="Nome della Chiave (DB)"]', 'codiceFiscale');
    await page.selectOption('select[label="Tipo di Dato"]', 'string');
    await page.check('input[label="Campo Obbligatorio (isRequired)"]');

    await page.click('button:has-text("Salva")');
    await expect(page.getByText('Nuovo campo creato!')).toBeVisible();
  });

  test('superadmin can create select custom field', async ({ page }) => {
    await page.goto('/admin-panel');
    await page.click('button:has-text("Campi Personalizzati")');

    await page.click('button:has-text("Nuovo Campo")');

    await page.fill('input[label="Etichetta Visualizzata (Label)"]', 'Tipo di Pelle');
    await page.fill('input[label="Nome della Chiave (DB)"]', 'tipoPelle');
    await page.selectOption('select[label="Tipo di Dato"]', 'select');
    await page.fill('input[label="Opzioni del menu (Separate da virgola)"]', 'Normale, Secca, Grassa, Mista');

    await page.click('button:has-text("Salva")');
    await expect(page.getByText('Nuovo campo creato!')).toBeVisible();
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
    // Login first
    const loginResponse = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'superadmin@nagma.it', password: 'superadmin123' },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Test client-config endpoint
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