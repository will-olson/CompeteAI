import { ScrapedItem } from '@/state/ScrapeStore';

export interface DatabaseItem extends ScrapedItem {
  ai_analysis?: string;
  sentiment_score?: number;
  key_topics?: string[];
  competitive_insights?: string;
  risk_factors?: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseStats {
  totalItems: number;
  companies: string[];
  categories: string[];
  averageContentLength: number;
  contentQuality: {
    richContent: number;
    hasLinks: number;
    hasImages: number;
    hasCode: number;
    structuredContent: number;
  };
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'InsightForgeDB';
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('scraped_items')) {
          const itemStore = db.createObjectStore('scraped_items', { keyPath: 'id' });
          itemStore.createIndex('company', 'company', { unique: false });
          itemStore.createIndex('category', 'category', { unique: false });
          itemStore.createIndex('created_at', 'created_at', { unique: false });
          itemStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        if (!db.objectStoreNames.contains('ai_analyses')) {
          const analysisStore = db.createObjectStore('ai_analyses', { keyPath: 'item_id' });
          analysisStore.createIndex('company', 'company', { unique: false });
          analysisStore.createIndex('created_at', 'created_at', { unique: false });
        }
      };
    });
  }

  async addItem(item: ScrapedItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const dbItem: DatabaseItem = {
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const transaction = this.db.transaction(['scraped_items'], 'readwrite');
    const store = transaction.objectStore('scraped_items');
    
    return new Promise((resolve, reject) => {
      const request = store.add(dbItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addItems(items: ScrapedItem[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['scraped_items'], 'readwrite');
    const store = transaction.objectStore('scraped_items');
    
    return new Promise((resolve, reject) => {
      let completed = 0;
      let hasError = false;

      items.forEach(item => {
        const dbItem: DatabaseItem = {
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const request = store.add(dbItem);
        request.onsuccess = () => {
          completed++;
          if (completed === items.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  async getAllItems(): Promise<DatabaseItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['scraped_items'], 'readonly');
    const store = transaction.objectStore('scraped_items');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getItemsByCompany(company: string): Promise<DatabaseItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['scraped_items'], 'readonly');
    const store = transaction.objectStore('scraped_items');
    const index = store.index('company');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(company);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getItemsByCategory(category: string): Promise<DatabaseItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['scraped_items'], 'readonly');
    const store = transaction.objectStore('scraped_items');
    const index = store.index('category');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(category);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchItems(query: string): Promise<DatabaseItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const allItems = await this.getAllItems();
    const searchTerm = query.toLowerCase();
    
    return allItems.filter(item => 
      item.title?.toLowerCase().includes(searchTerm) ||
      item.markdown?.toLowerCase().includes(searchTerm) ||
      item.company?.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm)
    );
  }

  async updateItemAI(id: string, aiData: {
    ai_analysis?: string;
    sentiment_score?: number;
    key_topics?: string[];
    competitive_insights?: string;
    risk_factors?: string[];
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['scraped_items'], 'readwrite');
    const store = transaction.objectStore('scraped_items');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updatedItem = {
            ...item,
            ...aiData,
            updated_at: new Date().toISOString()
          };
          
          const putRequest = store.put(updatedItem);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Item not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getStats(): Promise<DatabaseStats> {
    const allItems = await this.getAllItems();
    
    const companies = Array.from(new Set(allItems.map(item => item.company)));
    const categories = Array.from(new Set(allItems.map(item => item.category)));
    
    const contentQuality = {
      richContent: allItems.filter(item => (item.markdown?.length || 0) > 1000).length,
      hasLinks: allItems.filter(item => item.markdown?.includes('http')).length,
      hasImages: allItems.filter(item => item.markdown?.includes('![')).length,
      hasCode: allItems.filter(item => item.markdown?.includes('```')).length,
      structuredContent: allItems.filter(item => item.markdown?.includes('##')).length,
    };

    const averageContentLength = allItems.reduce((acc, item) => 
      acc + (item.markdown?.length || 0), 0) / Math.max(allItems.length, 1);

    return {
      totalItems: allItems.length,
      companies,
      categories,
      averageContentLength,
      contentQuality
    };
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['scraped_items'], 'readwrite');
    const store = transaction.objectStore('scraped_items');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async exportToCSV(): Promise<string> {
    const allItems = await this.getAllItems();
    
    const headers = ['id', 'company', 'category', 'title', 'url', 'scrapedAt', 'ai_analysis', 'sentiment_score', 'key_topics', 'competitive_insights', 'risk_factors'];
    const csvContent = [
      headers.join(','),
      ...allItems.map(item => [
        item.id,
        `"${item.company}"`,
        `"${item.category}"`,
        `"${item.title || ''}"`,
        `"${item.url || ''}"`,
        item.scrapedAt,
        `"${item.ai_analysis || ''}"`,
        item.sentiment_score || '',
        `"${(item.key_topics || []).join('; ')}"`,
        `"${item.competitive_insights || ''}"`,
        `"${(item.risk_factors || []).join('; ')}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
}

export const databaseService = new DatabaseService(); 