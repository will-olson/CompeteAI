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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Real data interface based on backend API structure
interface RealScrapedItem {
  id?: string;
  company: string;
  category: string;
  url?: string;
  text_content?: string;
  quality_score?: number;
  technical_relevance?: number;
  scraped_at?: string;
  // Additional fields from real data
  title?: string;
  content_preview?: string;
  metadata?: any;
}

interface DataViewPanelProps {
  items: RealScrapedItem[];
}

export function DataViewPanel({ items }: DataViewPanelProps) {
  const { toast } = useToast();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'analytics'>('table');
  const [selectedItem, setSelectedItem] = useState<RealScrapedItem | null>(null);
  
  // Safe data processing with error handling for real data
  const processedItems = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      
      return items.filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        // Basic validation for real data structure
        if (!item.company || !item.category) return false;
        
        // Search filter - adapted for real data fields
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            (item.title && item.title.toLowerCase().includes(searchLower)) ||
            (item.text_content && item.text_content.toLowerCase().includes(searchLower)) ||
            (item.company && item.company.toLowerCase().includes(searchLower)) ||
            (item.content_preview && item.content_preview.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) return false;
        }
        
        // Company filter
        if (selectedCompany && item.company !== selectedCompany) return false;
        
        // Category filter
        if (selectedCategory && item.category !== selectedCategory) return false;
        
        // Date filter - adapted for real data timestamp
        if (dateRange !== 'all' && item.scraped_at) {
          const itemDate = new Date(item.scraped_at);
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

  // Get unique companies and categories from real data
  const companies = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      return [...new Set(items.map(item => item.company).filter(Boolean))].sort();
    } catch (error) {
      return [];
    }
  }, [items]);

  const categories = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      return [...new Set(items.map(item => item.category).filter(Boolean))].sort();
    } catch (error) {
      return [];
    }
  }, [items]);

  // Handle item selection for detailed view
  const handleItemSelect = (item: RealScrapedItem) => {
    setSelectedItem(item);
  };

  // Copy content to clipboard
  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Content copied",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  // Export data
  const handleExport = (format: 'csv' | 'json') => {
    try {
      const data = processedItems.map(item => ({
        company: item.company,
        category: item.category,
        url: item.url || '',
        title: item.title || '',
        content_preview: item.content_preview || item.text_content?.substring(0, 200) || '',
        quality_score: item.quality_score || 0,
        technical_relevance: item.technical_relevance || 0,
        scraped_at: item.scraped_at || ''
      }));

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scraped_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const headers = ['Company', 'Category', 'URL', 'Title', 'Content Preview', 'Quality Score', 'Technical Relevance', 'Scraped At'];
        const csvContent = [
          headers.join(','),
          ...data.map(row => [
            `"${row.company}"`,
            `"${row.category}"`,
            `"${row.url}"`,
            `"${row.title}"`,
            `"${row.content_preview}"`,
            row.quality_score,
            row.technical_relevance,
            `"${row.scraped_at}"`
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scraped_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export successful",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  // Render content based on view mode
  const renderContent = () => {
    if (viewMode === 'table') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">Company</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Title/Preview</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Quality</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge variant="outline">{item.company}</Badge>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge variant="secondary">{item.category}</Badge>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="max-w-xs">
                      <p className="font-medium text-sm truncate">
                        {item.title || 'No title'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {item.content_preview || item.text_content?.substring(0, 100) || 'No content preview'}
                      </p>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Quality:</span>
                        <Badge variant={item.quality_score && item.quality_score > 7 ? 'default' : 'secondary'}>
                          {item.quality_score?.toFixed(1) || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Tech:</span>
                        <Badge variant={item.technical_relevance && item.technical_relevance > 0.7 ? 'default' : 'secondary'}>
                          {(item.technical_relevance * 100)?.toFixed(0) || 'N/A'}%
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleItemSelect(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {item.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (viewMode === 'cards') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedItems.map((item, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.company}</CardTitle>
                    <Badge variant="secondary" className="mt-1">{item.category}</Badge>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {item.quality_score && (
                      <Badge variant={item.quality_score > 7 ? 'default' : 'secondary'}>
                        {item.quality_score.toFixed(1)}
                      </Badge>
                    )}
                    {item.technical_relevance && (
                      <Badge variant={item.technical_relevance > 0.7 ? 'default' : 'secondary'}>
                        {(item.technical_relevance * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm line-clamp-2">
                      {item.title || 'No title available'}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-3 mt-1">
                      {item.content_preview || item.text_content?.substring(0, 150) || 'No content preview available'}
                    </p>
                  </div>
                  
                  {item.url && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{item.url}</span>
                    </div>
                  )}
                  
                  {item.scraped_at && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.scraped_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleItemSelect(item)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {item.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // Analytics view
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">{processedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Companies:</span>
                  <span className="font-medium">{companies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Categories:</span>
                  <span className="font-medium">{categories.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Avg Quality:</span>
                  <span className="font-medium">
                    {processedItems.length > 0 
                      ? (processedItems.reduce((sum, item) => sum + (item.quality_score || 0), 0) / processedItems.length).toFixed(1)
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Tech Relevance:</span>
                  <span className="font-medium">
                    {processedItems.length > 0
                      ? (processedItems.reduce((sum, item) => sum + (item.technical_relevance || 0), 0) / processedItems.length * 100).toFixed(0)
                      : 'N/A'
                    }%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Last 24h:</span>
                  <span className="font-medium">
                    {processedItems.filter(item => {
                      if (!item.scraped_at) return false;
                      const itemDate = new Date(item.scraped_at);
                      const now = new Date();
                      return (now.getTime() - itemDate.getTime()) < (24 * 60 * 60 * 1000);
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last 7 days:</span>
                  <span className="font-medium">
                    {processedItems.filter(item => {
                      if (!item.scraped_at) return false;
                      const itemDate = new Date(item.scraped_at);
                      const now = new Date();
                      return (now.getTime() - itemDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
                    }).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Data View</h2>
          <p className="text-gray-600">
            Explore and analyze scraped competitive intelligence data
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search Content</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search companies, content, titles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Company Filter */}
            <div>
              <Label htmlFor="company">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1d">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            size="sm"
          >
            <Table className="w-4 h-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            onClick={() => setViewMode('cards')}
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'analytics' ? 'default' : 'outline'}
            onClick={() => setViewMode('analytics')}
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Showing {processedItems.length} of {items.length} items
        </div>
      </div>

      {/* Content */}
      {processedItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <FileText className="w-12 h-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">No data found</h3>
                <p className="text-gray-600">
                  {items.length === 0 
                    ? 'No scraped data available. Start scraping to see results here.'
                    : 'No items match your current filters. Try adjusting your search criteria.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        renderContent()
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedItem.company}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{selectedItem.category}</Badge>
                    {selectedItem.quality_score && (
                      <Badge variant={selectedItem.quality_score > 7 ? 'default' : 'secondary'}>
                        Quality: {selectedItem.quality_score.toFixed(1)}
                      </Badge>
                    )}
                    {selectedItem.technical_relevance && (
                      <Badge variant={selectedItem.technical_relevance > 0.7 ? 'default' : 'secondary'}>
                        Tech: {(selectedItem.technical_relevance * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {selectedItem.title && (
                  <div>
                    <h4 className="font-medium mb-2">Title</h4>
                    <p className="text-gray-700">{selectedItem.title}</p>
                  </div>
                )}

                {selectedItem.url && (
                  <div>
                    <h4 className="font-medium mb-2">Source URL</h4>
                    <div className="flex items-center gap-2">
                      <a 
                        href={selectedItem.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {selectedItem.url}
                      </a>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedItem.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedItem.text_content && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Content</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyContent(selectedItem.text_content || '')}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedItem.text_content}
                      </p>
                    </div>
                  </div>
                )}

                {selectedItem.scraped_at && (
                  <div>
                    <h4 className="font-medium mb-2">Scraped At</h4>
                    <p className="text-gray-700">
                      {new Date(selectedItem.scraped_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 