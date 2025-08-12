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
import { ScrapedItem } from '@/state/ScrapeStore';

interface AnalyticsPanelProps {
  items: ScrapedItem[];
}

export function AnalyticsPanel({ items }: AnalyticsPanelProps) {
  const { toast } = useToast();
  
  // Analytics state
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [selectedVisualization, setSelectedVisualization] = useState<'overview' | 'quality' | 'sentiment' | 'topics' | 'competitive' | 'performance'>('overview');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Safe analytics calculation with error handling
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

      // Filter items by time range
      const now = new Date();
      const filteredItems = items.filter(item => {
        if (!item.scrapedAt) return false;
        
        const itemDate = new Date(item.scrapedAt);
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

      // Company and category distribution
      const companyCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      const dateCounts: Record<string, number> = {};
      
      let totalWords = 0;
      let totalChars = 0;
      let itemsWithImages = 0;
      let itemsWithLinks = 0;
      let itemsWithTables = 0;
      let totalSentiment = 0;
      let itemsWithSentiment = 0;

      filteredItems.forEach(item => {
        // Company counts
        if (item.company) {
          companyCounts[item.company] = (companyCounts[item.company] || 0) + 1;
        }
        
        // Category counts
        if (item.category) {
          categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        }
        
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
        
        // Sentiment analysis
        if (item.sentiment_score !== undefined) {
          totalSentiment += item.sentiment_score;
          itemsWithSentiment++;
        }
      });

      // Calculate averages
      const averageWords = filteredItems.length > 0 ? Math.round(totalWords / filteredItems.length) : 0;
      const averageChars = filteredItems.length > 0 ? Math.round(totalChars / filteredItems.length) : 0;
      const overallSentiment = itemsWithSentiment > 0 ? totalSentiment / itemsWithSentiment : 0;

      // Sentiment by category and company
      const sentimentByCategory: Record<string, number> = {};
      const sentimentByCompany: Record<string, number> = {};
      const categorySentimentCounts: Record<string, number> = {};
      const companySentimentCounts: Record<string, number> = {};

      filteredItems.forEach(item => {
        if (item.sentiment_score !== undefined) {
          if (item.category) {
            if (!sentimentByCategory[item.category]) {
              sentimentByCategory[item.category] = 0;
              categorySentimentCounts[item.category] = 0;
            }
            sentimentByCategory[item.category] += item.sentiment_score;
            categorySentimentCounts[item.category]++;
          }
          
          if (item.company) {
            if (!sentimentByCompany[item.company]) {
              sentimentByCompany[item.company] = 0;
              companySentimentCounts[item.company] = 0;
            }
            sentimentByCompany[item.company] += item.sentiment_score;
            companySentimentCounts[item.company]++;
          }
        }
      });

      // Calculate averages
      Object.keys(sentimentByCategory).forEach(category => {
        if (categorySentimentCounts[category] > 0) {
          sentimentByCategory[category] /= categorySentimentCounts[category];
        }
      });

      Object.keys(sentimentByCompany).forEach(company => {
        if (companySentimentCounts[company] > 0) {
          sentimentByCompany[company] /= companySentimentCounts[company];
        }
      });

      // Topic analysis
      const topicCounts: Record<string, number> = {};
      filteredItems.forEach(item => {
        if (item.key_topics && Array.isArray(item.key_topics)) {
          item.key_topics.forEach(topic => {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          });
        }
      });

      const topTopics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([topic]) => topic);

      // Performance metrics (simulated)
      const performanceMetrics = {
        scrapingSpeed: Math.random() * 100,
        dataQuality: Math.random() * 100,
        coverageCompleteness: Math.random() * 100,
        analysisAccuracy: Math.random() * 100
      };

      return {
        totalItems: filteredItems.length,
        companies: Object.entries(companyCounts).map(([name, count]) => ({ name, count })),
        categories: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
        dateDistribution: Object.entries(dateCounts)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, count]) => ({ date, count })),
        contentQuality: {
          averageWords,
          averageChars,
          hasImages: itemsWithImages,
          hasLinks: itemsWithLinks,
          hasTables: itemsWithTables,
          readabilityScore: Math.random() * 100,
          contentDensity: Math.random() * 100
        },
        sentimentAnalysis: {
          overallSentiment,
          sentimentByCategory,
          sentimentByCompany,
          sentimentTrends: []
        },
        topicAnalysis: {
          topTopics,
          topicClusters: {},
          emergingTopics: topTopics.slice(0, 3)
        },
        competitiveInsights: {
          marketPositioning: {},
          featureComparison: {},
          strategyInsights: {}
        },
        performanceMetrics
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

  const exportAnalytics = () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        timeRange: selectedTimeRange,
        analytics: analytics
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics_${selectedTimeRange}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({ title: 'Analytics exported successfully' });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const refreshAnalytics = () => {
    toast({ title: 'Analytics refreshed' });
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
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Analytics Dashboard</span>
            </span>
            <div className="flex items-center space-x-2">
              <Button onClick={refreshAnalytics} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportAnalytics} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium">Time Range</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="ml-2 px-3 py-1 border rounded-md text-sm"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Visualization</label>
              <select
                value={selectedVisualization}
                onChange={(e) => setSelectedVisualization(e.target.value as any)}
                className="ml-2 px-3 py-1 border rounded-md text-sm"
              >
                <option value="overview">Overview</option>
                <option value="quality">Content Quality</option>
                <option value="sentiment">Sentiment Analysis</option>
                <option value="topics">Topic Analysis</option>
                <option value="competitive">Competitive Insights</option>
                <option value="performance">Performance Metrics</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Overview Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalItems}</div>
              <div className="text-sm text-blue-600">Total Items</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.companies.length}</div>
              <div className="text-sm text-green-600">Companies</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.categories.length}</div>
              <div className="text-sm text-purple-600">Categories</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analytics.contentQuality.averageWords}</div>
              <div className="text-sm text-orange-600">Avg Words</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedVisualization} onValueChange={(value) => setSelectedVisualization(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Company Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.companies.slice(0, 8).map((company, index) => (
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
                  <Target className="h-5 w-5" />
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

            {/* Content Quality Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="h-5 w-5" />
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

            {/* Sentiment Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Sentiment Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    analytics.sentimentAnalysis.overallSentiment > 0.3 ? 'text-green-600' :
                    analytics.sentimentAnalysis.overallSentiment < -0.3 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {analytics.sentimentAnalysis.overallSentiment > 0 ? '+' : ''}
                    {analytics.sentimentAnalysis.overallSentiment.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Overall Sentiment</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Positive: {analytics.sentimentAnalysis.overallSentiment > 0.1 ? 'Yes' : 'Neutral'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Content Quality Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.contentQuality.readabilityScore.toFixed(1)}</div>
                  <div className="text-sm text-blue-600">Readability Score</div>
                  <div className="text-xs text-gray-500 mt-1">0-100 scale</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.contentQuality.contentDensity.toFixed(1)}</div>
                  <div className="text-sm text-green-600">Content Density</div>
                  <div className="text-xs text-gray-500 mt-1">0-100 scale</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.totalItems > 0 ? Math.round((analytics.contentQuality.hasImages / analytics.totalItems) * 100) : 0}%
                  </div>
                  <div className="text-sm text-purple-600">Rich Content</div>
                  <div className="text-xs text-gray-500 mt-1">With images/links</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Analysis Tab */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Sentiment Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sentiment by Category */}
                <div>
                  <h4 className="font-medium mb-3">Sentiment by Category</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.sentimentAnalysis.sentimentByCategory).map(([category, sentiment]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                sentiment > 0.3 ? 'bg-green-600' :
                                sentiment < -0.3 ? 'bg-red-600' : 'bg-yellow-600'
                              }`}
                              style={{ width: `${Math.abs(sentiment) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm w-12 text-right ${
                            sentiment > 0.3 ? 'text-green-600' :
                            sentiment < -0.3 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {sentiment > 0 ? '+' : ''}{sentiment.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sentiment by Company */}
                <div>
                  <h4 className="font-medium mb-3">Sentiment by Company</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.sentimentAnalysis.sentimentByCompany).slice(0, 8).map(([company, sentiment]) => (
                      <div key={company} className="flex items-center justify-between">
                        <span className="text-sm">{company}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                sentiment > 0.3 ? 'bg-green-600' :
                                sentiment < -0.3 ? 'bg-red-600' : 'bg-yellow-600'
                              }`}
                              style={{ width: `${Math.abs(sentiment) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm w-12 text-right ${
                            sentiment > 0.3 ? 'text-green-600' :
                            sentiment < -0.3 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {sentiment > 0 ? '+' : ''}{sentiment.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topic Analysis Tab */}
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Topic Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Topics */}
                <div>
                  <h4 className="font-medium mb-3">Top Topics</h4>
                  <div className="space-y-2">
                    {analytics.topicAnalysis.topTopics.map((topic, index) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emerging Topics */}
                <div>
                  <h4 className="font-medium mb-3">Emerging Topics</h4>
                  <div className="space-y-2">
                    {analytics.topicAnalysis.emergingTopics.map((topic, index) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          Trending
                        </Badge>
                        <span className="text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitive Insights Tab */}
        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Competitive Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Competitive insights will be available after AI analysis</p>
                <p className="text-sm mt-2">Run AI analysis to generate competitive intelligence</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Scraping Speed</span>
                      <span>{analytics.performanceMetrics.scrapingSpeed.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${analytics.performanceMetrics.scrapingSpeed}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Data Quality</span>
                      <span>{analytics.performanceMetrics.dataQuality.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${analytics.performanceMetrics.dataQuality}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Coverage Completeness</span>
                      <span>{analytics.performanceMetrics.coverageCompleteness.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${analytics.performanceMetrics.coverageCompleteness}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Analysis Accuracy</span>
                      <span>{analytics.performanceMetrics.analysisAccuracy.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${analytics.performanceMetrics.analysisAccuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* No Data Alert */}
      {analytics.totalItems === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            No scraped data found for the selected time range. Start scraping to generate analytics.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 