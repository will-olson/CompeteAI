import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { linkTargetingService, LinkTarget } from '@/utils/LinkTargetingService';

const genId = () => Math.random().toString(36).slice(2);

// Dynamic industry groupings using LinkTargetingService
const getIndustryGroupings = () => {
  const profiles = linkTargetingService.getAllCompanyProfiles();
  const groupings: Record<string, { name: string; companies: string[]; categories: string[]; description: string; linkPatterns: Record<string, string[]> }> = {};
  
  // Enhanced preset groups with common link patterns
  const enhancedGroupings = {
    'tech-saas': {
      name: 'Tech SaaS Companies',
      companies: ['OpenAI', 'Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'Supabase', 'PlanetScale'],
      categories: ['marketing', 'docs', 'api', 'blog', 'community'],
      description: 'Software-as-a-Service companies with developer-focused content',
      linkPatterns: {
        marketing: ['', '/features', '/pricing', '/about', '/customers', '/security'],
        docs: ['/docs', '/help', '/guides', '/tutorials', '/api', '/reference'],
        api: ['/api', '/docs/api', '/developers', '/integrations', '/sdk'],
        blog: ['/blog', '/news', '/updates', '/changelog', '/insights'],
        community: ['/community', '/forum', '/discord', '/slack', '/github']
      }
    },
    'fintech': {
      name: 'Fintech & Payments',
      companies: ['Stripe', 'Plaid', 'Square', 'Coinbase', 'Robinhood', 'Chime', 'Affirm', 'Klarna'],
      categories: ['marketing', 'docs', 'api', 'compliance', 'security'],
      description: 'Financial technology and payment processing companies',
      linkPatterns: {
        marketing: ['', '/solutions', '/pricing', '/enterprise', '/partners'],
        docs: ['/docs', '/guides', '/api', '/support', '/knowledge-base'],
        api: ['/api', '/docs/api', '/developers', '/integrations', '/webhooks'],
        compliance: ['/compliance', '/security', '/privacy', '/regulatory', '/audit'],
        security: ['/security', '/trust', '/compliance', '/certifications']
      }
    },
    'ai-ml': {
      name: 'AI & Machine Learning',
      companies: ['OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI', 'Hugging Face', 'Stability AI', 'Cohere', 'Scale AI'],
      categories: ['marketing', 'docs', 'api', 'research', 'models'],
      description: 'Artificial intelligence and machine learning companies',
      linkPatterns: {
        marketing: ['', '/products', '/solutions', '/enterprise', '/research'],
        docs: ['/docs', '/guides', '/tutorials', '/examples', '/best-practices'],
        api: ['/api', '/docs/api', '/playground', '/models', '/endpoints'],
        research: ['/research', '/papers', '/blog', '/publications', '/insights'],
        models: ['/models', '/gallery', '/showcase', '/examples', '/benchmarks']
      }
    },
    'ecommerce': {
      name: 'E-commerce & Retail',
      companies: ['Shopify', 'WooCommerce', 'BigCommerce', 'Magento', 'Salesforce Commerce', 'Adobe Commerce'],
      categories: ['marketing', 'docs', 'api', 'templates', 'apps'],
      description: 'E-commerce platforms and retail technology',
      linkPatterns: {
        marketing: ['', '/features', '/pricing', '/templates', '/showcase'],
        docs: ['/docs', '/guides', '/tutorials', '/api', '/reference'],
        api: ['/api', '/docs/api', '/webhooks', '/integrations', '/apps'],
        templates: ['/templates', '/themes', '/designs', '/showcase', '/examples'],
        apps: ['/apps', '/extensions', '/plugins', '/integrations', '/marketplace']
      }
    },
    'developer-tools': {
      name: 'Developer Tools',
      companies: ['GitHub', 'GitLab', 'Bitbucket', 'JetBrains', 'VS Code', 'Postman', 'Docker', 'Kubernetes'],
      categories: ['marketing', 'docs', 'api', 'downloads', 'community'],
      description: 'Tools and platforms for software developers',
      linkPatterns: {
        marketing: ['', '/features', '/pricing', '/enterprise', '/teams'],
        docs: ['/docs', '/guides', '/tutorials', '/api', '/reference'],
        api: ['/api', '/docs/api', '/webhooks', '/integrations', '/sdk'],
        downloads: ['/download', '/releases', '/versions', '/changelog', '/updates'],
        community: ['/community', '/forum', '/discussions', '/support', '/help']
      }
    },
    'data-analytics': {
      name: 'Data & Analytics',
      companies: ['Tableau', 'Power BI', 'Looker', 'Mode', 'Amplitude', 'Mixpanel', 'Segment', 'Snowflake'],
      categories: ['marketing', 'docs', 'api', 'templates', 'resources'],
      description: 'Data visualization and analytics platforms',
      linkPatterns: {
        marketing: ['', '/solutions', '/pricing', '/enterprise', '/industries'],
        docs: ['/docs', '/guides', '/tutorials', '/api', '/reference'],
        api: ['/api', '/docs/api', '/integrations', '/webhooks', '/sdk'],
        templates: ['/templates', '/dashboards', '/examples', '/gallery', '/showcase'],
        resources: ['/resources', '/blog', '/webinars', '/events', '/training']
      }
    }
  };
  
  return enhancedGroupings;
};

const INDUSTRY_GROUPINGS = getIndustryGroupings();

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
  const [dbStats, setDbStats] = useState<{
    totalItems?: number;
    companies?: string[];
    contentQuality?: {
      totalWords: number;
      totalCharacters: number;
      richContent: number;
      hasLinks: number;
      hasImages: number;
      hasCode: number;
      structuredContent: number;
      averageWordsPerItem: number;
      averageCharsPerItem: number;
    };
  } | null>(null);

  // Enhanced scraping setup state
  const [selectedTargets, setSelectedTargets] = useState<Map<string, Set<string>>>(new Map());
  const [useBackendKey, setUseBackendKey] = useState(true);
  const [frontendOpenAIKey, setFrontendOpenAIKey] = useState<string>('');
  const [showTargetSelection, setShowTargetSelection] = useState(false);

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
    
    // Calculate content quality metrics
    const totalWords = dbItems.reduce((acc, item) => acc + (item.markdown?.split(/\s+/).length || 0), 0);
    const totalCharacters = dbItems.reduce((acc, item) => acc + (item.markdown?.length || 0), 0);
    
    return {
      byCat: Object.entries(byCat).map(([name, value]) => ({ name, value })),
      byCompany: Object.entries(byCompany).map(([name, value]) => ({ name, value })),
      trendData,
      contentQuality: {
        totalWords: dbStats.contentQuality?.totalWords || 0,
        totalCharacters: dbStats.contentQuality?.totalCharacters || 0,
        richContent: dbStats.contentQuality?.richContent || 0,
        hasLinks: dbStats.contentQuality?.hasLinks || 0,
        hasImages: dbStats.contentQuality?.hasImages || 0,
        hasCode: dbStats.contentQuality?.hasCode || 0,
        structuredContent: dbStats.contentQuality?.structuredContent || 0,
        averageWordsPerItem: dbStats.contentQuality?.averageWordsPerItem || 0,
        averageCharsPerItem: dbStats.contentQuality?.averageCharsPerItem || 0
      },
      totalItems: dbStats.totalItems || dbItems.length,
      uniqueCompanies: dbStats.companies?.length || Object.keys(byCompany).length
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

  const initializeDatabase = useCallback(async () => {
    try {
      await databaseService.init();
      await loadDatabaseItems();
      await loadDatabaseStats();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }, []);

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

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
      // Calculate additional content quality metrics
      const allItems = await databaseService.getAllItems();
      const contentQuality = {
        totalWords: allItems.reduce((acc, item) => acc + (item.markdown?.split(/\s+/).length || 0), 0),
        totalCharacters: allItems.reduce((acc, item) => acc + (item.markdown?.length || 0), 0),
        richContent: stats.contentQuality?.richContent || 0,
        hasLinks: stats.contentQuality?.hasLinks || 0,
        hasImages: stats.contentQuality?.hasImages || 0,
        hasCode: stats.contentQuality?.hasCode || 0,
        structuredContent: stats.contentQuality?.structuredContent || 0,
        averageWordsPerItem: allItems.length > 0 ? Math.round(allItems.reduce((acc, item) => acc + (item.markdown?.split(/\s+/).length || 0), 0) / allItems.length) : 0,
        averageCharsPerItem: allItems.length > 0 ? Math.round(allItems.reduce((acc, item) => acc + (item.markdown?.length || 0), 0) / allItems.length) : 0
      };
      
      setDbStats({
        ...stats,
        contentQuality
      });
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
    const preset = INDUSTRY_GROUPINGS[presetKey as keyof typeof INDUSTRY_GROUPINGS];
    if (!preset) return;
    
    setCustomCompanies(preset.companies);
    setSelectedCategories(preset.categories);
    
    // Generate URLs using enhanced patterns
    const newCompanyUrls: Record<string, Record<string, string>> = {};
    preset.companies.forEach(company => {
      const baseDomain = `${company.toLowerCase().replace(/\s+/g, '')}.com`;
      newCompanyUrls[company] = {};
      
      preset.categories.forEach(category => {
        if (preset.linkPatterns[category]) {
          const patterns = preset.linkPatterns[category];
          // Generate multiple URLs for each category using different patterns
          newCompanyUrls[company][category] = `https://www.${baseDomain}${patterns[0]}`;
        } else {
          newCompanyUrls[company][category] = `https://www.${baseDomain}/${category}`;
        }
      });
    });
    
    setCompanyUrls(newCompanyUrls);
    setSelectedPreset(presetKey);

    // Automatically select all targets for all companies
    setTimeout(() => {
      const newMap = new Map();
      preset.companies.forEach(company => {
        newMap.set(company, new Set(preset.categories));
      });
      setSelectedTargets(newMap);
      setShowTargetSelection(true);
    }, 100);
    
    toast({ 
      title: `Loaded ${preset.name} preset`, 
      description: `Configured ${preset.companies.length} companies with ${preset.categories.length} categories. All targets selected automatically.` 
    });
  };

  const addCustomCompany = () => {
    setCustomCompanies(prev => [...prev, '']);
  };

  const addCompanyWithUrls = (companyName: string) => {
    if (!companyName.trim()) return;
    
    // Add company to list
    setCustomCompanies(prev => [...prev, companyName.trim()]);
    
    // Generate URLs using enhanced patterns
    const newUrls: Record<string, string> = {};
    const baseDomain = `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    
    // Generate URLs for each selected category with common patterns
    selectedCategories.forEach(category => {
      let url = '';
      
      // Try to find a matching preset pattern
      const preset = Object.values(INDUSTRY_GROUPINGS).find(p => 
        p.companies.some(c => c.toLowerCase() === companyName.toLowerCase())
      );
      
      if (preset && preset.linkPatterns[category]) {
        // Use preset patterns
        const patterns = preset.linkPatterns[category];
        url = `https://www.${baseDomain}${patterns[0]}`; // Use first pattern as default
      } else {
        // Fallback to common patterns
        const commonPatterns: Record<string, string[]> = {
          marketing: ['', '/features', '/pricing', '/about', '/solutions'],
          docs: ['/docs', '/help', '/guides', '/tutorials', '/support'],
          api: ['/api', '/docs/api', '/developers', '/integrations'],
          blog: ['/blog', '/news', '/updates', '/insights', '/articles'],
          community: ['/community', '/forum', '/discussions', '/support'],
          news: ['/news', '/blog', '/press', '/updates', '/announcements'],
          social: ['/twitter', '/linkedin', '/facebook', '/youtube'],
          rss: ['/feed', '/rss', '/blog/feed', '/news/feed']
        };
        
        if (commonPatterns[category]) {
          url = `https://www.${baseDomain}${commonPatterns[category][0]}`;
        } else {
          url = `https://www.${baseDomain}/${category}`;
        }
      }
      
      newUrls[category] = url;
    });
    
    setCompanyUrls(prev => ({
      ...prev,
      [companyName.trim()]: newUrls
    }));

    // Automatically select all targets for the new company
    setTimeout(() => {
      const allCategories = new Set(selectedCategories);
      setSelectedTargets(prev => {
        const newMap = new Map(prev);
        newMap.set(companyName.trim(), allCategories);
        return newMap;
      });
      setShowTargetSelection(true);
    }, 100);
    
    toast({ 
      title: `Added ${companyName}`, 
      description: `Generated ${Object.keys(newUrls).length} URLs and selected all targets automatically` 
    });
  };

  // Enhanced helper functions for improved scraping setup
  const toggleTargetSelection = (company: string, category: string) => {
    setSelectedTargets(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(company)) {
        newMap.set(company, new Set());
      }
      const companyTargets = new Set(newMap.get(company)!);
      
      if (companyTargets.has(category)) {
        companyTargets.delete(category);
      } else {
        companyTargets.add(category);
      }
      
      newMap.set(company, companyTargets);
      return newMap;
    });
  };

  const isTargetSelected = (company: string, category: string) => {
    return selectedTargets.get(company)?.has(category) || false;
  };

  const getSelectedTargetsCount = () => {
    let count = 0;
    selectedTargets.forEach(targets => {
      count += targets.size;
    });
    return count;
  };

  const selectAllTargetsForCompany = (company: string) => {
    const targets = linkTargetingService.generateLinkTargets(company, selectedCategories);
    const allCategories = new Set(targets.map(t => t.category));
    setSelectedTargets(prev => {
      const newMap = new Map(prev);
      newMap.set(company, allCategories);
      return newMap;
    });
  };

  const clearAllTargetsForCompany = (company: string) => {
    setSelectedTargets(prev => {
      const newMap = new Map(prev);
      newMap.set(company, new Set());
      return newMap;
    });
  };

  const selectAllTargets = () => {
    const newMap = new Map();
    customCompanies.filter(c => c.trim()).forEach(company => {
      const targets = linkTargetingService.generateLinkTargets(company, selectedCategories);
      const allCategories = new Set(targets.map(t => t.category));
      newMap.set(company, allCategories);
    });
    setSelectedTargets(newMap);
  };

  const clearAllTargets = () => {
    setSelectedTargets(new Map());
  };

  const generateAllTargets = () => {
    const allTargets: Record<string, LinkTarget[]> = {};
    
    customCompanies.filter(c => c.trim()).forEach(company => {
      const targets = linkTargetingService.generateLinkTargets(company, selectedCategories);
      allTargets[company] = targets;
    });
    
    return allTargets;
  };

  const updateTargetUrl = (company: string, category: string, url: string) => {
    setCompanyUrls(prev => ({
      ...prev,
      [company]: {
        ...prev[company],
        [category]: url
      }
    }));
  };

  const getFinalScrapingTargets = (): ScrapingTarget[] => {
    const targets: ScrapingTarget[] = [];
    
    selectedTargets.forEach((categories, company) => {
      categories.forEach(category => {
        const url = companyUrls[company]?.[category] || '';
        if (url.trim()) {
          targets.push({
            company,
            category,
            url: url.trim(),
            enabled: true
          });
        }
      });
    });
    
    return targets;
  };

  const runAIAnalysis = async () => {
    if (!useBackendKey && !frontendOpenAIKey) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    // Set the appropriate API key
    if (!useBackendKey) {
      aiService.setApiKey(frontendOpenAIKey);
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = focusAreas.split(',').map(area => area.trim());
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'AI analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({ title: 'AI analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
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
        // First try to get URLs from companyUrls (user-configured)
        let url = companyUrls[company]?.[category] || '';
        
        // If no user URL, generate from LinkTargetingService
        if (!url.trim()) {
          const linkTargets = linkTargetingService.generateLinkTargets(company, [category]);
          const highPriorityTarget = linkTargets.find(target => target.priority === 'high');
          if (highPriorityTarget) {
            url = highPriorityTarget.url;
          }
        }
        
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
              const newItems: ScrapedItem[] = categoryData.items.map((item: { id?: string; url?: string; title?: string; content?: string; markdown?: string; content_html?: string; scraped_at?: string }) => ({
                id: item.id || genId(),
                company: target.company,
                category: target.category as 'marketing' | 'docs' | 'rss' | 'social' | 'news' | 'api' | 'community',
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
            const mapped: ScrapedItem[] = r.data.filter(Boolean).map((row: { company?: string; category?: string; url: string; title: string; markdown?: string }) => ({
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
        const result = await (mammoth as { extractRawText: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> }).extractRawText({ arrayBuffer });
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
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Limit</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={250} 
                    value={limit} 
                    onChange={e => setLimit(parseInt(e.target.value || '25'))} 
                  />
                  <p className="text-xs text-muted-foreground">Maximum pages to scrape per target</p>
                </div>
                <div className="space-y-2">
                  <Label>Content Categories</Label>
                  <Select 
                    value={selectedCategories.join(',')} 
                    onValueChange={(value) => setSelectedCategories(value.split(','))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing,docs,rss,social,news,api,community">All Categories</SelectItem>
                      <SelectItem value="marketing,docs">Marketing & Documentation</SelectItem>
                      <SelectItem value="marketing,social">Marketing & Social</SelectItem>
                      <SelectItem value="docs,api">Documentation & API</SelectItem>
                      <SelectItem value="rss,news">News & RSS Feeds</SelectItem>
                      <SelectItem value="marketing">Marketing Only</SelectItem>
                      <SelectItem value="docs">Documentation Only</SelectItem>
                      <SelectItem value="social">Social Media Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Types of content to scrape</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Preset Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Industry Preset Groups
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick setup with pre-configured companies and categories for different industries
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(INDUSTRY_GROUPINGS).map(([key, preset]) => (
                  <div key={key} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{preset.name}</h4>
                      <Badge variant="outline">{preset.companies.length} companies</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {preset.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedPreset === key ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => loadPresetGroup(key)}
                      >
                        {selectedPreset === key ? 'Selected' : 'Use Preset'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomCompanies(preset.companies);
                          setSelectedCategories(preset.categories);
                          setShowTargetSelection(true);
                        }}
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
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
              <p className="text-sm text-muted-foreground">
                Add your own companies or competitors to monitor
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Section */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter company name (e.g., OpenAI, Stripe, Notion)"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      addCompanyWithUrls(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Enter company name"]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      addCompanyWithUrls(input.value.trim());
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </div>
              
              {/* Company List */}
              {customCompanies.filter(c => c.trim()).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Companies to Monitor</h4>
                  {customCompanies.map((company, index) => (
                    <div key={index} className="flex gap-3 items-center p-3 border rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <Input
                          placeholder="Company name"
                          value={company}
                          onChange={(e) => updateCompanyName(index, e.target.value)}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (company.trim()) {
                            setShowTargetSelection(true);
                          }
                        }}
                        disabled={!company.trim()}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Configure Targets
                      </Button>
                      {customCompanies.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCustomCompany(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {customCompanies.filter(c => c.trim()).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No companies added yet</p>
                  <p className="text-sm">Use the input above to add companies or select an industry preset</p>
                </div>
              )}
              
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

          {/* Target Selection and Configuration */}
          {showTargetSelection && customCompanies.filter(c => c.trim()).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Target Selection & Configuration
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and customize the generated link targets for each company
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={selectAllTargets}
                    size="sm"
                    variant="outline"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Select All Companies
                  </Button>
                  <Button
                    onClick={clearAllTargets}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Companies
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Section */}
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Scraping Summary</h4>
                    <Badge variant="default">{getSelectedTargetsCount()} targets selected</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Companies:</span> {customCompanies.filter(c => c.trim()).length}
                    </div>
                    <div>
                      <span className="font-medium">Categories:</span> {selectedCategories.length}
                    </div>
                    <div>
                      <span className="font-medium">Estimated Pages:</span> {getSelectedTargetsCount() * limit}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge variant="outline" className="ml-2">
                        {getSelectedTargetsCount() > 0 ? 'Ready to Scrape' : 'No Targets Selected'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {customCompanies.filter(c => c.trim()).map((company) => {
                  const targets = linkTargetingService.generateLinkTargets(company, selectedCategories);
                  const companySelectedTargets = selectedTargets.get(company) || new Set();
                  
                  return (
                    <div key={company} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-lg">{company}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {companySelectedTargets.size} of {targets.length} selected
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectAllTargetsForCompany(company)}
                          >
                            Select All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => clearAllTargetsForCompany(company)}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {targets.map((target, index) => {
                          const isSelected = isTargetSelected(company, target.category);
                          const currentUrl = companyUrls[company]?.[target.category] || target.url;
                          
                          return (
                            <div 
                              key={index} 
                              className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                                isSelected 
                                  ? 'border-primary bg-primary/5 shadow-sm' 
                                  : 'border-border hover:border-primary/30'
                              }`}
                              onClick={() => toggleTargetSelection(company, target.category)}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleTargetSelection(company, target.category)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="font-medium text-sm capitalize">{target.category}</span>
                                </div>
                                <Badge variant={target.priority === 'high' ? 'default' : target.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                                  {target.priority}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                  {target.description}
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">URL</Label>
                                  <Input
                                    value={currentUrl}
                                    onChange={(e) => updateTargetUrl(company, target.category, e.target.value)}
                                    placeholder="URL"
                                    className="text-xs h-8"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(target.url, '_blank');
                                    }}
                                  >
                                    Test Original
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (currentUrl !== target.url) {
                                        updateTargetUrl(company, target.category, target.url);
                                      }
                                    }}
                                  >
                                    Reset
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {targets.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No targets generated for {company}</p>
                          <p className="text-sm">Try selecting different categories</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Scraping Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start Scraping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Scraping Summary</h4>
                  <Badge variant="default">{getSelectedTargetsCount()} targets selected</Badge>
                </div>
                
                {getSelectedTargetsCount() > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Array.from(selectedTargets.entries()).map(([company, categories]) => (
                      <div key={company} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{company}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(categories).map(category => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No targets selected. Configure companies and select targets above.
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => runScraping(getFinalScrapingTargets())}
                  disabled={isLoading || getSelectedTargetsCount() === 0 || backendStatus !== 'connected'}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isLoading ? 'Scraping...' : `Start Scraping (${getSelectedTargetsCount()} targets)`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={selectAllTargets}
                  disabled={getSelectedTargetsCount() === 0}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Select All Companies
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearAllTargets}
                  disabled={getSelectedTargetsCount() === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Companies
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportCSV} 
                  disabled={dbItems.length === 0}
                >
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
              <p className="text-sm text-muted-foreground">
                Upload existing documents to include in your analysis
              </p>
            </CardHeader>
            <CardContent>
              <Input 
                type="file" 
                accept=".csv,.md,.markdown,.docx" 
                onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} 
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: CSV, Markdown, DOCX
              </p>
            </CardContent>
          </Card>

          {/* AI Analysis Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure AI analysis to run after scraping is complete
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">OpenAI API Configuration</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={useBackendKey} 
                      onCheckedChange={setUseBackendKey} 
                    />
                    <Label>Use backend API key (recommended)</Label>
                  </div>
                  
                  {!useBackendKey && (
                    <div className="space-y-2">
                      <Label>Frontend OpenAI API Key</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="password" 
                          value={frontendOpenAIKey} 
                          onChange={e => setFrontendOpenAIKey(e.target.value)} 
                          placeholder="sk-..." 
                        />
                        <Button onClick={() => aiService.setApiKey(frontendOpenAIKey)} variant="secondary">
                          Save
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your API key will be stored locally in the browser
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Analysis Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Analysis Tone</Label>
                    <Select value={analysisTone} onValueChange={(value: 'neutral' | 'confident' | 'skeptical' | 'enthusiastic') => setAnalysisTone(value)}>
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
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch checked={autoAnalysis} onCheckedChange={setAutoAnalysis} />
                  <Label>Automatically run AI analysis after scraping</Label>
                </div>
              </div>

              {/* AI Analysis Actions */}
              {dbItems.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Run AI Analysis</h4>
                  <div className="flex gap-3">
                    <Button
                      onClick={runAIAnalysis}
                      disabled={isAnalyzing || (useBackendKey && !openaiKey) || (!useBackendKey && !frontendOpenAIKey)}
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
                      disabled={!openaiKey && !frontendOpenAIKey}
                      variant="outline"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Summary
                    </Button>
                  </div>
                  
                  {!useBackendKey && !frontendOpenAIKey && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>OpenAI API key required for AI analysis</p>
                      <p className="text-sm">Enter your API key above or enable backend key usage</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-Time Data Insights & AI Analysis */}
          {dbItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Real-Time Market Intelligence
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live insights from your scraped data with AI-powered analysis
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary">{dbItems.length}</div>
                    <div className="text-sm text-muted-foreground">Total Pages</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary">
                      {Array.from(new Set(dbItems.map(i => i.company))).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Companies</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary">
                      {Array.from(new Set(dbItems.map(i => i.category))).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary">
                      {dbItems.filter(i => i.sentiment_score !== undefined).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Analyzed</div>
                  </div>
                </div>

                {/* Company Performance Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium">Company Performance Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(dbItems.map(i => i.company))).slice(0, 6).map(company => {
                      const companyItems = dbItems.filter(i => i.company === company);
                      const categories = Array.from(new Set(companyItems.map(i => i.category)));
                      const avgSentiment = companyItems
                        .filter(i => i.sentiment_score !== undefined)
                        .reduce((acc, i) => acc + (i.sentiment_score || 0), 0) / 
                        companyItems.filter(i => i.sentiment_score !== undefined).length;
                      
                      return (
                        <div key={company} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{company}</h5>
                            <Badge variant="outline">{companyItems.length} pages</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {categories.map(cat => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                            {!isNaN(avgSentiment) && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Avg Sentiment:</span>
                                <Badge variant={avgSentiment > 0.1 ? 'default' : avgSentiment < -0.1 ? 'destructive' : 'outline'}>
                                  {avgSentiment > 0.1 ? '😊' : avgSentiment < -0.1 ? '😟' : '😐'} {avgSentiment.toFixed(2)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Content Analysis */}
                <div className="space-y-4">
                  <h4 className="font-medium">Content Analysis & Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-3">Category Distribution</h5>
                      <div className="space-y-2">
                        {Object.entries(
                          dbItems.reduce((acc, item) => {
                            acc[item.category] = (acc[item.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{category}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-3">Recent Activity</h5>
                      <div className="space-y-2">
                        {dbItems
                          .sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime())
                          .slice(0, 5)
                          .map(item => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{item.company}</Badge>
                                <span className="text-muted-foreground capitalize">{item.category}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.scrapedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI-Powered Market Analysis */}
                <div className="space-y-4">
                  <h4 className="font-medium">AI-Powered Market Analysis</h4>
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Intelligent Market Insights</span>
                    </div>
                    
                    {competitiveSummary ? (
                      <div className="space-y-3">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap bg-white p-3 rounded border">{competitiveSummary}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => runAIAnalysis()}
                            disabled={isAnalyzing || (useBackendKey && !openaiKey) || (!useBackendKey && !frontendOpenAIKey)}
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Analysis
                          </Button>
                          <Button
                            onClick={() => setCompetitiveSummary('')}
                            variant="outline"
                            size="sm"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-blue-800">
                          Generate AI-powered insights from your scraped data to understand market trends, 
                          competitive positioning, and strategic opportunities.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={generateCompetitiveSummary}
                            disabled={!openaiKey && !frontendOpenAIKey}
                            size="sm"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Generate Market Analysis
                          </Button>
                          <Button
                            onClick={() => runAIAnalysis()}
                            disabled={isAnalyzing || (useBackendKey && !openaiKey) || (!useBackendKey && !frontendOpenAIKey)}
                            variant="outline"
                            size="sm"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Analyze All Content
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export & Share */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={exportCSV} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data (CSV)
                  </Button>
                  <Button 
                    onClick={clearAllData} 
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
                  {(() => {
                    if (selectedChart === 'overview' && metrics.byCat.length > 0) {
                      return (
                        <BarChart data={metrics.byCat}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Pages" fill="hsl(var(--primary))" />
                        </BarChart>
                      );
                    }
                    
                    if (selectedChart === 'trends' && metrics.trendData.length > 0) {
                      return (
                        <AreaChart data={metrics.trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                        </AreaChart>
                      );
                    }
                    
                    if (selectedChart === 'categories' && metrics.byCat.length > 0) {
                      return (
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
                      );
                    }
                    
                    if (selectedChart === 'companies' && metrics.byCompany.length > 0) {
                      return (
                        <BarChart data={metrics.byCompany}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Items" fill="#82ca9d" />
                        </BarChart>
                      );
                    }
                    
                    // Fallback for empty data
                    return (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No data available for this chart</p>
                          <p className="text-sm">Scrape some data first to see visualizations</p>
                        </div>
                      </div>
                    );
                  })()}
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
                    {Array.from(new Set(dbItems.map(i => i.company))).map(company => (
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
                    {Array.from(new Set(dbItems.map(i => i.category))).map(cat => (
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
                Scraped Data ({dbItems.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dbItems.length === 0 ? (
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
