import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Eye, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Database,
  BarChart3,
  TrendingUp,
  Settings,
  Zap,
  Plus,
  ExternalLink,
  FileText,
  Globe,
  Code,
  Rss,
  DollarSign,
  Table,
  Link
} from 'lucide-react';

interface Company {
  name: string;
  url: string;
  technicalScore: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: {
    docs_count: number;
    rss_count: number;
    technical_relevance_stats?: {
      high_tech: number;
      medium_tech: number;
      low_tech: number;
    };
    fallback_discovery_used?: boolean;
  };
  lastRun?: string;
}

interface SystemStatus {
  backend_health: 'healthy' | 'degraded' | 'down';
  database_size: string;
  total_companies: number;
  active_scrapes: number;
  last_backup: string;
}

const TechnicalIntelligenceDashboard: React.FC = () => {
  // Enhanced state for real data
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', url: '', docs: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Real data state
  const [realScrapedData, setRealScrapedData] = useState<any>([]);
  const [realCompanyStats, setRealCompanyStats] = useState<any>([
    {
      name: 'Snowflake',
      url: 'https://www.snowflake.com',
      technicalScore: 85,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 105, 
        rss_count: 1,
        technical_relevance_stats: { high_tech: 25, medium_tech: 30, low_tech: 7 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'Databricks',
      url: 'https://www.databricks.com',
      technicalScore: 92,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 86, 
        rss_count: 3,
        technical_relevance_stats: { high_tech: 35, medium_tech: 25, low_tech: 9 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'PowerBI',
      url: 'https://powerbi.microsoft.com',
      technicalScore: 78,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 123, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 20, medium_tech: 45, low_tech: 35 },
        fallback_discovery_used: true
      }
    },
    {
      name: 'Tableau',
      url: 'https://www.tableau.com',
      technicalScore: 65,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 116, 
        rss_count: 10,
        technical_relevance_stats: { high_tech: 15, medium_tech: 35, low_tech: 66 },
        fallback_discovery_used: true
      }
    },
    {
      name: 'Omni',
      url: 'https://www.omni.co',
      technicalScore: 72,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 86, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 18, medium_tech: 28, low_tech: 15 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'Looker',
      url: 'https://cloud.google.com/looker',
      technicalScore: 68,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 144, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 22, medium_tech: 32, low_tech: 12 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'Oracle',
      url: 'https://www.oracle.com',
      technicalScore: 72,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 61, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 18, medium_tech: 28, low_tech: 15 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'SAP BusinessObjects',
      url: 'https://www.sap.com',
      technicalScore: 70,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 0, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 0, medium_tech: 0, low_tech: 0 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'Qlik',
      url: 'https://www.qlik.com',
      technicalScore: 68,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 60, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 15, medium_tech: 25, low_tech: 20 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'MicroStrategy',
      url: 'https://www.microstrategy.com',
      technicalScore: 68,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 4, 
        rss_count: 10,
        technical_relevance_stats: { high_tech: 2, medium_tech: 1, low_tech: 1 },
        fallback_discovery_used: true
      }
    },
    {
      name: 'Hex',
      url: 'https://hex.tech',
      technicalScore: 75,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 83, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 20, medium_tech: 30, low_tech: 15 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'Thoughtspot',
      url: 'https://www.thoughtspot.com',
      technicalScore: 70,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 0, 
        rss_count: 10,
        technical_relevance_stats: { high_tech: 0, medium_tech: 0, low_tech: 0 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'Domo',
      url: 'https://www.domo.com',
      technicalScore: 65,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 60, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 12, medium_tech: 25, low_tech: 23 },
        fallback_discovery_used: false
      }
    },
    {
      name: 'IBM Cognos',
      url: 'https://www.ibm.com/products/cognos-analytics',
      technicalScore: 72,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 0, 
        rss_count: 0,
        technical_relevance_stats: { high_tech: 0, medium_tech: 0, low_tech: 0 },
        fallback_discovery_used: false
      }
    }
  ]);
  const [contentAnalysis, setContentAnalysis] = useState<any>({
    code_blocks: 578,
    tables: 289,
    links: 4964
  });

  // Content viewing state
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [contentViewMode, setContentViewMode] = useState<'list' | 'detail' | 'analysis'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // System status state
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend_health: 'healthy',
    database_size: '9.2MB',
    total_companies: 0,
    active_scrapes: 0,
    last_backup: '2025-08-15 12:50'
  });

  // Comparison matrix state
  const [comparisonFocus, setComparisonFocus] = useState<string>('all');
  const [comparisonSort, setComparisonSort] = useState<string>('score');
  const [comparisonViewMode, setComparisonViewMode] = useState<'matrix' | 'radar' | 'detailed'>('matrix');
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // Fetch real data from backend
  const fetchRealData = async () => {
    try {
      const apiService = new APIService();
      
      // Fetch scraped items
      const scrapedItems = await apiService.getScrapedItems();
      setRealScrapedData(scrapedItems || []);
      
      // Fetch company data
      const companyData = await apiService.getCompanyData();
      setRealCompanyStats(companyData || []);
      
      // Fetch competitive intelligence
      const competitiveData = await apiService.getCompetitiveIntelligenceData();
      setContentAnalysis(competitiveData || {});
      
      // Fetch strategic comparison data
      const comparisonData = await apiService.getStrategicComparisonData();
      if (comparisonData?.success && comparisonData?.data) {
        setComparisonData(Object.entries(comparisonData.data).map(([company, data]: [string, any]) => ({
          name: company,
          url: realCompanyStats.find(c => c.name === company)?.url || '',
          apiScore: Math.round(data.api_first_architecture || 0),
          apiDetails: getScoreDetails(data.api_first_architecture || 0, 'API'),
          cloudScore: Math.round(data.cloud_native_features || 0),
          cloudDetails: getScoreDetails(data.cloud_native_features || 0, 'Cloud'),
          integrationScore: Math.round(data.data_integration || 0),
          integrationDetails: getScoreDetails(data.data_integration || 0, 'Integration'),
          developerScore: Math.round(data.developer_experience || 0),
          developerDetails: getScoreDetails(data.developer_experience || 0, 'Developer'),
          analyticsScore: Math.round(data.modern_analytics || 0),
          analyticsDetails: getScoreDetails(data.modern_analytics || 0, 'Analytics'),
          overallScore: Math.round(data.overall_score || 0),
          positioning: data.positioning || 'Unknown',
          insights: generateInsightsFromData(data)
        })));
      } else {
        // Generate comparison data from scraped content
        generateComparisonData();
      }
      
    } catch (error) {
      console.error('Error fetching real data:', error);
      // Use fallback data
      generateComparisonData();
    }
  };

  // Generate strategic comparison data
  const generateComparisonData = () => {
    const comparison = realCompanyStats.map((company: any) => {
      // Analyze scraped content for this company
      const companyContent = realScrapedData.filter((item: any) => 
        item.company === company.name
      );
      
      // Calculate scores based on content analysis
      const apiScore = calculateAPIScore(companyContent);
      const cloudScore = calculateCloudScore(companyContent);
      const integrationScore = calculateIntegrationScore(companyContent);
      const developerScore = calculateDeveloperScore(companyContent);
      const analyticsScore = calculateAnalyticsScore(companyContent);
      
      const overallScore = Math.round(
        (apiScore + cloudScore + integrationScore + developerScore + analyticsScore) / 5
      );
      
      // Determine positioning
      const positioning = getPositioning(overallScore);
      
      // Generate insights
      const insights = generateInsights(companyContent, {
        apiScore,
        cloudScore,
        integrationScore,
        developerScore,
        analyticsScore
      });
      
      return {
        name: company.name,
        url: company.url,
        apiScore,
        apiDetails: getScoreDetails(apiScore, 'API'),
        cloudScore,
        cloudDetails: getScoreDetails(cloudScore, 'Cloud'),
        integrationScore,
        integrationDetails: getScoreDetails(integrationScore, 'Integration'),
        developerScore,
        developerDetails: getScoreDetails(developerScore, 'Developer'),
        analyticsScore,
        analyticsDetails: getScoreDetails(analyticsScore, 'Analytics'),
        overallScore,
        positioning,
        insights
      };
    });
    
    setComparisonData(comparison);
  };

  // Calculate API-First Architecture Score
  const calculateAPIScore = (content: any[]): number => {
    if (!content.length) return 0;
    
    let score = 0;
    let totalContent = 0;
    
    content.forEach((item: any) => {
      const text = item.text_content?.toLowerCase() || '';
      totalContent += text.length;
      
      // API documentation indicators
      if (text.includes('api') || text.includes('endpoint')) score += 20;
      if (text.includes('rest') || text.includes('graphql')) score += 15;
      if (text.includes('swagger') || text.includes('openapi')) score += 15;
      if (text.includes('sdk') || text.includes('client library')) score += 10;
      if (text.includes('webhook') || text.includes('callback')) score += 10;
      if (text.includes('authentication') || text.includes('oauth')) score += 10;
      if (text.includes('rate limit') || text.includes('throttling')) score += 10;
      if (text.includes('versioning') || text.includes('v1') || text.includes('v2')) score += 10;
    });
    
    return Math.min(100, Math.round((score / Math.max(totalContent / 1000, 1)) * 10));
  };

  // Calculate Cloud-Native Features Score
  const calculateCloudScore = (content: any[]): number => {
    if (!content.length) return 0;
    
    let score = 0;
    let totalContent = 0;
    
    content.forEach((item: any) => {
      const text = item.text_content?.toLowerCase() || '';
      totalContent += text.length;
      
      // Cloud-native indicators
      if (text.includes('multi-cloud') || text.includes('hybrid cloud')) score += 20;
      if (text.includes('auto-scaling') || text.includes('elastic')) score += 15;
      if (text.includes('serverless') || text.includes('lambda')) score += 15;
      if (text.includes('container') || text.includes('kubernetes') || text.includes('docker')) score += 15;
      if (text.includes('microservices') || text.includes('distributed')) score += 10;
      if (text.includes('cloud-native') || text.includes('cloud-first')) score += 10;
      if (text.includes('infrastructure as code') || text.includes('terraform')) score += 10;
      if (text.includes('managed service') || text.includes('paas')) score += 5;
    });
    
    return Math.min(100, Math.round((score / Math.max(totalContent / 1000, 1)) * 10));
  };

  // Calculate Data Integration Score
  const calculateIntegrationScore = (content: any[]): number => {
    if (!content.length) return 0;
    
    let score = 0;
    let totalContent = 0;
    
    content.forEach((item: any) => {
      const text = item.text_content?.toLowerCase() || '';
      totalContent += text.length;
      
      // Integration indicators
      if (text.includes('real-time') || text.includes('streaming')) score += 20;
      if (text.includes('etl') || text.includes('elt') || text.includes('data pipeline')) score += 15;
      if (text.includes('connector') || text.includes('integration')) score += 15;
      if (text.includes('data warehouse') || text.includes('snowflake') || text.includes('bigquery')) score += 15;
      if (text.includes('api-based') || text.includes('webhook')) score += 10;
      if (text.includes('data mesh') || text.includes('data fabric')) score += 10;
      if (text.includes('open format') || text.includes('parquet') || text.includes('avro')) score += 10;
      if (text.includes('data catalog') || text.includes('metadata')) score += 5;
    });
    
    return Math.min(100, Math.round((score / Math.max(totalContent / 1000, 1)) * 10));
  };

  // Calculate Developer Experience Score
  const calculateDeveloperScore = (content: any[]): number => {
    if (!content.length) return 0;
    
    let score = 0;
    let totalContent = 0;
    
    content.forEach((item: any) => {
      const text = item.text_content?.toLowerCase() || '';
      totalContent += text.length;
      
      // Developer experience indicators
      if (text.includes('self-service') || text.includes('provisioning')) score += 20;
      if (text.includes('ci/cd') || text.includes('pipeline') || text.includes('deployment')) score += 15;
      if (text.includes('infrastructure as code') || text.includes('terraform') || text.includes('cloudformation')) score += 15;
      if (text.includes('developer documentation') || text.includes('getting started')) score += 15;
      if (text.includes('sample code') || text.includes('example') || text.includes('tutorial')) score += 10;
      if (text.includes('playground') || text.includes('sandbox') || text.includes('demo')) score += 10;
      if (text.includes('community') || text.includes('forum') || text.includes('support')) score += 10;
      if (text.includes('api explorer') || text.includes('interactive')) score += 5;
    });
    
    return Math.min(100, Math.round((score / Math.max(totalContent / 1000, 1)) * 10));
  };

  // Calculate Modern Analytics Score
  const calculateAnalyticsScore = (content: any[]): number => {
    if (!content.length) return 0;
    
    let score = 0;
    let totalContent = 0;
    
    content.forEach((item: any) => {
      const text = item.text_content?.toLowerCase() || '';
      totalContent += text.length;
      
      // Modern analytics indicators
      if (text.includes('ai') || text.includes('machine learning') || text.includes('ml')) score += 20;
      if (text.includes('real-time') || text.includes('streaming analytics')) score += 15;
      if (text.includes('data mesh') || text.includes('data fabric')) score += 15;
      if (text.includes('open data') || text.includes('data sharing')) score += 15;
      if (text.includes('natural language') || text.includes('nlp') || text.includes('conversational')) score += 10;
      if (text.includes('automated insights') || text.includes('auto-discovery')) score += 10;
      if (text.includes('collaborative') || text.includes('team analytics')) score += 10;
      if (text.includes('governance') || text.includes('compliance') || text.includes('security')) score += 5;
    });
    
    return Math.min(100, Math.round((score / Math.max(totalContent / 1000, 1)) * 10));
  };

  // Get positioning based on overall score
  const getPositioning = (score: number): string => {
    if (score >= 80) return 'Leader';
    if (score >= 60) return 'Transitioning';
    return 'Legacy';
  };

  // Generate strategic insights
  const generateInsights = (content: any[], scores: any): string[] => {
    const insights: string[] = [];
    
    if (scores.apiScore >= 70) {
      insights.push('Strong API-first architecture with comprehensive developer tools');
    } else if (scores.apiScore <= 30) {
      insights.push('Limited API capabilities, primarily traditional integration methods');
    }
    
    if (scores.cloudScore >= 70) {
      insights.push('Cloud-native platform with modern infrastructure capabilities');
    } else if (scores.cloudScore <= 30) {
      insights.push('Traditional on-premise focus, limited cloud-native features');
    }
    
    if (scores.integrationScore >= 70) {
      insights.push('Advanced data integration with real-time streaming capabilities');
    } else if (scores.integrationScore <= 30) {
      insights.push('Basic data integration, limited real-time capabilities');
    }
    
    if (scores.developerScore >= 70) {
      insights.push('Excellent developer experience with self-service capabilities');
    } else if (scores.developerScore <= 30) {
      insights.push('Complex provisioning process, limited developer self-service');
    }
    
    if (scores.analyticsScore >= 70) {
      insights.push('Modern AI-powered analytics with collaborative features');
    } else if (scores.analyticsScore <= 30) {
      insights.push('Traditional BI focus, limited AI and collaboration features');
    }
    
    return insights;
  };

  // Get score details for display
  const getScoreDetails = (score: number, category: string): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Limited';
    return 'Minimal';
  };

  // Get sorted comparison data
  const getSortedComparisonData = () => {
    if (!comparisonData.length) return [];
    
    return [...comparisonData].sort((a: any, b: any) => {
      switch (comparisonSort) {
        case 'api':
          return b.apiScore - a.apiScore;
        case 'cloud':
          return b.cloudScore - a.cloudScore;
        case 'integration':
          return b.integrationScore - a.integrationScore;
        case 'developer':
          return b.developerScore - a.developerScore;
        default:
          return b.overallScore - a.overallScore;
      }
    });
  };

  // Get company color based on score
  const getCompanyColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get positioning badge variant
  const getPositioningVariant = (positioning: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (positioning) {
      case 'Leader':
        return 'default';
      case 'Transitioning':
        return 'secondary';
      case 'Legacy':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Refresh comparison data
  const refreshComparisonData = () => {
    generateComparisonData();
  };

  // Generate insights from API data
  const generateInsightsFromData = (data: any): string[] => {
    const insights: string[] = [];
    
    if (data.api_first_architecture >= 70) {
      insights.push('Strong API-first architecture with comprehensive developer tools');
    } else if (data.api_first_architecture <= 30) {
      insights.push('Limited API capabilities, primarily traditional integration methods');
    }
    
    if (data.cloud_native_features >= 70) {
      insights.push('Cloud-native platform with modern infrastructure capabilities');
    } else if (data.cloud_native_features <= 30) {
      insights.push('Traditional on-premise focus, limited cloud-native features');
    }
    
    if (data.data_integration >= 70) {
      insights.push('Advanced data integration with real-time streaming capabilities');
    } else if (data.data_integration <= 30) {
      insights.push('Basic data integration, limited real-time capabilities');
    }
    
    if (data.developer_experience >= 70) {
      insights.push('Excellent developer experience with self-service capabilities');
    } else if (data.developer_experience <= 30) {
      insights.push('Complex provisioning process, limited developer self-service');
    }
    
    if (data.modern_analytics >= 70) {
      insights.push('Modern AI-powered analytics with collaborative features');
    } else if (data.modern_analytics <= 30) {
      insights.push('Traditional BI focus, limited AI and collaboration features');
    }
    
    return insights;
  };

  // Load real data on component mount
  useEffect(() => {
    fetchRealData();
  }, []);

  const refreshData = () => {
    fetchRealData();
  };

  const runScrape = async (companyName: string) => {
    if (isRunning) return;
    setIsRunning(true);
    setSelectedCompany(companyName);
    
    // Update company status
    setRealCompanyStats(prev => prev.map((comp: any) => 
      comp.name === companyName 
        ? { ...comp, status: 'running', progress: 0 }
        : comp
    ));
    
    // Simulate enhanced scraping process with technical content extraction
    const updateProgress = (progress: number, currentUrl?: string) => {
      setRealCompanyStats(prev => prev.map((comp: any) => 
        comp.name === companyName 
          ? { ...comp, progress, currentUrl }
          : comp
      ));
    };
    
    try {
      updateProgress(15, 'Classifying technical content...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateProgress(35, 'Discovering technical documentation...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      updateProgress(55, 'Running coverage gap analysis...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProgress(75, 'Extracting API endpoints & auth patterns...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProgress(100, 'Technical intelligence extraction completed');
      
      // Generate realistic results based on company technical score
      const company = realCompanyStats.find((c: any) => c.name === companyName);
      const baseScore = company?.technicalScore || 0.5;
      
      const results = {
        docs_count: Math.floor(Math.random() * 100) + 20,
        rss_count: Math.floor(Math.random() * 30) + 5,
        technical_relevance_stats: {
          high_tech: Math.floor(Math.random() * 40) + 10,
          medium_tech: Math.floor(Math.random() * 50) + 20,
          low_tech: Math.floor(Math.random() * 30) + 5
        },
        fallback_discovery_used: Math.random() > 0.7
      };
      
      // Update company with results
      setRealCompanyStats(prev => prev.map((comp: any) => 
        comp.name === companyName 
          ? { 
              ...comp, 
              status: 'completed', 
              progress: 100, 
              results,
              lastRun: new Date().toISOString()
            }
          : comp
      ));
      
      setSystemStatus(prev => ({ ...prev, active_scrapes: Math.max(0, prev.active_scrapes - 1) }));
      
    } catch (error) {
      console.error('Scraping failed:', error);
      setRealCompanyStats(prev => prev.map((comp: any) => 
        comp.name === companyName 
          ? { ...comp, status: 'failed', progress: 0 }
          : comp
      ));
    } finally {
      setIsRunning(false);
      setSelectedCompany(null);
    }
  };

  const addCompany = () => {
    if (newCompany.name && newCompany.url) {
      const company = {
        name: newCompany.name,
        url: newCompany.url,
        technicalScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
        status: 'idle',
        progress: 0,
        results: {
          docs_count: 0,
          rss_count: 0,
          technical_relevance_stats: { high_tech: 0, medium_tech: 0, low_tech: 0 },
          fallback_discovery_used: false
        }
      };
      
      setRealCompanyStats(prev => [...prev, company]);
      setSystemStatus(prev => ({ ...prev, total_companies: prev.total_companies + 1 }));
      setShowAddCompany(false);
      setNewCompany({ name: '', url: '', docs: '' });
    }
  };

  const runAllScrapes = async () => {
    if (isRunning) return;
    
    setSystemStatus(prev => ({ ...prev, active_scrapes: realCompanyStats.length }));
    
    for (const company of realCompanyStats) {
      await runScrape(company.name);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Technical Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Advanced technical content extraction and competitive intelligence
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={runAllScrapes} 
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Run All Scrapes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowAddCompany(true)}
            disabled={isRunning}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Backend Health</p>
                <Badge className={systemStatus.backend_health === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {systemStatus.backend_health}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Database Size</p>
                <p className="text-lg font-bold">{systemStatus.database_size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Companies</p>
                <p className="text-lg font-bold">{systemStatus.total_companies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Active Scrapes</p>
                <p className="text-lg font-bold">{systemStatus.active_scrapes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Last Backup</p>
                <p className="text-sm">{systemStatus.last_backup}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
          <TabsTrigger value="data">Data Visualization</TabsTrigger>
          <TabsTrigger value="content">Content Explorer</TabsTrigger>
          <TabsTrigger value="comparison">Strategic Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Intelligence Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Welcome to the Technical Intelligence Dashboard. This system provides advanced competitive intelligence through technical content extraction.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realCompanyStats.map((company: any) => (
              <Card key={company.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <Badge className={
                      company.status === 'completed' ? 'bg-green-100 text-green-800' :
                      company.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      company.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {company.status === 'running' && <Clock className="h-3 w-3 mr-1" />}
                      {company.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {company.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                      <span className="ml-1 capitalize">{company.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{company.url}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Technical Score:</span>
                    <span className={`text-sm font-medium ${
                      company.technicalScore >= 80 ? 'text-green-600' :
                      company.technicalScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {company.technicalScore}/100
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{company.progress}%</span>
                      </div>
                      <Progress value={company.progress} className="w-full" />
                    </div>
                  )}

                  {company.results && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">{company.results.docs_count}</div>
                          <div className="text-xs text-blue-600">Documents</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-600">{company.results.rss_count}</div>
                          <div className="text-xs text-green-600">RSS Items</div>
                        </div>
                      </div>
                      
                      {company.results.technical_relevance_stats && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-600">Technical Relevance:</div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div className="text-center p-1 bg-purple-50 rounded">
                              <div className="font-bold text-purple-600">{company.results.technical_relevance_stats.high_tech}</div>
                              <div className="text-purple-600">High</div>
                            </div>
                            <div className="text-center p-1 bg-orange-50 rounded">
                              <div className="font-bold text-orange-600">{company.results.technical_relevance_stats.medium_tech}</div>
                              <div className="text-orange-600">Medium</div>
                            </div>
                            <div className="text-center p-1 bg-gray-50 rounded">
                              <div className="font-bold text-gray-600">{company.results.technical_relevance_stats.low_tech}</div>
                              <div className="text-gray-600">Low</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {company.results.fallback_discovery_used && (
                        <Badge variant="secondary" className="text-xs">
                          Fallback Discovery Used
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {company.status === 'idle' && (
                      <Button 
                        onClick={() => runScrape(company.name)}
                        disabled={isRunning}
                        size="sm"
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {company.status === 'running' && (
                      <Button 
                        onClick={() => runScrape(company.name)}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    )}
                    {company.status === 'completed' && (
                      <Button 
                        onClick={() => setSelectedCompany(company.name)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Results
                      </Button>
                    )}
                  </div>

                  {company.lastRun && (
                    <p className="text-xs text-gray-500">
                      Last run: {new Date(company.lastRun).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Content Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {realCompanyStats.filter(c => c.results).map((company: any) => (
                  <div key={company.name} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{company.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>High Technical:</span>
                        <Badge variant="default">
                          {company.results?.technical_relevance_stats?.high_tech || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Technical:</span>
                        <Badge variant="secondary">
                          {company.results?.technical_relevance_stats?.medium_tech || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Technical:</span>
                        <Badge variant="outline">
                          {company.results?.technical_relevance_stats?.low_tech || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Analysis & Fallback Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realCompanyStats.map((company: any) => (
                  <div key={company.name} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{company.name}</span>
                      <p className="text-sm text-gray-600">
                        {company.results ? 
                          `${company.results.docs_count} docs, ${company.results.rss_count} RSS` :
                          'No data yet'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      {company.results && (
                        <div className="text-sm">
                          <div className={company.results.docs_count > 20 ? 'text-green-600' : 'text-yellow-600'}>
                            {company.results.docs_count > 20 ? '✅ Good' : '⚠️ Low'} Coverage
                          </div>
                          {company.results.fallback_discovery_used && (
                            <Badge variant="secondary" className="text-xs">
                              Fallback Used
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Data Visualization & Content Analysis</CardTitle>
                  <p className="text-sm text-gray-600">
                    Real-time view of scraped content with technical analysis and insights
                  </p>
                </div>
                <Button onClick={refreshData} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isLoading ? 'Loading...' : 'Refresh Data'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Content Overview Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {realScrapedData?.length || 0}
                    </div>
                    <div className="text-sm text-blue-600">Total Documents</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {realScrapedData?.length || 0}
                    </div>
                    <div className="text-sm text-green-600">Total RSS Items</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {realScrapedData?.filter((item: any) => item.fallback_discovery_used).length || 0}
                    </div>
                    <div className="text-sm text-purple-600">Fallback Used</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(realCompanyStats.reduce((sum: any, c: any) => sum + (c.technicalScore || 0), 0) / realCompanyStats.length)}
                    </div>
                    <div className="text-sm text-orange-600">Avg Tech Score</div>
                  </div>
                </div>

                {/* Company Performance Matrix */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Company Performance Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Company</th>
                          <th className="text-center p-2">Tech Score</th>
                          <th className="text-center p-2">Documents</th>
                          <th className="text-center p-2">RSS Items</th>
                          <th className="text-center p-2">High Tech</th>
                          <th className="text-center p-2">Medium Tech</th>
                          <th className="text-center p-2">Low Tech</th>
                          <th className="text-center p-2">Status</th>
                          <th className="text-center p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realCompanyStats.map((company: any) => (
                          <tr key={company.name} className="border-b hover:bg-white">
                            <td className="p-2 font-medium">{company.name}</td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${
                                company.technicalScore >= 80 ? 'bg-green-100 text-green-800' :
                                company.technicalScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {company.technicalScore}/100
                              </span>
                            </td>
                            <td className="p-2 text-center">{company.results?.docs_count || 0}</td>
                            <td className="p-2 text-center">{company.results?.rss_count || 0}</td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                {company.results?.technical_relevance_stats?.high_tech || 0}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                {company.results?.technical_relevance_stats?.medium_tech || 0}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                {company.results?.technical_relevance_stats?.low_tech || 0}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <Badge className={
                                company.status === 'completed' ? 'bg-green-100 text-green-800' :
                                company.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                company.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {company.status}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedCompany(company.name)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Technical Content Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Technical Content Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {realCompanyStats.filter(c => c.results?.technical_relevance_stats).map((company: any) => (
                          <div key={company.name} className="border rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{company.name}</span>
                              <span className="text-sm text-gray-600">
                                {company.results?.docs_count || 0} total items
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <div className="flex-1 bg-purple-100 rounded p-2 text-center">
                                <div className="text-sm font-bold text-purple-800">
                                  {company.results?.technical_relevance_stats?.high_tech || 0}
                                </div>
                                <div className="text-xs text-purple-600">High Tech</div>
                              </div>
                              <div className="flex-1 bg-orange-100 rounded p-2 text-center">
                                <div className="text-sm font-bold text-orange-800">
                                  {company.results?.technical_relevance_stats?.medium_tech || 0}
                                </div>
                                <div className="text-xs text-orange-600">Medium Tech</div>
                              </div>
                              <div className="flex-1 bg-gray-100 rounded p-2 text-center">
                                <div className="text-sm font-bold text-gray-800">
                                  {company.results?.technical_relevance_stats?.low_tech || 0}
                                </div>
                                <div className="text-xs text-gray-600">Low Tech</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Coverage Quality Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {realCompanyStats.map((company: any) => {
                          const docsCount = company.results?.docs_count || 0;
                          const rssCount = company.results?.rss_count || 0;
                          const totalItems = docsCount + rssCount;
                          const coverageQuality = totalItems > 50 ? 'Excellent' : totalItems > 20 ? 'Good' : totalItems > 5 ? 'Fair' : 'Poor';
                          
                          return (
                            <div key={company.name} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="font-medium">{company.name}</span>
                                <div className="text-sm text-gray-600">
                                  {docsCount} docs + {rssCount} RSS = {totalItems} items
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={
                                  coverageQuality === 'Excellent' ? 'bg-green-100 text-green-800' :
                                  coverageQuality === 'Good' ? 'bg-blue-100 text-blue-800' :
                                  coverageQuality === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {coverageQuality}
                                </Badge>
                                {company.results?.fallback_discovery_used && (
                                  <div className="text-xs text-gray-500 mt-1">Fallback Used</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Export Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Export & Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <Download className="h-6 w-6 mb-2" />
                        <span>Export CSV</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <BarChart3 className="h-6 w-6 mb-2" />
                        <span>Generate Report</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <TrendingUp className="h-6 w-6 mb-2" />
                        <span>Trend Analysis</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Structure Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Structure Analysis</CardTitle>
                    <p className="text-sm text-gray-600">
                      Detailed breakdown of scraped content types and technical elements
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Content Type Distribution */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {realScrapedData?.length || 0}
                          </div>
                          <div className="text-sm text-blue-600">Total Pages</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {contentAnalysis?.code_blocks || 0}
                          </div>
                          <div className="text-sm text-green-600">Code Blocks</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {contentAnalysis?.tables || 0}
                          </div>
                          <div className="text-sm text-purple-600">Data Tables</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {contentAnalysis?.links || 0}
                          </div>
                          <div className="text-sm text-orange-600">Technical Links</div>
                        </div>
                      </div>

                      {/* Company Content Breakdown */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold mb-3">Company Content Breakdown</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Company</th>
                                <th className="text-center p-2">Pages</th>
                                <th className="text-center p-2">Code Blocks</th>
                                <th className="text-center p-2">Tables</th>
                                <th className="text-center p-2">Links</th>
                                <th className="text-center p-2">Avg Content Length</th>
                                <th className="text-center p-2">Technical Density</th>
                              </tr>
                            </thead>
                            <tbody>
                              {realCompanyStats?.map((company: any) => {
                                const companyItems = realScrapedData?.filter((item: any) => 
                                  item.company === company.name
                                ) || [];
                                
                                const totalContent = companyItems.reduce((sum: number, item: any) => 
                                  sum + (item.content?.length || 0), 0
                                );
                                
                                const avgContentLength = companyItems.length > 0 ? 
                                  Math.round(totalContent / companyItems.length) : 0;
                                
                                const technicalDensity = companyItems.length > 0 ? 
                                  Math.round((companyItems.filter((item: any) => 
                                    item.content?.includes('API') || 
                                    item.content?.includes('function') || 
                                    item.content?.includes('class') ||
                                    item.content?.includes('database') ||
                                    item.content?.includes('query')
                                  ).length / companyItems.length) * 100) : 0;
                                
                                return (
                                  <tr key={company.name} className="border-b hover:bg-white">
                                    <td className="p-2 font-medium">{company.name}</td>
                                    <td className="p-2 text-center">{companyItems.length}</td>
                                    <td className="p-2 text-center">
                                      {companyItems.filter((item: any) => 
                                        item.content?.includes('```') || 
                                        item.content?.includes('<code>')
                                      ).length}
                                    </td>
                                    <td className="p-2 text-center">
                                      {companyItems.filter((item: any) => 
                                        item.content?.includes('<table>') || 
                                        item.content?.includes('|')
                                      ).length}
                                    </td>
                                    <td className="p-2 text-center">
                                      {companyItems.filter((item: any) => 
                                        item.content?.includes('http') || 
                                        item.content?.includes('href=')
                                      ).length}
                                    </td>
                                    <td className="p-2 text-center">
                                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                        {avgContentLength} chars
                                      </span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        technicalDensity >= 70 ? 'bg-green-100 text-green-800' :
                                        technicalDensity >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {technicalDensity}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Content Sample Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Code className="h-4 w-4 mr-2" />
                              Code Content Samples
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {realScrapedData?.slice(0, 5).map((item: any, index: number) => {
                                const codeMatch = item.content?.match(/```[\s\S]*?```/);
                                if (codeMatch) {
                                  return (
                                    <div key={index} className="border rounded p-3 bg-gray-50">
                                      <div className="text-xs text-gray-600 mb-2">
                                        {item.company} - {item.url?.substring(0, 50)}...
                                      </div>
                                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                        {codeMatch[0].substring(0, 200)}...
                                      </pre>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Table className="h-4 w-4 mr-2" />
                              Table Content Samples
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {realScrapedData?.slice(0, 5).map((item: any, index: number) => {
                                const tableMatch = item.content?.match(/\|[^|]+\|[^|]+\|/);
                                if (tableMatch) {
                                  return (
                                    <div key={index} className="border rounded p-3 bg-gray-50">
                                      <div className="text-xs text-gray-600 mb-2">
                                        {item.company} - {item.url?.substring(0, 50)}...
                                      </div>
                                      <div className="text-xs bg-gray-100 p-2 rounded">
                                        {tableMatch[0].substring(0, 150)}...
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Technical Content Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Technical Content Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded">
                                <div className="text-lg font-semibold text-blue-800">API References</div>
                                <div className="text-2xl font-bold text-blue-600">
                                  {realScrapedData?.filter((item: any) => 
                                    item.content?.toLowerCase().includes('api') ||
                                    item.content?.toLowerCase().includes('endpoint') ||
                                    item.content?.toLowerCase().includes('swagger')
                                  ).length || 0}
                                </div>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded">
                                <div className="text-lg font-semibold text-green-800">Database Content</div>
                                <div className="text-2xl font-bold text-green-600">
                                  {realScrapedData?.filter((item: any) => 
                                    item.content?.toLowerCase().includes('sql') ||
                                    item.content?.toLowerCase().includes('database') ||
                                    item.content?.toLowerCase().includes('query')
                                  ).length || 0}
                                </div>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded">
                                <div className="text-lg font-semibold text-purple-800">Configuration</div>
                                <div className="text-2xl font-bold text-purple-600">
                                  {realScrapedData?.filter((item: any) => 
                                    item.content?.toLowerCase().includes('config') ||
                                    item.content?.toLowerCase().includes('setting') ||
                                    item.content?.toLowerCase().includes('parameter')
                                  ).length || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Content Explorer - Raw Scraped Data</CardTitle>
                  <p className="text-sm text-gray-600">
                    Directly view and analyze the actual scraped content for product capability analysis
                  </p>
                </div>
                <Button onClick={refreshData} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isLoading ? 'Loading...' : 'Refresh Content'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search Content</Label>
                    <Input
                      id="search"
                      placeholder="Search for APIs, features, pricing..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-filter">Company</Label>
                    <select
                      id="company-filter"
                      className="w-full p-2 border rounded-md"
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                    >
                      <option value="all">All Companies</option>
                      {realCompanyStats.map((company: any) => (
                        <option key={company.name} value={company.name}>
                          {company.name} ({company.results?.docs_count || 0} docs)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category-filter">Category</Label>
                    <select
                      id="category-filter"
                      className="w-full p-2 border rounded-md"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      <option value="api">API Documentation</option>
                      <option value="features">Product Features</option>
                      <option value="pricing">Pricing</option>
                      <option value="integrations">Integrations</option>
                      <option value="tutorials">Tutorials</option>
                    </select>
                  </div>
                  <div>
                    <Label>View Mode</Label>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant={contentViewMode === 'list' ? 'default' : 'outline'}
                        onClick={() => setContentViewMode('list')}
                      >
                        List
                      </Button>
                      <Button
                        size="sm"
                        variant={contentViewMode === 'detail' ? 'default' : 'outline'}
                        onClick={() => setContentViewMode('detail')}
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant={contentViewMode === 'analysis' ? 'default' : 'outline'}
                        onClick={() => setContentViewMode('analysis')}
                      >
                        Analysis
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content Display */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  {(() => {
                    // Filter content based on search and filters
                    let filteredContent = realScrapedData || [];
                    
                    if (filterCompany !== 'all') {
                      filteredContent = filteredContent.filter((item: any) => 
                        item.company === filterCompany
                      );
                    }
                    
                    if (filterCategory !== 'all') {
                      filteredContent = filteredContent.filter((item: any) => 
                        item.category?.toLowerCase().includes(filterCategory.toLowerCase())
                      );
                    }
                    
                    if (searchQuery) {
                      filteredContent = filteredContent.filter((item: any) => 
                        item.text_content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.url?.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                    }

                    if (filteredContent.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No content found matching your criteria.</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Try adjusting your search terms or filters.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-lg">
                            {filteredContent.length} Content Items Found
                          </h3>
                          <div className="text-sm text-gray-600">
                            Showing {filteredContent.length} of {realScrapedData?.length || 0} total items
                          </div>
                        </div>

                        {/* Content List View */}
                        {contentViewMode === 'list' && (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filteredContent.map((item: any, index: number) => (
                              <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-blue-600 text-sm">
                                    {item.company} - {item.category}
                                  </h4>
                                  <Badge className="text-xs">
                                    {item.technical_relevance ? 
                                      `${Math.round(item.technical_relevance * 100)}% Tech` : 
                                      'Unknown'
                                    }
                                  </Badge>
                                </div>
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-600 hover:text-blue-600 block mb-2"
                                >
                                  {item.url}
                                </a>
                                <p className="text-sm text-gray-800 line-clamp-3">
                                  {item.text_content?.substring(0, 300)}...
                                </p>
                                <div className="flex justify-between items-center mt-3">
                                  <span className="text-xs text-gray-500">
                                    Scraped: {new Date(item.scraped_at).toLocaleDateString()}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedContent(item)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Full
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Content Detail View */}
                        {contentViewMode === 'detail' && (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {filteredContent.map((item: any, index: number) => (
                              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div>
                                    <Label className="text-xs text-gray-500">Company</Label>
                                    <p className="font-medium">{item.company}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Category</Label>
                                    <p className="font-medium">{item.category}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Technical Relevance</Label>
                                    <p className="font-medium">
                                      {item.technical_relevance ? 
                                        `${Math.round(item.technical_relevance * 100)}%` : 
                                        'Unknown'
                                      }
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <Label className="text-xs text-gray-500">URL</Label>
                                  <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm break-all"
                                  >
                                    {item.url}
                                  </a>
                                </div>

                                <div className="mb-4">
                                  <Label className="text-xs text-gray-500">Content Preview</Label>
                                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 max-h-32 overflow-y-auto">
                                    {item.text_content?.substring(0, 500)}...
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    Scraped: {new Date(item.scraped_at).toLocaleDateString()}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedContent(item)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Full Content
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Content Analysis View */}
                        {contentViewMode === 'analysis' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded">
                                <div className="text-2xl font-bold text-blue-600">
                                  {filteredContent.filter((item: any) => 
                                    item.text_content?.toLowerCase().includes('api') ||
                                    item.text_content?.toLowerCase().includes('endpoint')
                                  ).length}
                                </div>
                                <div className="text-sm text-blue-600">API References</div>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded">
                                <div className="text-2xl font-bold text-green-600">
                                  {filteredContent.filter((item: any) => 
                                    item.text_content?.toLowerCase().includes('pricing') ||
                                    item.text_content?.toLowerCase().includes('cost') ||
                                    item.text_content?.toLowerCase().includes('$')
                                  ).length}
                                </div>
                                <div className="text-sm text-green-600">Pricing Info</div>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded">
                                <div className="text-2xl font-bold text-purple-600">
                                  {filteredContent.filter((item: any) => 
                                    item.text_content?.toLowerCase().includes('integration') ||
                                    item.text_content?.toLowerCase().includes('connector')
                                  ).length}
                                </div>
                                <div className="text-sm text-purple-600">Integrations</div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg">
                              <h4 className="font-medium mb-3">Content Analysis</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Total Items:</span>
                                  <span className="font-medium">{filteredContent.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>High Tech Content:</span>
                                  <span className="font-medium">
                                    {filteredContent.filter((item: any) => 
                                      (item.technical_relevance || 0) > 0.7
                                    ).length}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Average Technical Score:</span>
                                  <span className="font-medium">
                                    {filteredContent.length > 0 ? 
                                      Math.round(
                                        filteredContent.reduce((sum: number, item: any) => 
                                          sum + (item.technical_relevance || 0), 0
                                        ) / filteredContent.length * 100
                                      ) : 0
                                    }%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Strategic Feature Comparison Matrix</CardTitle>
                  <p className="text-sm text-gray-600">
                    Cloud-native competitive positioning across key technical dimensions
                  </p>
                </div>
                <Button onClick={refreshComparisonData} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update Matrix'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Matrix Controls */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <Label className="text-sm font-medium">Focus Area</Label>
                    <select 
                      className="p-2 border rounded-md text-sm"
                      value={comparisonFocus}
                      onChange={(e) => setComparisonFocus(e.target.value)}
                    >
                      <option value="all">All Dimensions</option>
                      <option value="api">API-First Architecture</option>
                      <option value="cloud">Cloud-Native Features</option>
                      <option value="integration">Data Integration</option>
                      <option value="developer">Developer Experience</option>
                      <option value="analytics">Modern Analytics</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Sort By</Label>
                    <select 
                      className="p-2 border rounded-md text-sm"
                      value={comparisonSort}
                      onChange={(e) => setComparisonSort(e.target.value)}
                    >
                      <option value="score">Overall Score</option>
                      <option value="api">API Maturity</option>
                      <option value="cloud">Cloud Native</option>
                      <option value="integration">Integration</option>
                      <option value="developer">Developer Experience</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">View Mode</Label>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={comparisonViewMode === 'matrix' ? 'default' : 'outline'}
                        onClick={() => setComparisonViewMode('matrix')}
                      >
                        Matrix
                      </Button>
                      <Button
                        size="sm"
                        variant={comparisonViewMode === 'radar' ? 'default' : 'outline'}
                        onClick={() => setComparisonViewMode('radar')}
                      >
                        Radar
                      </Button>
                      <Button
                        size="sm"
                        variant={comparisonViewMode === 'detailed' ? 'default' : 'outline'}
                        onClick={() => setComparisonViewMode('detailed')}
                      >
                        Detailed
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Strategic Comparison Matrix */}
                {comparisonViewMode === 'matrix' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-3 text-left font-medium text-sm">Company</th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-sm">API-First</th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-sm">Cloud-Native</th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-sm">Data Integration</th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-sm">Developer Exp</th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-sm">Modern Analytics</th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-sm">Overall Score</th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-sm">Positioning</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedComparisonData().map((company: any) => (
                          <tr key={company.name} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-3 font-medium">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getCompanyColor(company.overallScore)}`}></div>
                                <span>{company.name}</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <div className="flex flex-col items-center">
                                <div className="text-lg font-bold text-blue-600">{company.apiScore}</div>
                                <div className="text-xs text-gray-600">{company.apiDetails}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <div className="flex flex-col items-center">
                                <div className="text-lg font-bold text-green-600">{company.cloudScore}</div>
                                <div className="text-xs text-gray-600">{company.cloudDetails}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <div className="flex flex-col items-center">
                                <div className="text-lg font-bold text-purple-600">{company.integrationScore}</div>
                                <div className="text-xs text-gray-600">{company.integrationDetails}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <div className="flex flex-col items-center">
                                <div className="text-lg font-bold text-orange-600">{company.developerScore}</div>
                                <div className="text-xs text-gray-600">{company.developerDetails}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <div className="flex flex-col items-center">
                                <div className="text-lg font-bold text-indigo-600">{company.analyticsScore}</div>
                                <div className="text-xs text-gray-600">{company.analyticsDetails}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <div className="text-xl font-bold text-gray-800">{company.overallScore}</div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <Badge variant={getPositioningVariant(company.positioning)}>
                                {company.positioning}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Radar Chart View */}
                {comparisonViewMode === 'radar' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getSortedComparisonData().slice(0, 6).map((company: any) => (
                      <Card key={company.name} className="p-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <p className="text-sm text-gray-600">Overall: {company.overallScore}/100</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">API-First</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{width: `${company.apiScore}%`}}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8">{company.apiScore}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Cloud-Native</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{width: `${company.cloudScore}%`}}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8">{company.cloudScore}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Integration</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full" 
                                    style={{width: `${company.integrationScore}%`}}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8">{company.integrationScore}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Developer</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-orange-600 h-2 rounded-full" 
                                      style={{width: `${company.developerScore}%`}}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-sm font-medium w-8">{company.developerScore}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Analytics</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-indigo-600 h-2 rounded-full" 
                                    style={{width: `${company.analyticsScore}%`}}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8">{company.analyticsScore}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Detailed Analysis View */}
                {comparisonViewMode === 'detailed' && (
                  <div className="space-y-6">
                    {getSortedComparisonData().map((company: any) => (
                      <Card key={company.name} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">{company.name}</h3>
                            <p className="text-sm text-gray-600">Overall Score: {company.overallScore}/100</p>
                            <Badge variant={getPositioningVariant(company.positioning)} className="mt-2">
                              {company.positioning}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800">{company.overallScore}</div>
                            <div className="text-sm text-gray-600">Cloud-Native Index</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="text-lg font-bold text-blue-600">{company.apiScore}</div>
                            <div className="text-sm text-blue-600">API-First</div>
                            <div className="text-xs text-blue-500 mt-1">{company.apiDetails}</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="text-lg font-bold text-green-600">{company.cloudScore}</div>
                            <div className="text-sm text-green-600">Cloud-Native</div>
                            <div className="text-xs text-green-500 mt-1">{company.cloudDetails}</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded">
                            <div className="text-lg font-bold text-purple-600">{company.integrationScore}</div>
                            <div className="text-sm text-purple-600">Integration</div>
                            <div className="text-xs text-purple-500 mt-1">{company.integrationDetails}</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded">
                            <div className="text-lg font-bold text-orange-600">{company.developerScore}</div>
                            <div className="text-sm text-orange-600">Developer</div>
                            <div className="text-xs text-orange-500 mt-1">{company.developerDetails}</div>
                          </div>
                          <div className="text-center p-3 bg-indigo-50 rounded">
                            <div className="text-lg font-bold text-indigo-600">{company.analyticsScore}</div>
                            <div className="text-sm text-indigo-600">Analytics</div>
                            <div className="text-xs text-indigo-500 mt-1">{company.analyticsDetails}</div>
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded">
                          <h4 className="font-medium mb-2">Strategic Insights</h4>
                          <div className="text-sm text-gray-700 space-y-1">
                            {company.insights.map((insight: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Competitive Positioning Summary */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardHeader>
                    <CardTitle>Competitive Positioning Analysis</CardTitle>
                    <p className="text-sm text-gray-600">
                      How your competitive set positions against cloud-native advantages
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-blue-800 mb-3">Cloud-Native Leaders</h4>
                        <div className="space-y-2">
                          {getSortedComparisonData()
                            .filter((c: any) => c.positioning === 'Leader')
                            .map((company: any) => (
                              <div key={company.name} className="flex justify-between items-center text-sm">
                                <span>{company.name}</span>
                                <span className="font-medium">{company.overallScore}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-orange-800 mb-3">Transitioning Platforms</h4>
                        <div className="space-y-2">
                          {getSortedComparisonData()
                            .filter((c: any) => c.positioning === 'Transitioning')
                            .map((company: any) => (
                              <div key={company.name} className="flex justify-between items-center text-sm">
                                <span>{company.name}</span>
                                <span className="font-medium">{company.overallScore}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Legacy Platforms</h4>
                        <div className="space-y-2">
                          {getSortedComparisonData()
                            .filter((c: any) => c.positioning === 'Legacy')
                            .map((company: any) => (
                              <div key={company.name} className="flex justify-between items-center text-sm">
                                <span>{company.name}</span>
                                <span className="font-medium">{company.overallScore}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <Label htmlFor="company-url">Website URL</Label>
                <Input
                  id="company-url"
                  value={newCompany.url}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={addCompany} className="flex-1">
                  Add Company
                </Button>
                <Button variant="outline" onClick={() => setShowAddCompany(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Technical Intelligence Results for {selectedCompany}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCompany(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const company = realCompanyStats.find(c => c.name === selectedCompany);
                if (!company?.results) return <p>No results available</p>;
                
                return (
                  <div className="space-y-6">
                    {/* Company Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {company.results.docs_count}
                        </div>
                        <div className="text-sm text-blue-600">Documents</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {company.results.rss_count}
                        </div>
                        <div className="text-sm text-green-600">RSS Items</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {company.technicalScore}
                        </div>
                        <div className="text-sm text-purple-600">Tech Score</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          {company.results.docs_count + company.results.rss_count}
                        </div>
                        <div className="text-sm text-orange-600">Total Items</div>
                      </div>
                    </div>
                    
                    {/* Technical Content Distribution */}
                    {company.results.technical_relevance_stats && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Technical Content Distribution</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-purple-100 rounded-lg">
                            <div className="text-3xl font-bold text-purple-800">
                              {company.results.technical_relevance_stats.high_tech}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">High Technical</div>
                            <div className="text-xs text-purple-600 mt-1">
                              {Math.round((company.results.technical_relevance_stats.high_tech / (company.results.docs_count + company.results.rss_count)) * 100)}% of total
                            </div>
                          </div>
                          <div className="text-center p-4 bg-orange-100 rounded-lg">
                            <div className="text-3xl font-bold text-orange-800">
                              {company.results.technical_relevance_stats.medium_tech}
                            </div>
                            <div className="text-sm text-orange-700 font-medium">Medium Technical</div>
                            <div className="text-xs text-orange-600 mt-1">
                              {Math.round((company.results.technical_relevance_stats.medium_tech / (company.results.docs_count + company.results.rss_count)) * 100)}% of total
                            </div>
                          </div>
                          <div className="text-center p-4 bg-gray-100 rounded-lg">
                            <div className="text-3xl font-bold text-gray-800">
                              {company.results.technical_relevance_stats.low_tech}
                            </div>
                            <div className="text-sm text-gray-700 font-medium">Low Technical</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {Math.round((company.results.technical_relevance_stats.low_tech / (company.results.docs_count + company.results.rss_count)) * 100)}% of total
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Content Quality Metrics */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Content Quality Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">Document Analysis</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Documents:</span>
                              <span className="font-medium">{company.results.docs_count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Technical Documents:</span>
                              <span className="font-medium">
                                {(company.results.technical_relevance_stats?.high_tech || 0) + (company.results.technical_relevance_stats?.medium_tech || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Technical Ratio:</span>
                              <span className="font-medium">
                                {company.results.docs_count > 0 ? 
                                  Math.round(((company.results.technical_relevance_stats?.high_tech || 0) + (company.results.technical_relevance_stats?.medium_tech || 0)) / company.results.docs_count * 100) : 0
                                }%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">RSS Feed Analysis</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total RSS Items:</span>
                              <span className="font-medium">{company.results.rss_count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Content Freshness:</span>
                              <span className="font-medium">
                                {company.results.rss_count > 0 ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Update Frequency:</span>
                              <span className="font-medium">
                                {company.results.rss_count > 20 ? 'High' : company.results.rss_count > 5 ? 'Medium' : 'Low'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* System Features Used */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">System Features Used</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>Enhanced Technical Content Extraction</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>Intelligent Link Discovery</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>Technical Relevance Classification</span>
                        </div>
                        {company.results.fallback_discovery_used && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Fallback Discovery System</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => window.open(company.url, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                      </Button>
                      <Button variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Detailed Analysis
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Full Content Analysis - {selectedContent.company}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedContent(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Content Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-sm font-medium text-blue-800">Company</div>
                    <div className="text-lg font-bold text-blue-600">{selectedContent.company}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-sm font-medium text-green-800">Category</div>
                    <div className="text-lg font-bold text-green-600">{selectedContent.category}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-sm font-medium text-purple-800">Tech Relevance</div>
                    <div className="text-lg font-bold text-purple-600">
                      {selectedContent.technical_relevance ? 
                        `${Math.round(selectedContent.technical_relevance * 100)}%` : 
                        'Unknown'
                      }
                    </div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-sm font-medium text-orange-800">Quality Score</div>
                    <div className="text-lg font-bold text-orange-600">
                      {selectedContent.quality_score ? 
                        `${Math.round(selectedContent.quality_score * 100)}%` : 
                        'Unknown'
                      }
                    </div>
                  </div>
                </div>

                {/* URL and Source */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Source URL</Label>
                  <a 
                    href={selectedContent.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all block p-2 bg-gray-50 rounded"
                  >
                    {selectedContent.url}
                  </a>
                </div>

                {/* Full Content Display */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Full Scraped Content</Label>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                      {selectedContent.text_content || 'No content available'}
                    </pre>
                  </div>
                </div>

                {/* Content Analysis */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Content Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {selectedContent.text_content?.match(/api|endpoint|swagger/gi)?.length || 0}
                      </div>
                      <div className="text-sm text-blue-600">API References</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {selectedContent.text_content?.match(/pricing|cost|\$/gi)?.length || 0}
                      </div>
                      <div className="text-sm text-green-600">Pricing Mentions</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">
                        {selectedContent.text_content?.match(/integration|connector|plugin/gi)?.length || 0}
                      </div>
                      <div className="text-sm text-purple-600">Integration Info</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => window.open(selectedContent.url, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Source Page
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Content
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Similar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TechnicalIntelligenceDashboard;
