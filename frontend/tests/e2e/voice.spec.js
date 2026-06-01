import { test, expect } from '@playwright/test';

test.describe('Voice Assistant Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test using demo credentials
    await page.goto('/login');
    await page.click('button:has-text("Fill Demo Credentials")');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should open voice assistant modal and display the initial state', async ({ page }) => {
    // Click the voice call button on the dashboard
    await page.click('button:has-text("Request Call")');

    // Wait for modal to open
    const modal = page.locator('h2:has-text("Aria Voice Assistant")');
    await expect(modal).toBeVisible();

    // Ensure the initial helper text is visible
    await expect(page.locator('text=Tap the microphone to start speaking')).toBeVisible();

    // Verify the microphone button exists
    const micButton = page.locator('button#voice-mic-button');
    await expect(micButton).toBeVisible();

    // Note: We cannot easily test real microphone/SpeechRecognition API in headless playwright
    // without mocking browser APIs or passing complex flags, so we just verify the UI structure.
  });
});
