import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  test('should allow a new user to sign up', async ({ page }) => {
    await page.goto('/signup');

    // Fill the signup form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check for success toast or dashboard element
    await expect(page.locator('h1')).toContainText('Test User 👋');
  });

  test('should allow an existing user to log in', async ({ page }) => {
    // We assume the demo user exists or we use a known good credential
    // The codebase has a "Fill Demo Credentials" button
    await page.goto('/login');

    // Click the demo credentials button
    await page.click('button:has-text("Fill Demo Credentials")');

    // Submit the login form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show validation errors on invalid login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid_email');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Enter a valid email')).toBeVisible();
  });
});
