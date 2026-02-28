# Playwright E2E Testing Guide

## Overview

End-to-end tests verify the full payment integration flow including navigation, form submission, lifecycle automation, real-time events, and analytics dashboards.

Tests are located in the `e2e/` directory and configured via `playwright.config.ts`.

## Prerequisites

- Node.js 18+
- Playwright browsers installed

## Setup

```bash
# Install Playwright (from project root)
npx playwright install

# Or install with dependencies
npx playwright install --with-deps chromium
```

## Running Tests

### All tests
```bash
npx playwright test
```

### Specific test file
```bash
npx playwright test e2e/payment-dashboard.spec.ts
```

### With UI mode (interactive)
```bash
npx playwright test --ui
```

### With Playwright MCP at port 9000
The Playwright config assumes the MCP server listens at port 9000. Ensure it's running before executing tests.

## Test Files

| File | Tests | Services Required |
|------|-------|-------------------|
| `payment-dashboard.spec.ts` | Dashboard navigation, stats grid, quick links | Angular only |
| `payment-lifecycle.spec.ts` | Lifecycle demo, step pipeline, real-time events | Angular + BFF + .NET |
| `event-analytics.spec.ts` | Analytics page, metrics cards, SSE connection | Angular + BFF |
| `navigation-smoke.spec.ts` | Sidebar links, full navigation flows | Angular only |

## Environment Flags

Some tests require running backend services. Use environment variables to enable/skip:

| Variable | Purpose |
|----------|---------|
| `PAYMENT_SERVICES_RUNNING=1` | Enable tests that hit .NET microservices |
| `BFF_RUNNING=1` | Enable tests that require the BFF server |

### Run with all services available
```bash
PAYMENT_SERVICES_RUNNING=1 BFF_RUNNING=1 npx playwright test
```

### Run only frontend-level tests
```bash
npx playwright test
# Tests requiring services will be auto-skipped
```

## Test Categories

### Smoke Tests (no backend needed)
- Page navigation and rendering
- Form field visibility
- Button presence and state
- Sidebar links

### Integration Tests (BFF required)
- API-driven data loading
- SSE connection establishment
- Analytics data display

### Full E2E Tests (all services required)
- Order creation and submission
- Full lifecycle execution
- Real-time event propagation
- Ledger verification

## Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports include:
- Test results with pass/fail status
- Screenshots on failure
- Video recordings on failure
- Trace files for debugging

## Writing New Tests

```typescript
import { test, expect, Page } from '@playwright/test';

// Auth helper (reusable)
async function ensureAuthenticated(page: Page) {
  await page.goto('/');
  if (page.url().includes('/login')) {
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('tenant_id', 'test-tenant');
    });
    await page.goto('/dashboard');
  }
}

test.describe('My Payment Feature', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('should do something', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await expect(page.locator('h1')).toContainText('Payment');
  });
});
```

## CI Integration

The Playwright config includes `webServer` entries that auto-start the Angular dev server and BFF server. In CI:

```yaml
- name: E2E Tests
  run: |
    npx playwright install --with-deps chromium
    npx playwright test
  env:
    CI: true
    PAYMENT_SERVICES_RUNNING: ${{ secrets.HAS_PAYMENT_SERVICES }}
```
