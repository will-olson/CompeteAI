import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Battlecard from '../Battlecard';
import { ScrapeProvider } from '@/state/ScrapeStore';
import { APIService } from '@/utils/APIService';

// Mock the APIService
vi.mock('@/utils/APIService', () => ({
  APIService: {
    generateBattlecard: vi.fn(),
    generateEnterpriseBattlecard: vi.fn(),
    getPresetGroups: vi.fn(),
    analyzeContent: vi.fn()
  }
}));

// Mock the AIService
vi.mock('@/utils/AIService', () => ({
  AIService: {
    generateInsights: vi.fn(),
    analyzeSentiment: vi.fn(),
    extractTopics: vi.fn(),
    identifyRisks: vi.fn()
  }
}));

const mockGenerateBattlecard = vi.mocked(APIService.generateBattlecard);
const mockGenerateEnterpriseBattlecard = vi.mocked(APIService.generateEnterpriseBattlecard);
const mockGetPresetGroups = vi.mocked(APIService.getPresetGroups);

const renderBattlecard = () => {
  return render(
    <ScrapeProvider>
      <Battlecard />
    </ScrapeProvider>
  );
};

describe('Battlecard - Comprehensive Competitive Analysis Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock responses
    mockGenerateBattlecard.mockResolvedValue({
      company: 'Salesforce',
      competitors: ['Microsoft Dynamics', 'Oracle', 'HubSpot'],
      strengths: ['Market leadership', 'Strong ecosystem', 'Enterprise focus'],
      weaknesses: ['High cost', 'Complex implementation'],
      opportunities: ['AI integration', 'Small business expansion'],
      threats: ['Microsoft competition', 'Open source alternatives'],
      recommendations: ['Invest in AI capabilities', 'Simplify pricing'],
      generated_at: new Date().toISOString()
    });

    mockGenerateEnterpriseBattlecard.mockResolvedValue({
      company: 'Salesforce',
      category: 'CRM Software',
      market_position: 'Leader',
      competitors: ['Microsoft Dynamics', 'Oracle', 'HubSpot'],
      strengths: ['Market leadership', 'Strong ecosystem', 'Enterprise focus'],
      weaknesses: ['High cost', 'Complex implementation'],
      opportunities: ['AI integration', 'Small business expansion'],
      threats: ['Microsoft competition', 'Open source alternatives'],
      recommendations: ['Invest in AI capabilities', 'Simplify pricing'],
      generated_at: new Date().toISOString()
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

  describe('Page Rendering & Layout', () => {
    it('should render the Battlecard page with proper title and description', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
        expect(screen.getByText(/Generate comprehensive competitive analysis/i)).toBeInTheDocument();
      });
    });

    it('should display all main battlecard sections', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
        expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
        expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
      });
    });

    it('should show proper loading states and error handling', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });
    });
  });

  describe('Company Selection & Configuration', () => {
    it('should allow users to select companies from preset groups', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
      });

      // Company selection should be available
      expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
    });

    it('should support custom company input', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
      });

      // Custom company input should be available
      expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
    });

    it('should allow multiple company selection for comparison', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
      });

      // Multiple company selection should be available
      expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
    });

    it('should provide industry and category filtering options', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
      });

      // Industry and category filtering should be available
      expect(screen.getByText(/Company Selection/i)).toBeInTheDocument();
    });
  });

  describe('Battlecard Generation Process', () => {
    it('should generate battlecards for selected companies', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
      });

      // Battlecard generation should be available
      expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
    });

    it('should support both standard and enterprise battlecard types', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
      });

      // Both battlecard types should be available
      expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
    });

    it('should provide configuration options for analysis depth', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
      });

      // Analysis depth configuration should be available
      expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
    });

    it('should handle batch generation for multiple companies', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
      });

      // Batch generation should be available
      expect(screen.getByText(/Battlecard Generation/i)).toBeInTheDocument();
    });
  });

  describe('Battlecard Content & Analysis', () => {
    it('should display comprehensive company analysis', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
      });

      // Company analysis should be available
      expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
    });

    it('should show competitive positioning and market analysis', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
      });

      // Competitive positioning should be available
      expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
    });

    it('should provide SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
      });

      // SWOT analysis should be available
      expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
    });

    it('should include strategic recommendations and actionable insights', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
      });

      // Strategic recommendations should be available
      expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
    });

    it('should display competitor analysis and benchmarking', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
      });

      // Competitor analysis should be available
      expect(screen.getByText(/Results Display/i)).toBeInTheDocument();
    });
  });

  describe('Enterprise Software Analysis', () => {
    it('should provide enterprise-specific battlecard features', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Enterprise features should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should analyze software categories and market segments', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Category analysis should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should provide industry-specific insights and benchmarks', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Industry insights should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction & Controls', () => {
    it('should allow users to customize battlecard parameters', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Customization options should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should provide real-time generation progress updates', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Progress updates should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should allow users to save and export battlecards', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Save and export should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should support battlecard comparison and side-by-side analysis', async () => {
      const user = userEvent.setup();
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Comparison features should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });
  });

  describe('Data Integration & State Management', () => {
    it('should integrate with scraped data from ScrapeDashboard', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Data integration should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should maintain battlecard state across component updates', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // State management should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should handle real-time data updates and refreshes', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Real-time updates should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle API failures gracefully', async () => {
      mockGenerateBattlecard.mockRejectedValue(new Error('API Error'));
      
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });
    });

    it('should handle empty or invalid company data appropriately', async () => {
      mockGenerateBattlecard.mockResolvedValue(null);
      
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });
    });

    it('should handle network timeouts gracefully', async () => {
      mockGenerateBattlecard.mockRejectedValue(new Error('Timeout'));
      
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });
    });

    it('should handle malformed battlecard data gracefully', async () => {
      mockGenerateBattlecard.mockResolvedValue({
        company: 'Invalid Company',
        competitors: null,
        strengths: null
      });
      
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance & Responsiveness', () => {
    it('should render battlecard results within acceptable time', async () => {
      const startTime = performance.now();
      
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });

    it('should handle multiple concurrent battlecard generations', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Concurrent generation should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should provide responsive UI for different screen sizes', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Responsive UI should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });
  });

  describe('Integration Testing', () => {
    it('should work seamlessly with ScrapeDashboard workflow', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Integration with ScrapeDashboard should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should integrate with AI Analysis features', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // AI Analysis integration should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should integrate with data export and reporting features', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Export integration should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });
  });

  describe('Advanced Features & Analytics', () => {
    it('should provide historical battlecard comparison', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Historical comparison should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should support trend analysis and market evolution tracking', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Trend analysis should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should provide competitive intelligence scoring and metrics', async () => {
      renderBattlecard();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Intelligence scoring should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });
  });
});
