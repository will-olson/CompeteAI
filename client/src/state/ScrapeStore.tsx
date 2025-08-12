// ScrapeStore.tsx - Context for managing scraped data state
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface ScrapedItem {
  id: string;
  company: string;
  category: 'marketing' | 'docs' | 'rss' | 'social' | 'aggregate' | 'upload';
  url?: string;
  title?: string;
  markdown?: string;
  html?: string;
  scrapedAt: string;
  source?: string;
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
