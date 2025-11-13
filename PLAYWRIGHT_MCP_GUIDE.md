# Playwright MCP Testing Guide for Portfolio CMS

## Overview

This guide demonstrates how to use Playwright MCP (running on port 9000) to test the Portfolio CMS application.

## Prerequisites

- ✅ Angular app running on http://localhost:4200
- ✅ Playwright MCP server running on port 9000
- ✅ Backend API running on http://localhost:5000 (for full functionality)

## Test Execution Summary

### Tests Executed ✅

#### Test 1: Login Page Load
**Objective**: Verify login page loads correctly

**Playwright Commands**:
```javascript
await page.goto('http://localhost:4200');
// Page should auto-redirect to /login
```

**Results**:
- ✅ Page loaded successfully
- ✅ Redirected to /login
- ✅ Title: "PortfolioCmsWeb"
- ✅ Heading "Portfolio CMS" visible
- ✅ All form fields present (Tenant ID, Email, Password)
- ✅ Login button present and disabled

**Screenshot**: `login-page.png`

---

#### Test 2: Form Validation
**Objective**: Verify form validation and input handling

**Playwright Commands**:
```javascript
// Fill form fields
await page.getByRole('textbox', { name: 'Tenant ID' }).fill('tenant1');
await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com');
await page.getByRole('textbox', { name: 'Password' }).fill('password123');

// Take screenshot
await page.screenshot();
```

**Results**:
- ✅ Tenant ID field accepts input
- ✅ Email field accepts input
- ✅ Password field accepts input (masked)
- ✅ Login button enabled after filling all fields
- ✅ Form validation working correctly

**Screenshot**: `login-form-filled.png`

---

## Manual Test Scripts

### Test Script 1: Complete Login Flow (Requires Backend)

```javascript
// Navigate to application
await page.goto('http://localhost:4200');

// Verify redirect to login
await expect(page).toHaveURL(/.*login/);

// Fill login form
await page.getByRole('textbox', { name: 'Tenant ID' }).fill('tenant1');
await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com');
await page.getByRole('textbox', { name: 'Password' }).fill('password123');

// Click login button
await page.getByRole('button', { name: 'Login' }).click();

// Verify redirect to dashboard
await expect(page).toHaveURL(/.*dashboard/);

// Verify navbar is visible
await expect(page.getByRole('navigation')).toBeVisible();

// Verify dashboard heading
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

// Take screenshot
await page.screenshot({ path: 'dashboard.png' });
```

**Expected Results**:
- Login successful
- Redirect to dashboard
- Dashboard loads with statistics
- Navbar visible with navigation links

---

### Test Script 2: Navigate to Blogs

```javascript
// Assuming already logged in
await page.goto('http://localhost:4200/dashboard');

// Click Blogs link in navbar
await page.getByRole('link', { name: 'Blogs' }).click();

// Verify blogs page
await expect(page).toHaveURL(/.*blogs/);
await expect(page.getByRole('heading', { name: 'Blogs' })).toBeVisible();

// Verify Create button
await expect(page.getByRole('button', { name: 'Create New Blog' })).toBeVisible();

// Take screenshot
await page.screenshot({ path: 'blogs-page.png' });
```

---

### Test Script 3: Create New Blog

```javascript
// Navigate to blog form
await page.goto('http://localhost:4200/dashboard/blogs/new');

// Fill blog form
await page.getByLabel('Title').fill('My Test Blog Post');
await page.getByLabel('Summary').fill('This is a test summary for the blog post');
await page.getByLabel('Content').fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit...');
await page.getByLabel('Tags').fill('test, angular, cms');

// Check publish checkbox
await page.getByRole('checkbox', { name: 'Publish immediately' }).check();

// Take screenshot of filled form
await page.screenshot({ path: 'blog-form-filled.png' });

// Click Create button
await page.getByRole('button', { name: 'Create Blog' }).click();

// Verify redirect back to blogs list
await expect(page).toHaveURL(/.*\/blogs$/);

// Verify new blog appears in list
await expect(page.getByText('My Test Blog Post')).toBeVisible();

// Take screenshot
await page.screenshot({ path: 'blog-created.png' });
```

---

### Test Script 4: Edit Blog

