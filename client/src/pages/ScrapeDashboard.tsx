import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import React, { useMemo, useState, useEffect } from 'react';
import { APIService } from '@/utils/APIService';
import { ScrapedItem, useScrapeStore } from '@/state/ScrapeStore';
import { SEO } from '@/components/SEO';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, AreaChart, Area } from 'recharts';
import Papa from 'papaparse';
import mammoth from 'mammoth';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Activity, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Users, Building2, Target, Plus, Trash2, Server, Wifi, WifiOff, Globe, FileText, Rss, MessageCircle, Settings, Play, Filter, Brain, Zap, Lightbulb, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { databaseService, DatabaseItem } from '@/utils/DatabaseService';
import { aiService, AIAnalysisResult } from '@/utils/AIService';

const genId = () => Math.random().toString(36).slice(2);

// Enhanced preset competitor groupings
const PRESET_GROUPINGS = {
  'tech-saas': {
    name: 'Tech SaaS',
    companies: ['Salesforce', 'HubSpot', 'Slack', 'Notion', 'Figma', 'Airtable'],
    categories: ['marketing', 'docs', 'rss', 'social'],
    defaultUrls: {
      'Salesforce': {
        marketing: 'https://salesforce.com',
        docs: 'https://docs.salesforce.com',
        rss: 'https://salesforce.com/blog/feed',
        social: 'https://twitter.com/salesforce'
      },
      'HubSpot': {
        marketing: 'https://hubspot.com',
        docs: 'https://developers.hubspot.com',
        rss: 'https://blog.hubspot.com/feed',
        social: 'https://twitter.com/HubSpot'
      },
      'Slack': {
        marketing: 'https://slack.com',
        docs: 'https://api.slack.com/docs',
        rss: 'https://slack.com/blog/feed',
        social: 'https://twitter.com/SlackHQ'
      }
    }
  },
  'fintech': {
    name: 'Fintech',
    companies: ['Stripe', 'Plaid', 'Coinbase', 'Robinhood', 'Chime', 'Affirm'],
    categories: ['marketing', 'docs', 'rss', 'social'],
    defaultUrls: {
      'Stripe': {
        marketing: 'https://stripe.com',
        docs: 'https://stripe.com/docs',
        rss: 'https://stripe.com/blog/feed',
        social: 'https://twitter.com/stripe'
      },
      'Plaid': {
        marketing: 'https://plaid.com',
        docs: 'https://plaid.com/docs',
        rss: 'https://plaid.com/blog/feed',
        social: 'https://twitter.com/Plaid'
      },
      'Coinbase': {
        marketing: 'https://coinbase.com',
        docs: 'https://docs.cloud.coinbase.com',
        rss: 'https://blog.coinbase.com/feed',
        social: 'https://twitter.com/coinbase'
      }
    }
  },
  'ecommerce': {
    name: 'E-commerce',
    companies: ['Shopify', 'Amazon', 'Etsy', 'WooCommerce', 'BigCommerce', 'Magento'],
    categories: ['marketing', 'docs', 'rss', 'social'],
    defaultUrls: {
      'Shopify': {
        marketing: 'https://shopify.com',
        docs: 'https://shopify.dev',
        rss: 'https://shopify.com/blog/feed',
        social: 'https://twitter.com/Shopify'
      },
      'Amazon': {
        marketing: 'https://amazon.com',
        docs: 'https://developer.amazon.com',
        rss: 'https://amazon.com/blog/feed',
        social: 'https://twitter.com/amazon'
      },
      'Etsy': {
        marketing: 'https://etsy.com',
        docs: 'https://developer.etsy.com',
        rss: 'https://etsy.com/blog/feed',
        social: 'https://twitter.com/Etsy'
      }
    }
  },
  'ai-ml': {
    name: 'AI/ML',
    companies: ['OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI', 'Meta AI', 'NVIDIA'],
    categories: ['marketing', 'docs', 'rss', 'social'],
    defaultUrls: {
      'OpenAI': {
        marketing: 'https://openai.com',
        docs: 'https://platform.openai.com/docs',
        rss: 'https://openai.com/blog/feed',
        social: 'https://twitter.com/OpenAI'
      },
      'Anthropic': {
        marketing: 'https://anthropic.com',
        docs: 'https://docs.anthropic.com',
        rss: 'https://anthropic.com/blog/feed',
        social: 'https://twitter.com/AnthropicAI'
      },
      'Google AI': {
        marketing: 'https://ai.google',
        docs: 'https://ai.google.dev',
        rss: 'https://ai.google/blog/feed',
        social: 'https://twitter.com/GoogleAI'
      }
    }
  }
};

