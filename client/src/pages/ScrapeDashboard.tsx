import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import React, { useMemo, useState } from 'react';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { ScrapedItem, useScrapeStore } from '@/state/ScrapeStore';
import { SEO } from '@/components/SEO';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import Papa from 'papaparse';
import mammoth from 'mammoth';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, TrendingUp, TrendingDown, Activity, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Users, Building2, Target, Plus, Trash2 } from 'lucide-react';

const genId = () => Math.random().toString(36).slice(2);

// Preset competitor groupings
const PRESET_GROUPINGS = {
  'tech-saas': {
    name: 'Tech SaaS',
    companies: ['Salesforce', 'HubSpot', 'Slack', 'Notion', 'Figma', 'Airtable'],
    categories: ['marketing', 'docs', 'rss', 'social']
  },
  'fintech': {
    name: 'Fintech',
    companies: ['Stripe', 'Plaid', 'Coinbase', 'Robinhood', 'Chime', 'Affirm'],
    categories: ['marketing', 'docs', 'rss', 'social']
  },
  'ecommerce': {
    name: 'E-commerce',
    companies: ['Shopify', 'Amazon', 'Etsy', 'WooCommerce', 'BigCommerce', 'Magento'],
    categories: ['marketing', 'docs', 'rss', 'social']
  },
  'ai-ml': {
    name: 'AI/ML',
    companies: ['OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI', 'Meta AI', 'NVIDIA'],
    categories: ['marketing', 'docs', 'rss', 'social']
  }
};

interface CompetitorGroup {
  id: string;
  name: string;
  companies: string[];
  categories: string[];
  urls: Record<string, string>;
}

