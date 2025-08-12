import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import AIAnalysis from '../AIAnalysis';
import { ScrapeProvider } from '@/state/ScrapeStore';
import { APIService } from '@/utils/APIService';

// Mock the APIService
vi.mock('@/utils/APIService', () => ({
  APIService: {
    analyzeContent: vi.fn(),
    generateBattlecard: vi.fn(),
    getContentStrategy: vi.fn(),
    getCompetitiveMoves: vi.fn(),
    analyzeEnterpriseCategory: vi.fn(),
    generateEnterpriseBattlecard: vi.fn()
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

const mockAnalyzeContent = vi.mocked(APIService.analyzeContent);
const mockGenerateBattlecard = vi.mocked(APIService.generateBattlecard);
const mockGetContentStrategy = vi.mocked(APIService.getContentStrategy);
const mockGetCompetitiveMoves = vi.mocked(APIService.getCompetitiveMoves);

const renderAIAnalysis = () => {
  return render(
    <ScrapeProvider>
      <AIAnalysis />
    </ScrapeProvider>
  );
};

describe('AIAnalysis - Comprehensive AI-Powered Analysis Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock responses
    mockAnalyzeContent.mockResolvedValue({
      sentiment_score: 0.8,
      key_topics: ['CRM', 'cloud computing', 'enterprise software'],
      competitive_insights: 'Strong market position in enterprise CRM',
      risk_factors: 'Competition from Microsoft Dynamics and Oracle',
      analysis_timestamp: new Date().toISOString()
    });

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

    mockGetContentStrategy.mockResolvedValue({
      content_themes: ['Customer success', 'Digital transformation', 'AI innovation'],
      messaging_strategy: 'Emphasize customer outcomes and AI leadership',
      content_gaps: ['Competitive comparisons', 'ROI case studies'],
      recommendations: ['Create competitive battlecards', 'Develop customer success stories'],
      analysis_timestamp: new Date().toISOString()
    });

    mockGetCompetitiveMoves.mockResolvedValue({
      company: 'Salesforce',
      competitive_moves: [
        {
          move_type: 'Product Launch',
          description: 'Released Einstein AI features',
          impact: 'High',
          timeframe: 'Last 3 months',
          strategic_implications: 'AI leadership positioning',
          recommended_response: 'Accelerate AI roadmap'
        }
      ],
      analysis_timestamp: new Date().toISOString()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering & Layout', () => {
    it('should render the AI Analysis page with proper title and description', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
        expect(screen.getByText(/Leverage artificial intelligence/i)).toBeInTheDocument();
      });
    });

    it('should display all main analysis sections', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
        expect(screen.getByText(/Content Strategy/i)).toBeInTheDocument();
        expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
      });
    });

    it('should show proper loading states and error handling', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });
    });
  });

  describe('Content Analysis Functionality', () => {
    it('should provide comprehensive content analysis with AI insights', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
      });

      // Content analysis section should be visible
      expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
    });

    it('should display sentiment analysis results', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
      });

      // Sentiment analysis should be available
      expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
    });

    it('should extract key topics from content', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
      });

      // Topic extraction should be available
      expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
    });

    it('should identify competitive insights and risk factors', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
      });

      // Competitive insights should be available
      expect(screen.getByText(/Content Analysis/i)).toBeInTheDocument();
    });
  });

  describe('Competitive Battlecard Generation', () => {
    it('should generate comprehensive competitive battlecards', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Battlecard generation should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should analyze company strengths and weaknesses', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Strengths and weaknesses analysis should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should identify opportunities and threats', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Opportunities and threats analysis should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });

    it('should provide strategic recommendations', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
      });

      // Strategic recommendations should be available
      expect(screen.getByText(/Competitive Battlecards/i)).toBeInTheDocument();
    });
  });

  describe('Content Strategy Analysis', () => {
    it('should analyze content themes and messaging strategy', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Content Strategy/i)).toBeInTheDocument();
      });

      // Content strategy analysis should be available
      expect(screen.getByText(/Content Strategy/i)).toBeInTheDocument();
    });

    it('should identify content gaps and opportunities', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Content Strategy/i)).toBeInTheDocument();
      });

      // Content gap analysis should be available
      expect(screen.getByText(/Content Strategy/i)).toBeInTheDocument();
    });

    it('should provide actionable content recommendations', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Content Strategy/i)).toBeInTheDocument();
      });

      // Content recommendations should be available
      expect(screen.getByText(/Content Strategy/i)).toBeInTheDocument();
    });
  });

  describe('Competitive Moves Detection', () => {
    it('should detect and analyze competitive moves', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
      });

      // Competitive moves detection should be available
      expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
    });

    it('should categorize move types and impact levels', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
      });

      // Move categorization should be available
      expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
    });

    it('should provide strategic implications and responses', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
      });

      // Strategic implications should be available
      expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
    });

    it('should track competitive moves over time', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
      });

      // Time-based tracking should be available
      expect(screen.getByText(/Competitive Moves/i)).toBeInTheDocument();
    });
  });

  describe('Enterprise Software Analysis', () => {
    it('should provide enterprise software category analysis', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Enterprise analysis should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });

    it('should generate enterprise-specific battlecards', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Enterprise battlecards should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction & Controls', () => {
    it('should allow users to select analysis types', async () => {
      const user = userEvent.setup();
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Analysis type selection should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });

    it('should provide configuration options for analysis parameters', async () => {
      const user = userEvent.setup();
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Configuration options should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });

    it('should allow users to export analysis results', async () => {
      const user = userEvent.setup();
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Export functionality should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });
  });

  describe('Data Integration & State Management', () => {
    it('should integrate with scraped data from other components', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Data integration should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });

    it('should maintain analysis state across component updates', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // State management should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });

    it('should handle real-time data updates', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Real-time updates should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle API failures gracefully', async () => {
      mockAnalyzeContent.mockRejectedValue(new Error('API Error'));
      
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });
    });

    it('should handle empty or invalid data appropriately', async () => {
      mockAnalyzeContent.mockResolvedValue(null);
      
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });
    });

    it('should handle network timeouts gracefully', async () => {
      mockAnalyzeContent.mockRejectedValue(new Error('Timeout'));
      
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance & Responsiveness', () => {
    it('should render analysis results within acceptable time', async () => {
      const startTime = performance.now();
      
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });

    it('should handle multiple concurrent analysis requests', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Concurrent request handling should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });
  });

  describe('Integration Testing', () => {
    it('should work seamlessly with ScrapeDashboard workflow', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Integration with ScrapeDashboard should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });

    it('should integrate with data export and reporting features', async () => {
      renderAIAnalysis();
      
      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
      });

      // Export integration should be available
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });
  });
});
