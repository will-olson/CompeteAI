import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, Minus, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types for competitive intelligence data
interface DimensionScore {
  dimension_name: string;
  aggregated_score: number;
  data_points_count: number;
  last_updated: string;
}

interface CompanyOverview {
  company_info: {
    name: string;
    domain: string;
    description: string;
  };
  dimension_scores: DimensionScore[];
  total_dimensions: number;
  total_intelligence_items: number;
}

interface CompetitiveComparison {
  sigma: {
    company_info: any;
    dimension_scores: DimensionScore[];
  };
  competitor: {
    company_info: any;
    dimension_scores: DimensionScore[];
  };
  analysis: {
    sigma_advantages: Array<{
      dimension: string;
      advantage: number;
      sigma_score: number;
      competitor_score: number;
    }>;
    competitor_advantages: Array<{
      dimension: string;
      advantage: number;
      sigma_score: number;
      competitor_score: number;
    }>;
    competitive_gaps: Array<{
      dimension: string;
      gap_size: number;
      sigma_score: number;
      competitor_score: number;
    }>;
    overall_assessment: {
      sigma_total_score: number;
      competitor_total_score: number;
      score_difference: number;
      sigma_advantage_count: number;
      competitor_advantage_count: number;
    };
  };
}

const COMPETITIVE_DIMENSIONS = [
  { key: 'spreadsheet_interface', label: 'Spreadsheet Interface', description: 'Excel-like functionality and user experience' },
  { key: 'semantic_layer_integration', label: 'Semantic Layer Integration', description: 'Data modeling and business logic capabilities' },
  { key: 'data_app_development', label: 'Data App Development', description: 'Custom application building and deployment' },
  { key: 'multi_modal_development', label: 'Multi-modal Development', description: 'Support for various development approaches' },
  { key: 'writeback', label: 'Writeback', description: 'Data modification and write capabilities' },
  { key: 'ai_model_flexibility', label: 'AI Model Flexibility', description: 'AI/ML integration and customization options' },
  { key: 'unstructured_data_querying', label: 'Unstructured Data Querying', description: 'Text, image, and document analysis' },
  { key: 'governed_collaboration', label: 'Governed Collaboration', description: 'Team collaboration with governance controls' },
  { key: 'materialization_controls', label: 'Materialization Controls', description: 'Data pipeline and caching management' },
  { key: 'lineage', label: 'Lineage', description: 'Data provenance and audit trail capabilities' }
];

const COMPETITORS = [
  'Snowflake', 'Databricks', 'PowerBI', 'Tableau', 'Omni',
  'Looker', 'Oracle', 'SAP BusinessObjects', 'Qlik', 'MicroStrategy',
  'Hex', 'Thoughtspot', 'Domo', 'IBM Cognos'
];

// Fallback Sigma data for testing when backend is not available
const FALLBACK_SIGMA_DATA: CompanyOverview = {
  company_info: {
    name: "Sigma",
    domain: "https://www.sigmacomputing.com/",
    description: "Cloud-native analytics platform with spreadsheet interface"
  },
  dimension_scores: [
    { dimension_name: 'spreadsheet_interface', aggregated_score: 9.5, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'semantic_layer_integration', aggregated_score: 8.8, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'data_app_development', aggregated_score: 8.2, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'multi_modal_development', aggregated_score: 7.8, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'writeback', aggregated_score: 7.5, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'ai_model_flexibility', aggregated_score: 7.2, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'unstructured_data_querying', aggregated_score: 6.8, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'governed_collaboration', aggregated_score: 8.5, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'materialization_controls', aggregated_score: 7.8, data_points_count: 1, last_updated: new Date().toISOString() },
    { dimension_name: 'lineage', aggregated_score: 8.2, data_points_count: 1, last_updated: new Date().toISOString() }
  ],
  total_dimensions: 10,
  total_intelligence_items: 10
};

