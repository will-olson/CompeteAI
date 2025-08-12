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

interface ScrapeState {
  items: ScrapedItem[];
}

type ScrapeAction =
  | { type: 'ADD_ITEMS'; payload: ScrapedItem[] }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<ScrapedItem> } };

const initialState: ScrapeState = {
  items: []
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

  const value: ScrapeContextType = {
    state,
    addItems,
    removeItem,
    clear,
    updateItem
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

// Helper function to get actions from context
export const useScrapeActions = () => {
  const context = useScrapeStore();
  return {
    addItems: context.addItems,
    removeItem: context.removeItem,
    clear: context.clear,
    updateItem: context.updateItem
  };
};
