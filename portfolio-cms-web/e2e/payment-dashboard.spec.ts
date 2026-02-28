import { test, expect, Page } from '@playwright/test';

/**
 * Helper: bypass auth if the app redirects to login.
 * Stores a mock JWT in localStorage so the auth guard passes.
 */
async function ensureAuthenticated(page: Page) {
  await page.goto('/');
  const url = page.url();
  if (url.includes('/login')) {
    // Set a mock token so the auth guard lets us through
    await page.evaluate(() => {
      localStorage.setItem(
        'auth_token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjk5OTk5OTk5OTl9.mock'
      );
      localStorage.setItem('tenant_id', 'test-tenant');
    });
    await page.goto('/dashboard');
  }
}

test.describe('Payment Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should navigate to payment dashboard', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await expect(page.locator('h1')).toContainText('Payment');
  });

  test('should display stats grid', async ({ page }) => {
    await page.goto('/dashboard/payments');
    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid).toBeVisible();
  });

  test('should show quick-link cards', async ({ page }) => {
    await page.goto('/dashboard/payments');
    const links = page.locator('.quick-link');
    await expect(links).toHaveCount(4);
  });

  test('should navigate to create order from quick link', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await page.locator('a[routerLink*="orders/new"]').first().click();
    await expect(page).toHaveURL(/payments\/orders\/new/);
  });
});

test.describe('Create Payment Order', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should display the order form', async ({ page }) => {
    await page.goto('/dashboard/payments/orders/new');
    await expect(page.locator('h1')).toContainText('Create');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should have required form fields', async ({ page }) => {
    await page.goto('/dashboard/payments/orders/new');
    await expect(page.locator('input[name="customerId"], input[formControlName="customerId"], #customerId')).toBeVisible();
    await expect(page.locator('input[name="amount"], input[formControlName="amount"], #amount')).toBeVisible();
  });

  test('should submit a new order', async ({ page }) => {
    await page.goto('/dashboard/payments/orders/new');

    // Fill in the form
    const customerInput = page.locator('#customerId, input[name="customerId"]').first();
    await customerInput.fill('e2e-customer-' + Date.now());

    const amountInput = page.locator('#amount, input[name="amount"]').first();
    await amountInput.fill('25.50');

    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Should see a success message or order ID
    await expect(
      page.locator('.order-result, .success-message, .alert-success').first()
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Payment Orders List', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should display orders page', async ({ page }) => {
    await page.goto('/dashboard/payments/orders');
    await expect(page.locator('h1')).toContainText('Order');
  });

  test('should have a create order button', async ({ page }) => {
    await page.goto('/dashboard/payments/orders');
    const createBtn = page.locator('a[routerLink*="new"], button:has-text("Create")').first();
    await expect(createBtn).toBeVisible();
  });
});

test.describe('Payment Accounting', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should display accounting page', async ({ page }) => {
    await page.goto('/dashboard/payments/accounting');
    await expect(page.locator('h1')).toContainText('Accounting');
  });

  test('should show double-entry explanation', async ({ page }) => {
    await page.goto('/dashboard/payments/accounting');
    await expect(page.locator('.de-diagram')).toBeVisible();
  });

  test('should have reconciliation button', async ({ page }) => {
    await page.goto('/dashboard/payments/accounting');
    const reconBtn = page.locator('button:has-text("Reconciliation")');
    await expect(reconBtn).toBeVisible();
  });
});
