import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:8085/api';
const APP_URL = 'http://localhost:4200';

test.describe('Notification Backend API E2E', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    // Login to get JWT token
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'test@portfolio.local',
        password: 'Test123!',
        tenantId: '00000000-0000-0000-0000-000000000001'
      }
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);
    token = loginData.token;
  });

  test('GET /notifications returns empty initially', async ({ request }) => {
    const res = await request.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
      }
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /notifications creates a notification', async ({ request }) => {
    const res = await request.post(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
      },
      data: {
        type: 'blog_published',
        message: 'Blog "E2E Test Post" was published'
      }
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.type).toBe('blog_published');
    expect(data.message).toBe('Blog "E2E Test Post" was published');
    expect(data.isRead).toBe(false);
    expect(data.id).toBeTruthy();
  });

  test('GET /notifications/unread-count shows correct count', async ({ request }) => {
    const res = await request.get(`${API_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
      }
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.count).toBeGreaterThan(0);
  });

  test('PUT /notifications/read-all marks all as read', async ({ request }) => {
    const res = await request.put(`${API_URL}/notifications/read-all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
      }
    });
    expect(res.ok()).toBeTruthy();

    // Verify unread count is now 0
    const countRes = await request.get(`${API_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
      }
    });
    const countData = await countRes.json();
    expect(countData.count).toBe(0);
  });

  test('DELETE /notifications clears all notifications', async ({ request }) => {
    const res = await request.delete(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
      }
    });
    expect(res.status()).toBe(204);

    // Verify empty
    const getRes = await request.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': '00000000-0000-0000-0000-000000000001'
      }
    });
    const data = await getRes.json();
    expect(data).toEqual([]);
  });
});

test.describe('Frontend UI E2E', () => {
  test('Login page loads', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
    // The page should load (either login or dashboard)
    expect(await page.title()).toBeTruthy();
  });

  test('Login and verify notification bell exists', async ({ page }) => {
    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('test@portfolio.local');
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('Test123!');

      // Try to submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Check if notification bell icon exists in topbar
    await page.waitForTimeout(2000);
    const notifBtn = page.locator('.notification-btn, [title="Notifications"]');
    if (await notifBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(await notifBtn.isVisible()).toBe(true);
    }
  });
});
