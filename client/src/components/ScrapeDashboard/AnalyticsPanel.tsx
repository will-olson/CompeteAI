import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Target, 
  Globe,
  Calendar,
  Hash,
  MessageSquare,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap
} from 'lucide-react';

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
  title?: string;
  content_preview?: string;
  metadata?: any;
}

interface AnalyticsPanelProps {
  items: RealScrapedItem[];
}

export function AnalyticsPanel({ items }: AnalyticsPanelProps) {
  const { toast } = useToast();
  
  // Analytics state
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [selectedVisualization, setSelectedVisualization] = useState<'overview' | 'quality' | 'sentiment' | 'topics' | 'competitive' | 'performance'>('overview');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Safe analytics calculation with error handling for real data
  const analytics = useMemo(() => {
    try {
      if (!Array.isArray(items) || items.length === 0) {
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
            hasTables: 0,
            readabilityScore: 0,
            contentDensity: 0
          },
          sentimentAnalysis: {
            overallSentiment: 0,
            sentimentByCategory: {},
            sentimentByCompany: {},
            sentimentTrends: []
          },
          topicAnalysis: {
            topTopics: [],
            topicClusters: {},
            emergingTopics: []
          },
          competitiveInsights: {
            marketPositioning: {},
            featureComparison: {},
            strategyInsights: {}
          },
          performanceMetrics: {
            scrapingSpeed: 0,
            dataQuality: 0,
            coverageCompleteness: 0,
            analysisAccuracy: 0
          }
        };
      }

      // Filter items by time range - adapted for real data timestamp
      const now = new Date();
      const filteredItems = items.filter(item => {
        if (!item.scraped_at) return false;
        
        const itemDate = new Date(item.scraped_at);
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (selectedTimeRange) {
          case '1d': return diffDays <= 1;
          case '7d': return diffDays <= 7;
          case '30d': return diffDays <= 30;
          case '90d': return diffDays <= 90;
          case '1y': return diffDays <= 365;
          case 'all': return true;
          default: return true;
        }
      });

      // Basic analytics for real data
      const companies = [...new Set(filteredItems.map(item => item.company))];
      const categories = [...new Set(filteredItems.map(item => item.category))];
      
      // Content quality analysis based on real data fields
      const contentQuality = {
        averageWords: filteredItems.length > 0 
          ? Math.round(filteredItems.reduce((sum, item) => {
              const words = item.text_content ? item.text_content.split(' ').length : 0;
              return sum + words;
            }, 0) / filteredItems.length)
          : 0,
        averageChars: filteredItems.length > 0
          ? Math.round(filteredItems.reduce((sum, item) => {
              const chars = item.text_content ? item.text_content.length : 0;
              return sum + chars;
            }, 0) / filteredItems.length)
          : 0,
        hasImages: 0, // Not available in real data structure
        hasLinks: 0,  // Not available in real data structure
        hasTables: 0, // Not available in real data structure
        readabilityScore: filteredItems.length > 0
          ? Math.round(filteredItems.reduce((sum, item) => sum + (item.quality_score || 0), 0) / filteredItems.length)
          : 0,
        contentDensity: filteredItems.length > 0
          ? Math.round(filteredItems.reduce((sum, item) => sum + (item.technical_relevance || 0), 0) / filteredItems.length * 100)
          : 0
      };

      // Company performance analysis
      const companyPerformance = companies.reduce((acc, company) => {
        const companyItems = filteredItems.filter(item => item.company === company);
        const avgQuality = companyItems.reduce((sum, item) => sum + (item.quality_score || 0), 0) / companyItems.length;
        const avgTechRelevance = companyItems.reduce((sum, item) => sum + (item.technical_relevance || 0), 0) / companyItems.length;
        
        acc[company] = {
          itemCount: companyItems.length,
          avgQuality: Math.round(avgQuality * 10) / 10,
          avgTechRelevance: Math.round(avgTechRelevance * 100) / 100,
          categories: [...new Set(companyItems.map(item => item.category))]
        };
        return acc;
      }, {} as Record<string, any>);

      // Category analysis
      const categoryAnalysis = categories.reduce((acc, category) => {
        const categoryItems = filteredItems.filter(item => item.category === category);
        const avgQuality = categoryItems.reduce((sum, item) => sum + (item.quality_score || 0), 0) / categoryItems.length;
        
        acc[category] = {
          itemCount: categoryItems.length,
          avgQuality: Math.round(avgQuality * 10) / 10,
          companies: [...new Set(categoryItems.map(item => item.company))]
        };
        return acc;
      }, {} as Record<string, any>);

      // Date distribution analysis
      const dateDistribution = filteredItems.reduce((acc, item) => {
        if (item.scraped_at) {
          const date = new Date(item.scraped_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        totalItems: filteredItems.length,
        companies,
        categories,
        dateDistribution,
        contentQuality,
        companyPerformance,
        categoryAnalysis,
        // Placeholder analytics for features not available in real data
        sentimentAnalysis: {
          overallSentiment: 0,
          sentimentByCategory: {},
          sentimentByCompany: {},
          sentimentTrends: []
        },
        topicAnalysis: {
          topTopics: [],
          topicClusters: {},
          emergingTopics: []
        },
        competitiveInsights: {
          marketPositioning: companyPerformance,
          featureComparison: categoryAnalysis,
          strategyInsights: {}
        },
        performanceMetrics: {
          scrapingSpeed: 0,
          dataQuality: contentQuality.readabilityScore,
          coverageCompleteness: Math.round((companies.length / 15) * 100), // Assuming 15 total competitors
          analysisAccuracy: contentQuality.contentDensity
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
          hasTables: 0,
          readabilityScore: 0,
          contentDensity: 0
        },
        sentimentAnalysis: {
          overallSentiment: 0,
          sentimentByCategory: {},
          sentimentByCompany: {},
          sentimentTrends: []
        },
        topicAnalysis: {
          topTopics: [],
          topicClusters: {},
          emergingTopics: []
        },
        competitiveInsights: {
          marketPositioning: {},
          featureComparison: {},
          strategyInsights: {}
        },
        performanceMetrics: {
          scrapingSpeed: 0,
          dataQuality: 0,
          coverageCompleteness: 0,
          analysisAccuracy: 0
        }
      };
    }
  }, [items, selectedTimeRange]);

  // Export analytics data
  const handleExportAnalytics = (format: 'csv' | 'json') => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        timeRange: selectedTimeRange,
        overview: {
          totalItems: analytics.totalItems,
          companies: analytics.companies.length,
          categories: analytics.categories.length
        },
        companyPerformance: analytics.companyPerformance,
        categoryAnalysis: analytics.categoryAnalysis,
        contentQuality: analytics.contentQuality
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${selectedTimeRange}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Create CSV for company performance
        const csvContent = [
          'Company,Item Count,Avg Quality,Avg Tech Relevance,Categories',
          ...Object.entries(analytics.companyPerformance).map(([company, data]: [string, any]) => [
            `"${company}"`,
            data.itemCount,
            data.avgQuality,
            data.avgTechRelevance,
            `"${data.categories.join(', ')}"`
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `company_performance_${selectedTimeRange}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Analytics exported",
        description: `Analytics data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export analytics data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">
            Comprehensive analysis of scraped competitive intelligence data
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExportAnalytics('csv')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportAnalytics('json')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Time Range:</span>
            <div className="flex gap-2">
              {(['1d', '7d', '30d', '90d', '1y', 'all'] as const).map(range => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                >
                  {range === '1d' ? '24h' : range === '1y' ? '1 Year' : range === 'all' ? 'All Time' : `${range}`}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{analytics.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded">
                <Globe className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold">{analytics.companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded">
                <Hash className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{analytics.categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Quality</p>
                <p className="text-2xl font-bold">{analytics.contentQuality.readabilityScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs value={selectedVisualization} onValueChange={(value) => setSelectedVisualization(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.companyPerformance).map(([company, data]: [string, any]) => (
                    <div key={company} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{company}</p>
                        <p className="text-sm text-gray-600">{data.itemCount} items</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          Quality: {data.avgQuality}
                        </Badge>
                        <Badge variant="secondary">
                          Tech: {(data.avgTechRelevance * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.categoryAnalysis).map(([category, data]: [string, any]) => (
                    <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{category}</p>
                        <p className="text-sm text-gray-600">{data.companies.length} companies</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {data.itemCount} items
                        </Badge>
                        <Badge variant="secondary">
                          Quality: {data.avgQuality}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Words per Item:</span>
                    <span className="font-medium">{analytics.contentQuality.averageWords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Characters per Item:</span>
                    <span className="font-medium">{analytics.contentQuality.averageChars.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Quality Score:</span>
                    <span className="font-medium">{analytics.contentQuality.readabilityScore}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Relevance:</span>
                    <span className="font-medium">{analytics.contentQuality.contentDensity}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.companies.map(company => {
                    const companyItems = items.filter(item => item.company === company);
                    const avgQuality = companyItems.reduce((sum, item) => sum + (item.quality_score || 0), 0) / companyItems.length;
                    
                    return (
                      <div key={company} className="flex justify-between items-center">
                        <span className="text-sm">{company}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(avgQuality / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{avgQuality.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Competitive Tab */}
        <TabsContent value="competitive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Positioning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.companyPerformance)
                    .sort(([,a]: [string, any], [,b]: [string, any]) => b.avgQuality - a.avgQuality)
                    .map(([company, data]: [string, any], index: number) => (
                      <div key={company} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                          <span className="font-medium">{company}</span>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">
                            {data.avgQuality}/10
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feature Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.categoryAnalysis)
                    .sort(([,a]: [string, any], [,b]: [string, any]) => b.itemCount - a.itemCount)
                    .map(([category, data]: [string, any]) => (
                      <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {data.itemCount} items
                          </Badge>
                          <Badge variant="secondary">
                            {data.companies.length} companies
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Data Quality Score:</span>
                    <span className="font-medium">{analytics.performanceMetrics.dataQuality}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage Completeness:</span>
                    <span className="font-medium">{analytics.performanceMetrics.coverageCompleteness}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analysis Accuracy:</span>
                    <span className="font-medium">{analytics.performanceMetrics.analysisAccuracy}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.dateDistribution)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .slice(0, 7)
                    .map(([date, count]) => (
                      <div key={date} className="flex justify-between items-center">
                        <span className="text-sm">{date}</span>
                        <Badge variant="outline">{count} items</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Topics Tab - Placeholder for real data */}
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <Brain className="w-12 h-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Topic Analysis</h3>
                  <p className="text-gray-600">
                    Topic analysis will be available when AI content analysis is implemented.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Tab - Placeholder for real data */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <MessageSquare className="w-12 h-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Sentiment Analysis</h3>
                  <p className="text-gray-600">
                    Sentiment analysis will be available when AI content analysis is implemented.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 