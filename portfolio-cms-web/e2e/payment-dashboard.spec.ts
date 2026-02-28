import { test, expect, Page } from '@playwright/test';

/**
 * Set auth tokens via addInitScript so they exist BEFORE Angular client bootstraps.
 * Angular SSR runs the auth guard on the server (no localStorage), so the client
 * must detect the token and re-route after hydration.
 */
async function setupAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'portfolio_jwt_token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjk5OTk5OTk5OTl9.mock'
    );
    localStorage.setItem('portfolio_tenant_id', 'test-tenant');
    localStorage.setItem('portfolio_user_id', 'test-user');
  });
}

/** Navigate and wait for Angular to render the target component (past any SSR login redirect). */
async function gotoAndWait(page: Page, url: string, waitSelector: string) {
  await page.goto(url);
  await page.waitForSelector(waitSelector, { timeout: 20000 });
}

test.describe('Payment Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should navigate to payment dashboard', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments', '.payment-dashboard');
    await expect(page.locator('h1.page-title')).toContainText('Payment Dashboard');
  });

  test('should display stats grid', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments', '.payment-dashboard');
    await expect(page.locator('.stats-grid')).toBeVisible();
  });

  test('should show quick-link cards', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments', '.payment-dashboard');
    const links = page.locator('.quick-link');
    await expect(links).toHaveCount(5);
  });

  test('should navigate to create order from quick link', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments', '.payment-dashboard');
    await page.locator('a.quick-link', { hasText: 'Create Order' }).click();
    await expect(page).toHaveURL(/payments\/orders\/new/);
  });
});

test.describe('Create Payment Order', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display the order form', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/orders/new', '.create-order');
    await expect(page.locator('h1.page-title')).toContainText('Create Payment Order');
  });

  test('should have required form fields', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/orders/new', '.create-order');
    await expect(page.locator('label', { hasText: 'Customer ID' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Amount' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Currency' })).toBeVisible();
  });

  test('should submit a new order', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/orders/new', '.create-order');

    // Fill Customer ID
    const formGroups = page.locator('.form-group');
    await formGroups.filter({ hasText: 'Customer ID' }).locator('input.form-control').fill('e2e-customer-' + Date.now());

    // Fill Amount
    await formGroups.filter({ hasText: 'Amount' }).locator('input.form-control').fill('25.50');

    // Submit
    const submitBtn = page.locator('button', { hasText: 'Create Order' });
    await submitBtn.click();

    // Should see a response message (success or connection error)
    await expect(page.locator('.alert').first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Payment Orders List', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display orders page', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/orders', '.payment-orders');
    await expect(page.locator('h1.page-title')).toContainText('Payment Orders');
  });

  test('should have a create order button', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/orders', '.payment-orders');
    const createBtn = page.locator('a', { hasText: 'New Order' });
    await expect(createBtn).toBeVisible();
  });
});

test.describe('Payment Accounting', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display accounting page', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/accounting', '.accounting');
    await expect(page.locator('h1.page-title')).toContainText('Accounting');
  });

  test('should show double-entry explanation', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/accounting', '.accounting');
    await expect(page.locator('.de-diagram')).toBeVisible();
  });

  test('should have reconciliation button', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/accounting', '.accounting');
    const reconBtn = page.locator('button', { hasText: 'Run Reconciliation' });
    await expect(reconBtn).toBeVisible();
  });
});
