import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';
const API_URL = 'http://localhost:8085/api';

test.describe('Portfolio Manager - E2E Tests', () => {
  const adminEmail = 'admin@portfolio.local';
  const adminPassword = 'Admin@123!';
  const tenantId = '00000000-0000-0000-0000-000000000001';

  async function login(page: any) {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input#email', adminEmail);
    await page.fill('input#password', adminPassword);
    // Fill tenantId if visible
    const tenantInput = page.locator('input#tenantId');
    if (await tenantInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tenantInput.fill(tenantId);
    }
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  }

  test('1. Sidebar shows Portfolio Manager link', async ({ page }) => {
    await login(page);
    
    // Sidebar should contain a Portfolio Manager nav item
    const sidebar = page.locator('app-sidebar');
    await expect(sidebar).toBeVisible({ timeout: 5000 });
    
    // Check portfolio manager link exists
    const pmLink = sidebar.locator('a[href*="portfolio-manager"]');
    const pmLinkCount = await pmLink.count();
    console.log(`Portfolio Manager links found: ${pmLinkCount}`);
    expect(pmLinkCount).toBeGreaterThanOrEqual(1);
    
    console.log('✓ Sidebar has Portfolio Manager link');
  });

  test('2. Portfolio Manager page loads', async ({ page }) => {
    await login(page);
    
    // Navigate to portfolio manager
    await page.goto(`${BASE_URL}/dashboard/portfolio-manager`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Should show portfolio manager component
    const pmComponent = page.locator('app-portfolio-manager');
    await expect(pmComponent).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Portfolio Manager page loads');
  });

  test('3. Portfolio Manager shows list or empty state', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard/portfolio-manager`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Should show either portfolio cards or empty state
    const listView = page.locator('.list-view');
    const emptyState = page.locator('.empty-state');
    const portfolioCard = page.locator('.portfolio-card');
    
    // Wait for loading to finish
    await page.waitForSelector('.loading-state', { state: 'hidden', timeout: 10000 }).catch(() => {});
    
    const hasListView = await listView.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasCards = await portfolioCard.count() > 0;
    
    console.log(`List view visible: ${hasListView}, Empty state: ${hasEmptyState}, Cards: ${hasCards}`);
    
    // Either empty state or cards should be showing
    expect(hasListView || hasEmptyState).toBeTruthy();
    
    console.log('✓ Portfolio Manager shows list or empty state');
  });

  test('4. Create New Portfolio opens editor', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard/portfolio-manager`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for loading to finish
    await page.waitForSelector('.loading-state', { state: 'hidden', timeout: 10000 }).catch(() => {});
    
    // Click "Create Portfolio" button
    const createBtn = page.locator('.btn-create').first();
    await expect(createBtn).toBeVisible({ timeout: 5000 });
    await createBtn.click();
    
    // Editor should appear
    const editor = page.locator('.editor-layout');
    await expect(editor).toBeVisible({ timeout: 5000 });
    
    // Section nav should be visible
    const sectionNav = page.locator('.section-nav');
    await expect(sectionNav).toBeVisible({ timeout: 3000 });
    
    // About section should be active by default
    const aboutPanel = page.locator('.section-panel');
    await expect(aboutPanel).toBeVisible({ timeout: 3000 });
    
    console.log('✓ Create Portfolio opens editor view');
  });

  test('5. Dashboard page loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    const dashboard = page.locator('app-dashboard');
    await expect(dashboard).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Dashboard page loads');
  });

  test('6. Blogs page loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard/blogs`);
    await page.waitForLoadState('networkidle');
    
    const blogs = page.locator('app-blogs');
    await expect(blogs).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Blogs page loads');
  });

  test('7. Settings page loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard/settings`);
    await page.waitForLoadState('networkidle');
    
    const settings = page.locator('app-settings');
    await expect(settings).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Settings page loads');
  });

  test('8. CV Manager page loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard/cv-manager`);
    await page.waitForLoadState('networkidle');
    
    const cvManager = page.locator('app-cv-manager');
    await expect(cvManager).toBeVisible({ timeout: 5000 });
    
    console.log('✓ CV Manager page loads');
  });

  test('9. All sidebar nav routes work', async ({ page }) => {
    await login(page);
    
    const routes = [
      { path: '/dashboard', selector: 'app-dashboard', name: 'Dashboard' },
      { path: '/dashboard/blogs', selector: 'app-blogs', name: 'Blogs' },
      { path: '/dashboard/cv-manager', selector: 'app-cv-manager', name: 'CV Manager' },
      { path: '/dashboard/job-matcher', selector: 'app-job-matcher', name: 'Job Matcher' },
      { path: '/dashboard/resume-generator', selector: 'app-resume-generator', name: 'Resume Generator' },
      { path: '/dashboard/analytics', selector: 'app-analytics', name: 'Analytics' },
      { path: '/dashboard/portfolio-manager', selector: 'app-portfolio-manager', name: 'Portfolio Manager' },
      { path: '/dashboard/settings', selector: 'app-settings', name: 'Settings' },
    ];

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path}`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const component = page.locator(route.selector);
      const isVisible = await component.isVisible({ timeout: 5000 }).catch(() => false);
      
      console.log(`  ${isVisible ? '✓' : '✗'} ${route.name} (${route.path})`);
      expect(isVisible).toBeTruthy();
    }
    
    console.log('✓ All sidebar nav routes work');
  });
});
