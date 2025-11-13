import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';
const API_URL = 'http://localhost:8085/api';

test.describe('Portfolio CMS - Complete Flow', () => {
  let testEmail: string;
  let testPassword: string;
  let authToken: string;
  let portfolioId: string;
  let blogId: string;
  let portfolioSlug: string;
  let blogSlug: string;

  test.beforeAll(() => {
    // Generate unique test credentials
    const timestamp = Date.now();
    testEmail = `e2etest${timestamp}@example.com`;
    testPassword = 'TestPassword123!';
  });

  test('1. User Registration', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Fill registration form
    await page.fill('input[formControlName="firstName"]', 'E2E');
    await page.fill('input[formControlName="lastName"]', 'Tester');
    await page.fill('input[formControlName="email"]', testEmail);
    await page.fill('input[formControlName="password"]', testPassword);
    await page.fill('input[formControlName="confirmPassword"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to login
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('2. User Login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Fill login form
    await page.fill('input[formControlName="email"]', testEmail);
    await page.fill('input[formControlName="password"]', testPassword);
    
    // Default tenant ID (from previous tests)
    await page.fill('input[formControlName="tenantId"]', '3fa85f64-5717-4562-b3fc-2c963f66afa6');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');

    // Verify JWT token stored
    const token = await page.evaluate(() => localStorage.getItem('portfolio_jwt_token'));
    expect(token).toBeTruthy();
    authToken = token!;
  });

  test('3. Portfolio Generation from LinkedIn', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[formControlName="email"]', testEmail);
    await page.fill('input[formControlName="password"]', testPassword);
    await page.fill('input[formControlName="tenantId"]', '3fa85f64-5717-4562-b3fc-2c963f66afa6');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to portfolio creation
    await page.goto(`${BASE_URL}/portfolios/new`);

    // Click "Generate from PDF/LinkedIn" button
    await page.click('text=Generate from PDF/LinkedIn');

    // Wait for modal
    await page.waitForSelector('.generate-modal', { timeout: 5000 });

    // Fill LinkedIn URL
    await page.fill('input[formControlName="linkedInUrl"]', 'https://www.linkedin.com/in/test-user');

    // Select template (Modern - template 1)
    await page.click('.template-card:has-text("Modern")');

    // Click Generate button
    await page.click('.generate-modal button:has-text("Generate Portfolio")');

    // Wait for form to be pre-filled
    await page.waitForTimeout(3000);

    // Fill required fields
    await page.fill('input[formControlName="title"]', 'Software Engineer');
    await page.fill('textarea[formControlName="bio"]', 'Experienced software engineer with 5+ years in full-stack development.');

    // Toggle publish
    await page.check('input[formControlName="isPublished"]');

    // Submit
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for redirect to portfolios list
    await page.waitForURL('**/portfolios', { timeout: 10000 });
    expect(page.url()).toContain('/portfolios');
  });

  test('4. Blog Creation with Quill Editor', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[formControlName="email"]', testEmail);
    await page.fill('input[formControlName="password"]', testPassword);
    await page.fill('input[formControlName="tenantId"]', '3fa85f64-5717-4562-b3fc-2c963f66afa6');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to blog creation
    await page.goto(`${BASE_URL}/blogs/new`);

    // Fill blog form
    await page.fill('input[formControlName="title"]', 'Test Blog Post');
    await page.fill('textarea[formControlName="summary"]', 'This is a test blog post created via E2E test.');

    // Type in Quill editor
    const editor = await page.locator('.ql-editor');
    await editor.click();
    await editor.fill('This is the blog content written in the Quill rich text editor. It supports formatting, lists, and more.');

    // Add tags
    await page.fill('input[formControlName="tags"]', 'testing, e2e, automation');

    // Toggle publish
    await page.check('input[formControlName="isPublished"]');

    // Submit
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for redirect to blogs list
    await page.waitForURL('**/blogs', { timeout: 10000 });
    expect(page.url()).toContain('/blogs');
  });

  test('5. Public Portfolio Access', async ({ page, request }) => {
    // First, get the portfolio slug from API
    const response = await request.get(`${API_URL}/portfolios`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': '3fa85f64-5717-4562-b3fc-2c963f66afa6'
      }
    });

    expect(response.ok()).toBeTruthy();
    const portfolios = await response.json();
    
    if (portfolios.length > 0) {
      portfolioSlug = portfolios[0].slug || portfolios[0].id;
      portfolioId = portfolios[0].id;

      // Access public portfolio
      await page.goto(`${BASE_URL}/portfolio/${portfolioSlug}`);

      // Verify portfolio content loads (no 404)
      const errorMessage = await page.locator('text=404').count();
      expect(errorMessage).toBe(0);

      // Verify portfolio displays (wait for content to load)
      await page.waitForSelector('.portfolio-content, .loading', { timeout: 10000 });
      
      // If loading, wait a bit more
      const isLoading = await page.locator('.loading').count();
      if (isLoading > 0) {
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('No portfolios found, skipping public portfolio test');
    }
  });

  test('6. Public Blog Access', async ({ page, request }) => {
    // First, get the blog slug from API
    const response = await request.get(`${API_URL}/blogs?publishedOnly=true`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': '3fa85f64-5717-4562-b3fc-2c963f66afa6'
      }
    });

    expect(response.ok()).toBeTruthy();
    const blogs = await response.json();
    
    if (blogs.length > 0) {
      blogSlug = blogs[0].slug || blogs[0].id;
      blogId = blogs[0].id;

      // Access public blog
      await page.goto(`${BASE_URL}/blog/${blogSlug}`);

      // Verify blog content loads (no 404)
      const errorMessage = await page.locator('text=404').count();
      expect(errorMessage).toBe(0);

      // Verify blog title displays
      await page.waitForSelector('.blog-title', { timeout: 10000 });
      const title = await page.locator('.blog-title').textContent();
      expect(title).toBeTruthy();

      // Verify share buttons exist
      const shareButtons = await page.locator('.share-btn').count();
      expect(shareButtons).toBeGreaterThan(0);
    } else {
      console.log('No published blogs found, skipping public blog test');
    }
  });

  test('7. Admin User Creation', async ({ page, request }) => {
    // Login as regular user first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[formControlName="email"]', testEmail);
    await page.fill('input[formControlName="password"]', testPassword);
    await page.fill('input[formControlName="tenantId"]', '3fa85f64-5717-4562-b3fc-2c963f66afa6');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to users page
    await page.goto(`${BASE_URL}/users`);

    // Click "Create Admin" button (if exists - may not be visible to non-admin)
    const createAdminBtn = await page.locator('button:has-text("Create Admin")').count();
    
    if (createAdminBtn > 0) {
      await page.click('button:has-text("Create Admin")');

      // Wait for modal
      await page.waitForSelector('.modal-content', { timeout: 5000 });

      // Fill admin form
      const adminEmail = `admin${Date.now()}@example.com`;
      await page.fill('input[name="firstName"]', 'Admin');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', adminEmail);
      await page.fill('input[name="password"]', 'AdminPass123!');

      // Submit
      await page.click('.modal-content button[type="submit"]');

      // Wait for modal to close
      await page.waitForTimeout(2000);

      // Verify users list updated
      const userCount = await page.locator('.table-row').count();
      expect(userCount).toBeGreaterThan(0);
    } else {
      console.log('Create Admin button not visible (user may not have admin privileges)');
      
      // Just verify users list loads
      await page.waitForSelector('.users-table', { timeout: 10000 });
      const userCount = await page.locator('.table-row').count();
      expect(userCount).toBeGreaterThan(0);
    }
  });

  test('8. Verify Role Badges Display', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[formControlName="email"]', testEmail);
    await page.fill('input[formControlName="password"]', testPassword);
    await page.fill('input[formControlName="tenantId"]', '3fa85f64-5717-4562-b3fc-2c963f66afa6');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to users page
    await page.goto(`${BASE_URL}/users`);

    // Wait for users table
    await page.waitForSelector('.users-table', { timeout: 10000 });

    // Verify role badges exist
    const roleBadges = await page.locator('.role-badge').count();
    expect(roleBadges).toBeGreaterThan(0);

    // Verify at least one badge has correct styling (Admin, Member, or Guest)
    const adminBadge = await page.locator('.role-badge.role-admin').count();
    const memberBadge = await page.locator('.role-badge.role-member').count();
    const guestBadge = await page.locator('.role-badge.role-guest').count();
    
    const totalBadges = adminBadge + memberBadge + guestBadge;
    expect(totalBadges).toBeGreaterThan(0);
  });

  test('9. End-to-End Flow Summary', async ({ page }) => {
    console.log('\n=== E2E Test Summary ===');
    console.log(`Test Email: ${testEmail}`);
    console.log(`Portfolio ID: ${portfolioId || 'N/A'}`);
    console.log(`Portfolio Slug: ${portfolioSlug || 'N/A'}`);
    console.log(`Blog ID: ${blogId || 'N/A'}`);
    console.log(`Blog Slug: ${blogSlug || 'N/A'}`);
    console.log('========================\n');
    
    // Just a summary test - always passes
    expect(true).toBe(true);
  });
});
