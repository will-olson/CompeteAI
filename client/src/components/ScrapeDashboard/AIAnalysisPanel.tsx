import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Brain,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Lightbulb
} from 'lucide-react';
import { ScrapedItem } from '@/state/ScrapeStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIAnalysisPanelProps {
  items: ScrapedItem[];
}

interface AIAnalysisResult {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    confidence: number;
    processingTime: number;
    model: string;
    tokens: number;
  };
}

export function AIAnalysisPanel({ items }: AIAnalysisPanelProps) {
  const { toast } = useToast();
  
  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult[]>([]);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('comprehensive');
  const [focusAreas, setFocusAreas] = useState('positioning, differentiation, pricing, risks, opportunities');
  const [analysisTone, setAnalysisTone] = useState<'neutral' | 'confident' | 'skeptical' | 'enthusiastic'>('neutral');
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Analysis types
  const analysisTypes = {
    'comprehensive': {
      name: 'Comprehensive Analysis',
      description: 'Full competitive intelligence analysis covering all aspects',
      icon: Brain,
      duration: '5-10 minutes',
      complexity: 'High'
    },
    'content-intelligence': {
      name: 'Content Intelligence',
      description: 'Analyze content themes, key topics, and main messages',
      icon: FileText,
      duration: '2-3 minutes',
      complexity: 'Medium'
    },
    'trend-detection': {
      name: 'Trend Detection',
      description: 'Identify emerging trends and market patterns',
      icon: TrendingUp,
      duration: '3-5 minutes',
      complexity: 'Medium'
    },
    'competitive-positioning': {
      name: 'Competitive Positioning',
      description: 'Analyze market positioning and competitive advantages',
      icon: Target,
      duration: '4-6 minutes',
      complexity: 'High'
    },
    'risk-assessment': {
      name: 'Risk Assessment',
      description: 'Identify potential risks and vulnerabilities',
      icon: Settings,
      duration: '3-4 minutes',
      complexity: 'Medium'
    },
    'opportunity-analysis': {
      name: 'Opportunity Analysis',
      description: 'Discover market opportunities and growth potential',
      icon: Zap,
      duration: '3-4 minutes',
      complexity: 'Medium'
    }
  };

  // Sample analysis results for demonstration
  const sampleResults: AIAnalysisResult[] = [
    {
      id: '1',
      type: 'comprehensive',
      content: `## Competitive Intelligence Analysis

### Executive Summary
Based on the analysis of scraped content from OpenAI, Stripe, and Notion, we've identified key competitive dynamics in the SaaS market.

### Key Findings

#### 1. Market Positioning
- **OpenAI**: Leading AI research and development, focusing on cutting-edge technology
- **Stripe**: Dominant payment processing with developer-first approach
- **Notion**: Collaborative workspace platform with strong productivity focus

#### 2. Competitive Advantages
- **OpenAI**: First-mover advantage in generative AI, strong research capabilities
- **Stripe**: Extensive developer ecosystem, seamless integration experience
- **Notion**: Intuitive user interface, flexible workspace customization

#### 3. Market Opportunities
- AI-powered productivity tools integration
- Enhanced developer experience platforms
- Collaborative workflow automation

### Recommendations
1. Focus on developer experience and API-first approach
2. Invest in AI integration capabilities
3. Develop strong ecosystem partnerships`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      metadata: {
        confidence: 0.87,
        processingTime: 320,
        model: 'gpt-4',
        tokens: 1250
      }
    },
    {
      id: '2',
      type: 'trend-detection',
      content: `## Emerging Market Trends

### 1. AI Integration Everywhere
- Companies are rapidly integrating AI into existing products
- Focus on practical AI applications rather than research
- Growing demand for AI-powered automation

### 2. Developer Experience Focus
- Enhanced API documentation and developer tools
- Improved integration workflows
- Better developer onboarding experiences

### 3. Collaborative Workspaces
- Increased demand for remote collaboration tools
- Integration between different productivity platforms
- Focus on seamless workflow automation`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed',
      metadata: {
        confidence: 0.92,
        processingTime: 180,
        model: 'gpt-4',
        tokens: 850
      }
    }
  ];

  // Initialize with sample results
  React.useEffect(() => {
    setAnalysisResults(sampleResults);
  }, []);

  const startAnalysis = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    // Create new analysis result
    const newResult: AIAnalysisResult = {
      id: Date.now().toString(),
      type: selectedAnalysisType,
      content: '',
      timestamp: new Date().toISOString(),
      status: 'processing'
    };
    
    setAnalysisResults(prev => [newResult, ...prev]);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysisType = analysisTypes[selectedAnalysisType as keyof typeof analysisTypes];
      const mockContent = generateMockAnalysis(selectedAnalysisType, analysisType.name);
      
      setAnalysisResults(prev => prev.map(result => 
        result.id === newResult.id 
          ? {
              ...result,
              content: mockContent,
              status: 'completed',
              metadata: {
                confidence: 0.8 + Math.random() * 0.15,
                processingTime: Math.floor(Math.random() * 300) + 100,
                model: 'gpt-4',
                tokens: Math.floor(Math.random() * 1000) + 500
              }
            }
          : result
      ));
      
      setIsAnalyzing(false);
      toast({ 
        title: `${analysisType.name} completed`, 
        description: 'Analysis results are ready for review.' 
      });
    }, 3000 + Math.random() * 4000); // 3-7 seconds
  };

  const generateMockAnalysis = (type: string, name: string): string => {
    const baseContent = `## ${name}

### Analysis Summary
This analysis was generated based on the scraped content from your selected targets.

### Key Insights
- **Market Dynamics**: The competitive landscape shows varying approaches to market positioning
- **Content Strategy**: Different companies employ distinct content strategies
- **User Experience**: Focus areas vary significantly across competitors

### Recommendations
1. Analyze your own positioning relative to competitors
2. Identify unique value propositions
3. Develop differentiated content strategies

### Next Steps
- Review detailed findings below
- Compare with your current strategy
- Identify actionable improvements`;

    switch (type) {
      case 'content-intelligence':
        return baseContent.replace('Key Insights', 'Content Intelligence Insights')
          .replace('Market Dynamics', 'Content Themes')
          .replace('Content Strategy', 'Content Quality');
      case 'trend-detection':
        return baseContent.replace('Key Insights', 'Trend Analysis')
          .replace('Market Dynamics', 'Emerging Patterns')
          .replace('Content Strategy', 'Market Shifts');
      case 'competitive-positioning':
        return baseContent.replace('Key Insights', 'Positioning Analysis')
          .replace('Market Dynamics', 'Competitive Landscape')
          .replace('Content Strategy', 'Market Positioning');
      default:
        return baseContent;
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    toast({ title: 'Analysis stopped' });
  };

  const deleteResult = (id: string) => {
    setAnalysisResults(prev => prev.filter(result => result.id !== id));
    toast({ title: 'Analysis result deleted' });
  };

  const exportResults = () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        results: analysisResults
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ai_analysis_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({ title: 'Analysis results exported successfully' });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI-Powered Analysis</span>
            </span>
            <div className="flex items-center space-x-2">
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                size="sm"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="analysis-type">Analysis Type</Label>
              <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(analysisTypes).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="analysis-tone">Analysis Tone</Label>
              <Select value={analysisTone} onValueChange={(value) => setAnalysisTone(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="skeptical">Skeptical</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-analysis"
                checked={autoAnalysis}
                onCheckedChange={setAutoAnalysis}
              />
              <Label htmlFor="auto-analysis" className="text-sm">Auto-analysis</Label>
            </div>
          </div>
          
          {showAdvanced && (
            <div className="mt-4">
              <Label htmlFor="focus-areas">Focus Areas</Label>
              <Textarea
                id="focus-areas"
                placeholder="Enter focus areas separated by commas..."
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-4 mt-4">
            {!isAnalyzing ? (
              <Button onClick={startAnalysis} size="lg" className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Start Analysis</span>
              </Button>
            ) : (
              <Button onClick={stopAnalysis} size="lg" variant="destructive" className="flex items-center space-x-2">
                <Square className="h-5 w-5" />
                <span>Stop Analysis</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Analysis Types</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysisTypes).map(([key, type]) => {
              const Icon = type.icon;
              return (
                <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Icon className="h-8 w-8 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{type.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>⏱️ {type.duration}</span>
                          <span>📊 {type.complexity}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Analysis Results</span>
            </span>
            <Badge variant="outline">
              {analysisResults.length} results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResults.map((result) => {
              const analysisType = analysisTypes[result.type as keyof typeof analysisTypes];
              return (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(result.status)}>
                        {getStatusIcon(result.status)}
                        <span className="ml-2">{result.status}</span>
                      </Badge>
                      <div>
                        <h4 className="font-semibold">{analysisType?.name || result.type}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {result.metadata && (
                        <div className="text-right text-xs text-gray-500">
                          <div>Confidence: {(result.metadata.confidence * 100).toFixed(0)}%</div>
                          <div>Time: {result.metadata.processingTime}s</div>
                          <div>Model: {result.metadata.model}</div>
                        </div>
                      )}
                      <Button
                        onClick={() => deleteResult(result.id)}
                        variant="outline"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  {result.content && (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {result.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {result.status === 'processing' && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing analysis...</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {analysisResults.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No analysis results yet</p>
                <p className="text-sm mt-2">Start an analysis to generate insights</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>AI Capabilities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-medium">Natural Language Processing</div>
              <div className="text-sm text-gray-600 mt-1">Advanced text analysis and understanding</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Competitive Intelligence</div>
              <div className="text-sm text-gray-600 mt-1">Market positioning and strategy analysis</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-medium">Trend Detection</div>
              <div className="text-sm text-gray-600 mt-1">Identify emerging patterns and opportunities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {isAnalyzing && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Analysis in Progress</AlertTitle>
          <AlertDescription>
            AI analysis is currently running. This may take several minutes depending on the complexity and amount of data.
          </AlertDescription>
        </Alert>
      )}

      {analysisResults.some(r => r.status === 'failed') && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Errors</AlertTitle>
          <AlertDescription>
            Some analysis runs failed. Check the results above for details and try again.
          </AlertDescription>
        </Alert>
      )}

      {analysisResults.length === 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Ready to Analyze</AlertTitle>
          <AlertDescription>
            You have {items.length} scraped items ready for AI analysis. Choose an analysis type and start generating insights.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 