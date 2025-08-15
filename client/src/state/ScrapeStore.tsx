// ScrapeStore.tsx - Context for managing scraped data state
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface ScrapedItem {
  id: string;
  company: string;
  category: 'marketing' | 'docs' | 'rss' | 'social' | 'aggregate' | 'upload' | 'api' | 'blog' | 'community' | 'pricing' | 'security' | 'enterprise' | 'partners' | 'developers' | 'support' | 'resources' | 'templates' | 'apps' | 'downloads' | 'integrations' | 'compliance' | 'research' | 'models' | 'ethics' | 'demos' | 'news';
  url?: string;
  title?: string;
  markdown?: string;
  html?: string;
  scrapedAt: string;
  source?: string;
  // Enhanced metadata fields
  metadata?: {
    // Content analysis
    word_count?: number;
    char_count?: number;
    language?: string;
    readability_score?: number | null;
    content_density?: number | null;
    freshness_score?: number | null;
    authority_score?: number | null;
    // Technical metadata
    http_status?: number;
    response_time?: number | null;
    content_type?: string;
    encoding?: string;
    // Content structure
    has_images?: boolean;
    has_tables?: boolean;
    has_forms?: boolean;
    has_videos?: boolean;
    // Link analysis
    internal_links?: string[];
    external_links?: string[];
    link_count?: number;
    // SEO metadata
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    canonical_url?: string | null;
    // Social media metadata
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    twitter_card?: string | null;
    // Publication metadata
    author?: string | null;
    published_date?: string | null;
    modified_date?: string | null;
    // Business metadata
    pricing_info?: string | null;
    contact_info?: string | null;
    location_info?: string | null;
    // Content quality indicators
    is_duplicate?: boolean;
    quality_score?: number | null;
    relevance_score?: number | null;
    // Scraping metadata
    crawl_depth?: number;
    parent_url?: string | null;
    redirect_chain?: string[];
    // Regional and localization
    region?: string | null;
    currency?: string | null;
    timezone?: string | null;
    // Compliance metadata
    robots_txt_respected?: boolean;
    gdpr_compliant?: boolean;
    rate_limit_respected?: boolean;
  };
  // Enhanced content fields
  content_summary?: string | null;
  key_phrases?: string[];
  sentiment_preview?: string | null;
  topic_tags?: string[];
  // Link targeting metadata
  target_pattern?: string;
  target_category?: string;
  target_company?: string;
  target_priority?: 'high' | 'medium' | 'low';
  // Performance metrics
  processing_time?: number | null;
  content_size?: number | null;
  compression_ratio?: number | null;
  // AI analysis fields
  sentiment_score?: number;
  ai_analysis?: string;
  key_topics?: string[];
  risk_factors?: string[];
  competitive_insights?: string;
  updated_at?: string;
}

// Configuration interfaces
export interface ScrapingTarget {
  company: string;
  category: string;
  url: string;
  enabled: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface PresetGroup {
  name: string;
  companies: string[];
  categories: string[];
  company_count: number;
  description?: string;
}

export interface ScrapingConfiguration {
  selectedPreset: string;
  customCompanies: string[];
  selectedCategories: string[];
  targets: ScrapingTarget[];
  advancedConfig: {
    pageLimit: number;
    depthLimit: number;
    delayBetweenRequests: number;
    respectRobots: boolean;
    followRedirects: boolean;
    handleJavascript: boolean;
    extractMetadata: boolean;
    extractLinks: boolean;
    extractImages: boolean;
    extractTables: boolean;
    filterDuplicates: boolean;
    filterLowQuality: boolean;
    gdprCompliance: boolean;
    rateLimiting: string;
  };
}

interface ScrapeState {
  items: ScrapedItem[];
  configuration: ScrapingConfiguration;
  presetGroups: Record<string, PresetGroup>;
}

type ScrapeAction =
  | { type: 'ADD_ITEMS'; payload: ScrapedItem[] }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<ScrapedItem> } }
  | { type: 'UPDATE_CONFIGURATION'; payload: Partial<ScrapingConfiguration> }
  | { type: 'SET_PRESET_GROUPS'; payload: Record<string, PresetGroup> }
  | { type: 'LOAD_PRESET_GROUP'; payload: { presetKey: string; preset: PresetGroup } }
  | { type: 'UPDATE_TARGETS'; payload: ScrapingTarget[] }
  | { type: 'ADD_TARGET'; payload: ScrapingTarget }
  | { type: 'REMOVE_TARGET'; payload: string }
  | { type: 'UPDATE_TARGET'; payload: { id: string; updates: Partial<ScrapingTarget> } };

