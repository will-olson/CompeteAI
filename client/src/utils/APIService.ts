// APIService.ts - Service for communicating with the InsightForge backend
// Provides fallback functionality for frontend testing when backend is unavailable

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export interface ScrapedItem {
  id: number;
  company: string;
  category: string;
  url: string;
  text_content?: string;
  quality_score?: number;
  technical_relevance?: number;
  scraped_at: string;
}

export interface CompanyData {
  company: string;
  total_items: number;
  categories: {
    [category: string]: number;
  };
  recent_items: ScrapedItem[];
  technical_score: number;
  last_scraped: string;
}

export interface CompetitiveIntelligenceData {
  company: string;
  category: string;
  content_type: 'docs' | 'rss' | 'api_docs' | 'features' | 'pricing' | 'integrations';
  title?: string;
  url: string;
  content_preview: string;
  ai_summary?: string;
  insights?: string;
  scraped_at: string;
  metadata: {
    word_count?: number;
    link_count?: number;
    has_images?: boolean;
    technical_keywords?: string[];
  };
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

class APIService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health');
  }

  // Get all scraped items from database
  async getScrapedItems(): Promise<ScrapedItem[]> {
    return this.makeRequest('/api/scraped-items');
  }

  // Get company summary data
  async getCompanyData(): Promise<CompanyData[]> {
    return this.makeRequest('/api/company-data');
  }

  // Get competitive intelligence data
  async getCompetitiveIntelligenceData(): Promise<CompetitiveIntelligenceData[]> {
    return this.makeRequest('/api/competitive-intelligence');
  }

  async getStrategicComparisonData(): Promise<any> {
    try {
      return await this.makeRequest('/api/strategic-comparison');
    } catch (error) {
      console.error('Error fetching strategic comparison data:', error);
      throw error;
    }
  }

  // Get preset groups
  async getPresetGroups(): Promise<Record<string, any>> {
    return this.makeRequest('/api/preset-groups');
  }

  // Real Data Integration Methods
  async getRealCompetitorData(): Promise<any> {
    try {
      return await this.makeRequest("/api/real-competitor-data");
    } catch (error) {
      console.error("Error fetching real competitor data:", error);
      throw error;
    }
  }

  async getRealCompetitor(companyName: string): Promise<any> {
    try {
      return await this.makeRequest(`/api/real-competitor/${companyName}`);
    } catch (error) {
      console.error(`Error fetching real data for ${companyName}:`, error);
      throw error;
    }
  }

  async getScrapingStatus(): Promise<any> {
    try {
      return await this.makeRequest("/api/scraping-status");
    } catch (error) {
      console.error("Error fetching scraping status:", error);
      throw error;
    }
  }

  async getScrapingProgress(): Promise<any> {
    try {
      return await this.makeRequest("/api/scraping-progress");
    } catch (error) {
      console.error("Error fetching scraping progress:", error);
      throw error;
    }
  }

  // Start scraping
  async startScraping(config: any): Promise<{ job_id: string; status: string }> {
    return this.makeRequest('/api/scrape/company', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }


}

export default new APIService();

// Legacy static methods for backward compatibility
export class APIServiceStatic {
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return new APIService().checkHealth();
  }

  static async getPresetGroups(): Promise<Record<string, any>> {
    return new APIService().getPresetGroups();
  }

  static async getScrapingStatus(): Promise<{
    is_running: boolean;
    progress: number;
    current_company: string;
    total_companies: number;
  }> {
    // Mock status for backward compatibility
    return {
      is_running: false,
      progress: 0,
      current_company: '',
      total_companies: 0
    };
  }

  static async getScrapingHistory(): Promise<Array<{
    id: string;
    company: string;
    category: string;
    url: string;
    scraped_at: string;
    status: string;
    items_found: number;
  }>> {
    return [];
  }

  static async getCompanyInsights(company: string): Promise<{
    company: string;
    total_items: number;
    categories: Record<string, number>;
    recent_activity: string[];
    technical_score: number;
  }> {
    return {
      company,
      total_items: 0,
      categories: {},
      recent_activity: [],
      technical_score: 0
    };
  }

  static async getCompetitiveAnalysis(): Promise<{
    total_companies: number;
    total_items: number;
    top_categories: string[];
    recent_activity: string[];
    technical_trends: string[];
  }> {
    return {
      total_companies: 0,
      total_items: 0,
      top_categories: [],
      recent_activity: [],
      technical_trends: []
    };
  }
} 