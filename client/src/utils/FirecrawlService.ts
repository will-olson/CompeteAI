// FirecrawlService.ts - Mock service for frontend testing
// In production, this would integrate with the actual Firecrawl API

const API_KEY_STORAGE_KEY = 'firecrawl_api_key';

export interface FirecrawlResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class FirecrawlService {
  private static apiKey: string | null = null;

  static getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    }
    return this.apiKey;
  }

  static saveApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  }

  static clearApiKey(): void {
    this.apiKey = null;
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    // For frontend testing, we'll simulate a successful API key test
    // In production, this would make an actual API call to validate the key
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate API key validation
        resolve(apiKey.startsWith('fc_') || apiKey.startsWith('mock_'));
      }, 500);
    });
  }

  static async crawlWebsite(url: string, limit: number = 25): Promise<FirecrawlResponse> {
    // For frontend testing, return mock data
    // In production, this would make actual API calls to Firecrawl
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Generate mock data based on the URL and limit
      const mockData = this.generateMockData(url, limit);
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private static generateMockData(url: string, limit: number) {
    const baseUrl = new URL(url);
    const host = baseUrl.host;
    const path = baseUrl.pathname;
    
    const mockPages = [];
    const actualLimit = Math.min(limit, 10); // Cap at 10 for demo purposes
    
    for (let i = 0; i < actualLimit; i++) {
      const pageData = {
        metadata: {
          url: `${baseUrl.origin}${path}/page-${i + 1}`,
          title: `Mock Page ${i + 1} - ${host}`,
          description: `This is a mock page generated for testing the scraping dashboard functionality.`,
          language: 'en',
          timestamp: new Date().toISOString()
        },
        markdown: `# Mock Page ${i + 1}\n\nThis is a mock page for testing purposes.\n\n## Content Section\n\nThis page contains sample content that simulates what would be scraped from a real website.\n\n### Features\n- Mock data generation\n- Frontend testing capabilities\n- Sample content structure\n\nThis allows you to test the dashboard functionality without requiring actual web scraping services.\n\n## Technical Details\n\nThe mock data includes:\n- Page metadata (URL, title, description)\n- Markdown content\n- HTML content\n- Timestamps\n\n## Next Steps\n\nUse this mock data to test:\n- Analytics and visualizations\n- Filtering and search\n- Data export functionality\n- Content quality analysis`,
        html: `<h1>Mock Page ${i + 1}</h1><p>This is a mock page for testing purposes.</p><h2>Content Section</h2><p>This page contains sample content that simulates what would be scraped from a real website.</p>`,
        text: `Mock Page ${i + 1}\n\nThis is a mock page for testing purposes.\n\nContent Section\n\nThis page contains sample content that simulates what would be scraped from a real website.`,
        links: [
          `${baseUrl.origin}/page-${i + 2}`,
          `${baseUrl.origin}/about`,
          `${baseUrl.origin}/contact`
        ],
        images: [
          `${baseUrl.origin}/images/mock-${i + 1}.jpg`,
          `${baseUrl.origin}/images/logo.png`
        ]
      };
      
      mockPages.push(pageData);
    }
    
    return {
      data: mockPages,
      total: mockPages.length,
      limit: actualLimit,
      url: url,
      timestamp: new Date().toISOString()
    };
  }

  static async batchCrawl(urls: string[], limit: number = 25): Promise<FirecrawlResponse[]> {
    const results: FirecrawlResponse[] = [];
    
    for (const url of urls) {
      const result = await this.crawlWebsite(url, limit);
      results.push(result);
      
      // Add delay between requests to simulate rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  static async getCrawlStatus(crawlId: string): Promise<FirecrawlResponse> {
    // Mock crawl status for testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: crawlId,
            status: 'completed',
            progress: 100,
            totalPages: 10,
            completedPages: 10,
            failedPages: 0
          }
        });
      }, 500);
    });
  }
}

export default FirecrawlService;
