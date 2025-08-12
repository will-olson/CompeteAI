import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { APIService } from '../APIService';

// Note: This test file tests the actual APIService implementation
// It should not be run with the global test setup that mocks APIService
// The global setup mocks APIService for component tests, but here we want to test the real implementation

// Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('APIService - Backend Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    delete import.meta.env.VITE_API_BASE_URL;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('Health Check', () => {
    it('should make health check request to backend', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00.000Z',
        services: {
          scraper: 'available',
          ai_analyzer: 'available',
          enterprise_analyzer: 'available'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.healthCheck();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/health',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return fallback response when backend is unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await APIService.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.services.scraper).toBe('unavailable');
    });
  });

  describe('Preset Groups', () => {
    it('should fetch preset groups from backend', async () => {
      const mockResponse = {
        'tech-saas': {
          name: 'Tech SaaS',
          companies: ['Salesforce', 'HubSpot'],
          categories: ['marketing', 'docs'],
          company_count: 2
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.getPresetGroups();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/preset-groups',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return fallback preset groups when backend is unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await APIService.getPresetGroups();

      expect(result['tech-saas']).toBeDefined();
      expect(result['tech-saas'].companies).toContain('Salesforce');
    });
  });

  describe('Company Scraping', () => {
    it('should scrape company using backend API', async () => {
      const request = {
        company: 'Test Company',
        urls: { marketing: 'https://example.com' },
        categories: ['marketing']
      };

      const mockResponse = {
        company: 'Test Company',
        categories: { marketing: { success: true } }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.scrapeCompany(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/scrape/company',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle scraping errors gracefully', async () => {
      const request = {
        company: 'Test Company',
        urls: { marketing: 'https://example.com' },
        categories: ['marketing']
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      await expect(APIService.scrapeCompany(request)).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('Group Scraping', () => {
    it('should scrape multiple companies in a group', async () => {
      const request = {
        group_name: 'Tech Group',
        companies: [
          { name: 'Company A', website: 'https://a.com', categories: ['marketing'] }
        ],
        categories: ['marketing']
      };

      const mockResponse = { success: true, message: 'Scraping completed' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.scrapeGroup(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/scrape/group',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Mass Scraping', () => {
    it('should perform mass scraping operation', async () => {
      const request = {
        companies: ['Company A', 'Company B'],
        categories: ['marketing', 'docs']
      };

      const mockResponse = { success: true, message: 'Mass scraping completed' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.scrapeMass(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/scrape/mass',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('File Import/Export', () => {
    it('should import data from file', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.csv'));

      const mockResponse = { success: true, message: 'File imported successfully' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.importFile(formData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/import/file',
        expect.objectContaining({
          method: 'POST',
          body: formData
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should export data to specified format', async () => {
      const request = { format: 'csv', data: ['item1', 'item2'] };

      const mockResponse = { success: true, download_url: '/download/export.csv' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.exportData(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/export/data',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('AI Analysis', () => {
    it('should trigger AI analysis', async () => {
      const request = {
        company: 'Test Company',
        category: 'marketing',
        data: ['content1', 'content2']
      };

      const mockResponse = {
        success: true,
        insights: ['Insight 1', 'Insight 2']
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.aiAnalyze(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/ai/analyze',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should generate battlecard', async () => {
      const request = {
        company: 'Test Company',
        category: 'marketing',
        data: ['content1', 'content2']
      };

      const mockResponse = {
        success: true,
        battlecard: { strengths: ['Strength 1'], weaknesses: ['Weakness 1'] }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.generateBattlecard(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/ai/battlecard',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Enterprise Analysis', () => {
    it('should analyze enterprise category', async () => {
      const request = {
        category: 'enterprise-software',
        companies: ['Company A', 'Company B']
      };

      const mockResponse = {
        success: true,
        analysis: { market_size: 'Large', competition: 'High' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.analyzeEnterpriseCategory(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/enterprise/analyze-category',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Analytics and Search', () => {
    it('should get analytics summary', async () => {
      const request = { date_range: 'last_30_days' };

      const mockResponse = {
        success: true,
        summary: { total_items: 100, companies: 10 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.getAnalyticsSummary(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/analytics/summary',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should search content', async () => {
      const request = { query: 'AI features', filters: { category: 'marketing' } };

      const mockResponse = {
        success: true,
        results: [{ title: 'AI Features Guide', relevance: 0.9 }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await APIService.searchContent(request);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/search/content',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(APIService.healthCheck()).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      } as Response);

      await expect(APIService.healthCheck()).rejects.toThrow('Invalid JSON');
    });

    it('should handle timeout scenarios', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Timeout'));

      await expect(APIService.healthCheck()).rejects.toThrow('Timeout');
    });
  });

  describe('Request Configuration', () => {
    it('should use correct base URL from environment', async () => {
      // Set custom API base URL
      import.meta.env.VITE_API_BASE_URL = 'https://api.example.com';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' })
      } as Response);

      await APIService.healthCheck();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/health',
        expect.any(Object)
      );
    });

    it('should include proper headers in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' })
      } as Response);

      await APIService.healthCheck();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });
  });
}); 