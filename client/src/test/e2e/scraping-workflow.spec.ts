import { test, expect } from '@playwright/test';

test.describe('Complete Scraping Workflow - Backend Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the scraping dashboard
    await page.goto('/scrape');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="scrape-dashboard"]', { timeout: 10000 });
  });

  test('should connect to backend and display healthy status', async ({ page }) => {
    // Check if backend connection status is displayed
    const statusElement = await page.locator('[data-testid="backend-status"]');
    await expect(statusElement).toBeVisible();
    
    // Wait for backend health check to complete
    await page.waitForTimeout(2000);
    
    // Should show connected status
    const statusText = await statusElement.textContent();
    expect(statusText).toMatch(/connected|healthy/i);
  });

  test('should load preset groups from backend', async ({ page }) => {
    // Wait for preset groups to load
    await page.waitForSelector('[data-testid="preset-group"]', { timeout: 10000 });
    
    // Check if preset groups are displayed
    const presetGroups = await page.locator('[data-testid="preset-group"]').all();
    expect(presetGroups.length).toBeGreaterThan(0);
    
    // Verify at least one group has expected structure
    const firstGroup = presetGroups[0];
    await expect(firstGroup.locator('[data-testid="group-name"]')).toBeVisible();
    await expect(firstGroup.locator('[data-testid="company-list"]')).toBeVisible();
  });

  test('should scrape a single company using backend API', async ({ page }) => {
    // Fill in company details
    await page.fill('[data-testid="company-input"]', 'Salesforce');
    
    // Set URLs for different categories
    await page.fill('[data-testid="marketing-url"]', 'https://salesforce.com');
    await page.fill('[data-testid="docs-url"]', 'https://docs.salesforce.com');
    
    // Select categories
    await page.check('[data-testid="category-marketing"]');
    await page.check('[data-testid="category-docs"]');
    
    // Set page limit
    await page.fill('[data-testid="page-limit"]', '25');
    
    // Click scrape button
    await page.click('[data-testid="scrape-company-btn"]');
    
    // Wait for scraping to start
    await page.waitForSelector('[data-testid="scraping-progress"]', { timeout: 10000 });
    
    // Verify scraping is in progress
    const progressElement = await page.locator('[data-testid="scraping-progress"]');
    await expect(progressElement).toBeVisible();
    
    // Wait for scraping to complete (with timeout)
    await page.waitForSelector('[data-testid="scraping-complete"]', { timeout: 60000 });
    
    // Verify results are displayed
    const resultsElement = await page.locator('[data-testid="scraping-results"]');
    await expect(resultsElement).toBeVisible();
    
    // Check if scraped items are shown
    const scrapedItems = await page.locator('[data-testid="scraped-item"]').all();
    expect(scrapedItems.length).toBeGreaterThan(0);
  });

  test('should handle scraping errors gracefully', async ({ page }) => {
    // Try to scrape with invalid URL
    await page.fill('[data-testid="company-input"]', 'Invalid Company');
    await page.fill('[data-testid="marketing-url"]', 'https://invalid-url-that-does-not-exist.com');
    await page.check('[data-testid="category-marketing"]');
    
    // Click scrape button
    await page.click('[data-testid="scrape-company-btn"]');
    
    // Wait for error to be displayed
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
    
    // Verify error message is shown
    const errorElement = await page.locator('[data-testid="error-message"]');
    await expect(errorElement).toBeVisible();
    
    // Check if retry option is available
    const retryButton = await page.locator('[data-testid="retry-btn"]');
    await expect(retryButton).toBeVisible();
  });

  test('should scrape multiple companies in a group', async ({ page }) => {
    // Select a preset group
    const presetGroup = await page.locator('[data-testid="preset-group"]').first();
    await presetGroup.click();
    
    // Wait for group details to load
    await page.waitForSelector('[data-testid="group-companies"]', { timeout: 5000 });
    
    // Verify companies are loaded
    const companies = await page.locator('[data-testid="group-company"]').all();
    expect(companies.length).toBeGreaterThan(0);
    
    // Click group scrape button
    await page.click('[data-testid="scrape-group-btn"]');
    
    // Wait for group scraping to start
    await page.waitForSelector('[data-testid="group-scraping-progress"]', { timeout: 10000 });
    
    // Verify progress is shown
    const progressElement = await page.locator('[data-testid="group-scraping-progress"]');
    await expect(progressElement).toBeVisible();
    
    // Wait for completion (with longer timeout for group scraping)
    await page.waitForSelector('[data-testid="group-scraping-complete"]', { timeout: 120000 });
    
    // Verify group results
    const groupResults = await page.locator('[data-testid="group-results"]');
    await expect(groupResults).toBeVisible();
  });

  test('should export scraped data using backend API', async ({ page }) => {
    // First, scrape some data
    await page.fill('[data-testid="company-input"]', 'Test Company');
    await page.fill('[data-testid="marketing-url"]', 'https://example.com');
    await page.check('[data-testid="category-marketing"]');
    await page.click('[data-testid="scrape-company-btn"]');
    
    // Wait for scraping to complete
    await page.waitForSelector('[data-testid="scraping-complete"]', { timeout: 60000 });
    
    // Click export button
    await page.click('[data-testid="export-btn"]');
    
    // Wait for export options to appear
    await page.waitForSelector('[data-testid="export-options"]', { timeout: 5000 });
    
    // Select export format
    await page.selectOption('[data-testid="export-format"]', 'csv');
    
    // Click export
    await page.click('[data-testid="export-confirm-btn"]');
    
    // Wait for export to complete
    await page.waitForSelector('[data-testid="export-complete"]', { timeout: 30000 });
    
    // Verify export success
    const exportSuccess = await page.locator('[data-testid="export-complete"]');
    await expect(exportSuccess).toBeVisible();
  });

  test('should import data from file using backend API', async ({ page }) => {
    // Click import button
    await page.click('[data-testid="import-btn"]');
    
    // Wait for import dialog
    await page.waitForSelector('[data-testid="import-dialog"]', { timeout: 5000 });
    
    // Create a test file
    const testFile = new File(['company,category,url\nTest Company,marketing,https://example.com'], 'test.csv', {
      type: 'text/csv',
    });
    
    // Upload file
    const fileInput = await page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles([testFile]);
    
    // Click import
    await page.click('[data-testid="import-confirm-btn"]');
    
    // Wait for import to complete
    await page.waitForSelector('[data-testid="import-complete"]', { timeout: 30000 });
    
    // Verify import success
    const importSuccess = await page.locator('[data-testid="import-complete"]');
    await expect(importSuccess).toBeVisible();
    
    // Check if imported data is displayed
    const importedItems = await page.locator('[data-testid="imported-item"]').all();
    expect(importedItems.length).toBeGreaterThan(0);
  });

  test('should navigate between different scraping modes', async ({ page }) => {
    // Test single company scraping
    await page.click('[data-testid="single-company-tab"]');
    await expect(page.locator('[data-testid="single-company-form"]')).toBeVisible();
    
    // Test group scraping
    await page.click('[data-testid="group-scraping-tab"]');
    await expect(page.locator('[data-testid="group-scraping-form"]')).toBeVisible();
    
    // Test mass scraping
    await page.click('[data-testid="mass-scraping-tab"]');
    await expect(page.locator('[data-testid="mass-scraping-form"]')).toBeVisible();
    
    // Test custom scraping
    await page.click('[data-testid="custom-scraping-tab"]');
    await expect(page.locator('[data-testid="custom-scraping-form"]')).toBeVisible();
  });

  test('should display real-time scraping progress', async ({ page }) => {
    // Start scraping
    await page.fill('[data-testid="company-input"]', 'Progress Test');
    await page.fill('[data-testid="marketing-url"]', 'https://example.com');
    await page.check('[data-testid="category-marketing"]');
    await page.click('[data-testid="scrape-company-btn"]');
    
    // Wait for progress to start
    await page.waitForSelector('[data-testid="scraping-progress"]', { timeout: 10000 });
    
    // Check progress indicators
    const progressBar = await page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible();
    
    const progressText = await page.locator('[data-testid="progress-text"]');
    await expect(progressText).toBeVisible();
    
    // Progress should update in real-time
    const initialProgress = await progressText.textContent();
    await page.waitForTimeout(2000);
    const updatedProgress = await progressText.textContent();
    
    // Progress should have changed
    expect(updatedProgress).not.toBe(initialProgress);
  });

  test('should handle backend disconnection gracefully', async ({ page }) => {
    // Simulate backend disconnection by stopping the server
    // This would typically be done by the test environment
    
    // Wait for disconnection to be detected
    await page.waitForSelector('[data-testid="backend-disconnected"]', { timeout: 30000 });
    
    // Verify fallback mode is activated
    const fallbackMode = await page.locator('[data-testid="fallback-mode"]');
    await expect(fallbackMode).toBeVisible();
    
    // Verify frontend services are still available
    const frontendServices = await page.locator('[data-testid="frontend-services"]');
    await expect(frontendServices).toBeVisible();
    
    // Should still be able to perform basic operations
    await page.fill('[data-testid="company-input"]', 'Fallback Test');
    await page.click('[data-testid="scrape-company-btn"]');
    
    // Should use frontend scraping service
    await page.waitForSelector('[data-testid="frontend-scraping"]', { timeout: 10000 });
  });

  test('should maintain state across page navigation', async ({ page }) => {
    // Start scraping
    await page.fill('[data-testid="company-input"]', 'State Test');
    await page.fill('[data-testid="marketing-url"]', 'https://example.com');
    await page.check('[data-testid="category-marketing"]');
    await page.click('[data-testid="scrape-company-btn"]');
    
    // Wait for scraping to complete
    await page.waitForSelector('[data-testid="scraping-complete"]', { timeout: 60000 });
    
    // Navigate to another page
    await page.goto('/analysis');
    await page.waitForSelector('[data-testid="ai-analysis-page"]', { timeout: 5000 });
    
    // Navigate back to scraping
    await page.goto('/scrape');
    await page.waitForSelector('[data-testid="scrape-dashboard"]', { timeout: 5000 });
    
    // Verify scraped data is still present
    const scrapedItems = await page.locator('[data-testid="scraped-item"]').all();
    expect(scrapedItems.length).toBeGreaterThan(0);
    
    // Verify the specific item is still there
    const stateTestItem = await page.locator('[data-testid="scraped-item"]:has-text("State Test")');
    await expect(stateTestItem).toBeVisible();
  });
}); 