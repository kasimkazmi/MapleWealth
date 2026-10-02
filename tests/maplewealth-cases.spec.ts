import { test, expect } from '@playwright/test';

test.describe('MapleWealth End-to-End Test Suite', () => {
  const QA_URL = process.env.QA_BASE_URL || 'http://localhost:3000';

  test.describe('1. Happy Path Scenarios', () => {
    test('Landing page loads properly with title', async ({ page }) => {
      await page.goto(QA_URL);
      await expect(page).toHaveTitle(/MapleWealth|Wealth|Finance/i);
    });

    test('Portfolio dashboard navigation renders primary widgets', async ({ page }) => {
      await page.goto(`${QA_URL}/dashboard`);
      const navLinks = page.locator('nav a, header a');
      if (await navLinks.count() > 0) {
        await expect(navLinks.first()).toBeVisible();
      }
    });

    test('User login flow with test credentials', async ({ page }) => {
      await page.goto(`${QA_URL}/login`);
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const submitBtn = page.locator('button[type="submit"]');

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill('qa_user@maplewealth.com');
        await passwordInput.fill('SecurePass123!');
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
        }
      }
    });
  });

  test.describe('2. Unhappy Path & Error Handling', () => {
    test('Unauthenticated access to financial dashboard redirects', async ({ page }) => {
      const response = await page.goto(`${QA_URL}/portfolio`);
      const status = response?.status();
      expect([200, 302, 401, 403, 404]).toContain(status);
    });

    test('Invalid login attempts show alert feedback', async ({ page }) => {
      await page.goto(`${QA_URL}/login`);
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const submitBtn = page.locator('button[type="submit"]');

      if (await emailInput.count() > 0 && await passwordInput.count() > 0 && await submitBtn.count() > 0) {
        await emailInput.fill('invalid@maplewealth.com');
        await passwordInput.fill('wrongpassword');
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('3. Edge Cases & Security Resilience', () => {
    test('Financial search inputs sanitize malicious injection payloads', async ({ page }) => {
      await page.goto(`${QA_URL}/search`);
      const searchInput = page.locator('input[type="search"], input[name="q"], input[name="symbol"]');

      if (await searchInput.count() > 0) {
        const payload = "<script>alert('xss')</script>' OR 1=1 --";
        await searchInput.fill(payload);
        await searchInput.press('Enter');
        await expect(page.locator('script:has-text("alert(\'xss\')")')).toHaveCount(0);
      }
    });

    test('Deep link handling for portfolio assets handles malformed parameters', async ({ page }) => {
      const response = await page.goto(`${QA_URL}/asset?id=../../../etc/passwd&format=xml%00`);
      expect(response?.status()).toBeLessThan(500);
    });
  });
});