const CompetitiveIntelligenceDashboard: React.FC = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [comparison, setComparison] = useState<CompetitiveComparison | null>(null);
  const [sigmaData, setSigmaData] = useState<CompanyOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const { toast } = useToast();

  // Load Sigma data on component mount
  useEffect(() => {
    loadSigmaData();
    checkBackendAvailability();
  }, []);

  const checkBackendAvailability = async () => {
    try {
      const response = await fetch('http://localhost:5001/health', { 
        method: 'GET',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setBackendAvailable(true);
        console.log('Backend is available');
      } else {
        setBackendAvailable(false);
        console.log('Backend not responding properly');
      }
    } catch (error) {
      setBackendAvailable(false);
      console.log('Backend not accessible:', error);
    }
  };

  const loadSigmaData = async () => {
    try {
      setIsLoading(true);
      
      if (backendAvailable) {
        // Try to load from backend
        const response = await fetch('http://localhost:5001/api/competitive-intelligence/sigma/preset-data', {
          method: 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSigmaData(data.data);
            return;
          }
        }
      }
      
      // Fallback to local data if backend fails
      console.log('Using fallback Sigma data');
      setSigmaData(FALLBACK_SIGMA_DATA);
      
    } catch (error) {
      console.error('Error loading Sigma data:', error);
      // Use fallback data
      setSigmaData(FALLBACK_SIGMA_DATA);
      toast({
        title: "Backend Unavailable",
        description: "Using fallback data for testing. Backend scraping will not work.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparison = async (competitorName: string) => {
    try {
      setIsLoading(true);
      
      if (backendAvailable) {
        const response = await fetch(`http://localhost:5001/api/competitive-intelligence/comparison/sigma-vs-${competitorName}`, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setComparison(data.data);
            return;
          }
        }
      }
      
      // If no backend data, show message
      toast({
        title: "No Comparison Data",
        description: `No competitive data found for ${competitorName}. Backend scraping is required.`,
        variant: "destructive",
      });
      
    } catch (error) {
      console.error('Error loading comparison:', error);
      toast({
        title: "Error",
        description: "Failed to load competitive comparison",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompetitorSelect = (competitorName: string) => {
    setSelectedCompetitor(competitorName);
    if (competitorName) {
      loadComparison(competitorName);
    }
  };

  const scrapeCompetitor = async (competitorName: string) => {
    if (!backendAvailable) {
      toast({
        title: "Backend Unavailable",
        description: "Cannot scrape data - backend server is not running",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScraping(true);
      setScrapingProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setScrapingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch(`http://localhost:5001/api/competitive-intelligence/scrape/company/${competitorName}/all-dimensions`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' }
      });

      clearInterval(progressInterval);
      setScrapingProgress(100);

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Scraping Complete",
          description: `Successfully scraped ${data.data?.summary?.total_results || 0} data points for ${competitorName}`,
        });
        
        // Reload comparison after scraping
        setTimeout(() => {
          loadComparison(competitorName);
        }, 1000);
      } else {
        throw new Error('Scraping failed');
      }
    } catch (error) {
      console.error('Error scraping competitor:', error);
      toast({
        title: "Scraping Failed",
        description: "Failed to scrape competitive intelligence data. Check backend logs.",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
      setScrapingProgress(0);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-100 text-green-800">Strong</Badge>;
    if (score >= 6) return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-800">Weak</Badge>;
  };

  const renderDimensionComparison = (dimension: typeof COMPETITIVE_DIMENSIONS[0]) => {
    if (!comparison) return null;

    const sigmaScore = comparison.sigma.dimension_scores.find(
      s => s.dimension_name === dimension.key
    )?.aggregated_score || 0;

    const competitorScore = comparison.competitor.dimension_scores.find(
      s => s.dimension_name === dimension.key
    )?.aggregated_score || 0;

    const scoreDifference = sigmaScore - competitorScore;
    const hasAdvantage = scoreDifference > 0;
    const hasDisadvantage = scoreDifference < 0;

    return (
      <Card key={dimension.key} className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{dimension.label}</span>
            <div className="flex items-center gap-2">
              {hasAdvantage && <TrendingUp className="h-5 w-5 text-green-600" />}
              {hasDisadvantage && <TrendingDown className="h-5 w-5 text-red-600" />}
              {!hasAdvantage && !hasDisadvantage && <Minus className="h-5 w-5 text-gray-400" />}
            </div>
          </CardTitle>
          <CardDescription>{dimension.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sigmaScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Sigma</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(competitorScore)}`}>
                {competitorScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">{selectedCompetitor}</div>
            </div>
          </div>
          
          {Math.abs(scoreDifference) > 0.1 && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <div className="text-sm text-gray-600">
                {hasAdvantage ? (
                  <span className="text-green-600 font-medium">
                    Sigma has a {scoreDifference.toFixed(1)} point advantage
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    {selectedCompetitor} has a {Math.abs(scoreDifference).toFixed(1)} point advantage
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Competitive Intelligence Dashboard</h1>
        <p className="text-xl text-gray-600">
          Compare Sigma against competitors across strategic dimensions
        </p>
      </div>

      {/* Backend Status */}
      {!backendAvailable && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription>
            <strong>Backend Status:</strong> Backend server is not available. Using fallback data for testing. 
            Scraping functionality will not work until backend is running on port 5001.
          </AlertDescription>
        </Alert>
      )}

      {/* Sigma Overview */}
      {sigmaData && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Sigma Competitive Positioning
            </CardTitle>
            <CardDescription>
              Sigma's capabilities across all strategic dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {COMPETITIVE_DIMENSIONS.map(dimension => {
                const score = sigmaData.dimension_scores.find(
                  s => s.dimension_name === dimension.key
                )?.aggregated_score || 0;
                
                return (
                  <div key={dimension.key} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{score.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">{dimension.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitor Selection and Scraping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-orange-600" />
            Competitor Analysis
          </CardTitle>
          <CardDescription>
            Select a competitor to analyze and compare against Sigma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCompetitor} onValueChange={handleCompetitorSelect}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select a competitor" />
              </SelectTrigger>
              <SelectContent>
                {COMPETITORS.map(competitor => (
                  <SelectItem key={competitor} value={competitor}>
                    {competitor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCompetitor && (
              <Button
                onClick={() => scrapeCompetitor(selectedCompetitor)}
                disabled={isScraping || !backendAvailable}
                className="w-full sm:w-auto"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Scrape Data
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Scraping Progress */}
          {isScraping && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Scraping competitive intelligence...</span>
                <span>{scrapingProgress}%</span>
              </div>
              <Progress value={scrapingProgress} className="w-full" />
            </div>
          )}

          {/* Backend Status for Scraping */}
          {!backendAvailable && selectedCompetitor && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription>
                <strong>Scraping Unavailable:</strong> Backend server must be running to scrape data. 
                Start the backend with: <code className="bg-gray-100 px-2 py-1 rounded">python insightforge_app.py</code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedCompetitor && (
        <Tabs defaultValue="dimensions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dimensions">Dimension Comparison</TabsTrigger>
            <TabsTrigger value="overview">Competitive Overview</TabsTrigger>
            <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dimensions" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : comparison ? (
              <div className="space-y-4">
                {COMPETITIVE_DIMENSIONS.map(dimension => 
                  renderDimensionComparison(dimension)
                )}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  {backendAvailable 
                    ? "No comparison data available. Select a competitor and scrape data to begin analysis."
                    : "Backend not available. Cannot load comparison data or perform scraping."
                  }
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            {comparison ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">Sigma Advantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {comparison.analysis.sigma_advantages.map((advantage, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">{advantage.dimension}</span>
                          <Badge className="bg-green-100 text-green-800">
                            +{advantage.advantage.toFixed(1)}
                          </Badge>
                        </div>
                      ))}
                      {comparison.analysis.sigma_advantages.length === 0 && (
                        <p className="text-gray-500 text-sm">No significant advantages identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">{selectedCompetitor} Advantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {comparison.analysis.competitor_advantages.map((advantage, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="text-sm font-medium">{advantage.dimension}</span>
                          <Badge className="bg-red-100 text-red-800">
                            +{advantage.advantage.toFixed(1)}
                          </Badge>
                        </div>
                      ))}
                      {comparison.analysis.competitor_advantages.length === 0 && (
                        <p className="text-gray-500 text-sm">No significant advantages identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No comparison data available. {backendAvailable ? "Select a competitor and scrape data to begin analysis." : "Backend must be running to access this data."}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {comparison ? (
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {comparison.analysis.overall_assessment.sigma_total_score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Sigma Total Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {comparison.analysis.overall_assessment.competitor_total_score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">{selectedCompetitor} Total Score</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {comparison.analysis.overall_assessment.score_difference > 0 ? '+' : ''}
                        {comparison.analysis.overall_assessment.score_difference.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Score Difference</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Key Insights:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Sigma has advantages in {comparison.analysis.overall_assessment.sigma_advantage_count} dimensions</li>
                      <li>• {selectedCompetitor} has advantages in {comparison.analysis.overall_assessment.competitor_advantage_count} dimensions</li>
                      <li>• {comparison.analysis.competitive_gaps.length} dimensions show significant competitive gaps</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertDescription>
                  No strategic insights available. {backendAvailable ? "Select a competitor and scrape data to begin analysis." : "Backend must be running to access this data."}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CompetitiveIntelligenceDashboard;
