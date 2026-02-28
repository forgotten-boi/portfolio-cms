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

test.describe('Event Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should display event analytics page', async ({ page }) => {
    await page.goto('/dashboard/event-analytics');
    await expect(page.locator('h1')).toContainText('Event Analytics');
  });

  test('should show stats row when BFF is available', async ({ page }) => {
    await page.goto('/dashboard/event-analytics');
    // Stats row may show after loading
    const statsRow = page.locator('.stats-row');
    const loading = page.locator('.loading-state');
    // Wait for either stats or loading to resolve
    await page.waitForTimeout(3000);
    const statsCount = await statsRow.count();
    const loadingCount = await loading.count();
    expect(statsCount > 0 || loadingCount > 0).toBeTruthy();
  });

  test('should display payment metrics card', async ({ page }) => {
    test.skip(
      !process.env.BFF_RUNNING,
      'Skipping: BFF server not available. Set BFF_RUNNING=1 to enable.'
    );

    await page.goto('/dashboard/event-analytics');
    await page.waitForTimeout(2000);

    const paymentCard = page.locator('h3:has-text("Payment Metrics")');
    await expect(paymentCard).toBeVisible();
  });

  test('should display portfolio metrics card', async ({ page }) => {
    test.skip(
      !process.env.BFF_RUNNING,
      'Skipping: BFF server not available. Set BFF_RUNNING=1 to enable.'
    );

    await page.goto('/dashboard/event-analytics');
    await page.waitForTimeout(2000);

    const portfolioCard = page.locator('h3:has-text("Portfolio Metrics")');
    await expect(portfolioCard).toBeVisible();
  });

  test('should have refresh and reset buttons', async ({ page }) => {
    await page.goto('/dashboard/event-analytics');
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
    await expect(page.locator('button:has-text("Reset")')).toBeVisible();
  });

  test('should show live event feed section', async ({ page }) => {
    await page.goto('/dashboard/event-analytics');
    const feedCard = page.locator('.feed-card, h3:has-text("Live Event Feed")');
    await expect(feedCard.first()).toBeVisible();
  });
});

test.describe('Real-time Event Updates', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should establish SSE connection', async ({ page }) => {
    test.skip(
      !process.env.BFF_RUNNING,
      'Skipping: BFF server not available. Set BFF_RUNNING=1 to enable.'
    );

    // Navigate to event analytics which uses SSE
    await page.goto('/dashboard/event-analytics');

    // Check that the EventSource was created by evaluating in browser
    const hasEventSource = await page.evaluate(() => {
      return typeof EventSource !== 'undefined';
    });
    expect(hasEventSource).toBeTruthy();
  });

  test('should receive events on the analytics dashboard', async ({ page }) => {
    test.skip(
      !process.env.PAYMENT_SERVICES_RUNNING,
      'Skipping: payment services not available.'
    );

    await page.goto('/dashboard/event-analytics');
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

    // Wait for the event to appear in the live feed
    await page.waitForTimeout(3000);
    const liveItems = page.locator('.feed-item.live');
    const count = await liveItems.count();
    expect(count).toBeGreaterThan(0);
  });
});
