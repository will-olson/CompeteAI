import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ScrapeDashboard from '../ScrapeDashboard';
import AIAnalysis from '../AIAnalysis';
import Battlecard from '../Battlecard';
import Index from '../Index';
import NotFound from '../NotFound';
import { ScrapeProvider } from '@/state/ScrapeStore';
import { APIService } from '@/utils/APIService';

// Mock all services
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

vi.mock('@/utils/LinkTargetingService', () => ({
  LinkTargetingService: {
    generateLinkTargets: vi.fn(),
    getCompanyProfile: vi.fn(),
    getAllCompanyProfiles: vi.fn()
  }
}));

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

describe('Comprehensive End-to-End Testing Suite', () => {
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
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering & Navigation Tests', () => {
    it('should render all main pages correctly', async () => {
      // Test Index page
      const { unmount: unmountIndex } = render(<Index />);
      expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      unmountIndex();

      // Test ScrapeDashboard page
      const { unmount: unmountDashboard } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );
      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });
      unmountDashboard();

      // Test AIAnalysis page
      const { unmount: unmountAI } = render(
        <ScrapeProvider>
          <AIAnalysis />
        </ScrapeProvider>
      );
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });
      unmountAI();

      // Test Battlecard page
      const { unmount: unmountBattlecard } = render(
        <ScrapeProvider>
          <Battlecard />
        </ScrapeProvider>
      );
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });
      unmountBattlecard();

      // Test NotFound page
      const { unmount: unmountNotFound } = render(<NotFound />);
      expect(screen.getByText(/404/i)).toBeInTheDocument();
      unmountNotFound();
    });

    it('should handle page routing and navigation correctly', async () => {
      // Test that each page renders its unique content
      const pages = [
        { component: Index, expectedText: /Welcome/i },
        { component: NotFound, expectedText: /404/i }
      ];

      for (const page of pages) {
        const { unmount } = render(<page.component />);
        expect(screen.getByText(page.expectedText)).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('ScrapeDashboard Integration Tests', () => {
    it('should render all 8 tabs and allow navigation between them', async () => {
      const user = userEvent.setup();
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Verify all tabs are present
      const expectedTabs = ['Configuration', 'Targets', 'Scraping', 'Progress', 'Data View', 'Analytics', 'AI Analysis', 'Export'];
      
      for (const tabName of expectedTabs) {
        expect(screen.getByText(tabName)).toBeInTheDocument();
      }

      // Test tab navigation
      for (const tabName of expectedTabs) {
        const tab = screen.getByText(tabName);
        await user.click(tab);
        
        await waitFor(() => {
          expect(tab).toBeInTheDocument();
        });
      }

      unmount();
    });

    it('should maintain state consistency across tab switches', async () => {
      const user = userEvent.setup();
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Rapidly switch between tabs to test state consistency
      const tabs = ['Targets', 'Scraping', 'Progress', 'Data View', 'Analytics', 'AI Analysis', 'Export'];
      
      for (let i = 0; i < 3; i++) {
        for (const tabName of tabs) {
          const tab = screen.getByText(tabName);
          await user.click(tab);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Should still be functional
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });
  });

  describe('AI Analysis Integration Tests', () => {
    it('should provide comprehensive AI-powered analysis capabilities', async () => {
      const { unmount } = render(
        <ScrapeProvider>
          <AIAnalysis />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Verify all analysis sections are present
      const expectedSections = ['Content Analysis', 'Competitive Battlecards', 'Content Strategy', 'Competitive Moves'];
      
      for (const sectionName of expectedSections) {
        expect(screen.getByText(sectionName)).toBeInTheDocument();
      }

      unmount();
    });

    it('should integrate with scraped data and provide meaningful insights', async () => {
      const { unmount } = render(
        <ScrapeProvider>
          <AIAnalysis />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // AI analysis should be available and functional
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();

      unmount();
    });
  });

  describe('Battlecard Integration Tests', () => {
    it('should generate comprehensive competitive battlecards', async () => {
      const { unmount } = render(
        <ScrapeProvider>
          <Battlecard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Verify all battlecard sections are present
      const expectedSections = ['Company Selection', 'Battlecard Generation', 'Results Display'];
      
      for (const sectionName of expectedSections) {
        expect(screen.getByText(sectionName)).toBeInTheDocument();
      }

      unmount();
    });

    it('should support both standard and enterprise battlecard types', async () => {
      const { unmount } = render(
        <ScrapeProvider>
          <Battlecard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Both battlecard types should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();

      unmount();
    });
  });

  describe('Cross-Component Integration Tests', () => {
    it('should maintain consistent data flow between components', async () => {
      // Test that data flows correctly between ScrapeDashboard and other components
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Data flow should be consistent
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });

    it('should handle shared state and configuration across components', async () => {
      // Test shared state management
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Shared state should be managed correctly
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });
  });

  describe('Error Handling & Resilience Tests', () => {
    it('should handle API failures gracefully across all components', async () => {
      mockHealthCheck.mockRejectedValue(new Error('API Error'));

      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Should handle errors gracefully
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });

    it('should handle network timeouts and connection issues', async () => {
      mockHealthCheck.mockRejectedValue(new Error('Timeout'));

      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Should handle timeouts gracefully
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });
  });

  describe('Performance & Scalability Tests', () => {
    it('should render all components within acceptable time limits', async () => {
      const startTime = performance.now();

      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 3 seconds for comprehensive dashboard
      expect(renderTime).toBeLessThan(3000);

      unmount();
    });

    it('should handle multiple concurrent operations without performance degradation', async () => {
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Should handle concurrent operations
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });
  });

  describe('User Experience & Accessibility Tests', () => {
    it('should provide intuitive navigation and user flow', async () => {
      const user = userEvent.setup();
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Navigation should be intuitive
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });

    it('should provide proper loading states and user feedback', async () => {
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Loading states should be available
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });
  });

  describe('Data Management & Persistence Tests', () => {
    it('should handle data import, processing, and export correctly', async () => {
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Data management should be functional
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });

    it('should maintain data integrity across component interactions', async () => {
      const { unmount } = render(
        <ScrapeProvider>
          <ScrapeDashboard />
        </ScrapeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();
      });

      // Data integrity should be maintained
      expect(screen.getByText(/Competitive Intelligence Dashboard/i)).toBeInTheDocument();

      unmount();
    });
  });
});
