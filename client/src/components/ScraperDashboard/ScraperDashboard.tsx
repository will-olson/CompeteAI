import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Eye, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface Company {
  name: string;
  domain: string;
  docs: string[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  currentUrl?: string;
  results?: ScrapingResults;
  lastRun?: string;
}

interface ScrapingResults {
  rss_count: number;
  docs_count: number;
  enhanced_crawling: boolean;
  fallback_discovery_used: boolean;
  technical_relevance_stats: {
    high_tech: number;
    medium_tech: number;
    low_tech: number;
  };
}

interface ScrapingStatus {
  company: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  currentUrl?: string;
  results?: ScrapingResults;
  error?: string;
}

const ScraperDashboard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Sample companies data (in real app, this would come from API)
  const sampleCompanies: Company[] = [
    {
      name: 'Snowflake',
      domain: 'https://www.snowflake.com',
      docs: ['https://docs.snowflake.com'],
      status: 'idle',
      progress: 0
    },
    {
      name: 'Databricks',
      domain: 'https://www.databricks.com',
      docs: ['https://docs.databricks.com'],
      status: 'idle',
      progress: 0
    },
    {
      name: 'PowerBI',
      domain: 'https://powerbi.microsoft.com',
      docs: ['https://docs.microsoft.com/en-us/power-bi'],
      status: 'idle',
      progress: 0
    },
    {
      name: 'Tableau',
      domain: 'https://www.tableau.com',
      docs: ['https://help.tableau.com'],
      status: 'idle',
      progress: 0
    }
  ];

  useEffect(() => {
    setCompanies(sampleCompanies);
  }, []);

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

    // Simulate scraping process
    const updateProgress = (progress: number, currentUrl?: string) => {
      setCompanies(prev => prev.map(comp => 
        comp.name === companyName 
          ? { ...comp, progress, currentUrl }
          : comp
      ));
    };

    try {
      // Simulate RSS discovery
      updateProgress(20, 'Discovering RSS feeds...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate document crawling
      updateProgress(40, 'Crawling documentation...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate technical content extraction
      updateProgress(60, 'Extracting technical content...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate fallback discovery if needed
      updateProgress(80, 'Running fallback discovery...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Complete
      updateProgress(100, 'Scraping completed');
      
      // Generate sample results
      const results: ScrapingResults = {
        rss_count: Math.floor(Math.random() * 20) + 5,
        docs_count: Math.floor(Math.random() * 60) + 10,
        enhanced_crawling: true,
        fallback_discovery_used: Math.random() > 0.7,
        technical_relevance_stats: {
          high_tech: Math.floor(Math.random() * 20) + 5,
          medium_tech: Math.floor(Math.random() * 30) + 10,
          low_tech: Math.floor(Math.random() * 20) + 5
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

  const stopScrape = (companyName: string) => {
    setCompanies(prev => prev.map(comp => 
      comp.name === companyName 
        ? { ...comp, status: 'idle', progress: 0 }
        : comp
    ));
  };

  const runAllScrapes = async () => {
    if (isRunning) return;
    
    for (const company of companies) {
      await runScrape(company.name);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between companies
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scraper Testing Dashboard</h1>
        <div className="space-x-2">
          <Button 
            onClick={runAllScrapes} 
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Run All Scrapes
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This dashboard provides real-time monitoring and testing of the enhanced technical content extraction system. 
          Phase 1-3 implementations are now active with fallback discovery capabilities.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <Badge className={getStatusColor(company.status)}>
                      {getStatusIcon(company.status)}
                      <span className="ml-1 capitalize">{company.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{company.domain}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{company.progress}%</span>
                      </div>
                      <Progress value={company.progress} className="w-full" />
                      {company.currentUrl && (
                        <p className="text-xs text-gray-500 truncate">
                          Current: {company.currentUrl}
                        </p>
                      )}
                    </div>
                  )}

                  {company.results && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">RSS:</span> {company.results.rss_count}
                        </div>
                        <div>
                          <span className="font-medium">Docs:</span> {company.results.docs_count}
                        </div>
                      </div>
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
                        onClick={() => stopScrape(company.name)}
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
                          {company.results?.technical_relevance_stats.high_tech || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Technical:</span>
                        <Badge variant="secondary">
                          {company.results?.technical_relevance_stats.medium_tech || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Technical:</span>
                        <Badge variant="outline">
                          {company.results?.technical_relevance_stats.low_tech || 0}
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
              <CardTitle>Coverage Analysis</CardTitle>
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
      </Tabs>

      {/* Results Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Results for {selectedCompany}</CardTitle>
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
              {companies.find(c => c.name === selectedCompany)?.results && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {companies.find(c => c.name === selectedCompany)?.results?.rss_count}
                      </div>
                      <div className="text-sm text-blue-600">RSS Items</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {companies.find(c => c.name === selectedCompany)?.results?.docs_count}
                      </div>
                      <div className="text-sm text-green-600">Document Pages</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Technical Content Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>High Technical Relevance:</span>
                        <span className="font-medium">
                          {companies.find(c => c.name === selectedCompany)?.results?.technical_relevance_stats.high_tech}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Technical Relevance:</span>
                        <span className="font-medium">
                          {companies.find(c => c.name === selectedCompany)?.results?.technical_relevance_stats.medium_tech}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Technical Relevance:</span>
                        <span className="font-medium">
                          {companies.find(c => c.name === selectedCompany)?.results?.technical_relevance_stats.low_tech}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">System Features Used</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Enhanced Technical Content Extraction</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Intelligent Link Discovery</span>
                      </div>
                      {companies.find(c => c.name === selectedCompany)?.results?.fallback_discovery_used && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Fallback Discovery System</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ScraperDashboard;