```javascript
// Navigate to blogs page
await page.goto('http://localhost:4200/dashboard/blogs');

// Find a blog card and click Edit
const firstBlog = page.locator('.blog-card').first();
await firstBlog.getByRole('button', { name: 'Edit' }).click();

// Verify edit form loaded
await expect(page).toHaveURL(/.*\/blogs\/edit\/.*/);
await expect(page.getByRole('heading', { name: 'Edit Blog' })).toBeVisible();

// Change title
const titleInput = page.getByLabel('Title');
await titleInput.clear();
await titleInput.fill('Updated Blog Title');

// Click Update button
await page.getByRole('button', { name: 'Update Blog' }).click();

// Verify redirect and update
await expect(page).toHaveURL(/.*\/blogs$/);
await expect(page.getByText('Updated Blog Title')).toBeVisible();
```

---

### Test Script 5: Delete Blog

```javascript
// Navigate to blogs page
await page.goto('http://localhost:4200/dashboard/blogs');

// Count blogs before delete
const blogCount = await page.locator('.blog-card').count();

// Find a blog card and click Delete
const firstBlog = page.locator('.blog-card').first();
const blogTitle = await firstBlog.locator('h3').textContent();

// Click delete button
await firstBlog.getByRole('button', { name: 'Delete' }).click();

// Handle confirmation dialog
page.once('dialog', dialog => {
  expect(dialog.message()).toContain(blogTitle);
  dialog.accept();
});

// Wait for blog to be removed
await page.waitForFunction(
  (count) => document.querySelectorAll('.blog-card').length === count - 1,
  blogCount
);

// Verify blog count decreased
const newBlogCount = await page.locator('.blog-card').count();
expect(newBlogCount).toBe(blogCount - 1);
```

---

### Test Script 6: Navigate to Portfolios

```javascript
// From dashboard, click Portfolios link
await page.goto('http://localhost:4200/dashboard');
await page.getByRole('link', { name: 'Portfolios' }).click();

// Verify portfolios page
await expect(page).toHaveURL(/.*portfolios/);
await expect(page.getByRole('heading', { name: 'Portfolios' })).toBeVisible();

// Verify Create button
await expect(page.getByRole('button', { name: 'Create New Portfolio' })).toBeVisible();

// Take screenshot
await page.screenshot({ path: 'portfolios-page.png' });
```

---

### Test Script 7: Create Portfolio

```javascript
// Navigate to portfolio form
await page.goto('http://localhost:4200/dashboard/portfolios/new');

// Fill portfolio form
await page.getByLabel('Title').fill('John Doe');
await page.getByLabel('Subtitle').fill('Full Stack Developer');
await page.getByLabel('Bio').fill('Experienced developer with 5+ years in web development...');

// Select template
await page.getByLabel('Template').selectOption('Modern');

// Check public checkbox
await page.getByRole('checkbox', { name: 'Make portfolio public' }).check();
await page.getByRole('checkbox', { name: 'Enable featured blogs' }).check();

// Take screenshot
await page.screenshot({ path: 'portfolio-form-filled.png' });

// Click Create button
await page.getByRole('button', { name: 'Create Portfolio' }).click();

// Verify redirect and creation
await expect(page).toHaveURL(/.*\/portfolios$/);
await expect(page.getByText('John Doe')).toBeVisible();
```

---

### Test Script 8: View Users Page

```javascript
// Navigate to users page
await page.goto('http://localhost:4200/dashboard/users');

// Verify users page loaded
await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

// Verify table headers
await expect(page.getByText('Name')).toBeVisible();
await expect(page.getByText('Email')).toBeVisible();
await expect(page.getByText('Role')).toBeVisible();
await expect(page.getByText('Created')).toBeVisible();

// Take screenshot
await page.screenshot({ path: 'users-page.png' });
```

---

### Test Script 9: View Tenants Page

```javascript
// Navigate to tenants page
await page.goto('http://localhost:4200/dashboard/tenants');

// Verify tenants page loaded
await expect(page.getByRole('heading', { name: 'Tenants' })).toBeVisible();

// Take screenshot
await page.screenshot({ path: 'tenants-page.png' });
```

---

### Test Script 10: Logout