const initialState: ScrapeState = {
  items: [
    {
      id: 'sample-1',
      company: 'OpenAI',
      category: 'marketing',
      url: 'https://openai.com',
      title: 'OpenAI Product Launch',
      markdown: 'We are excited to announce the launch of our new product...',
      scrapedAt: new Date().toISOString(),
      source: 'marketing',
      metadata: {
        word_count: 150,
        char_count: 750,
        has_images: true,
        link_count: 5
      },
      ai_analysis: 'Positive sentiment about product launch. Key topics: AI, innovation, product development.',
      sentiment_score: 0.8,
      key_topics: ['AI', 'innovation', 'product launch'],
      risk_factors: [],
      competitive_insights: 'Leading AI company launching new product'
    },
    {
      id: 'sample-2',
      company: 'Stripe',
      category: 'docs',
      url: 'https://stripe.com/docs',
      title: 'Stripe API Documentation',
      markdown: 'Complete API reference for Stripe payment processing...',
      scrapedAt: new Date().toISOString(),
      source: 'docs',
      metadata: {
        word_count: 300,
        char_count: 1500,
        has_images: false,
        link_count: 12
      },
      ai_analysis: 'Technical documentation with comprehensive API coverage. Key topics: payments, API, integration.',
      sentiment_score: 0.0,
      key_topics: ['payments', 'API', 'integration'],
      risk_factors: [],
      competitive_insights: 'Comprehensive payment processing documentation'
    }
  ],
  configuration: {
    selectedPreset: '',
    customCompanies: ['OpenAI', 'Stripe'],
    selectedCategories: ['marketing', 'docs'],
    targets: [
      {
        company: 'OpenAI',
        category: 'marketing',
        url: 'https://openai.com',
        enabled: true,
        priority: 'high'
      },
      {
        company: 'Stripe',
        category: 'docs',
        url: 'https://stripe.com/docs',
        enabled: true,
        priority: 'medium'
      }
    ],
    advancedConfig: {
      pageLimit: 25,
      depthLimit: 3,
      delayBetweenRequests: 1000,
      respectRobots: true,
      followRedirects: true,
      handleJavascript: true,
      extractMetadata: true,
      extractLinks: true,
      extractImages: true,
      extractTables: true,
      filterDuplicates: true,
      filterLowQuality: true,
      gdprCompliance: true,
      rateLimiting: 'adaptive'
    }
  },
  presetGroups: {}
};

function scrapeReducer(state: ScrapeState, action: ScrapeAction): ScrapeState {
  switch (action.type) {
    case 'ADD_ITEMS':
      return {
        ...state,
        items: [...state.items, ...action.payload]
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'CLEAR_ALL':
      return {
        ...state,
        items: []
      };
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };

    case 'UPDATE_CONFIGURATION':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          ...action.payload
        }
      };

    case 'SET_PRESET_GROUPS':
      return {
        ...state,
        presetGroups: action.payload
      };

    case 'LOAD_PRESET_GROUP':
      const { presetKey, preset } = action.payload;
      return {
        ...state,
        configuration: {
          ...state.configuration,
          selectedPreset: presetKey,
          customCompanies: preset.companies,
          selectedCategories: preset.categories,
          targets: preset.companies.flatMap(company => 
            preset.categories.map(category => ({
              company,
              category,
              url: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
              enabled: true,
              priority: 'medium' as const
            }))
          )
        }
      };

    case 'UPDATE_TARGETS':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          targets: action.payload
        }
      };

    case 'ADD_TARGET':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          targets: [...state.configuration.targets, action.payload]
        }
      };

    case 'REMOVE_TARGET':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          targets: state.configuration.targets.filter(target => 
            `${target.company}-${target.category}` !== action.payload
          )
        }
      };

    case 'UPDATE_TARGET':
      const { id, updates } = action.payload;
      return {
        ...state,
        configuration: {
          ...state.configuration,
          targets: state.configuration.targets.map(target =>
            `${target.company}-${target.category}` === id
              ? { ...target, ...updates }
              : target
          )
        }
      };
    
    default:
      return state;
  }
}

