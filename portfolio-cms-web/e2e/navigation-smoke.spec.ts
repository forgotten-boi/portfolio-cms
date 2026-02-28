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

test.describe('Sidebar Navigation — Payment Items', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should show Payments link in sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    const paymentsLink = page.locator('a[href*="payments"]').first();
    await expect(paymentsLink).toBeVisible();
  });

  test('should show Event Analytics link in sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    const analyticsLink = page.locator('a[href*="event-analytics"]').first();
    await expect(analyticsLink).toBeVisible();
  });

  test('should navigate to payments when clicking sidebar link', async ({ page }) => {
    await page.goto('/dashboard');
    const paymentsLink = page.locator('a[href*="/dashboard/payments"]').first();
    await paymentsLink.click();
    await expect(page).toHaveURL(/\/dashboard\/payments/);
  });

  test('should navigate to event-analytics when clicking sidebar link', async ({ page }) => {
    await page.goto('/dashboard');
    const link = page.locator('a[href*="/dashboard/event-analytics"]').first();
    await link.click();
    await expect(page).toHaveURL(/\/dashboard\/event-analytics/);
  });
});

test.describe('Payment Flow — End-to-End Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('full navigation flow: dashboard → orders → new → back', async ({ page }) => {
    // Start at payment dashboard
    await page.goto('/dashboard/payments');
    await expect(page.locator('h1')).toContainText('Payment');

    // Navigate to orders
    await page.locator('a[routerLink*="orders"]').first().click();
    await expect(page).toHaveURL(/payments\/orders/);

    // Navigate to create order
    const createBtn = page.locator('a[routerLink*="new"], a:has-text("New Order"), button:has-text("Create")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page).toHaveURL(/orders\/new/);
    }

    // Go back to dashboard
    await page.goto('/dashboard/payments');
    await expect(page.locator('h1')).toContainText('Payment');
  });

  test('full navigation flow: dashboard → accounting → lifecycle', async ({ page }) => {
    await page.goto('/dashboard/payments');

    // Navigate to accounting
    await page.locator('a[routerLink*="accounting"]').first().click();
    await expect(page).toHaveURL(/payments\/accounting/);
    await expect(page.locator('h1')).toContainText('Accounting');

    // Navigate back, then to lifecycle
    await page.goto('/dashboard/payments/lifecycle');
    await expect(page.locator('h1')).toContainText('Lifecycle');
  });
});
