import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';
const API_URL = 'http://localhost:8085/api';
const ADMIN_EMAIL = 'admin@portfolio.local';
const ADMIN_PASSWORD = 'Admin@123!';
const TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Helper: Login via the UI
 */
async function loginViaUI(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('#tenantId', { state: 'visible', timeout: 15000 });

  await page.fill('#tenantId', TENANT_ID);
  await page.fill('#email', ADMIN_EMAIL);
  await page.fill('#password', ADMIN_PASSWORD);

  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

/**
 * Helper: Login via API and set localStorage directly (faster)
 */
async function loginViaAPI(page: Page) {
  const response = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const result = await response.json();
  expect(result.success).toBe(true);
  expect(result.token).toBeTruthy();

  // Set localStorage to mimic logged-in state
  await page.goto(BASE_URL);
  await page.evaluate(({ token, userId, tenantId }) => {
    localStorage.setItem('portfolio_jwt_token', token);
    localStorage.setItem('portfolio_user_id', userId);
    localStorage.setItem('portfolio_tenant_id', tenantId);
  }, { token: result.token, userId: result.userId, tenantId: TENANT_ID });

  return result;
}

/**
 * Helper: Delete all portfolios for the admin user via API
 */
async function cleanupPortfolios(page: Page) {
  const loginRes = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!loginRes.ok()) return;
  const { token } = await loginRes.json();

  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Id': TENANT_ID,
  };

  const listRes = await page.request.get(`${API_URL}/portfolios`, { headers });
  if (listRes.ok()) {
    const portfolios = await listRes.json();
    for (const p of portfolios) {
      await page.request.delete(`${API_URL}/portfolios/${p.id}`, { headers });
    }
  }
}

// ─────────────────────────────────────────────
// TEST SUITE: Portfolio Creation Flow
// ─────────────────────────────────────────────

test.describe('Portfolio Creation Flow', () => {

  test.beforeEach(async ({ page }) => {
    await cleanupPortfolios(page);
  });

  test('Step 1: Login page loads and accepts credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#tenantId', { state: 'visible', timeout: 15000 });

    // Verify login page elements
    await expect(page.locator('h1')).toContainText('Portfolio CMS');
    await expect(page.locator('h2')).toContainText('Login');
    await expect(page.locator('#tenantId')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // Login button should be disabled when form is empty
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();

    // Fill form
    await page.fill('#tenantId', TENANT_ID);
    await page.fill('#email', ADMIN_EMAIL);
    await page.fill('#password', ADMIN_PASSWORD);

    // Button should now be enabled
    await expect(submitBtn).toBeEnabled();
  });

  test('Step 2: Login redirects to dashboard', async ({ page }) => {
    await loginViaUI(page);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Step 3: Navigate to portfolio creation form', async ({ page }) => {
    await loginViaAPI(page);
    await page.goto(`${BASE_URL}/dashboard/portfolios/new`);
    await page.waitForSelector('.form-container', { state: 'visible', timeout: 15000 });

    // Verify form elements
    await expect(page.locator('h1')).toContainText('Create New Portfolio');
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#subtitle')).toBeVisible();
    await expect(page.locator('#bio')).toBeVisible();
    await expect(page.locator('.template-selector')).toBeVisible();
  });

  test('Step 4: Form validation — required fields', async ({ page }) => {
    await loginViaAPI(page);
    await page.goto(`${BASE_URL}/dashboard/portfolios/new`);
    await page.waitForSelector('.form-container', { state: 'visible', timeout: 15000 });

    // Try submitting empty form
    await page.click('button[type="submit"]');

    // Validation errors should appear
    await expect(page.locator('.error-message').first()).toBeVisible({ timeout: 5000 });
  });

  test('Step 5: Fill and submit portfolio creation form', async ({ page }) => {
    await loginViaAPI(page);
    await page.goto(`${BASE_URL}/dashboard/portfolios/new`);
    await page.waitForSelector('.form-container', { state: 'visible', timeout: 15000 });

    // Fill form fields
    await page.fill('#title', 'My Test Portfolio');
    await page.fill('#subtitle', 'Full Stack Developer & Cloud Architect');
    await page.fill('#bio', 'Experienced software engineer with 10+ years of building scalable web apps and cloud infrastructure. Passionate about clean code and mentoring.');

    // Select template (click first template option)
    const templateOption = page.locator('.template-option').first();
    await templateOption.click();

    // Listen for network request to see what's sent
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/portfolios') && req.method() === 'POST', { timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log('Request body:', request.postData());

    // Wait for response
    const response = await page.waitForResponse(
      res => res.url().includes('/portfolios') && res.request().method() === 'POST',
      { timeout: 10000 }
    );
    console.log('Response status:', response.status());
    if (!response.ok()) {
      console.log('Response body:', await response.text());
    }

    // Should redirect to portfolios list
    await page.waitForURL('**/dashboard/portfolios', { timeout: 15000 });
  });

  test('Step 6: Verify portfolio appears in list after creation', async ({ page }) => {
    // First create via API
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const { token } = await loginRes.json();

    const createRes = await page.request.post(`${API_URL}/portfolios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Id': TENANT_ID,
        'Content-Type': 'application/json',
      },
      data: {
        title: 'API Created Portfolio',
        subtitle: 'Created via API test',
        bio: 'This portfolio was created programmatically for testing purposes.',
        template: 'Modern',
        isPublic: true,
        featuredBlogsEnabled: false,
      },
    });
    expect(createRes.ok()).toBeTruthy();

    // Now verify it shows in the UI
    await loginViaAPI(page);
    await page.goto(`${BASE_URL}/dashboard/portfolios`);
    await page.waitForSelector('.portfolios-container, .portfolio-card, .portfolio-item, table, .loading', {
      state: 'visible',
      timeout: 15000,
    });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check that portfolio title appears somewhere on the page
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('API Created Portfolio');
  });

  test('Step 7: Portfolio creation via direct API call', async ({ page }) => {
    // Pure API test — no UI
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const authResult = await loginRes.json();
    expect(authResult.success).toBe(true);

    const createRes = await page.request.post(`${API_URL}/portfolios`, {
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'X-Tenant-Id': TENANT_ID,
        'Content-Type': 'application/json',
      },
      data: {
        title: 'Direct API Portfolio',
        subtitle: 'E2E API Test',
        bio: 'Testing portfolio creation directly via the API to verify the backend endpoint works independently.',
        template: 'Classic',
        isPublic: false,
        featuredBlogsEnabled: true,
      },
    });

    console.log('Create portfolio response status:', createRes.status());
    if (!createRes.ok()) {
      console.log('Create portfolio response body:', await createRes.text());
    }
    expect(createRes.ok()).toBeTruthy();

    const portfolio = await createRes.json();
    expect(portfolio.id).toBeTruthy();
    expect(portfolio.title).toBe('Direct API Portfolio');

    // Verify we can fetch it back
    const getRes = await page.request.get(`${API_URL}/portfolios/${portfolio.id}`, {
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'X-Tenant-Id': TENANT_ID,
      },
    });
    expect(getRes.ok()).toBeTruthy();
    const fetched = await getRes.json();
    expect(fetched.title).toBe('Direct API Portfolio');

    // Clean up: delete the portfolio
    const delRes = await page.request.delete(`${API_URL}/portfolios/${portfolio.id}`, {
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'X-Tenant-Id': TENANT_ID,
      },
    });
    expect(delRes.status()).toBe(204);
  });
});
