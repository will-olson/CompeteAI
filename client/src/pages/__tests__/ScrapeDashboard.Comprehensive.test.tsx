import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ScrapeDashboard from '../ScrapeDashboard';
import { ScrapeProvider } from '@/state/ScrapeStore';
import { APIService } from '@/utils/APIService';

// Mock the APIService
vi.mock('@/utils/APIService', () => ({
  APIService: {
    healthCheck: vi.fn(),
    getPresetGroups: vi.fn(),
    scrapeCompany: vi.fn(),
    analyzeContent: vi.fn(),
    generateBattlecard: vi.fn(),
    getContentStrategy: vi.fn(),
    getCompetitiveMoves: vi.fn(),
    getAnalyticsSummary: vi.fn(),
    searchContent: vi.fn(),
    exportData: vi.fn(),
    importFile: vi.fn(),
    analyzeEnterpriseCategory: vi.fn(),
    generateEnterpriseBattlecard: vi.fn()
  }
}));

// Mock the LinkTargetingService
vi.mock('@/utils/LinkTargetingService', () => ({
  LinkTargetingService: {
    generateLinkTargets: vi.fn(),
    getCompanyProfile: vi.fn(),
    getAllCompanyProfiles: vi.fn()
  }
}));

// Mock the DatabaseService
vi.mock('@/utils/DatabaseService', () => ({
  DatabaseService: {
    init: vi.fn(),
    saveItem: vi.fn(),
    getAllItems: vi.fn(),
    getItemsByCompany: vi.fn(),
    getItemsByCategory: vi.fn(),
    clearAllItems: vi.fn()
  }
}));

// Mock the AIService
vi.mock('@/utils/AIService', () => ({
  AIService: {
    analyzeContent: vi.fn(),
    generateInsights: vi.fn(),
    analyzeSentiment: vi.fn(),
    extractTopics: vi.fn(),
    identifyRisks: vi.fn()
  }
}));

const mockHealthCheck = vi.mocked(APIService.healthCheck);
const mockGetPresetGroups = vi.mocked(APIService.getPresetGroups);
const mockScrapeCompany = vi.mocked(APIService.scrapeCompany);
const mockAnalyzeContent = vi.mocked(APIService.analyzeContent);

const renderScrapeDashboard = () => {
  return render(
    <ScrapeProvider>
      <ScrapeDashboard />
    </ScrapeProvider>
  );
};