```javascript
// From any dashboard page
await page.goto('http://localhost:4200/dashboard');

// Click logout button in navbar
await page.getByRole('button', { name: 'Logout' }).click();

// Verify redirect to login
await expect(page).toHaveURL(/.*login/);

// Verify localStorage cleared
const token = await page.evaluate(() => localStorage.getItem('token'));
expect(token).toBeNull();

// Try to access protected route
await page.goto('http://localhost:4200/dashboard');

// Should redirect to login
await expect(page).toHaveURL(/.*login/);
```

---

### Test Script 11: Responsive Design - Mobile

```javascript
// Set mobile viewport
await page.setViewportSize({ width: 375, height: 667 });

// Navigate to each page and take screenshots
const pages = [
  '/login',
  '/dashboard',
  '/dashboard/blogs',
  '/dashboard/portfolios',
  '/dashboard/users',
  '/dashboard/tenants'
];

for (const url of pages) {
  await page.goto(`http://localhost:4200${url}`);
  await page.screenshot({ path: `mobile-${url.replace(/\//g, '-')}.png` });
}

// Verify cards stack vertically
await page.goto('http://localhost:4200/dashboard/blogs');
const cards = page.locator('.blog-card');
const firstCard = cards.first().boundingBox();
const secondCard = cards.nth(1).boundingBox();

// On mobile, second card should be below first card
if (firstCard && secondCard) {
  expect(secondCard.y).toBeGreaterThan(firstCard.y + firstCard.height);
}
```

---

### Test Script 12: Responsive Design - Tablet

```javascript
// Set tablet viewport
await page.setViewportSize({ width: 768, height: 1024 });

// Navigate and screenshot
await page.goto('http://localhost:4200/dashboard/blogs');
await page.screenshot({ path: 'tablet-blogs.png' });

await page.goto('http://localhost:4200/dashboard/portfolios');
await page.screenshot({ path: 'tablet-portfolios.png' });
```

---

## Playwright MCP Commands Used

### Navigation
```javascript
// Navigate to URL
await page.goto('http://localhost:4200');

// Go back
await page.goBack();

// Reload
await page.reload();
```

### Page Snapshot
```javascript
// Get current page state
const snapshot = await page.snapshot();
```

### Screenshots
```javascript
// Full page screenshot
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// Viewport screenshot
await page.screenshot({ path: 'screenshot.png' });

// Element screenshot
await element.screenshot({ path: 'element.png' });
```

### Interactions
```javascript
// Click element
await page.getByRole('button', { name: 'Login' }).click();

// Fill text input
await page.getByLabel('Email').fill('admin@example.com');

// Select dropdown
await page.getByLabel('Template').selectOption('Modern');

// Check checkbox
await page.getByRole('checkbox', { name: 'Public' }).check();

// Type text
await page.getByLabel('Content').type('Text content here');
```

### Assertions
```javascript
// URL assertion
await expect(page).toHaveURL(/.*dashboard/);

// Visibility assertion
await expect(page.getByText('Dashboard')).toBeVisible();

// Count assertion
const count = await page.locator('.card').count();
expect(count).toBe(5);
```

### Console Messages
```javascript
// Get console messages
const messages = await page.consoleMessages();

// Filter errors only
const errors = messages.filter(m => m.type === 'error');
```

---

## Test Results

### Executed Tests: 2/12
- ✅ Login page load
- ✅ Form validation

### Blocked Tests: 10/12
All remaining tests require the backend API to be running.

### Pass Rate: 100% (2/2 executed tests)

---

## Required Setup for Full Testing

1. **Start Backend API**:
   ```bash
   cd portfolio.api
   dotnet run
   ```

2. **Ensure Database**:
   - PostgreSQL running
   - Database created
   - Migrations applied

3. **Create Test Data**:
   - Test tenant
   - Test user (admin@example.com)
   - Sample blogs
   - Sample portfolios

4. **Run Tests**:
   - Execute Playwright MCP tests
   - Verify all functionality

---

## Conclusion

The Playwright MCP testing infrastructure is set up and working. Basic UI tests pass successfully. Full integration testing requires the backend API to be running.

**Next Step**: Start the backend API to enable full E2E testing.
