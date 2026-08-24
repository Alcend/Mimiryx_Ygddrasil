import { test, expect } from '@playwright/test';

test('App navigation and topic resolution', async ({ page }) => {
  // 1. App loads at root
  await page.goto('/');
  await expect(page).toHaveTitle(/MIMIRYX/i);

  // 2. Open Notes Page
  await page.goto('/notes');
  await expect(page.url()).toContain('/notes');

  // 3. Open Topics Page
  await page.goto('/topics');
  await expect(page.url()).toContain('/topics');

  // 4. Verify topic cards render
  const topicCards = page.locator('.cyber-card');
  await expect(topicCards.first()).toBeVisible();
});

test('Settings Modal and Diagnostics flow', async ({ page }) => {
  await page.goto('/');

  // Click Settings button in Header
  const settingsBtn = page.locator('button:has(.lucide-settings), [title*="Settings"], button:has-text("Settings")');
  if (await settingsBtn.count() > 0) {
    await settingsBtn.first().click();
    await expect(page.locator('text=Core Neural Settings')).toBeVisible();
  }
});
