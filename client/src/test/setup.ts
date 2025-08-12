import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('@/utils/APIService', () => ({
  APIService: {
    healthCheck: vi.fn(),
    getPresetGroups: vi.fn(),
    scrapeCompany: vi.fn(),
    scrapeGroup: vi.fn(),
    scrapeMass: vi.fn(),
    importFile: vi.fn(),
    exportData: vi.fn(),
    aiAnalyze: vi.fn(),
    generateBattlecard: vi.fn(),
    generateContentStrategy: vi.fn(),
    analyzeCompetitiveMoves: vi.fn(),
    analyzeEnterpriseCategory: vi.fn(),
    generateEnterpriseBattlecard: vi.fn(),
    getAnalyticsSummary: vi.fn(),
    searchContent: vi.fn()
  }
}));

// Mock FirecrawlService
vi.mock('@/utils/FirecrawlService', () => ({
  FirecrawlService: {
    getApiKey: vi.fn(() => 'test-key'),
    scrapeUrl: vi.fn(),
    scrapeMultipleUrls: vi.fn()
  }
}));

// Mock LLMService
vi.mock('@/utils/LLMService', () => ({
  LLMService: {
    analyzeContent: vi.fn(),
    generateInsights: vi.fn(),
    createBattlecard: vi.fn()
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn(); 