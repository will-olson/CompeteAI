import React, { useState } from 'react';
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
  DollarSign
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
  // Sample company data for demonstration
  const [companies, setCompanies] = useState<Company[]>([
    {
      name: 'Snowflake',
      url: 'https://www.snowflake.com',
      technicalScore: 85,
      status: 'idle',
      progress: 0,
      results: { 
        docs_count: 62, 
        rss_count: 41,
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
        docs_count: 69, 
        rss_count: 13,
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
        docs_count: 100, 
        rss_count: 20,
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
    }
  ]);

  // Enhanced state
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', url: '', docs: '' });
  
  // System status state
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend_health: 'healthy',
    database_size: '9.2MB',
    total_companies: 14,
    active_scrapes: 0,
    last_backup: '2025-08-15 12:50'
  });

  const runScrape = async (companyName: string) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setSelectedCompany(companyName);
    
    // Update company status
    setCompanies(prev => prev.map(comp => 
      comp.name === companyName 
        ? { ...comp, status: 'running', progress: 0 }
        : comp
    ));

    // Simulate enhanced scraping process with technical content extraction
    const updateProgress = (progress: number, currentUrl?: string) => {
      setCompanies(prev => prev.map(comp => 
        comp.name === companyName 
          ? { ...comp, progress, currentUrl }
          : comp
      ));
    };

    try {
      // Phase 1: Technical Content Classification
      updateProgress(15, 'Classifying technical content...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Phase 2: Enhanced Document Discovery
      updateProgress(35, 'Discovering technical documentation...');
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Phase 3: Coverage Gap Resolution
      updateProgress(55, 'Running coverage gap analysis...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 4: Technical Content Extraction
      updateProgress(75, 'Extracting API endpoints & auth patterns...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Complete with enhanced results
      updateProgress(100, 'Technical intelligence extraction completed');
      
      // Generate realistic results based on company technical score
      const company = companies.find(c => c.name === companyName);
      const baseScore = company?.technicalScore || 0.5;
      
      const results = {
        rss_count: Math.floor(baseScore * 25) + 5,
        docs_count: Math.floor(baseScore * 80) + 10,
        enhanced_crawling: true,
        fallback_discovery_used: baseScore < 0.7,
        technical_relevance_stats: {
          high_tech: Math.floor(baseScore * 25) + 5,
          medium_tech: Math.floor(baseScore * 35) + 10,
          low_tech: Math.floor(baseScore * 20) + 5
        }
      };

      // Update company with results
      setCompanies(prev => prev.map(comp => 
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

      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        active_scrapes: Math.max(0, prev.active_scrapes - 1)
      }));

    } catch (error) {
      setCompanies(prev => prev.map(comp => 
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
      const company: Company = {
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
      
      setCompanies(prev => [...prev, company]);
      setSystemStatus(prev => ({ ...prev, total_companies: prev.total_companies + 1 }));
      setShowAddCompany(false);
      setNewCompany({ name: '', url: '', docs: '' });
    }
  };

  const runAllScrapes = async () => {
    if (isRunning) return;
    
    setSystemStatus(prev => ({ ...prev, active_scrapes: companies.length }));
    
    for (const company of companies) {
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
            {companies.map((company) => (
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
                {companies.filter(c => c.results).map((company) => (
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
                {companies.map((company) => (
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
              <CardTitle>Data Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Basic data visualization will be added here once the core functionality is confirmed working.</p>
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
    </div>
  );
};

export default TechnicalIntelligenceDashboard;
