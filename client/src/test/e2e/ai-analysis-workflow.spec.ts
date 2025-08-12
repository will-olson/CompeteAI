import { test, expect } from '@playwright/test';

test.describe('AI Analysis Workflow - Backend Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the AI analysis page
    await page.goto('/analysis');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="ai-analysis-page"]', { timeout: 10000 });
  });

  test('should connect to AI backend services', async ({ page }) => {
    // Check if AI services status is displayed
    const aiStatusElement = await page.locator('[data-testid="ai-services-status"]');
    await expect(aiStatusElement).toBeVisible();
    
    // Wait for AI services health check to complete
    await page.waitForTimeout(2000);
    
    // Should show AI services as available
    const statusText = await aiStatusElement.textContent();
    expect(statusText).toMatch(/available|healthy/i);
  });

  test('should perform AI analysis on scraped data', async ({ page }) => {
    // Navigate to scraping first to get some data
    await page.goto('/scrape');
    await page.waitForSelector('[data-testid="scrape-dashboard"]', { timeout: 10000 });
    
    // Quick scrape to get data
    await page.fill('[data-testid="company-input"]', 'AI Test Company');
    await page.fill('[data-testid="marketing-url"]', 'https://example.com');
    await page.check('[data-testid="category-marketing"]');
    await page.click('[data-testid="scrape-company-btn"]');
    
    // Wait for scraping to complete
    await page.waitForSelector('[data-testid="scraping-complete"]', { timeout: 60000 });
    
    // Navigate back to AI analysis
    await page.goto('/analysis');
    await page.waitForSelector('[data-testid="ai-analysis-page"]', { timeout: 5000 });
    
    // Select company for analysis
    await page.selectOption('[data-testid="company-select"]', 'AI Test Company');
    
    // Select category
    await page.selectOption('[data-testid="category-select"]', 'marketing');
    
    // Click analyze button
    await page.click('[data-testid="analyze-btn"]');
    
    // Wait for analysis to start
    await page.waitForSelector('[data-testid="analysis-progress"]', { timeout: 10000 });
    
    // Verify analysis is in progress
    const progressElement = await page.locator('[data-testid="analysis-progress"]');
    await expect(progressElement).toBeVisible();
    
    // Wait for analysis to complete
    await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 120000 });
    
    // Verify results are displayed
    const resultsElement = await page.locator('[data-testid="analysis-results"]');
    await expect(resultsElement).toBeVisible();
    
    // Check if insights are shown
    const insights = await page.locator('[data-testid="ai-insight"]').all();
    expect(insights.length).toBeGreaterThan(0);
    
    // Check if summary is displayed
    const summaryElement = await page.locator('[data-testid="analysis-summary"]');
    await expect(summaryElement).toBeVisible();
  });

  test('should generate competitive battlecard', async ({ page }) => {
    // Navigate to battlecard tab
    await page.click('[data-testid="battlecard-tab"]');
    await page.waitForSelector('[data-testid="battlecard-form"]', { timeout: 5000 });
    
    // Fill in battlecard form
    await page.fill('[data-testid="battlecard-company"]', 'Competitor A');
    await page.selectOption('[data-testid="battlecard-category"]', 'marketing');
    
    // Click generate button
    await page.click('[data-testid="generate-battlecard-btn"]');
    
    // Wait for generation to start
    await page.waitForSelector('[data-testid="battlecard-generating"]', { timeout: 10000 });
    
    // Verify generation is in progress
    const generatingElement = await page.locator('[data-testid="battlecard-generating"]');
    await expect(generatingElement).toBeVisible();
    
    // Wait for completion
    await page.waitForSelector('[data-testid="battlecard-complete"]', { timeout: 90000 });
    
    // Verify battlecard is displayed
    const battlecardElement = await page.locator('[data-testid="battlecard-content"]');
    await expect(battlecardElement).toBeVisible();
    
    // Check if SWOT analysis sections are present
    await expect(page.locator('[data-testid="strengths-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="weaknesses-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="opportunities-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="threats-section"]')).toBeVisible();
  });

  test('should generate content strategy recommendations', async ({ page }) => {
    // Navigate to content strategy tab
    await page.click('[data-testid="content-strategy-tab"]');
    await page.waitForSelector('[data-testid="content-strategy-form"]', { timeout: 5000 });
    
    // Fill in form
    await page.fill('[data-testid="strategy-company"]', 'Content Company');
    await page.selectOption('[data-testid="strategy-category"]', 'marketing');
    
    // Click generate button
    await page.click('[data-testid="generate-strategy-btn"]');
    
    // Wait for generation to complete
    await page.waitForSelector('[data-testid="strategy-complete"]', { timeout: 90000 });
    
    // Verify strategy is displayed
    const strategyElement = await page.locator('[data-testid="content-strategy"]');
    await expect(strategyElement).toBeVisible();
    
    // Check if strategy components are present
    await expect(page.locator('[data-testid="strategy-themes"]')).toBeVisible();
    await expect(page.locator('[data-testid="strategy-content-types"]')).toBeVisible();
    await expect(page.locator('[data-testid="strategy-messaging"]')).toBeVisible();
  });

  test('should analyze competitive moves', async ({ page }) => {
    // Navigate to competitive moves tab
    await page.click('[data-testid="competitive-moves-tab"]');
    await page.waitForSelector('[data-testid="competitive-moves-form"]', { timeout: 5000 });
    
    // Fill in form
    await page.fill('[data-testid="moves-company"]', 'Moves Company');
    await page.selectOption('[data-testid="moves-category"]', 'marketing');
    
    // Click analyze button
    await page.click('[data-testid="analyze-moves-btn"]');
    
    // Wait for analysis to complete
    await page.waitForSelector('[data-testid="moves-analysis-complete"]', { timeout: 90000 });
    
    // Verify analysis is displayed
    const movesElement = await page.locator('[data-testid="competitive-moves-analysis"]');
    await expect(movesElement).toBeVisible();
    
    // Check if moves insights are present
    await expect(page.locator('[data-testid="moves-insights"]')).toBeVisible();
    await expect(page.locator('[data-testid="moves-recommendations"]')).toBeVisible();
  });

  test('should handle AI analysis errors gracefully', async ({ page }) => {
    // Try to analyze without selecting company
    await page.click('[data-testid="analyze-btn"]');
    
    // Wait for error to be displayed
    await page.waitForSelector('[data-testid="validation-error"]', { timeout: 5000 });
    
    // Verify error message is shown
    const errorElement = await page.locator('[data-testid="validation-error"]');
    await expect(errorElement).toBeVisible();
    
    // Should show what fields are required
    const errorText = await errorElement.textContent();
    expect(errorText).toMatch(/company|required/i);
  });

  test('should export AI analysis results', async ({ page }) => {
    // First perform an analysis
    await page.selectOption('[data-testid="company-select"]', 'Test Company');
    await page.selectOption('[data-testid="category-select"]', 'marketing');
    await page.click('[data-testid="analyze-btn"]');
    
    // Wait for analysis to complete
    await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 120000 });
    
    // Click export button
    await page.click('[data-testid="export-analysis-btn"]');
    
    // Wait for export options
    await page.waitForSelector('[data-testid="export-options"]', { timeout: 5000 });
    
    // Select export format
    await page.selectOption('[data-testid="export-format"]', 'pdf');
    
    // Click export
    await page.click('[data-testid="export-confirm-btn"]');
    
    // Wait for export to complete
    await page.waitForSelector('[data-testid="export-complete"]', { timeout: 30000 });
    
    // Verify export success
    const exportSuccess = await page.locator('[data-testid="export-complete"]');
    await expect(exportSuccess).toBeVisible();
  });

  test('should compare multiple AI analyses', async ({ page }) => {
    // Perform first analysis
    await page.selectOption('[data-testid="company-select"]', 'Company A');
    await page.selectOption('[data-testid="category-select"]', 'marketing');
    await page.click('[data-testid="analyze-btn"]');
    
    // Wait for completion
    await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 120000 });
    
    // Add to comparison
    await page.click('[data-testid="add-to-comparison-btn"]');
    
    // Perform second analysis
    await page.selectOption('[data-testid="company-select"]', 'Company B');
    await page.click('[data-testid="analyze-btn"]');
    
    // Wait for completion
    await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 120000 });
    
    // Add to comparison
    await page.click('[data-testid="add-to-comparison-btn"]');
    
    // View comparison
    await page.click('[data-testid="view-comparison-btn"]');
    
    // Wait for comparison view
    await page.waitForSelector('[data-testid="comparison-view"]', { timeout: 5000 });
    
    // Verify comparison is displayed
    const comparisonElement = await page.locator('[data-testid="comparison-view"]');
    await expect(comparisonElement).toBeVisible();
    
    // Check if both companies are in comparison
    await expect(page.locator('[data-testid="comparison-company"]:has-text("Company A")')).toBeVisible();
    await expect(page.locator('[data-testid="comparison-company"]:has-text("Company B")')).toBeVisible();
  });

  test('should save and load AI analysis templates', async ({ page }) => {
    // Perform analysis
    await page.selectOption('[data-testid="company-select"]', 'Template Company');
    await page.selectOption('[data-testid="category-select"]', 'marketing');
    await page.click('[data-testid="analyze-btn"]');
    
    // Wait for completion
    await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 120000 });
    
    // Save as template
    await page.click('[data-testid="save-template-btn"]');
    
    // Wait for save dialog
    await page.waitForSelector('[data-testid="save-template-dialog"]', { timeout: 5000 });
    
    // Fill template name
    await page.fill('[data-testid="template-name"]', 'Marketing Analysis Template');
    
    // Save template
    await page.click('[data-testid="save-template-confirm-btn"]');
    
    // Wait for save confirmation
    await page.waitForSelector('[data-testid="template-saved"]', { timeout: 5000 });
    
    // Verify template is saved
    const savedElement = await page.locator('[data-testid="template-saved"]');
    await expect(savedElement).toBeVisible();
    
    // Load template
    await page.click('[data-testid="load-template-btn"]');
    
    // Wait for template list
    await page.waitForSelector('[data-testid="template-list"]', { timeout: 5000 });
    
    // Select saved template
    await page.click('[data-testid="template-item"]:has-text("Marketing Analysis Template")');
    
    // Verify template is loaded
    await expect(page.locator('[data-testid="company-select"]:has-text("Template Company")')).toBeVisible();
    await expect(page.locator('[data-testid="category-select"]:has-text("marketing")')).toBeVisible();
  });

  test('should handle AI service unavailability', async ({ page }) => {
    // Simulate AI service being down
    // This would typically be done by the test environment
    
    // Wait for AI service to be detected as unavailable
    await page.waitForSelector('[data-testid="ai-service-unavailable"]', { timeout: 30000 });
    
    // Verify fallback mode is activated
    const fallbackMode = await page.locator('[data-testid="ai-fallback-mode"]');
    await expect(fallbackMode).toBeVisible();
    
    // Should still be able to perform basic operations
    await page.selectOption('[data-testid="company-select"]', 'Fallback Company');
    await page.selectOption('[data-testid="category-select"]', 'marketing');
    
    // Should show fallback analysis option
    const fallbackOption = await page.locator('[data-testid="fallback-analysis-option"]');
    await expect(fallbackOption).toBeVisible();
  });

  test('should maintain AI analysis state across navigation', async ({ page }) => {
    // Start analysis
    await page.selectOption('[data-testid="company-select"]', 'State Company');
    await page.selectOption('[data-testid="category-select"]', 'marketing');
    await page.click('[data-testid="analyze-btn"]');
    
    // Wait for analysis to start
    await page.waitForSelector('[data-testid="analysis-progress"]', { timeout: 10000 });
    
    // Navigate to another page
    await page.goto('/scrape');
    await page.waitForSelector('[data-testid="scrape-dashboard"]', { timeout: 5000 });
    
    // Navigate back to analysis
    await page.goto('/analysis');
    await page.waitForSelector('[data-testid="ai-analysis-page"]', { timeout: 5000 });
    
    // Verify analysis state is preserved
    await expect(page.locator('[data-testid="company-select"]:has-text("State Company")')).toBeVisible();
    await expect(page.locator('[data-testid="category-select"]:has-text("marketing")')).toBeVisible();
    
    // Should show analysis in progress or completed
    const analysisStatus = await page.locator('[data-testid="analysis-status"]');
    await expect(analysisStatus).toBeVisible();
  });
}); 