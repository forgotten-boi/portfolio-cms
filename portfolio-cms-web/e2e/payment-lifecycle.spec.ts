import { test, expect, Page } from '@playwright/test';

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

async function gotoAndWait(page: Page, url: string, waitSelector: string) {
  await page.goto(url);
  await page.waitForSelector(waitSelector, { timeout: 20000 });
}

test.describe('Payment Lifecycle Demo', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display lifecycle page with empty state', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/lifecycle', '.lifecycle');
    await expect(page.locator('h1.page-title')).toContainText('Lifecycle');
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should have Run Full Lifecycle button', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/lifecycle', '.lifecycle');
    const runBtn = page.locator('button', { hasText: 'Run Full Lifecycle' });
    await expect(runBtn).toBeVisible();
    await expect(runBtn).toBeEnabled();
  });

  test('should start lifecycle and show pipeline steps', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments/lifecycle', '.lifecycle');

    const runBtn = page.locator('button', { hasText: 'Run Full Lifecycle' });
    await runBtn.click();

    // Pipeline should appear with steps
    const pipeline = page.locator('.pipeline');
    await expect(pipeline).toBeVisible({ timeout: 10000 });

    // At least the first step should be running or complete
    const firstStep = page.locator('.step-node').first();
    await expect(firstStep).toBeVisible();
  });

  test('should complete full lifecycle when .NET services are running', async ({ page }) => {
    test.skip(
      !process.env.PAYMENT_SERVICES_RUNNING,
      'Skipping: .NET payment microservices not available. Set PAYMENT_SERVICES_RUNNING=1 to enable.'
    );

    await gotoAndWait(page, '/dashboard/payments/lifecycle', '.lifecycle');

    await page.locator('button', { hasText: 'Run Full Lifecycle' }).click();

    // Wait for completion
    await expect(page.locator('.summary-section')).toBeVisible({ timeout: 60000 });

    // Verify summary cards
    await expect(page.locator('.summary-card')).toHaveCount(3, { timeout: 5000 });

    // Verify ledger entries
    const ledgerTable = page.locator('.ledger-table');
    await expect(ledgerTable).toBeVisible();
    const rows = ledgerTable.locator('tbody tr');
    await expect(rows).toHaveCount(2);
  });

  test('should show real-time events during lifecycle', async ({ page }) => {
    test.skip(
      !process.env.PAYMENT_SERVICES_RUNNING,
      'Skipping: .NET payment microservices not available.'
    );

    await gotoAndWait(page, '/dashboard/payments/lifecycle', '.lifecycle');
    await page.locator('button', { hasText: 'Run Full Lifecycle' }).click();

    await expect(page.locator('.events-section')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.event-item').first()).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Payment Order Detail', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should show order detail page', async ({ page }) => {
    await gotoAndWait(
      page,
      '/dashboard/payments/orders/00000000-0000-0000-0000-000000000000',
      '.order-detail'
    );
    await expect(page.locator('h1.page-title')).toContainText('Order Details');
    // Back button should always be visible
    await expect(page.locator('a', { hasText: '← Back' })).toBeVisible();
    // For a non-existent order, loading finishes with no order data,
    // so neither .loading-state nor .detail-grid will be rendered
  });
});