export default function ScrapeDashboard() {
  const { toast } = useToast();
  const { items, addItems, clear } = useScrapeStore();

  const [company, setCompany] = useState('Acme Co');
  const [urls, setUrls] = useState({ marketing: '', docs: '', rss: '', social: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(25);
  const [fcKey, setFcKey] = useState<string>(FirecrawlService.getApiKey() || '');
  
  // Enhanced analytics state
  const [selectedChart, setSelectedChart] = useState('overview');
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    category: '',
    dateRange: 'all'
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  // Competitor grouping state
  const [competitorGroups, setCompetitorGroups] = useState<CompetitorGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [newGroup, setNewGroup] = useState<Partial<CompetitorGroup>>({
    name: '',
    companies: [''],
    categories: ['marketing', 'docs', 'rss', 'social'],
    urls: {}
  });

  const onSaveKey = async () => {
    if (!fcKey) return;
    const ok = await FirecrawlService.testApiKey(fcKey);
    if (!ok) {
      toast({ title: 'Invalid Firecrawl key', variant: 'destructive' });
      return;
    }
    FirecrawlService.saveApiKey(fcKey);
    toast({ title: 'Firecrawl key saved' });
  };

  // Competitor group management
  const createCompetitorGroup = () => {
    if (!newGroup.name || newGroup.companies?.length === 0) {
      toast({ title: 'Please provide group name and at least one company', variant: 'destructive' });
      return;
    }
    
    const group: CompetitorGroup = {
      id: genId(),
      name: newGroup.name,
      companies: newGroup.companies?.filter(c => c.trim()) || [],
      categories: newGroup.categories || ['marketing', 'docs', 'rss', 'social'],
      urls: newGroup.urls || {}
    };
    
    setCompetitorGroups(prev => [...prev, group]);
    setNewGroup({ name: '', companies: [''], categories: ['marketing', 'docs', 'rss', 'social'], urls: {} });
    setShowGroupCreator(false);
    toast({ title: 'Competitor group created' });
  };

  const deleteCompetitorGroup = (groupId: string) => {
    setCompetitorGroups(prev => prev.filter(g => g.id !== groupId));
    if (selectedGroup === groupId) setSelectedGroup('');
    toast({ title: 'Competitor group deleted' });
  };

  const loadPresetGroup = (presetKey: string) => {
    const preset = PRESET_GROUPINGS[presetKey as keyof typeof PRESET_GROUPINGS];
    if (!preset) return;
    
    const group: CompetitorGroup = {
      id: genId(),
      name: preset.name,
      companies: preset.companies,
      categories: preset.categories,
      urls: {}
    };
    
    setCompetitorGroups(prev => [...prev, group]);
    toast({ title: `Loaded ${preset.name} preset group` });
  };

  const runBatchScrape = async (group: CompetitorGroup) => {
    if (!group.companies.length) {
      toast({ title: 'No companies in group', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    let totalScraped = 0;
    
    try {
      for (const company of group.companies) {
        // Use group URLs if available, otherwise use default URLs
        const companyUrls = Object.keys(group.urls).length > 0 ? group.urls : urls;
        
        for (const [category, url] of Object.entries(companyUrls)) {
          if (!url.trim()) continue;
          
          try {
            const res = await FirecrawlService.crawlWebsite(url, limit);
            if (!res.success || !res.data) continue;
            
            const data = (res.data as any);
            const mapped: ScrapedItem[] = (data.data || []).map((d: any) => ({
              id: genId(),
              company,
              category: category as any,
              url: d?.metadata?.url,
              title: d?.metadata?.title,
              markdown: d?.markdown,
              html: d?.html,
              scrapedAt: new Date().toISOString(),
              source: (() => { try { return new URL(d?.metadata?.url).host; } catch { return undefined; } })()
            }));
            
            addItems(mapped);
            totalScraped += mapped.length;
          } catch (error) {
            console.error(`Failed to scrape ${category} for ${company}:`, error);
          }
        }
      }
      
      toast({ title: `Batch scrape complete: ${totalScraped} items from ${group.companies.length} companies` });
    } catch (error) {
      toast({ title: 'Batch scrape failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const runCrawl = async (category: keyof typeof urls) => {
    const url = urls[category].trim();
    if (!url) return;
    setIsLoading(true);
    try {
      const res = await FirecrawlService.crawlWebsite(url, limit);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed');
      const data = (res.data as any);
      const mapped: ScrapedItem[] = (data.data || []).map((d: any) => ({
        id: genId(),
        company,
        category: category as any,
        url: d?.metadata?.url,
        title: d?.metadata?.title,
        markdown: d?.markdown,
        html: d?.html,
        scrapedAt: new Date().toISOString(),
        source: (() => { try { return new URL(d?.metadata?.url).host; } catch { return undefined; } })()
      }));
      addItems(mapped);
      toast({ title: `Crawled ${mapped.length} pages` });
    } catch (e: any) {
      toast({ title: 'Crawl failed', description: e?.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const runAggregate = async () => {
    const all = Object.entries(urls).map(([k, v]) => ({ k, v: v.trim() })).filter(x => x.v);
    if (!all.length) return;
    setIsLoading(true);
    try {
      for (const { k, v } of all) {
        const res = await FirecrawlService.crawlWebsite(v, limit);
        if (!res.success || !res.data) continue;
        const data = (res.data as any);
        const mapped: ScrapedItem[] = (data.data || []).map((d: any) => ({
          id: genId(), company, category: 'aggregate', url: d?.metadata?.url, title: d?.metadata?.title, markdown: d?.markdown, html: d?.html, scrapedAt: new Date().toISOString(), source: (() => { try { return new URL(d?.metadata?.url).host; } catch { return undefined; } })()
        }));
        addItems(mapped);
      }
      toast({ title: 'Aggregate crawl complete' });
    } catch (e: any) {
      toast({ title: 'Aggregate crawl error', description: e?.message, variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(items.map(i => ({ id: i.id, company: i.company, category: i.category, url: i.url, title: i.title, scrapedAt: i.scrapedAt })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'scraped_data.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) return;
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (r) => {
          const mapped: ScrapedItem[] = r.data.filter(Boolean).map((row: any) => ({
            id: genId(), company, category: 'upload', url: row.url, title: row.title, markdown: row.markdown || JSON.stringify(row, null, 2), scrapedAt: new Date().toISOString(), source: (() => { try { return new URL(row.url).host; } catch { return undefined; } })()
          }));
          addItems(mapped);
          toast({ title: `Imported ${mapped.length} rows from CSV` });
        },
      });
      return;
    }
    if (ext === 'md' || ext === 'markdown') {
      const text = await file.text();
      addItems([{ id: genId(), company, category: 'upload', title: file.name, markdown: text, scrapedAt: new Date().toISOString() }]);
      toast({ title: 'Markdown imported' });
      return;
    }
    if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await (mammoth as any).extractRawText({ arrayBuffer });
      addItems([{ id: genId(), company, category: 'upload', title: file.name, markdown: result.value, scrapedAt: new Date().toISOString() }]);
      toast({ title: 'DOCX imported' });
      return;
    }
    toast({ title: 'Unsupported file', variant: 'destructive' });
  };

  // Enhanced filtering and analytics
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !filters.search || 
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.markdown?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.company?.toLowerCase().includes(filters.search.toLowerCase());
      
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
  }, [items, filters]);

  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const metrics = useMemo(() => {
    const byCat: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    const byCompany: Record<string, number> = {};
    const timeData: Record<string, number> = {};
    
    // Content quality metrics
    const contentQuality = {
      totalWords: 0,
      totalCharacters: 0,
      richContent: 0, // >1000 words
      hasLinks: 0,
      hasImages: 0,
      hasCode: 0,
      structuredContent: 0, // has headers
      averageWordsPerItem: 0,
      averageCharsPerItem: 0
    };
    
    items.forEach(i => {
      byCat[i.category] = (byCat[i.category] || 0) + 1;
      if (i.source) byDomain[i.source] = (byDomain[i.source] || 0) + 1;
      byCompany[i.company] = (byCompany[i.company] || 0) + 1;
      
      const date = new Date(i.scrapedAt).toLocaleDateString();
      timeData[date] = (timeData[date] || 0) + 1;
      
      // Content quality analysis
      if (i.markdown) {
        const wordCount = i.markdown.split(/\s+/).length;
        const charCount = i.markdown.length;
        
        contentQuality.totalWords += wordCount;
        contentQuality.totalCharacters += charCount;
        
        if (wordCount > 1000) contentQuality.richContent++;
        if (i.markdown.includes('http')) contentQuality.hasLinks++;
        if (i.markdown.includes('![')) contentQuality.hasImages++;
        if (i.markdown.includes('```')) contentQuality.hasCode++;
        if (i.markdown.includes('##')) contentQuality.structuredContent++;
      }
    });
    
    // Calculate averages
    if (items.length > 0) {
      contentQuality.averageWordsPerItem = Math.round(contentQuality.totalWords / items.length);
      contentQuality.averageCharsPerItem = Math.round(contentQuality.totalCharacters / items.length);
    }
    
    // Time trends
    const trendData = Object.entries(timeData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));
    
    // Word frequency analysis
    const wordFrequency: Record<string, number> = {};
    items.forEach(item => {
      const words = (item.markdown || '').toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => {
        if (word.length > 3) wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });
    
    const topWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }));
    
    // Competitive insights
    const competitiveInsights = {
      companiesWithMostContent: Object.entries(byCompany)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([company, count]) => ({ company, count })),
      topContentCategories: Object.entries(byCat)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count })),
      contentDensity: contentQuality.averageWordsPerItem > 500 ? 'High' : 
                     contentQuality.averageWordsPerItem > 200 ? 'Medium' : 'Low'
    };
    
    return {
      byCat: Object.entries(byCat).map(([name, value]) => ({ name, value })),
      byDomain: Object.entries(byDomain).map(([name, value]) => ({ name, value })),
      byCompany: Object.entries(byCompany).map(([name, value]) => ({ name, value })),
      trendData,
      topWords,
      contentQuality,
      competitiveInsights,
      totalItems: items.length,
      uniqueCompanies: Object.keys(byCompany).length,
      uniqueSources: Object.keys(byDomain).length
    };
  }, [items]);

  return (
    <main className="container mx-auto py-8">
      <SEO title="Scrape Intelligence | InsightForge" description="Targeted and aggregate web scraping across marketing, docs, RSS and social sources." canonical={window.location.href} />

      {/* Enhanced Analytics Dashboard */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{metrics.totalItems}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{metrics.uniqueCompanies}</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{metrics.uniqueSources}</div>
                <div className="text-sm text-muted-foreground">Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{filteredItems.length}</div>
                <div className="text-sm text-muted-foreground">Filtered</div>
              </div>
            </div>

            {/* Enhanced Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-primary">{metrics.contentQuality.averageWordsPerItem}</div>
                <div className="text-xs text-muted-foreground">Avg Words/Item</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-primary">{metrics.contentQuality.richContent}</div>
                <div className="text-xs text-muted-foreground">Rich Content</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-primary">{metrics.contentQuality.hasLinks}</div>
                <div className="text-xs text-muted-foreground">With Links</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-primary">{metrics.contentQuality.hasImages}</div>
                <div className="text-xs text-muted-foreground">With Images</div>
              </div>
            </div>
            
            {/* Chart Selection */}
            <div className="flex gap-2 mb-4">
              {['overview', 'trends', 'categories', 'companies', 'words', 'sources', 'quality'].map(chart => (
                <Button
                  key={chart}
                  variant={selectedChart === chart ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChart(chart)}
                >
                  {chart === 'overview' && <BarChart3 className="h-4 w-4 mr-2" />}
                  {chart === 'trends' && <LineChartIcon className="h-4 w-4 mr-2" />}
                  {chart === 'categories' && <PieChartIcon className="h-4 w-4 mr-2" />}
                  {chart === 'quality' && <Activity className="h-4 w-4 mr-2" />}
                  {chart.charAt(0).toUpperCase() + chart.slice(1)}
                </Button>
              ))}
            </div>
            
            {/* Enhanced Visualizations */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
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
                
                {selectedChart === 'words' && (
                  <BarChart data={metrics.topWords} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="word" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ffc658" />
                  </BarChart>
                )}
                
                {selectedChart === 'sources' && (
                  <PieChart>
                    <Pie
                      data={metrics.byDomain}
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

                {selectedChart === 'quality' && (
                  <BarChart data={[
                    { name: 'Rich Content', value: metrics.contentQuality.richContent },
                    { name: 'Has Links', value: metrics.contentQuality.hasLinks },
                    { name: 'Has Images', value: metrics.contentQuality.hasImages },
                    { name: 'Has Code', value: metrics.contentQuality.hasCode },
                    { name: 'Structured', value: metrics.contentQuality.structuredContent }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Items" fill="#ff6b6b" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Grouping & Batch Scraping */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Competitor Grouping & Batch Scraping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Preset Groups */}
              <div className="space-y-4">
                <h3 className="font-semibold">Preset Industry Groups</h3>
                <div className="space-y-2">
                  {Object.entries(PRESET_GROUPINGS).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => loadPresetGroup(key)}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Groups */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Custom Groups</h3>
                  <Button
                    size="sm"
                    onClick={() => setShowGroupCreator(!showGroupCreator)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </div>
                
                {showGroupCreator && (
                  <div className="space-y-3 p-3 border rounded-lg">
                    <Input
                      placeholder="Group Name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Companies (one per line)</label>
                      {newGroup.companies?.map((company, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Company name"
                            value={company}
                            onChange={(e) => {
                              const updated = [...(newGroup.companies || [])];
                              updated[index] = e.target.value;
                              setNewGroup(prev => ({ ...prev, companies: updated }));
                            }}
                          />
                          {newGroup.companies && newGroup.companies.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const updated = newGroup.companies?.filter((_, i) => i !== index);
                                setNewGroup(prev => ({ ...prev, companies: updated }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewGroup(prev => ({ 
                          ...prev, 
                          companies: [...(prev.companies || []), ''] 
                        }))}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Company
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={createCompetitorGroup}>
                        Create Group
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowGroupCreator(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {competitorGroups.map(group => (
                    <div key={group.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {group.companies.length} companies
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => runBatchScrape(group)}
                          disabled={isLoading}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Scrape
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCompetitorGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch Scraping Status */}
              <div className="space-y-4">
                <h3 className="font-semibold">Batch Operations</h3>
                <div className="space-y-3">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-primary">{competitorGroups.length}</div>
                    <div className="text-sm text-muted-foreground">Active Groups</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {competitorGroups.reduce((acc, g) => acc + g.companies.length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Companies</div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (competitorGroups.length === 0) {
                        toast({ title: 'No groups to scrape', variant: 'destructive' });
                        return;
                      }
                      competitorGroups.forEach(group => runBatchScrape(group));
                    }}
                    disabled={isLoading}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Scrape All Groups
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filtering and Search */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search & Filtering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Search content, titles, companies..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
              >
                <option value="">All Companies</option>
                {Array.from(new Set(items.map(i => i.company))).map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">All Categories</option>
                {Array.from(new Set(items.map(i => i.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{filteredItems.length} items</Badge>
                <Badge variant="outline">{metrics.uniqueCompanies} companies</Badge>
                <Badge variant="outline">{metrics.uniqueSources} sources</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="ghost" onClick={clear}>Clear All</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings and Controls */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm">Company Tag</label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Co" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Firecrawl API Key</label>
              <div className="flex gap-2">
                <Input type="password" value={fcKey} onChange={e => setFcKey(e.target.value)} placeholder="fc_live_..." />
                <Button onClick={onSaveKey} variant="secondary">Save</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Page Limit</label>
              <Input type="number" min={1} max={250} value={limit} onChange={e => setLimit(parseInt(e.target.value || '25'))} />
            </div>
          </CardContent>
        </Card>

        {(['marketing','docs','rss','social'] as const).map((cat) => (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="capitalize">{cat} URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder={`https://example.com/${cat}`} value={(urls as any)[cat]} onChange={e => setUrls(prev => ({ ...prev, [cat]: e.target.value }))} />
              <Button onClick={() => runCrawl(cat)} disabled={isLoading}>Run {cat}</Button>
            </CardContent>
          </Card>
        ))}

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Aggregate Crawl</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Run a macro crawl across all provided URLs.</p>
            <Button variant="default" onClick={runAggregate} disabled={isLoading}>Run Aggregate</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Import Files</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="file" accept=".csv,.md,.markdown,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
            <p className="text-xs text-muted-foreground">Upload CSV / DOCX / Markdown to include proprietary docs.</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Results Display */}
      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Scraped Insights & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quantitative Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{paginatedItems.length}</div>
              <div className="text-xs text-muted-foreground">Current Page</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {paginatedItems.reduce((acc, item) => acc + (item.markdown?.length || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Characters</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {paginatedItems.reduce((acc, item) => acc + (item.markdown?.split(/\s+/).length || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {paginatedItems.filter(item => item.markdown && item.markdown.length > 1000).length}
              </div>
              <div className="text-xs text-muted-foreground">Rich Content</div>
            </div>
          </div>

          {/* Content Quality Indicators */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Content Quality Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paginatedItems.slice(0, 3).map(item => {
                const wordCount = item.markdown?.split(/\s+/).length || 0;
                const charCount = item.markdown?.length || 0;
                const hasLinks = item.markdown?.includes('http') || false;
                const hasImages = item.markdown?.includes('![') || false;
                const hasCode = item.markdown?.includes('```') || false;
                
                return (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm truncate">{item.title || 'Untitled'}</h4>
                      <Badge variant={wordCount > 500 ? "default" : "secondary"}>
                        {wordCount > 500 ? 'Rich' : 'Basic'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Words:</span>
                        <span className="font-medium">{wordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Characters:</span>
                        <span className="font-medium">{charCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Links:</span>
                        <span className={hasLinks ? "text-green-600" : "text-gray-400"}>
                          {hasLinks ? "✓" : "✗"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Images:</span>
                        <span className={hasImages ? "text-green-600" : "text-gray-400"}>
                          {hasImages ? "✓" : "✗"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Code:</span>
                        <span className={hasCode ? "text-green-600" : "text-gray-400"}>
                          {hasCode ? "✓" : "✗"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Results List */}
          <div className="space-y-4">
            {paginatedItems.map(i => (
              <article key={i.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{i.title || i.url || 'Document'}</h3>
                      <Badge variant="outline">{i.company}</Badge>
                      <Badge variant="secondary">{i.category}</Badge>
                      {i.source && <Badge variant="outline">{i.source}</Badge>}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{new Date(i.scrapedAt).toLocaleDateString()}</span>
                      {i.markdown && (
                        <>
                          <span>•</span>
                          <span>{i.markdown.split(/\s+/).length} words</span>
                          <span>•</span>
                          <span>{i.markdown.length.toLocaleString()} characters</span>
                        </>
                      )}
                    </div>

                    {i.markdown && (
                      <div className="space-y-3">
                        {/* Content Preview with Enhanced Formatting */}
                        <div className="prose prose-sm dark:prose-invert max-h-48 overflow-auto">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{i.markdown.slice(0, 1200)}</ReactMarkdown>
                        </div>
                        
                        {/* Content Insights */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          {i.markdown.includes('http') && (
                            <Badge variant="outline" className="text-xs">Contains Links</Badge>
                          )}
                          {i.markdown.includes('![') && (
                            <Badge variant="outline" className="text-xs">Contains Images</Badge>
                          )}
                          {i.markdown.includes('```') && (
                            <Badge variant="outline" className="text-xs">Contains Code</Badge>
                          )}
                          {i.markdown.includes('##') && (
                            <Badge variant="outline" className="text-xs">Structured Content</Badge>
                          )}
                          {i.markdown.length > 2000 && (
                            <Badge variant="default" className="text-xs">Long-form Content</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
            
            {paginatedItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {items.length === 0 ? 'No data yet. Enter URLs and run a crawl or import a file.' : 'No items match your current filters'}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
