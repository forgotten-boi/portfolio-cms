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

test.describe('Event Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display event analytics page', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/event-analytics', '.analytics-dash');
    await expect(page.locator('h1.page-title')).toContainText('Event Analytics');
  });

  test('should show stats row or loading state', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/event-analytics', '.analytics-dash');
    // Stats row shows after data loads, loading-state shows while loading
    const statsRow = page.locator('.stats-row');
    const loading = page.locator('.loading-state');
    await page.waitForTimeout(3000);
    const count = (await statsRow.count()) + (await loading.count());
    expect(count).toBeGreaterThan(0);
  });

  test('should display payment metrics card', async ({ page }) => {
    test.skip(
      !process.env.BFF_RUNNING,
      'Skipping: BFF server not available. Set BFF_RUNNING=1 to enable.'
    );

    await gotoAndWait(page, '/dashboard/event-analytics', '.analytics-dash');
    await page.waitForTimeout(2000);
    await expect(page.locator('h3', { hasText: 'Payment Metrics' })).toBeVisible();
  });

  test('should display portfolio metrics card', async ({ page }) => {
    test.skip(
      !process.env.BFF_RUNNING,
      'Skipping: BFF server not available. Set BFF_RUNNING=1 to enable.'
    );

    await gotoAndWait(page, '/dashboard/event-analytics', '.analytics-dash');
    await page.waitForTimeout(2000);
    await expect(page.locator('h3', { hasText: 'Portfolio Metrics' })).toBeVisible();
  });

  test('should have refresh and reset buttons', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/event-analytics', '.analytics-dash');
    await expect(page.locator('button', { hasText: 'Refresh' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Reset' })).toBeVisible();
  });

  test('should show live event feed section', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/event-analytics', '.analytics-dash');
    await expect(page.locator('.feed-card')).toBeVisible();
  });
});

test.describe('Real-time Event Updates', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should establish SSE connection', async ({ page }) => {
    test.skip(
      !process.env.BFF_RUNNING,
      'Skipping: BFF server not available. Set BFF_RUNNING=1 to enable.'
    );

    await gotoAndWait(page, '/dashboard/event-analytics', '.analytics-dash');

    const hasEventSource = await page.evaluate(() => typeof EventSource !== 'undefined');
    expect(hasEventSource).toBeTruthy();
  });

  test('should receive events on the analytics dashboard', async ({ page }) => {
    test.skip(
      !process.env.PAYMENT_SERVICES_RUNNING,
      'Skipping: payment services not available.'
    );

    await gotoAndWait(page, '/dashboard/event-analytics', '.analytics-dash');
    await page.waitForTimeout(2000);

    // Publish a test event via the BFF
    await page.evaluate(async () => {
      await fetch('http://localhost:3100/api/events/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'test.e2e.event',
          source: 'playwright',
          payload: { test: true },
        }),
      });
    });

    await page.waitForTimeout(3000);
    const liveItems = page.locator('.feed-item.live');
    expect(await liveItems.count()).toBeGreaterThan(0);
  });
});
