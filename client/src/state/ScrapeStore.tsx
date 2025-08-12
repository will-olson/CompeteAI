import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ScrapeCategory = 'marketing' | 'docs' | 'rss' | 'social' | 'aggregate' | 'upload';

export interface ScrapedItem {
  id: string;
  company: string; // user-supplied tag
  category: ScrapeCategory;
  url?: string;
  title?: string;
  markdown?: string;
  html?: string;
  scrapedAt: string;
  source?: string; // domain
}

interface StoreState {
  items: ScrapedItem[];
  addItems: (items: ScrapedItem[]) => void;
  clear: () => void;
}

const ScrapeContext = createContext<StoreState | null>(null);
const STORAGE_KEY = 'ci_scraped_items_v1';

export const ScrapeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ScrapedItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setItems(JSON.parse(raw)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItems = (newItems: ScrapedItem[]) => setItems(prev => [...newItems, ...prev]);
  const clear = () => setItems([]);

  const value = useMemo(() => ({ items, addItems, clear }), [items]);
  return <ScrapeContext.Provider value={value}>{children}</ScrapeContext.Provider>;
};

export const useScrapeStore = () => {
  const ctx = useContext(ScrapeContext);
  if (!ctx) throw new Error('useScrapeStore must be used within ScrapeProvider');
  return ctx;
};
