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
  XCircle,
  ExternalLink,
  Copy,
  BookOpen,
  Tag,
  Clock,
  User,
  MapPin
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
  const [selectedItem, setSelectedItem] = useState<ScrapedItem | null>(null);
  
  // Safe data processing with error handling
  const processedItems = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      
      return items.filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        // Basic validation
        if (!item.company || !item.category) return false;
        
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
        if (dateRange !== 'all') {
          const itemDate = new Date(item.scrapedAt);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
          
          switch (dateRange) {
            case '1d': if (diffDays > 1) return false; break;
            case '7d': if (diffDays > 7) return false; break;
            case '30d': if (diffDays > 30) return false; break;
            case '90d': if (diffDays > 90) return false; break;
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error processing items:', error);
      return [];
    }
  }, [items, searchTerm, selectedCompany, selectedCategory, dateRange]);

  // Get unique companies and categories for filters
  const companies = useMemo(() => {
    try {
      return Array.from(new Set(items.map(item => item.company).filter(Boolean))).sort();
    } catch (error) {
      return [];
    }
  }, [items]);

  const categories = useMemo(() => {
    try {
      return Array.from(new Set(items.map(item => item.category).filter(Boolean))).sort();
    } catch (error) {
      return [];
    }
  }, [items]);

  // Export functionality
  const exportToCSV = () => {
    try {
      const headers = ['Company', 'Category', 'Title', 'URL', 'Scraped At', 'Word Count', 'AI Analysis'];
      const csvContent = [
        headers.join(','),
        ...processedItems.map(item => [
          `"${item.company}"`,
          `"${item.category}"`,
          `"${item.title || ''}"`,
          `"${item.url}"`,
          `"${item.scrapedAt}"`,
          item.metadata?.word_count || 0,
          `"${item.ai_analysis || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scraped_data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Data exported successfully', description: `Exported ${processedItems.length} items to CSV` });
    } catch (error) {
      toast({ title: 'Export failed', description: 'Error exporting data to CSV', variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  if (!Array.isArray(items)) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Data Error</AlertTitle>
        <AlertDescription>
          Unable to load scraped data. Please check the data source and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Data View</h2>
          <p className="text-gray-600">
            {processedItems.length} of {items.length} items
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Content</Label>
              <Input
                id="search"
                placeholder="Search titles, content, companies..."
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
                  <SelectItem value="">All companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
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
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">URL</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Scraped</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Content</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {processedItems.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Badge variant="outline">{item.company}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{item.category}</Badge>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="truncate" title={item.title}>
                            {item.title || 'No title'}
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="truncate text-blue-600" title={item.url}>
                            {item.url}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(item.scrapedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            {item.metadata?.word_count && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {item.metadata.word_count}
                              </span>
                            )}
                            {item.metadata?.has_images && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <BarChart3 className="h-3 w-3" />
                                Images
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
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
              <Card key={item.id || index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Badge variant="outline">{item.company}</Badge>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {item.title || 'No title'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {item.markdown ? 
                      item.markdown.substring(0, 150) + (item.markdown.length > 150 ? '...' : '') :
                      'No content available'
                    }
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.scrapedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {item.metadata?.word_count || 0} words
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openInNewTab(item.url)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(item.url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Analysis View */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {processedItems.map((item, index) => (
              <Card key={item.id || index} className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge variant="outline">{item.company}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{item.title || 'No title'}</CardTitle>
                      <p className="text-sm text-gray-600">{item.url}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openInNewTab(item.url)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content Preview */}
                  <div>
                    <h4 className="font-medium mb-2">Content Preview</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                      {item.markdown ? 
                        item.markdown.substring(0, 300) + (item.markdown.length > 300 ? '...' : '') :
                        'No content available'
                      }
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div>
                    <h4 className="font-medium mb-2">Content Analysis</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>{item.metadata?.word_count || 0} words</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-green-500" />
                        <span>{item.metadata?.char_count || 0} characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                        <span>{item.metadata?.has_images ? 'Has images' : 'No images'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-500" />
                        <span>{item.metadata?.link_count || 0} links</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Analysis */}
                  {item.ai_analysis && (
                    <div>
                      <h4 className="font-medium mb-2">AI Insights</h4>
                      <div className="bg-blue-50 p-3 rounded text-sm">
                        {item.ai_analysis}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    processedItems.reduce((acc, item) => {
                      acc[item.category] = (acc[item.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    processedItems.reduce((acc, item) => {
                      acc[item.company] = (acc[item.company] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([company, count]) => (
                    <div key={company} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{company}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Items</span>
                    <Badge variant="outline">{processedItems.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">With AI Analysis</span>
                    <Badge variant="outline">
                      {processedItems.filter(item => item.ai_analysis).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Words</span>
                    <Badge variant="outline">
                      {Math.round(
                        processedItems.reduce((sum, item) => sum + (item.metadata?.word_count || 0), 0) / 
                        Math.max(processedItems.length, 1)
                      )}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedItem.company}</Badge>
                    <Badge variant="secondary">{selectedItem.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{selectedItem.title || 'No title'}</CardTitle>
                  <p className="text-sm text-gray-600">{selectedItem.url}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Content */}
              <div>
                <h4 className="font-medium mb-3">Full Content</h4>
                <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                  {selectedItem.markdown ? (
                    <div className="prose prose-sm max-w-none">
                      {selectedItem.markdown}
                    </div>
                  ) : (
                    <p className="text-gray-500">No content available</p>
                  )}
                </div>
              </div>
              
              {/* AI Analysis */}
              {selectedItem.ai_analysis && (
                <div>
                  <h4 className="font-medium mb-3">AI Analysis</h4>
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm">{selectedItem.ai_analysis}</p>
                  </div>
                </div>
              )}
              
              {/* Metadata */}
              <div>
                <h4 className="font-medium mb-3">Content Metadata</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Scraped:</span>
                    <p className="text-gray-600">{new Date(selectedItem.scrapedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Words:</span>
                    <p className="text-gray-600">{selectedItem.metadata?.word_count || 0}</p>
                  </div>
                  <div>
                    <span className="font-medium">Characters:</span>
                    <p className="text-gray-600">{selectedItem.metadata?.char_count || 0}</p>
                  </div>
                  <div>
                    <span className="font-medium">Links:</span>
                    <p className="text-gray-600">{selectedItem.metadata?.link_count || 0}</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={() => window.open(selectedItem.url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original
                </Button>
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedItem.url)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 