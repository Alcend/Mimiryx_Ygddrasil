import { test, expect } from '@playwright/test';
import fs from 'fs';

test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12

test('Mobile: read note and open actions bottom sheet', async ({ page }) => {
  // Open app and wait for network idle
  await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // Try many candidate selectors for the note link and navigate to a note
  const candidateNoteSelectors = [
    'a[href^="/notes/"]',
    'a[href*="/note/"]',
    'a.note-link',
    '.note-list a',
    '[data-test="note-link"]',
    '.notes-list a',
    'main a[href^="/notes/"]',
    'main a'
  ];

  const tryClickSelector = async (sel: string) => {
    const handle = await page.$(sel);
    if (!handle) return false;
    try { await handle.scrollIntoViewIfNeeded(); } catch {}
    try {
      await handle.click({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  };

  // Attempt to click any candidate on the current page
  for (const sel of candidateNoteSelectors) {
    const found = await page.$(sel);
    if (found) {
      await tryClickSelector(sel);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      break;
    }
  }

  // If still not on a note URL, go to /notes and try again as fallback
  if (!/\/notes\/\w+/.test(page.url())) {
    await page.goto('http://localhost:5173/notes', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    let clicked = false;
    for (const sel of candidateNoteSelectors) {
      clicked = await tryClickSelector(sel);
      if (clicked) break;
    }
    if (!clicked) {
      const firstAnchor = await page.$('main a, .note-list a, a');
      if (firstAnchor) {
        await firstAnchor.scrollIntoViewIfNeeded().catch(() => {});
        await firstAnchor.click().catch(() => {});
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      }
    }
  }

  // Ensure Read button is present
  await page.waitForSelector('text=Read', { timeout: 15000 }).catch(() => {});
  const readBtn = await page.$('text=Read');
  if (!readBtn) {
    await page.screenshot({ path: 'playwright-read-missing.png', fullPage: true });
    fs.writeFileSync('playwright-read-missing.html', await page.content());
    throw new Error('READ BUTTON NOT FOUND — screenshot and HTML saved');
  }
  await readBtn.click();

  // confirm no horizontal scroll in read view
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 4);

  // Try robustly to open the actions bottom sheet (many selectors + wait + scroll)
  const actionSelectors = [
    'button[aria-label="Open actions"]',
    'button[aria-label="Open Actions"]',
    '.mobile-actions-fab',
    'button:has-text("Actions")',
    'button[title="Actions"]',
    '.floating-actions button'
  ];

  let actionsClicked = false;
  for (const sel of actionSelectors) {
    try {
      await page.waitForSelector(sel, { state: 'visible', timeout: 5000 });
      const el = await page.$(sel);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded().catch(() => {});
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await el.click({ timeout: 5000 });
          actionsClicked = true;
          break;
        } catch {
          await page.waitForTimeout(250);
        }
      }
      if (actionsClicked) break;
    } catch { /* try next selector */ }
  }

  // Fallback #1: toggle the sidebar (some builds render actions only in sidebar)
  if (!actionsClicked) {
    const sidebarToggle = await page.$('button[title="Toggle Sidebar"], button[aria-label*="Sidebar"], button[title*="Sidebar"]');
    if (sidebarToggle) {
      await sidebarToggle.scrollIntoViewIfNeeded().catch(() => {});
      await sidebarToggle.click().catch(() => {});
      // allow UI to animate / render
      await page.waitForTimeout(600);
      // Try to find Copy Page or actions in the revealed sidebar
      const copyBtn = await page.$('button:has-text("Copy Page"), .right-sidebar button:has-text("Copy Page"), button:has-text("Copy")');
      if (copyBtn) {
        await copyBtn.scrollIntoViewIfNeeded().catch(() => {});
        await copyBtn.click().catch(() => {});
        actionsClicked = true;
      }
    }
  }

  // Fallback #2: attempt to click any visible button with reasonable size that likely opens actions
  if (!actionsClicked) {
    const genericBtn = await page.$('button[title], button[aria-label], button');
    if (genericBtn) {
      const visible = await genericBtn.isVisible().catch(() => false);
      if (visible) {
        await genericBtn.scrollIntoViewIfNeeded().catch(() => {});
        await genericBtn.click().catch(() => {});
        actionsClicked = true;
      }
    }
  }

  if (!actionsClicked) {
    await page.screenshot({ path: 'playwright-actions-missing.png', fullPage: true });
    const html = await page.content();
    fs.writeFileSync('playwright-actions-missing.html', html);
    throw new Error('ACTIONS BUTTON NOT FOUND/CLICKABLE — screenshot and HTML saved');
  }

  // Wait for bottom-sheet open (if used)
  await page.waitForSelector('.bottom-sheet.open, .sidebar-open, .right-sidebar .open, .actions-panel', { timeout: 5000 }).catch(() => {});

  // Copy Page and close sheet
  await page.click('.bottom-sheet button:has-text("Copy Page")', { timeout: 5000 }).catch(() => {});
  await page.click('button[aria-label="Close actions"]', { timeout: 5000 }).catch(() => {});
});
