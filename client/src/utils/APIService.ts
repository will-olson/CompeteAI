// APIService.ts - Service for communicating with the InsightForge backend
// Provides fallback functionality for frontend testing when backend is unavailable

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: Record<string, string>;
}

export interface PresetGroup {
  name: string;
  companies: string[];
  categories: string[];
  company_count: number;
}

export interface ScrapeCompanyRequest {
  company: string;
  urls: Record<string, string>;
  categories: string[];
  page_limit?: number;
}

export interface ScrapeCompanyResponse {
  company?: string;
  categories?: Record<string, any>;
  error?: string;
}

export interface ScrapeGroupRequest {
  group_name: string;
  companies: Array<{
    name: string;
    website: string;
    categories: string[];
  }>;
  categories: string[];
}

export interface ScrapeGroupResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class APIService {
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  static async healthCheck(): Promise<HealthResponse> {
    try {
      return await this.makeRequest<HealthResponse>('/api/health');
    } catch (error) {
      // Return mock health response for frontend testing
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          scraper: 'unavailable',
          ai_analyzer: 'unavailable',
          enterprise_analyzer: 'unavailable'
        }
      };
    }
  }

  static async getPresetGroups(): Promise<Record<string, PresetGroup>> {
    try {
      return await this.makeRequest<Record<string, PresetGroup>>('/api/preset-groups');
    } catch (error) {
      // Return mock preset groups for frontend testing
      return {
        'tech-saas': {
          name: 'Tech SaaS',
          companies: ['Salesforce', 'HubSpot', 'Slack', 'Notion', 'Figma', 'Airtable'],
          categories: ['marketing', 'docs', 'rss', 'social'],
          company_count: 6
        },
        'fintech': {
          name: 'Fintech',
          companies: ['Stripe', 'Plaid', 'Coinbase', 'Robinhood', 'Chime', 'Affirm'],
          categories: ['marketing', 'docs', 'rss', 'social'],
          company_count: 6
        },
        'ecommerce': {
          name: 'E-commerce',
          companies: ['Shopify', 'Amazon', 'Etsy', 'WooCommerce', 'BigCommerce', 'Magento'],
          categories: ['marketing', 'docs', 'rss', 'social'],
          company_count: 6
        },
        'ai-ml': {
          name: 'AI/ML',
          companies: ['OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI', 'Meta AI', 'NVIDIA'],
          categories: ['marketing', 'docs', 'rss', 'social'],
          company_count: 6
        }
      };
    }
  }

  static async loadPresetGroup(groupKey: string): Promise<PresetGroup> {
    try {
      return await this.makeRequest<PresetGroup>(`/api/preset-groups/${groupKey}`);
    } catch (error) {
      // Return mock preset group for frontend testing
      const mockGroups = await this.getPresetGroups();
      const mockGroup = mockGroups[groupKey];
      
      if (!mockGroup) {
        throw new Error(`Preset group '${groupKey}' not found`);
      }
      
      return mockGroup;
    }
  }

  static async scrapeCompany(request: ScrapeCompanyRequest): Promise<ScrapeCompanyResponse> {
    try {
      return await this.makeRequest<ScrapeCompanyResponse>('/api/scrape/company', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      // Return mock response for frontend testing
      console.warn('Backend scraping failed, returning mock data:', error);
      return {
        company: request.company,
        categories: {
          [request.categories[0]]: {
            items: [
              {
                id: `mock_${Date.now()}`,
                title: `Mock ${request.categories[0]} content for ${request.company}`,
                content: `This is mock content for ${request.company} in the ${request.categories[0]} category. This demonstrates the scraping functionality when the backend is not available.`,
                url: Object.values(request.urls)[0] || 'https://example.com',
                scraped_at: new Date().toISOString()
              }
            ]
          }
        }
      };
    }
  }

  static async createCustomGroup(groupData: {
    name: string;
    companies: string[];
    categories: string[];
  }): Promise<{ success: boolean; group_id: string }> {
    try {
      return await this.makeRequest<{ success: boolean; group_id: string }>('/api/custom-groups', {
        method: 'POST',
        body: JSON.stringify(groupData),
      });
    } catch (error) {
      // Return mock response for frontend testing
      return {
        success: true,
        group_id: `mock_${Date.now()}`
      };
    }
  }

  static async scrapeGroup(request: ScrapeGroupRequest): Promise<ScrapeGroupResponse> {
    try {
      return await this.makeRequest<ScrapeGroupResponse>('/api/scrape/group', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      // Return mock response for frontend testing
      return {
        success: true,
        message: `Mock scraping completed for ${request.companies.length} companies`,
        data: {
          total_pages: request.companies.length * 5,
          companies_processed: request.companies.length,
          categories_processed: request.categories.length
        }
      };
    }
  }

  static async getScrapingStatus(): Promise<{
    is_running: boolean;
    progress: number;
    current_company: string;
    total_companies: number;
  }> {
    try {
      return await this.makeRequest<{
        is_running: boolean;
        progress: number;
        current_company: string;
        total_companies: number;
      }>('/api/scraping-status');
    } catch (error) {
      // Return mock status for frontend testing
      return {
        is_running: false,
        progress: 0,
        current_company: '',
        total_companies: 0
      };
    }
  }

  static async getScrapingHistory(): Promise<Array<{
    id: string;
    timestamp: string;
    companies: string[];
    categories: string[];
    total_pages: number;
    status: 'completed' | 'failed' | 'running';
  }>> {
    try {
      return await this.makeRequest<Array<{
        id: string;
        timestamp: string;
        companies: string[];
        categories: string[];
        total_pages: number;
        status: 'completed' | 'failed' | 'running';
      }>>('/api/scraping-history');
    } catch (error) {
      // Return mock history for frontend testing
      return [
        {
          id: 'mock_1',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          companies: ['Salesforce', 'HubSpot'],
          categories: ['marketing', 'docs'],
          total_pages: 15,
          status: 'completed'
        },
        {
          id: 'mock_2',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          companies: ['Stripe', 'Plaid'],
          categories: ['marketing', 'rss'],
          total_pages: 12,
          status: 'completed'
        }
      ];
    }
  }
}

export default APIService; 