interface ScrapeContextType {
  state: ScrapeState;
  addItems: (items: ScrapedItem[]) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  updateItem: (id: string, updates: Partial<ScrapedItem>) => void;
  updateConfiguration: (updates: Partial<ScrapingConfiguration>) => void;
  setPresetGroups: (groups: Record<string, PresetGroup>) => void;
  loadPresetGroup: (presetKey: string, preset: PresetGroup) => void;
  updateTargets: (targets: ScrapingTarget[]) => void;
  addTarget: (target: ScrapingTarget) => void;
  removeTarget: (id: string) => void;
  updateTarget: (id: string, updates: Partial<ScrapingTarget>) => void;
}

const ScrapeContext = createContext<ScrapeContextType | undefined>(undefined);

export function ScrapeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scrapeReducer, initialState);

  const addItems = (items: ScrapedItem[]) => {
    dispatch({ type: 'ADD_ITEMS', payload: items });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const clear = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const updateItem = (id: string, updates: Partial<ScrapedItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  };

  const updateConfiguration = (updates: Partial<ScrapingConfiguration>) => {
    dispatch({ type: 'UPDATE_CONFIGURATION', payload: updates });
  };

  const setPresetGroups = (groups: Record<string, PresetGroup>) => {
    dispatch({ type: 'SET_PRESET_GROUPS', payload: groups });
  };

  const loadPresetGroup = (presetKey: string, preset: PresetGroup) => {
    dispatch({ type: 'LOAD_PRESET_GROUP', payload: { presetKey, preset } });
  };

  const updateTargets = (targets: ScrapingTarget[]) => {
    dispatch({ type: 'UPDATE_TARGETS', payload: targets });
  };

  const addTarget = (target: ScrapingTarget) => {
    dispatch({ type: 'ADD_TARGET', payload: target });
  };

  const removeTarget = (id: string) => {
    dispatch({ type: 'REMOVE_TARGET', payload: id });
  };

  const updateTarget = (id: string, updates: Partial<ScrapingTarget>) => {
    dispatch({ type: 'UPDATE_TARGET', payload: { id, updates } });
  };

  const value: ScrapeContextType = {
    state,
    addItems,
    removeItem,
    clear,
    updateItem,
    updateConfiguration,
    setPresetGroups,
    loadPresetGroup,
    updateTargets,
    addTarget,
    removeTarget,
    updateTarget
  };

  return (
    <ScrapeContext.Provider value={value}>
      {children}
    </ScrapeContext.Provider>
  );
}

export function useScrapeStore(): ScrapeContextType {
  const context = useContext(ScrapeContext);
  if (context === undefined) {
    throw new Error('useScrapeStore must be used within a ScrapeProvider');
  }
  return context;
}

// Helper function to get items from context
export const useScrapeItems = () => {
  const context = useScrapeStore();
  return context.state.items;
};

// Helper function to get configuration from context
export const useScrapeConfiguration = () => {
  const context = useScrapeStore();
  return context.state.configuration;
};

// Helper function to get preset groups from context
export const usePresetGroups = () => {
  const context = useScrapeStore();
  return context.state.presetGroups;
};

// Helper function to get actions from context
export const useScrapeActions = () => {
  const context = useScrapeStore();
  return {
    addItems: context.addItems,
    removeItem: context.removeItem,
    clear: context.clear,
    updateItem: context.updateItem,
    updateConfiguration: context.updateConfiguration,
    setPresetGroups: context.setPresetGroups,
    loadPresetGroup: context.loadPresetGroup,
    updateTargets: context.updateTargets,
    addTarget: context.addTarget,
    removeTarget: context.removeTarget,
    updateTarget: context.updateTarget
  };
};
