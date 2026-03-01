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

test.describe('Sidebar Navigation — Payment Items', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should show Payments link in sidebar', async ({ page }) => {
    await gotoAndWait(page, '/dashboard', '.sidebar');
    // Sidebar uses routerLink which Angular renders as href
    const paymentsLink = page.locator('a.nav-item[href*="payments"]').first();
    await expect(paymentsLink).toBeVisible();
  });

  test('should show Event Analytics link in sidebar', async ({ page }) => {
    await gotoAndWait(page, '/dashboard', '.sidebar');
    const analyticsLink = page.locator('a.nav-item[href*="event-analytics"]').first();
    await expect(analyticsLink).toBeVisible();
  });

  test('should navigate to payments when clicking sidebar link', async ({ page }) => {
    await gotoAndWait(page, '/dashboard', '.sidebar');
    const paymentsLink = page.locator('a.nav-item[href*="payments"]').first();
    await paymentsLink.click();
    await expect(page).toHaveURL(/\/dashboard\/payments/);
    await expect(page.locator('.payment-dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to event-analytics when clicking sidebar link', async ({ page }) => {
    await gotoAndWait(page, '/dashboard', '.sidebar');
    const link = page.locator('a.nav-item[href*="event-analytics"]').first();
    await link.click();
    await expect(page).toHaveURL(/\/dashboard\/event-analytics/);
    await expect(page.locator('.analytics-dash')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Payment Flow — End-to-End Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('full navigation flow: dashboard → orders → new → back', async ({ page }) => {
    // Payment dashboard
    await gotoAndWait(page, '/dashboard/payments', '.payment-dashboard');
    await expect(page.locator('h1.page-title')).toContainText('Payment Dashboard');

    // Navigate to orders via quick link
    await page.locator('a.quick-link', { hasText: 'View All Orders' }).click();
    await expect(page).toHaveURL(/payments\/orders/);
    await expect(page.locator('.payment-orders')).toBeVisible({ timeout: 10000 });

    // Navigate to create order
    await page.locator('a', { hasText: 'New Order' }).first().click();
    await expect(page).toHaveURL(/orders\/new/);
    await expect(page.locator('.create-order')).toBeVisible({ timeout: 10000 });

    // Go back to dashboard
    await gotoAndWait(page, '/dashboard/payments', '.payment-dashboard');
    await expect(page.locator('h1.page-title')).toContainText('Payment Dashboard');
  });

  test('full navigation flow: dashboard → accounting → lifecycle', async ({ page }) => {
    await gotoAndWait(page, '/dashboard/payments', '.payment-dashboard');

    // Navigate to accounting via quick link
    await page.locator('a.quick-link', { hasText: 'Accounting' }).click();
    await expect(page).toHaveURL(/payments\/accounting/);
    await expect(page.locator('.accounting')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1.page-title')).toContainText('Accounting');

    // Navigate to lifecycle
    await gotoAndWait(page, '/dashboard/payments/lifecycle', '.lifecycle');
    await expect(page.locator('h1.page-title')).toContainText('Lifecycle');
  });
});
