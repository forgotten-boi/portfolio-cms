import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Portfolio CMS — Payment Integration E2E Tests.
 * Uses the Playwright MCP server at port 9000.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start the Angular dev server and BFF server before tests */
  webServer: [
    {
      command: 'npm run start',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'cd server && npm run dev',
      url: 'http://localhost:3100/api/health',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