interface CompetitorGroup {
  id: string;
  name: string;
  companies: string[];
  categories: string[];
  urls: Record<string, Record<string, string>>;
}

interface ScrapingTarget {
  company: string;
  category: string;
  url: string;
  enabled: boolean;
}

export default function ScrapeDashboard() {
  const { toast } = useToast();
  const { state, addItems, clear } = useScrapeStore();
  const items = state.items;

  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(25);
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Scraping configuration
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customCompanies, setCustomCompanies] = useState<string[]>(['']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['marketing', 'docs']);
  const [companyUrls, setCompanyUrls] = useState<Record<string, Record<string, string>>>({});
  
  // UI state
  const [activeTab, setActiveTab] = useState('scraping');
  const [selectedChart, setSelectedChart] = useState('overview');
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    category: '',
    dateRange: 'all'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // AI Analysis state
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [analysisTone, setAnalysisTone] = useState<'neutral' | 'confident' | 'skeptical' | 'enthusiastic'>('neutral');
  const [focusAreas, setFocusAreas] = useState('positioning, differentiation, pricing, risks, opportunities');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<Map<string, AIAnalysisResult>>(new Map());
  const [competitiveSummary, setCompetitiveSummary] = useState<string>('');

  // Database state
  const [dbItems, setDbItems] = useState<DatabaseItem[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);

  // Enhanced analytics using database data
  const metrics = useMemo(() => {
    if (!dbStats) return {
      byCat: [],
      byCompany: [],
      trendData: [],
      contentQuality: {
        totalWords: 0,
        totalCharacters: 0,
        richContent: 0,
        hasLinks: 0,
        hasImages: 0,
        hasCode: 0,
        structuredContent: 0,
        averageWordsPerItem: 0,
        averageCharsPerItem: 0
      },
      totalItems: 0,
      uniqueCompanies: 0
    };

    const byCat: Record<string, number> = {};
    const byCompany: Record<string, number> = {};
    const timeData: Record<string, number> = {};
    
    dbItems.forEach(item => {
      byCat[item.category] = (byCat[item.category] || 0) + 1;
      byCompany[item.company] = (byCompany[item.company] || 0) + 1;
      
      const date = new Date(item.scrapedAt).toLocaleDateString();
      timeData[date] = (timeData[date] || 0) + 1;
    });
    
    const trendData = Object.entries(timeData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));
    
    return {
      byCat: Object.entries(byCat).map(([name, value]) => ({ name, value })),
      byCompany: Object.entries(byCompany).map(([name, value]) => ({ name, value })),
      trendData,
      contentQuality: dbStats.contentQuality,
      totalItems: dbStats.totalItems,
      uniqueCompanies: dbStats.companies.length
    };
  }, [dbItems, dbStats]);

  const filteredItems = useMemo(() => {
    return dbItems.filter(item => {
      const matchesSearch = !filters.search || 
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.markdown?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.company?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.ai_analysis?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCompany = !filters.company || item.company === filters.company;
      const matchesCategory = !filters.category || item.category === filters.category;
      
      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const itemDate = new Date(item.scrapedAt);
        const now = new Date();
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (filters.dateRange) {
          case 'today': matchesDate = diffDays <= 1; break;
          case 'week': matchesDate = diffDays <= 7; break;
          case 'month': matchesDate = diffDays <= 30; break;
        }
      }
      
      return matchesSearch && matchesCompany && matchesCategory && matchesDate;
    });
  }, [dbItems, filters]);

  useEffect(() => {
    checkBackendConnection();
    initializeDatabase();
    loadStoredApiKey();
  }, []);

  const initializeDatabase = async () => {
    try {
      await databaseService.init();
      await loadDatabaseItems();
      await loadDatabaseStats();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const loadStoredApiKey = () => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      setOpenaiKey(stored);
      aiService.setApiKey(stored);
    }
  };

  const loadDatabaseItems = async () => {
    try {
      const items = await databaseService.getAllItems();
      setDbItems(items);
    } catch (error) {
      console.error('Failed to load database items:', error);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const stats = await databaseService.getStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  const checkBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const health = await APIService.healthCheck();
      if (health.status === 'healthy') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const onSaveKey = () => {
    if (!openaiKey) return;
    aiService.setApiKey(openaiKey);
    toast({ title: 'OpenAI API key saved' });
  };

  const analyzeScrapedContent = async (items: ScrapedItem[]) => {
    if (!openaiKey) {
      toast({ title: 'OpenAI API key required', description: 'Please set your OpenAI API key to enable AI analysis', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = focusAreas.split(',').map(area => area.trim());
      const analysisResults = await aiService.analyzeBatch(items, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems(); // Refresh data
      await loadDatabaseStats();
      
      toast({ title: 'AI analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({ title: 'AI analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCompetitiveSummary = async () => {
    if (!openaiKey) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    try {
      const companies = Array.from(new Set(dbItems.map(item => item.company)));
      const focusAreasArray = focusAreas.split(',').map(area => area.trim());
      
      const summary = await aiService.generateCompetitiveSummary(companies, focusAreasArray);
      setCompetitiveSummary(summary);
      
      toast({ title: 'Competitive summary generated' });
    } catch (error) {
      console.error('Failed to generate competitive summary:', error);
      toast({ title: 'Summary generation failed', variant: 'destructive' });
    }
  };

  const loadPresetGroup = (presetKey: string) => {
    const preset = PRESET_GROUPINGS[presetKey as keyof typeof PRESET_GROUPINGS];
    if (!preset) return;
    
    setCustomCompanies(preset.companies);
    setSelectedCategories(preset.categories);
    setCompanyUrls(preset.defaultUrls);
    setSelectedPreset(presetKey);
    
    toast({ title: `Loaded ${preset.name} preset` });
  };

  const addCustomCompany = () => {
    setCustomCompanies(prev => [...prev, '']);
  };

  const removeCustomCompany = (index: number) => {
    setCustomCompanies(prev => prev.filter((_, i) => i !== index));
  };

  const updateCompanyName = (index: number, name: string) => {
    const updated = [...customCompanies];
    updated[index] = name;
    setCustomCompanies(updated);
  };

  const updateCompanyUrl = (company: string, category: string, url: string) => {
    setCompanyUrls(prev => ({
      ...prev,
      [company]: {
        ...prev[company],
        [category]: url
      }
    }));
  };

  const getScrapingTargets = (): ScrapingTarget[] => {
    const targets: ScrapingTarget[] = [];
    
    customCompanies.forEach(company => {
      if (!company.trim()) return;
      
      selectedCategories.forEach(category => {
        const url = companyUrls[company]?.[category] || '';
        if (url.trim()) {
          targets.push({
            company: company.trim(),
            category,
            url: url.trim(),
            enabled: true
          });
        }
      });
    });
    
    return targets;
  };

  const runScraping = async (targets: ScrapingTarget[]) => {
    if (targets.length === 0) {
      toast({ title: 'No valid scraping targets', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    let totalScraped = 0;
    const scrapedItems: ScrapedItem[] = [];
    
    try {
      for (const target of targets) {
        if (!target.enabled) continue;
        
        try {
          const response = await APIService.scrapeCompany({
            company: target.company,
            urls: { [target.category]: target.url },
            categories: [target.category],
            page_limit: limit
          });
          
          if (response.error) {
            console.warn(`Failed to scrape ${target.category} for ${target.company}:`, response.error);
            continue;
          }
          
          if (response.categories && response.categories[target.category]) {
            const categoryData = response.categories[target.category];
            if (categoryData.items) {
              const newItems: ScrapedItem[] = categoryData.items.map((item: any) => ({
                id: item.id || genId(),
                company: target.company,
                category: target.category as any,
                url: item.url || target.url,
                title: item.title || `Scraped ${target.category} content`,
                markdown: item.content || item.markdown || '',
                html: item.content_html || '',
                scrapedAt: item.scraped_at || new Date().toISOString(),
                source: new URL(target.url).host
              }));
              
              scrapedItems.push(...newItems);
              totalScraped += newItems.length;
            }
          }
        } catch (error) {
          console.error(`Failed to scrape ${target.category} for ${target.company}:`, error);
        }
      }
      
      // Store in database
      if (scrapedItems.length > 0) {
        await databaseService.addItems(scrapedItems);
        await loadDatabaseItems();
        await loadDatabaseStats();
        
        // Add to store for immediate display
        addItems(scrapedItems);
        
        // Run AI analysis if enabled
        if (autoAnalysis && openaiKey) {
          toast({ title: 'Starting AI analysis...', description: 'Analyzing scraped content for insights' });
          setTimeout(() => analyzeScrapedContent(scrapedItems), 1000);
        }
      }
      
      toast({ title: `Scraping complete: ${totalScraped} items from ${targets.length} targets` });
    } catch (error) {
      toast({ title: 'Scraping failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const csv = await databaseService.exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'competitive_intelligence_data.csv';
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ title: 'Data exported successfully' });
    } catch (error) {
      console.error('Export failed:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const onUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) return;
    
    try {
      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (r) => {
            const mapped: ScrapedItem[] = r.data.filter(Boolean).map((row: any) => ({
              id: genId(), 
              company: row.company || 'upload', 
              category: row.category || 'upload', 
              url: row.url, 
              title: row.title, 
              markdown: row.markdown || JSON.stringify(row, null, 2), 
              scrapedAt: new Date().toISOString(), 
              source: (() => { try { return new URL(row.url).host; } catch { return undefined; } })()
            }));
            addItems(mapped);
            toast({ title: `Imported ${mapped.length} rows from CSV` });
          },
        });
      } else if (ext === 'md' || ext === 'markdown') {
        const text = await file.text();
        addItems([{ 
          id: genId(), 
          company: 'upload', 
          category: 'upload', 
          title: file.name, 
          markdown: text, 
          scrapedAt: new Date().toISOString() 
        }]);
        toast({ title: 'Markdown imported' });
      } else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await (mammoth as any).extractRawText({ arrayBuffer });
        addItems([{ 
          id: genId(), 
          company: 'upload', 
          category: 'upload', 
          title: file.name, 
          markdown: result.value, 
          scrapedAt: new Date().toISOString() 
        }]);
        toast({ title: 'DOCX imported' });
      } else {
        toast({ title: 'Unsupported file type', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'File import failed', variant: 'destructive' });
    }
  };

  const clearAllData = async () => {
    try {
      await databaseService.clearAll();
      clear();
      setDbItems([]);
      setDbStats(null);
      setAiInsights(new Map());
      setCompetitiveSummary('');
      toast({ title: 'All data cleared' });
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast({ title: 'Failed to clear data', variant: 'destructive' });
    }
  };

  return (
    <main className="container mx-auto py-6 px-4">
      <SEO title="Scrape Intelligence | InsightForge" description="Targeted and aggregate web scraping across marketing, docs, RSS and social sources." canonical={window.location.href} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scrape Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Monitor competitors and gather market intelligence through targeted web scraping</p>
      </div>

      {/* Backend Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {backendStatus === 'connected' && <Wifi className="h-5 w-5 text-green-500" />}
              {backendStatus === 'disconnected' && <WifiOff className="h-5 w-5 text-red-500" />}
              {backendStatus === 'checking' && <Wifi className="h-5 w-5 text-yellow-500 animate-spin" />}
              <span className="font-medium">
                {backendStatus === 'connected' ? 'Backend Connected' : 
                 backendStatus === 'disconnected' ? 'Backend Disconnected' : 'Checking Backend...'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkBackendConnection}
              disabled={backendStatus === 'checking'}
            >
              <Server className="h-4 w-4 mr-2" />
              {backendStatus === 'checking' ? 'Checking...' : 'Test Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scraping">Scraping Setup</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="data">Data View</TabsTrigger>
        </TabsList>

        {/* Scraping Setup Tab */}
        <TabsContent value="scraping" className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      value={openaiKey} 
                      onChange={e => setOpenaiKey(e.target.value)} 
                      placeholder="sk-..." 
                    />
                    <Button onClick={onSaveKey} variant="secondary">Save</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Page Limit</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={250} 
                    value={limit} 
                    onChange={e => setLimit(parseInt(e.target.value || '25'))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <Select 
                    value={selectedCategories.join(',')} 
                    onValueChange={(value) => setSelectedCategories(value.split(','))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing,docs,rss,social">All Categories</SelectItem>
                      <SelectItem value="marketing,docs">Marketing & Docs</SelectItem>
                      <SelectItem value="marketing">Marketing Only</SelectItem>
                      <SelectItem value="docs">Documentation Only</SelectItem>
                      <SelectItem value="rss">RSS Feeds</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Analysis Configuration */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">AI Analysis Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Analysis Tone</Label>
                    <Select value={analysisTone} onValueChange={(value: any) => setAnalysisTone(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                        <SelectItem value="skeptical">Skeptical</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Focus Areas</Label>
                    <Input 
                      value={focusAreas}
                      onChange={(e) => setFocusAreas(e.target.value)}
                      placeholder="positioning, differentiation, pricing, risks"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Auto Analysis</Label>
                      <Switch checked={autoAnalysis} onCheckedChange={setAutoAnalysis} />
                    </div>
                    <p className="text-xs text-muted-foreground">Automatically analyze scraped content</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preset Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Industry Preset Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(PRESET_GROUPINGS).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant={selectedPreset === key ? 'default' : 'outline'}
                    className="h-auto p-3 flex-col"
                    onClick={() => loadPresetGroup(key)}
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">{preset.companies.length} companies</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Custom Companies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customCompanies.map((company, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Company name"
                      value={company}
                      onChange={(e) => updateCompanyName(index, e.target.value)}
                    />
                  </div>
                  {customCompanies.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeCustomCompany(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addCustomCompany}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </CardContent>
          </Card>

          {/* URL Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                URL Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customCompanies.filter(c => c.trim()).map((company) => (
                  <div key={company} className="space-y-3">
                    <h4 className="font-medium text-sm">{company}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCategories.map((category) => (
                        <div key={category} className="space-y-2">
                          <Label className="text-xs capitalize">{category}</Label>
                          <Input
                            placeholder={`https://${company.toLowerCase()}.com/${category}`}
                            value={companyUrls[company]?.[category] || ''}
                            onChange={(e) => updateCompanyUrl(company, category, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scraping Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Start Scraping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Scraping Targets</h4>
                <div className="space-y-2">
                  {getScrapingTargets().map((target, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <Badge variant="outline">{target.company}</Badge>
                      <Badge variant="secondary">{target.category}</Badge>
                      <span className="text-muted-foreground truncate">{target.url}</span>
                    </div>
                  ))}
                </div>
                {getScrapingTargets().length === 0 && (
                  <p className="text-muted-foreground text-sm">No valid scraping targets configured</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => runScraping(getScrapingTargets())}
                  disabled={isLoading || getScrapingTargets().length === 0 || backendStatus !== 'connected'}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isLoading ? 'Scraping...' : 'Start Scraping'}
                </Button>
                <Button variant="outline" onClick={exportCSV} disabled={items.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Import Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input 
                type="file" 
                accept=".csv,.md,.markdown,.docx" 
                onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} 
              />
              <p className="text-xs text-muted-foreground mt-2">
                Upload CSV, DOCX, or Markdown files to include proprietary documents
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary">{metrics.totalItems}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary">{metrics.uniqueCompanies}</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-lg font-bold text-primary">{metrics.contentQuality.averageWordsPerItem}</div>
                <div className="text-sm text-muted-foreground">Avg Words/Item</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-lg font-bold text-primary">{metrics.contentQuality.richContent}</div>
                <div className="text-sm text-muted-foreground">Rich Content</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Data Visualizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {['overview', 'trends', 'categories', 'companies'].map(chart => (
                  <Button
                    key={chart}
                    variant={selectedChart === chart ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedChart(chart)}
                  >
                    {chart === 'overview' && <BarChart3 className="h-4 w-4 mr-2" />}
                    {chart === 'trends' && <LineChartIcon className="h-4 w-4 mr-2" />}
                    {chart === 'categories' && <PieChartIcon className="h-4 w-4 mr-2" />}
                    {chart === 'companies' && <Users className="h-4 w-4 mr-2" />}
                    {chart.charAt(0).toUpperCase() + chart.slice(1)}
                  </Button>
                ))}
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <div>
                    {selectedChart === 'overview' && (
                      <BarChart data={metrics.byCat}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Pages" fill="hsl(var(--primary))" />
                      </BarChart>
                    )}
                    
                    {selectedChart === 'trends' && (
                      <AreaChart data={metrics.trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      </AreaChart>
                    )}
                    
                    {selectedChart === 'categories' && (
                      <PieChart>
                        <Pie
                          data={metrics.byCat}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        />
                        <Tooltip />
                      </PieChart>
                    )}
                    
                    {selectedChart === 'companies' && (
                      <BarChart data={metrics.byCompany}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Items" fill="#82ca9d" />
                      </BarChart>
                    )}
                  </div>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          {/* AI Analysis Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{aiInsights.size}</div>
                  <div className="text-sm text-muted-foreground">Items Analyzed</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {dbItems.filter(item => item.sentiment_score !== undefined).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Sentiment Scores</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {dbItems.filter(item => item.key_topics && item.key_topics.length > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Topic Analysis</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {dbItems.filter(item => item.risk_factors && item.risk_factors.length > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Risk Assessments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Analysis Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => analyzeScrapedContent(dbItems)}
                  disabled={isAnalyzing || !openaiKey || dbItems.length === 0}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze All Content
                    </>
                  )}
                </Button>
                <Button
                  onClick={generateCompetitiveSummary}
                  disabled={!openaiKey || dbItems.length === 0}
                  variant="outline"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Summary
                </Button>
              </div>
              
              {!openaiKey && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>OpenAI API key required for AI analysis</p>
                  <p className="text-sm">Set your API key in the Scraping Setup tab</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitive Summary */}
          {competitiveSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Competitive Intelligence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{competitiveSummary}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Results */}
          {aiInsights.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(aiInsights.entries()).slice(0, 5).map(([itemId, analysis]) => {
                    const item = dbItems.find(i => i.id === itemId);
                    if (!item) return null;
                    
                    return (
                      <div key={itemId} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-medium">{item.title || 'Untitled'}</h4>
                          <Badge variant="outline">{item.company}</Badge>
                          <Badge variant="secondary">{item.category}</Badge>
                          <Badge variant={analysis.sentiment_score > 0 ? 'default' : analysis.sentiment_score < 0 ? 'destructive' : 'outline'}>
                            {analysis.sentiment_score > 0 ? 'Positive' : analysis.sentiment_score < 0 ? 'Negative' : 'Neutral'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {analysis.ai_analysis && (
                            <div>
                              <h5 className="font-medium text-sm mb-1">Analysis</h5>
                              <p className="text-sm text-muted-foreground">{analysis.ai_analysis}</p>
                            </div>
                          )}
                          
                          {analysis.key_topics && analysis.key_topics.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-1">Key Topics</h5>
                              <div className="flex flex-wrap gap-1">
                                {analysis.key_topics.map((topic, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {analysis.competitive_insights && (
                            <div>
                              <h5 className="font-medium text-sm mb-1">Competitive Insights</h5>
                              <p className="text-sm text-muted-foreground">{analysis.competitive_insights}</p>
                            </div>
                          )}
                          
                          {analysis.risk_factors && analysis.risk_factors.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-1">Risk Factors</h5>
                              <div className="flex flex-wrap gap-1">
                                {analysis.risk_factors.map((risk, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {risk}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {aiInsights.size > 5 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Showing first 5 of {aiInsights.size} analyzed items</p>
                      <p className="text-sm">Use the Data View tab to see all analyzed content</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data View Tab */}
        <TabsContent value="data" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Input
                  placeholder="Search content, titles, companies..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
                <Select 
                  value={filters.company} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, company: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Companies</SelectItem>
                    {Array.from(new Set(items.map(i => i.company))).map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {Array.from(new Set(items.map(i => i.category))).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{filteredItems.length} items</Badge>
                  <Badge variant="outline">{metrics.uniqueCompanies} companies</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="ghost" onClick={clearAllData}>Clear All</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Scraped Data ({items.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    {backendStatus === 'connected' ? (
                      <div className="text-muted-foreground">
                        <p className="mb-2">No scraped data yet. Configure companies and URLs in the Scraping Setup tab.</p>
                        <p className="text-sm">The backend Python scraper will collect real content from the specified websites.</p>
                      </div>
                    ) : (
                      <div className="text-red-600">
                        <p className="mb-2 font-medium">Backend not connected</p>
                        <p className="text-sm">Real scraping requires a connected backend. Please ensure your InsightForge backend is running.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.slice(0, 10).map(item => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{item.title || 'Untitled'}</h3>
                        <Badge variant="outline">{item.company}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                        {item.sentiment_score !== undefined && (
                          <Badge variant={item.sentiment_score > 0 ? 'default' : item.sentiment_score < 0 ? 'destructive' : 'outline'}>
                            {item.sentiment_score > 0 ? '😊' : item.sentiment_score < 0 ? '😟' : '😐'}
                          </Badge>
                        )}
                      </div>
                      
                      {item.markdown && (
                        <div className="prose prose-sm max-h-32 overflow-auto mb-3">
                          <div className="whitespace-pre-wrap">
                            {item.markdown.slice(0, 300)}...
                          </div>
                        </div>
                      )}
                      
                      {/* AI Analysis Results */}
                      {item.ai_analysis && (
                        <div className="border-t pt-3 space-y-2">
                          <h4 className="font-medium text-sm">AI Analysis</h4>
                          <p className="text-sm text-muted-foreground">{item.ai_analysis}</p>
                          
                          {item.key_topics && item.key_topics.length > 0 && (
                            <div>
                              <span className="text-xs font-medium">Topics: </span>
                              <div className="inline-flex flex-wrap gap-1">
                                {item.key_topics.map((topic, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {item.risk_factors && item.risk_factors.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-red-600">Risks: </span>
                              <div className="inline-flex flex-wrap gap-1">
                                {item.risk_factors.map((risk, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {risk}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        Scraped: {new Date(item.scrapedAt).toLocaleDateString()}
                        {item.updated_at && item.updated_at !== item.scrapedAt && (
                          <span> • Analyzed: {new Date(item.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredItems.length > 10 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Showing first 10 of {filteredItems.length} items</p>
                      <p className="text-sm">Use the search and filter options above to find specific content</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
