import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Table,
  FileText,
  Globe,
  Calendar,
  Hash,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ScrapedItem } from '@/state/ScrapeStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DataViewPanelProps {
  items: ScrapedItem[];
}

export function DataViewPanel({ items }: DataViewPanelProps) {
  const { toast } = useToast();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'analytics'>('table');
  
  // Safe data processing with error handling
  const processedItems = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      
      return items.filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        // Basic validation
        if (!item.url || !item.company || !item.category) return false;
        
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            (item.title && item.title.toLowerCase().includes(searchLower)) ||
            (item.markdown && item.markdown.toLowerCase().includes(searchLower)) ||
            (item.company && item.company.toLowerCase().includes(searchLower)) ||
            (item.ai_analysis && item.ai_analysis.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) return false;
        }
        
        // Company filter
        if (selectedCompany && item.company !== selectedCompany) return false;
        
        // Category filter
        if (selectedCategory && item.category !== selectedCategory) return false;
        
        // Date filter
        if (dateRange !== 'all' && item.scrapedAt) {
          try {
            const itemDate = new Date(item.scrapedAt);
            if (isNaN(itemDate.getTime())) return false;
            
            const now = new Date();
            const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
            
            switch (dateRange) {
              case 'today': if (diffDays > 1) return false; break;
              case 'week': if (diffDays > 7) return false; break;
              case 'month': if (diffDays > 30) return false; break;
            }
          } catch (error) {
            console.warn('Date parsing error:', error);
            return false;
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error processing items:', error);
      return [];
    }
  }, [items, searchTerm, selectedCompany, selectedCategory, dateRange]);

  // Safe analytics calculation
  const analytics = useMemo(() => {
    try {
      if (!processedItems || processedItems.length === 0) {
        return {
          totalItems: 0,
          companies: [],
          categories: [],
          dateDistribution: [],
          contentQuality: {
            averageWords: 0,
            averageChars: 0,
            hasImages: 0,
            hasLinks: 0,
            hasTables: 0
          }
        };
      }

      // Company distribution
      const companyCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      const dateCounts: Record<string, number> = {};
      
      let totalWords = 0;
      let totalChars = 0;
      let itemsWithImages = 0;
      let itemsWithLinks = 0;
      let itemsWithTables = 0;

      processedItems.forEach(item => {
        // Company counts
        companyCounts[item.company] = (companyCounts[item.company] || 0) + 1;
        
        // Category counts
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        
        // Date distribution
        if (item.scrapedAt) {
          try {
            const date = new Date(item.scrapedAt).toLocaleDateString();
            dateCounts[date] = (dateCounts[date] || 0) + 1;
          } catch (error) {
            console.warn('Date parsing error in analytics:', error);
          }
        }
        
        // Content quality metrics
        if (item.markdown) {
          const words = item.markdown.split(/\s+/).length;
          totalWords += words;
          totalChars += item.markdown.length;
        }
        
        // Metadata analysis
        if (item.metadata) {
          if (item.metadata.has_images) itemsWithImages++;
          if (item.metadata.has_links) itemsWithLinks++;
          if (item.metadata.has_tables) itemsWithTables++;
        }
      });

      return {
        totalItems: processedItems.length,
        companies: Object.entries(companyCounts).map(([name, count]) => ({ name, count })),
        categories: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
        dateDistribution: Object.entries(dateCounts)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, count]) => ({ date, count })),
        contentQuality: {
          averageWords: Math.round(totalWords / processedItems.length),
          averageChars: Math.round(totalChars / processedItems.length),
          hasImages: itemsWithImages,
          hasLinks: itemsWithLinks,
          hasTables: itemsWithTables
        }
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return {
        totalItems: 0,
        companies: [],
        categories: [],
        dateDistribution: [],
        contentQuality: {
          averageWords: 0,
          averageChars: 0,
          hasImages: 0,
          hasLinks: 0,
          hasTables: 0
        }
      };
    }
  }, [processedItems]);

  // Get unique companies and categories for filters
  const uniqueCompanies = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      return Array.from(new Set(items.map(item => item.company).filter(Boolean)));
    } catch (error) {
      console.error('Error getting unique companies:', error);
      return [];
    }
  }, [items]);

  const uniqueCategories = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      return Array.from(new Set(items.map(item => item.category).filter(Boolean)));
    } catch (error) {
      console.error('Error getting unique categories:', error);
      return [];
    }
  }, [items]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCompany('');
    setSelectedCategory('');
    setDateRange('all');
  };

  const exportFilteredData = () => {
    try {
      const csvContent = [
        ['Company', 'Category', 'Title', 'URL', 'Scraped At', 'Word Count', 'AI Analysis'],
        ...processedItems.map(item => [
          item.company || '',
          item.category || '',
          item.title || '',
          item.url || '',
          item.scrapedAt || '',
          item.markdown ? item.markdown.split(/\s+/).length : 0,
          item.ai_analysis || ''
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'filtered_scraped_data.csv';
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({ title: 'Data exported successfully' });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  if (!Array.isArray(items)) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Data Error</AlertTitle>
        <AlertDescription>
          Invalid data format. Please check your data source.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Overview</span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {processedItems.length} of {items.length} items
              </Badge>
              <Button onClick={exportFilteredData} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.companies.length}</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{analytics.contentQuality.averageWords}</div>
              <div className="text-sm text-gray-600">Avg Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.contentQuality.hasImages}</div>
              <div className="text-sm text-gray-600">With Images</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="All companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All companies</SelectItem>
                  {uniqueCompanies.map(company => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
            <div className="text-sm text-gray-600">
              Showing {processedItems.length} of {items.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedItems.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{item.company}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary">{item.category}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate" title={item.title}>
                            {item.title || 'No title'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.scrapedAt ? new Date(item.scrapedAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card View */}
        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedItems.map((item, index) => (
              <Card key={item.id || index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base line-clamp-2">{item.title || 'No title'}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{item.company}</Badge>
                        <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 line-clamp-3">
                      {item.markdown ? item.markdown.substring(0, 150) + '...' : 'No content available'}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.scrapedAt ? new Date(item.scrapedAt).toLocaleDateString() : 'Unknown date'}</span>
                      <span>{item.markdown ? item.markdown.split(/\s+/).length : 0} words</span>
                    </div>
                    
                    <Button size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Company Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.companies.slice(0, 10).map((company, index) => (
                    <div key={company.name} className="flex items-center justify-between">
                      <span className="text-sm truncate">{company.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(company.count / analytics.totalItems) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{company.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Category Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.categories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(category.count / analytics.totalItems) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{category.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Content Quality</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">{analytics.contentQuality.averageWords}</div>
                    <div className="text-xs text-blue-600">Avg Words</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">{analytics.contentQuality.averageChars}</div>
                    <div className="text-xs text-green-600">Avg Chars</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">{analytics.contentQuality.hasImages}</div>
                    <div className="text-xs text-purple-600">With Images</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-semibold text-orange-600">{analytics.contentQuality.hasLinks}</div>
                    <div className="text-xs text-orange-600">With Links</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Scraping Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dateDistribution.slice(-7).map((date, index) => (
                    <div key={date.date} className="flex items-center justify-between">
                      <span className="text-sm">{date.date}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(date.count / Math.max(...analytics.dateDistribution.map(d => d.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{date.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* No Results */}
      {processedItems.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>
            No items match your current filters. Try adjusting your search criteria or clearing filters.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 