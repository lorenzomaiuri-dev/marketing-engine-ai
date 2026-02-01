import { test, expect } from '@playwright/test';

test.describe('Strategy Lab Page', () => {
  test('should allow user to build a SWOT and Marketing Mix', async ({ page }) => {
    // Navigate to the strategy page
    await page.goto('/strategy');

    // Check if the page title is correct
    await expect(page.locator('h1')).toContainText('Foundations of Strategy');

    // 1. Add a Strength to SWOT
    const swotInput = page.getByLabel('New strategic factor description');
    await swotInput.fill('Innovative Product Architecture');
    await page.getByLabel('Add factor to selected quadrant').click();

    // Verify it appeared
    await expect(page.locator('text=Innovative Product Architecture')).toBeVisible();

    // 2. Change Marketing Mix Tab
    await page.getByLabel('Product strategy tab').click();
    const productTextarea = page.getByLabel('product strategy description');
    await productTextarea.fill('AI-driven marketing engine with real-time insights.');

    // 3. Switch to Price tab
    await page.getByLabel('Price strategy tab').click();
    const priceTextarea = page.getByLabel('price strategy description');
    await priceTextarea.fill('Premium subscription model with tiered pricing.');

    // 4. Check if data is persisted (reload page)
    await page.reload();

    // Verify SWOT factor is still there
    await expect(page.locator('text=Innovative Product Architecture')).toBeVisible();

    // Verify Marketing Mix data is still there
    await page.getByLabel('Product strategy tab').click();
    await expect(page.getByLabel('product strategy description')).toHaveValue('AI-driven marketing engine with real-time insights.');
  });

  test('should export SWOT data as JSON', async ({ page }) => {
    await page.goto('/strategy');
    
    // Add a factor to ensure there's data to export
    await page.getByLabel('New strategic factor description').fill('Export Test Factor');
    await page.getByLabel('Add factor to selected quadrant').click();

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.getByLabel('Export SWOT analysis as JSON').click();
    const download = await downloadPromise;

    // Wait for the download process to complete
    expect(download.suggestedFilename()).toBe('swot-analysis.json');
  });
});
