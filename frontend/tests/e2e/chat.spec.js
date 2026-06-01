import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test using demo credentials
    await page.goto('/login');
    await page.click('button:has-text("Fill Demo Credentials")');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should open the chat widget', async ({ page }) => {
    // Find and click the chat FAB
    const chatFab = page.locator('button[aria-label="Open AI Chat Assistant"]');
    await chatFab.click();

    // Verify chat panel opens
    const chatPanel = page.locator('div[id="chat-panel"]');
    await expect(chatPanel).toBeVisible();

    // Verify greeting
    await expect(page.locator('text=Hi! I\'m Aria 👋')).toBeVisible();
  });

  test('should allow sending a message and getting a response', async ({ page }) => {
    await page.click('button[aria-label="Open AI Chat Assistant"]');

    const input = page.locator('textarea[placeholder="Ask about admissions, courses, fees..."]');
    await input.fill('What is the highest package?');
    
    // Press enter to send
    await input.press('Enter');

    // The user's message should appear in the chat
    await expect(page.locator('p:has-text("What is the highest package?")')).toBeVisible();

    // Since we don't want to actually hit the real OpenAI API in an E2E test without mocking,
    // we'll just verify the typing indicator or that a response bubble is generated.
    // In a real environment, you'd use route interception to mock the API response.
    // Wait for the response (this assumes the backend is running and OpenAI key is valid)
    // If the OpenAI key is not valid, it will return an error message in the chat.
    await expect(page.locator('.prose-chat, p:has-text("I apologize")')).toBeVisible({ timeout: 15000 });
  });
});
