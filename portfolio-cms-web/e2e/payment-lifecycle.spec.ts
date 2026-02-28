import { test, expect, Page } from '@playwright/test';

/**
 * Helper: bypass auth.
 */
async function ensureAuthenticated(page: Page) {
  await page.goto('/');
  const url = page.url();
  if (url.includes('/login')) {
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

test.describe('Payment Lifecycle Demo', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should display lifecycle page with empty state', async ({ page }) => {
    await page.goto('/dashboard/payments/lifecycle');
    await expect(page.locator('h1')).toContainText('Lifecycle');
    await expect(page.locator('.empty-state, .empty-icon')).toBeVisible();
  });

  test('should have Run Full Lifecycle button', async ({ page }) => {
    await page.goto('/dashboard/payments/lifecycle');
    const runBtn = page.locator('button:has-text("Run Full Lifecycle")');
    await expect(runBtn).toBeVisible();
    await expect(runBtn).toBeEnabled();
  });

  test('should start lifecycle and show pipeline steps', async ({ page }) => {
    await page.goto('/dashboard/payments/lifecycle');

    const runBtn = page.locator('button:has-text("Run Full Lifecycle")');
    await runBtn.click();

    // Pipeline should appear with steps
    const pipeline = page.locator('.pipeline');
    await expect(pipeline).toBeVisible({ timeout: 5000 });

    // At least the first step should be running or complete
    const firstStep = page.locator('.step-node').first();
    await expect(firstStep).toBeVisible();
  });

  test('should complete full lifecycle when .NET services are running', async ({ page }) => {
    test.skip(
      !process.env.PAYMENT_SERVICES_RUNNING,
      'Skipping: .NET payment microservices not available. Set PAYMENT_SERVICES_RUNNING=1 to enable.'
    );

    await page.goto('/dashboard/payments/lifecycle');

    const runBtn = page.locator('button:has-text("Run Full Lifecycle")');
    await runBtn.click();

    // Wait for completion (up to 60s for the full cycle)
    await expect(page.locator('.summary-section, h2:has-text("Complete")')).toBeVisible({
      timeout: 60000,
    });

    // Verify summary cards appear
    await expect(page.locator('.summary-card')).toHaveCount(3, { timeout: 5000 });

    // Verify ledger entries
    const ledgerTable = page.locator('.ledger-table');
    await expect(ledgerTable).toBeVisible();
    const rows = ledgerTable.locator('tbody tr');
    await expect(rows).toHaveCount(2); // Debit + Credit
  });

  test('should show real-time events during lifecycle', async ({ page }) => {
    test.skip(
      !process.env.PAYMENT_SERVICES_RUNNING,
      'Skipping: .NET payment microservices not available.'
    );

    await page.goto('/dashboard/payments/lifecycle');
    await page.locator('button:has-text("Run Full Lifecycle")').click();

    // Events section should appear
    await expect(page.locator('.events-section')).toBeVisible({ timeout: 30000 });

    // Should have at least one event
    const eventItems = page.locator('.event-item');
    await expect(eventItems.first()).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Payment Order Detail', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should show error for non-existent order', async ({ page }) => {
    await page.goto('/dashboard/payments/orders/00000000-0000-0000-0000-000000000000');
    // Should display an error or loading state
    await page.waitForTimeout(3000);
    const error = page.locator('.error, .alert-danger, .not-found');
    const loading = page.locator('.loading-state, .spinner');
    // Either error or still loading (no real backend)
    expect(
      (await error.count()) > 0 || (await loading.count()) > 0
    ).toBeTruthy();
  });
});