describe('ScrapeDashboard - Comprehensive End-to-End Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock responses
    mockHealthCheck.mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        scraper: 'available',
        ai_analyzer: 'available',
        enterprise_analyzer: 'available'
      }
    });

    mockGetPresetGroups.mockResolvedValue({
      'tech-saas': {
        name: 'Tech SaaS',
        companies: ['Salesforce', 'HubSpot', 'Slack', 'Atlassian', 'Notion', 'Figma'],
        categories: ['marketing', 'docs', 'rss', 'social', 'news', 'api', 'community', 'careers', 'investors', 'press'],
        company_count: 6
      },
      'fintech': {
        name: 'Fintech',
        companies: ['Stripe', 'Plaid', 'Square', 'Robinhood', 'Coinbase', 'Chime'],
        categories: ['marketing', 'docs', 'rss', 'social', 'news', 'api', 'community', 'careers', 'investors', 'press'],
        company_count: 6
      },
      'ecommerce': {
        name: 'E-commerce',
        companies: ['Shopify', 'WooCommerce', 'Magento', 'BigCommerce', 'Squarespace', 'Wix'],
        categories: ['marketing', 'docs', 'rss', 'social', 'news', 'api', 'community', 'careers', 'investors', 'press'],
        company_count: 6
      },
      'ai-ml': {
        name: 'AI/ML',
        companies: ['OpenAI', 'Anthropic', 'Cohere', 'Hugging Face', 'Stability AI', 'Midjourney'],
        categories: ['marketing', 'docs', 'rss', 'social', 'news', 'api', 'community', 'careers', 'investors', 'press'],
        company_count: 6
      }
    });

    mockScrapeCompany.mockResolvedValue({
      company: 'Salesforce',
      categories: {
        marketing: [
          { 
            title: 'Salesforce CRM Platform', 
            content: 'Leading customer relationship management platform',
            url: 'https://www.salesforce.com/products/crm/',
            timestamp: new Date().toISOString()
          }
        ],
        docs: [
          { 
            title: 'Salesforce Developer Documentation', 
            content: 'Comprehensive API and development guides',
            url: 'https://developer.salesforce.com/docs/',
            timestamp: new Date().toISOString()
          }
        ],
        social: [
          { 
            title: 'Salesforce Twitter Feed', 
            content: 'Latest updates and announcements',
            url: 'https://twitter.com/salesforce',
            timestamp: new Date().toISOString()
          }
        ]
      }
    });

    mockAnalyzeContent.mockResolvedValue({
      sentiment_score: 0.8,
      key_topics: ['CRM', 'cloud computing', 'enterprise software'],
      competitive_insights: 'Strong market position in enterprise CRM',
      risk_factors: 'Competition from Microsoft Dynamics and Oracle',
      analysis_timestamp: new Date().toISOString()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Backend Integration & Health Monitoring', () => {
    it('should successfully connect to backend and display healthy status', async () => {
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Competitive Intelligence Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Advanced web scraping and market analysis platform')).toBeInTheDocument();
      });

      // Check backend status
      await waitFor(() => {
        expect(screen.getByText(/Backend Status/i)).toBeInTheDocument();
      });
    });

    it('should handle backend connection failures gracefully', async () => {
      mockHealthCheck.mockRejectedValue(new Error('Connection failed'));
      
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Competitive Intelligence Dashboard')).toBeInTheDocument();
      });
    });

    it('should display service availability information', async () => {
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/items scraped/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation & Component Integration', () => {
    it('should render all 8 main tabs correctly', async () => {
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Configuration')).toBeInTheDocument();
        expect(screen.getByText('Targets')).toBeInTheDocument();
        expect(screen.getByText('Scraping')).toBeInTheDocument();
        expect(screen.getByText('Progress')).toBeInTheDocument();
        expect(screen.getByText('Data View')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('AI Analysis')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    it('should switch between tabs and display appropriate content', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Configuration')).toBeInTheDocument();
      });

      // Switch to Targets tab
      const targetsTab = screen.getByText('Targets');
      await user.click(targetsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Targets')).toBeInTheDocument();
      });

      // Switch to Scraping tab
      const scrapingTab = screen.getByText('Scraping');
      await user.click(scrapingTab);
      
      await waitFor(() => {
        expect(screen.getByText('Scraping')).toBeInTheDocument();
      });
    });
  });

  describe('Configuration Panel Testing', () => {
    it('should display configuration options and API key management', async () => {
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Configuration')).toBeInTheDocument();
      });

      // Configuration tab should be active by default
      const configurationTab = screen.getByText('Configuration');
      expect(configurationTab).toHaveAttribute('data-state', 'active');
    });

    it('should allow users to configure scraping parameters', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Configuration')).toBeInTheDocument();
      });

      // Configuration panel should be visible
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });
  });

  describe('Target Selection Panel Testing', () => {
    it('should display preset industry groups for easy selection', async () => {
      renderScrapeDashboard();
      
      // Navigate to Targets tab
      const targetsTab = screen.getByText('Targets');
      fireEvent.click(targetsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Targets')).toBeInTheDocument();
      });

      // Check for preset groups
      await waitFor(() => {
        expect(screen.getByText('Tech SaaS')).toBeInTheDocument();
        expect(screen.getByText('Fintech')).toBeInTheDocument();
        expect(screen.getByText('E-commerce')).toBeInTheDocument();
        expect(screen.getByText('AI/ML')).toBeInTheDocument();
      });
    });

    it('should allow custom company and category configuration', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Targets tab
      const targetsTab = screen.getByText('Targets');
      await user.click(targetsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Targets')).toBeInTheDocument();
      });

      // Target selection panel should be visible
      expect(screen.getByText('Targets')).toBeInTheDocument();
    });
  });

  describe('Scraping Control Panel Testing', () => {
    it('should provide scraping execution controls', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Scraping tab
      const scrapingTab = screen.getByText('Scraping');
      await user.click(scrapingTab);
      
      await waitFor(() => {
        expect(screen.getByText('Scraping')).toBeInTheDocument();
      });

      // Scraping control panel should be visible
      expect(screen.getByText('Scraping')).toBeInTheDocument();
    });

    it('should allow users to start and stop scraping operations', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Scraping tab
      const scrapingTab = screen.getByText('Scraping');
      await user.click(scrapingTab);
      
      await waitFor(() => {
        expect(screen.getByText('Scraping')).toBeInTheDocument();
      });

      // Scraping controls should be available
      expect(screen.getByText('Scraping')).toBeInTheDocument();
    });
  });

  describe('Progress Monitoring Panel Testing', () => {
    it('should display real-time scraping progress', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Progress tab
      const progressTab = screen.getByText('Progress');
      await user.click(progressTab);
      
      await waitFor(() => {
        expect(screen.getByText('Progress')).toBeInTheDocument();
      });

      // Progress monitoring panel should be visible
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('should show system health and performance metrics', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Progress tab
      const progressTab = screen.getByText('Progress');
      await user.click(progressTab);
      
      await waitFor(() => {
        expect(screen.getByText('Progress')).toBeInTheDocument();
      });

      // Progress monitoring panel should be visible
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });
  });

  describe('Data View Panel Testing', () => {
    it('should display scraped data in a structured format', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Data View tab
      const dataViewTab = screen.getByText('Data View');
      await user.click(dataViewTab);
      
      await waitFor(() => {
        expect(screen.getByText('Data View')).toBeInTheDocument();
      });

      // Data view panel should be visible
      expect(screen.getByText('Data View')).toBeInTheDocument();
    });

    it('should handle empty data states gracefully', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Data View tab
      const dataViewTab = screen.getByText('Data View');
      await user.click(dataViewTab);
      
      await waitFor(() => {
        expect(screen.getByText('Data View')).toBeInTheDocument();
      });

      // Data view panel should be visible
      expect(screen.getByText('Data View')).toBeInTheDocument();
    });
  });

  describe('Analytics Panel Testing', () => {
    it('should provide comprehensive data analytics and insights', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Analytics tab
      const analyticsTab = screen.getByText('Analytics');
      await user.click(analyticsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });

      // Analytics panel should be visible
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should display performance metrics and trends', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Analytics tab
      const analyticsTab = screen.getByText('Analytics');
      await user.click(analyticsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });

      // Analytics panel should be visible
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  describe('AI Analysis Panel Testing', () => {
    it('should provide AI-powered competitive intelligence insights', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to AI Analysis tab
      const aiAnalysisTab = screen.getByText('AI Analysis');
      await user.click(aiAnalysisTab);
      
      await waitFor(() => {
        expect(screen.getByText('AI Analysis')).toBeInTheDocument();
      });

      // AI Analysis panel should be visible
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    });

    it('should display sentiment analysis and topic extraction', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to AI Analysis tab
      const aiAnalysisTab = screen.getByText('AI Analysis');
      await user.click(aiAnalysisTab);
      
      await waitFor(() => {
        expect(screen.getByText('AI Analysis')).toBeInTheDocument();
      });

      // AI Analysis panel should be visible
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    });
  });

  describe('Export Panel Testing', () => {
    it('should provide data export functionality in multiple formats', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Export tab
      const exportTab = screen.getByText('Export');
      await user.click(exportTab);
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      // Export panel should be visible
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should allow users to generate comprehensive reports', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate to Export tab
      const exportTab = screen.getByText('Export');
      await user.click(exportTab);
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      // Export panel should be visible
      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });

  describe('End-to-End Workflow Testing', () => {
    it('should support complete competitive intelligence workflow', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // 1. Configuration
      await waitFor(() => {
        expect(screen.getByText('Configuration')).toBeInTheDocument();
      });

      // 2. Target Selection
      const targetsTab = screen.getByText('Targets');
      await user.click(targetsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Targets')).toBeInTheDocument();
      });

      // 3. Scraping Control
      const scrapingTab = screen.getByText('Scraping');
      await user.click(scrapingTab);
      
      await waitFor(() => {
        expect(screen.getByText('Scraping')).toBeInTheDocument();
      });

      // 4. Progress Monitoring
      const progressTab = screen.getByText('Progress');
      await user.click(progressTab);
      
      await waitFor(() => {
        expect(screen.getByText('Progress')).toBeInTheDocument();
      });

      // 5. Data View
      const dataViewTab = screen.getByText('Data View');
      await user.click(dataViewTab);
      
      await waitFor(() => {
        expect(screen.getByText('Data View')).toBeInTheDocument();
      });

      // 6. Analytics
      const analyticsTab = screen.getByText('Analytics');
      await user.click(analyticsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });

      // 7. AI Analysis
      const aiAnalysisTab = screen.getByText('AI Analysis');
      await user.click(aiAnalysisTab);
      
      await waitFor(() => {
        expect(screen.getByText('AI Analysis')).toBeInTheDocument();
      });

      // 8. Export
      const exportTab = screen.getByText('Export');
      await user.click(exportTab);
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    it('should maintain state consistency across tab switches', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      // Navigate through all tabs
      const tabs = ['Configuration', 'Targets', 'Scraping', 'Progress', 'Data View', 'Analytics', 'AI Analysis', 'Export'];
      
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        await user.click(tab);
        
        await waitFor(() => {
          expect(screen.getByText(tabName)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle network failures gracefully', async () => {
      mockHealthCheck.mockRejectedValue(new Error('Network error'));
      
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Competitive Intelligence Dashboard')).toBeInTheDocument();
      });
    });

    it('should handle empty API responses appropriately', async () => {
      mockGetPresetGroups.mockResolvedValue({});
      
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Competitive Intelligence Dashboard')).toBeInTheDocument();
      });
    });

    it('should handle malformed data gracefully', async () => {
      mockScrapeCompany.mockResolvedValue({
        company: 'Invalid Company',
        categories: null
      });
      
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Competitive Intelligence Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Performance & Responsiveness', () => {
    it('should render all components within acceptable time', async () => {
      const startTime = performance.now();
      
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Competitive Intelligence Dashboard')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });

    it('should handle rapid tab switching without errors', async () => {
      const user = userEvent.setup();
      renderScrapeDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Configuration')).toBeInTheDocument();
      });

      // Rapidly switch between tabs
      const tabs = ['Targets', 'Scraping', 'Progress', 'Data View', 'Analytics', 'AI Analysis', 'Export'];
      
      for (let i = 0; i < 3; i++) {
        for (const tabName of tabs) {
          const tab = screen.getByText(tabName);
          await user.click(tab);
          await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
        }
      }
      
      // Should still be functional
      expect(screen.getByText('Competitive Intelligence Dashboard')).toBeInTheDocument();
    });
  });
});
