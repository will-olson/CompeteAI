const API_BASE_URL = 'http://localhost:5001/api';

export interface ScrapingRequest {
  company_name: string;
  website_url: string;
  categories: string[];
  custom_fields?: Record<string, string>;
}

export interface GroupScrapingRequest {
  group_name: string;
  companies: Array<{
    name: string;
    website: string;
    categories: string[];
  }>;
  categories: string[];
}

export interface AIAnalysisRequest {
  content: string;
  analysis_type: 'competitive' | 'battlecard' | 'content_strategy' | 'competitive_moves';
  options?: {
    tone?: string;
    focus_areas?: string[];
    format?: string;
  };
}

export interface PresetGroup {
  name: string;
  description: string;
  company_count: number;
  categories: string[];
}

export class APIService {
  static async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  static async getPresetGroups(): Promise<Record<string, PresetGroup>> {
    try {
      const response = await fetch(`${API_BASE_URL}/preset-groups`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get preset groups:', error);
      throw error;
    }
  }

  static async loadPresetGroup(groupKey: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/preset-groups/${groupKey}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to load preset group:', error);
      throw error;
    }
  }

  static async createCustomGroup(groupData: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/custom-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create custom group:', error);
      throw error;
    }
  }

  static async scrapeCompany(request: ScrapingRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/scrape/company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to scrape company:', error);
      throw error;
    }
  }

  static async scrapeGroup(request: GroupScrapingRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/scrape/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to scrape group:', error);
      throw error;
    }
  }

  static async massScrape(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/scrape/mass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to mass scrape:', error);
      throw error;
    }
  }

  static async importFile(file: File, importType: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('import_type', importType);

      const response = await fetch(`${API_BASE_URL}/import/file`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to import file:', error);
      throw error;
    }
  }

  static async exportData(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/export/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  static async analyzeWithAI(request: AIAnalysisRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to analyze with AI:', error);
      throw error;
    }
  }

  static async generateBattlecard(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/battlecard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate battlecard:', error);
      throw error;
    }
  }

  static async generateContentStrategy(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/content-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate content strategy:', error);
      throw error;
    }
  }

  static async analyzeCompetitiveMoves(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/competitive-moves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to analyze competitive moves:', error);
      throw error;
    }
  }

  static async analyzeEnterpriseCategory(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/enterprise/analyze-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to analyze enterprise category:', error);
      throw error;
    }
  }

  static async generateEnterpriseBattlecard(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/enterprise/generate-battlecard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate enterprise battlecard:', error);
      throw error;
    }
  }

  static async getAnalyticsSummary(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      throw error;
    }
  }

  static async searchContent(request: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/search/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to search content:', error);
      throw error;
    }
  }

  static async downloadFile(filename: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${filename}`);
      return await response.blob();
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }
} 