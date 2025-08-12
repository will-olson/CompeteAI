import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { useState, useMemo, useEffect } from 'react';
import { LLMService, type LLMProvider } from '@/utils/LLMService';
import { APIService } from '@/utils/APIService';
import { useScrapeStore } from '@/state/ScrapeStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Settings,
  Play,
  Pause,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function AIAnalysis() {
  const { toast } = useToast();
  const { items } = useScrapeStore();

  const [provider, setProvider] = useState<LLMProvider>(LLMService.getProvider() || 'openai');
  const [key, setKey] = useState<string>(LLMService.getKey(provider) || '');
  const [tone, setTone] = useState<'neutral'|'confident'|'skeptical'|'enthusiastic'>('neutral');
  const [length, setLength] = useState<'short'|'medium'|'long'>('medium');
  const [format, setFormat] = useState<'bullets'|'narrative'|'table'>('bullets');
  const [focus, setFocus] = useState('positioning, differentiation, pricing, risks');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Backend connection state
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [useBackend, setUseBackend] = useState(false);
  
  // Advanced AI workflow automation state
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [scheduledAnalysis, setScheduledAnalysis] = useState(false);
  const [analysisInterval, setAnalysisInterval] = useState(24); // hours
  const [lastAutoAnalysis, setLastAutoAnalysis] = useState<Date | null>(null);
  const [autoInsights, setAutoInsights] = useState<string[]>([]);
  const [smartCategorization, setSmartCategorization] = useState(true);
  const [trendDetection, setTrendDetection] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState('competitive');
  const [workflowHistory, setWorkflowHistory] = useState<Array<{
    id: string;
    type: string;
    timestamp: Date;
    insights: string[];
    status: 'completed' | 'failed' | 'running';
  }>>([]);

  const corpus = useMemo(() => items.map(i => `# ${i.company} | ${i.title || i.url}\n\n${i.markdown || ''}`).join('\n\n---\n\n'), [items]);

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const health = await APIService.healthCheck();
      if (health.status === 'healthy') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.warn('Backend connection failed:', error);
      setBackendStatus('disconnected');
    }
  };

  // Enhanced analytics and insights
  const insights = useMemo(() => {
    const companies = Array.from(new Set(items.map(i => i.company)));
    const categories = Array.from(new Set(items.map(i => i.category)));
    
    // Smart content categorization
    const contentThemes: Record<string, number> = {};
    const competitiveSignals: Record<string, number> = {};
    const riskIndicators: Record<string, number> = {};
    
    items.forEach(item => {
      const content = (item.markdown || '').toLowerCase();
      
      // Theme detection
      if (content.includes('ai') || content.includes('artificial intelligence')) contentThemes['AI/ML'] = (contentThemes['AI/ML'] || 0) + 1;
      if (content.includes('cloud') || content.includes('saas')) contentThemes['Cloud/SaaS'] = (contentThemes['Cloud/SaaS'] || 0) + 1;
      if (content.includes('security') || content.includes('cybersecurity')) contentThemes['Security'] = (contentThemes['Security'] || 0) + 1;
      if (content.includes('pricing') || content.includes('cost')) contentThemes['Pricing'] = (contentThemes['Pricing'] || 0) + 1;
      
      // Competitive signals
      if (content.includes('launch') || content.includes('release')) competitiveSignals['Product Launches'] = (competitiveSignals['Product Launches'] || 0) + 1;
      if (content.includes('partnership') || content.includes('integration')) competitiveSignals['Partnerships'] = (competitiveSignals['Partnerships'] || 0) + 1;
      if (content.includes('funding') || content.includes('investment')) competitiveSignals['Funding'] = (competitiveSignals['Funding'] || 0) + 1;
      
      // Risk indicators
      if (content.includes('layoff') || content.includes('restructuring')) riskIndicators['Organizational Changes'] = (riskIndicators['Organizational Changes'] || 0) + 1;
      if (content.includes('security breach') || content.includes('vulnerability')) riskIndicators['Security Issues'] = (riskIndicators['Security Issues'] || 0) + 1;
      if (content.includes('legal') || content.includes('compliance')) riskIndicators['Legal/Compliance'] = (riskIndicators['Legal/Compliance'] || 0) + 1;
    });
    
    return {
      companies,
      categories,
      contentThemes: Object.entries(contentThemes).map(([name, value]) => ({ name, value })),
      competitiveSignals: Object.entries(competitiveSignals).map(([name, value]) => ({ name, value })),
      riskIndicators: Object.entries(riskIndicators).map(([name, value]) => ({ name, value })),
      totalItems: items.length
    };
  }, [items]);

  // Auto-analysis effect
  useEffect(() => {
    if (!autoAnalysis || !items.length) return;
    
    const interval = setInterval(async () => {
      if (lastAutoAnalysis && Date.now() - lastAutoAnalysis.getTime() < analysisInterval * 60 * 60 * 1000) {
        return;
      }
      
      await runAutoAnalysis();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [autoAnalysis, items, lastAutoAnalysis, analysisInterval]);

  const saveKey = () => {
    LLMService.saveProvider(provider);
    LLMService.saveKey(provider, key);
    toast({ title: 'LLM key saved' });
  };

  const analyze = async () => {
    setIsLoading(true);
    try {
      const text = await LLMService.analyze(corpus, { provider, tone, length, format, focusAreas: focus });
      setOutput(text);
      toast({ title: 'Analysis complete' });
      
      // Add to workflow history
      const newWorkflow = {
        id: Date.now().toString(),
        type: 'manual',
        timestamp: new Date(),
        insights: [text],
        status: 'completed' as const
      };
      setWorkflowHistory(prev => [newWorkflow, ...prev]);
    } catch (e: any) {
      toast({ title: 'Analysis failed', description: e?.message, variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const analyzeWithBackend = async () => {
    if (!corpus.trim()) {
      toast({ title: 'No content to analyze', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        content: corpus,
        analysis_type: 'competitive',
        options: {
          tone,
          focus_areas: focus.split(',').map(s => s.trim()),
          format
        }
      };

      const result = await APIService.analyzeWithAI(request);
      
      if (result.success) {
        setOutput(result.analysis || result.message || 'Analysis completed');
        toast({ title: 'Backend analysis complete' });
        
        // Add to workflow history
        const newWorkflow = {
          id: Date.now().toString(),
          type: 'backend',
          timestamp: new Date(),
          insights: [result.analysis || result.message || 'Analysis completed'],
          status: 'completed' as const
        };
        setWorkflowHistory(prev => [newWorkflow, ...prev]);
      } else {
        throw new Error(result.error || 'Backend analysis failed');
      }
    } catch (error: any) {
      toast({ title: 'Backend analysis failed', description: error?.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const runAutoAnalysis = async () => {
    try {
      const workflowId = Date.now().toString();
      const newWorkflow = {
        id: workflowId,
        type: 'automated',
        timestamp: new Date(),
        insights: [],
        status: 'running' as const
      };
      setWorkflowHistory(prev => [newWorkflow, ...prev]);
      
      // Run different types of automated analysis
      const analysisPromises = [];
      
      if (smartCategorization) {
        analysisPromises.push(
          LLMService.analyze(corpus, { 
            provider, 
            tone: 'neutral', 
            length: 'short', 
            format: 'bullets', 
            focusAreas: 'content categorization, themes, topics' 
          })
        );
      }
      
      if (trendDetection) {
        analysisPromises.push(
          LLMService.analyze(corpus, { 
            provider, 
            tone: 'neutral', 
            length: 'short', 
            format: 'bullets', 
            focusAreas: 'trends, patterns, changes over time' 
          })
        );
      }
      
      if (riskAlerts) {
        analysisPromises.push(
          LLMService.analyze(corpus, { 
            provider, 
            tone: 'skeptical', 
            length: 'short', 
            format: 'bullets', 
            focusAreas: 'risks, threats, vulnerabilities, competitive threats' 
          })
        );
      }
      
      const results = await Promise.all(analysisPromises);
      
      // Update workflow with results
      setWorkflowHistory(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, insights: results, status: 'completed' as const }
          : w
      ));
      
      // Update auto insights
      setAutoInsights(prev => [...results, ...prev].slice(0, 10));
      setLastAutoAnalysis(new Date());
      
      toast({ title: 'Auto-analysis complete', description: `Generated ${results.length} insights` });
    } catch (error) {
      toast({ title: 'Auto-analysis failed', variant: 'destructive' });
      setWorkflowHistory(prev => prev.map(w => 
        w.type === 'automated' && w.status === 'running'
          ? { ...w, status: 'failed' as const }
          : w
      ));
    }
  };

  const topWords = useMemo(() => {
    const foci = focus.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const counts: Record<string, number> = {};
    const text = corpus.toLowerCase();
    foci.forEach(k => { counts[k] = (text.match(new RegExp(`\\b${k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g')) || []).length; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [corpus, focus]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <main className="container mx-auto py-8">
      <SEO title="AI Analysis | InsightForge" description="LLM-powered distillations with tone, length and focus controls." canonical={window.location.href} />

      {/* AI Workflow Automation Dashboard */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Workflow Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Automation Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-analysis">Auto Analysis</Label>
                  <Switch
                    id="auto-analysis"
                    checked={autoAnalysis}
                    onCheckedChange={setAutoAnalysis}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smart-cat">Smart Categorization</Label>
                  <Switch
                    id="smart-cat"
                    checked={smartCategorization}
                    onCheckedChange={setSmartCategorization}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="trend-detection">Trend Detection</Label>
                  <Switch
                    id="trend-detection"
                    checked={trendDetection}
                    onCheckedChange={setTrendDetection}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="risk-alerts">Risk Alerts</Label>
                  <Switch
                    id="risk-alerts"
                    checked={riskAlerts}
                    onCheckedChange={setRiskAlerts}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Analysis Interval (hours)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={analysisInterval}
                    onChange={(e) => setAnalysisInterval(parseInt(e.target.value) || 24)}
                  />
                </div>
                
                <Button 
                  onClick={runAutoAnalysis} 
                  disabled={!autoAnalysis || isLoading}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Now
                </Button>
              </div>
              
              {/* Status & Metrics */}
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{insights.totalItems}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{insights.companies.length}</div>
                  <div className="text-sm text-muted-foreground">Companies</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{autoInsights.length}</div>
                  <div className="text-sm text-muted-foreground">Auto Insights</div>
                </div>
                {lastAutoAnalysis && (
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Last Analysis</div>
                    <div className="text-sm">{lastAutoAnalysis.toLocaleDateString()}</div>
                  </div>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setSelectedWorkflow('competitive')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Competitive Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setSelectedWorkflow('trends')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trend Detection
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setSelectedWorkflow('risks')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Risk Assessment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setSelectedWorkflow('insights')}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Smart Insights
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Dashboard */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={insights.contentThemes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Competitive Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={insights.competitiveSignals}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {insights.competitiveSignals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workflow History */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Workflow History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflowHistory.slice(0, 10).map(workflow => (
              <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={workflow.status === 'completed' ? 'default' : workflow.status === 'failed' ? 'destructive' : 'secondary'}>
                    {workflow.status}
                  </Badge>
                  <span className="text-sm font-medium">{workflow.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {workflow.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {workflow.insights.length} insights
                  </span>
                  {workflow.status === 'running' && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            ))}
            {workflowHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No workflows run yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Generated Insights */}
      {autoInsights.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {autoInsights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{insight}</ReactMarkdown>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Analysis Controls */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Backend Status and Analysis Options */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Backend Analysis Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Backend Connection Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {backendStatus === 'connected' && (
                  <>
                    <Wifi className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">InsightForge Backend Connected</span>
                  </>
                )}
                {backendStatus === 'disconnected' && (
                  <>
                    <WifiOff className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">InsightForge Backend Disconnected</span>
                  </>
                )}
                {backendStatus === 'checking' && (
                  <>
                    <Wifi className="h-5 w-5 text-yellow-500 animate-spin" />
                    <span className="text-sm font-medium text-yellow-600">Checking Backend Connection...</span>
                  </>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={checkBackendConnection}
                disabled={backendStatus === 'checking'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Backend Analysis Controls */}
            {backendStatus === 'connected' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="use-backend">Use Backend Analysis</Label>
                  <Switch
                    id="use-backend"
                    checked={useBackend}
                    onCheckedChange={setUseBackend}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use InsightForge backend for enhanced analysis capabilities
                  </p>
                </div>
                
                {useBackend && (
                  <div className="space-y-2">
                    <Button 
                      onClick={analyzeWithBackend} 
                      disabled={isLoading || !corpus.trim()} 
                      className="w-full"
                      variant="default"
                    >
                      <Server className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Run Backend Analysis'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Leverage InsightForge's competitive intelligence analysis
                    </p>
                  </div>
                )}
              </div>
            )}

            {backendStatus === 'disconnected' && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Backend analysis requires InsightForge API connection. 
                  Please ensure the backend service is running on port 5001.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader><CardTitle>Model Settings</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm">Provider</label>
              <select className="w-full border rounded-md h-10 px-3 bg-background" value={provider} onChange={e => { const p = e.target.value as LLMProvider; setProvider(p); setKey(LLMService.getKey(p) || ''); }}>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">API Key</label>
              <div className="flex gap-2">
                <Input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="sk-..." />
                <Button variant="secondary" onClick={saveKey}>Save</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Tone</label>
              <select className="w-full border rounded-md h-10 px-3 bg-background" value={tone} onChange={e => setTone(e.target.value as any)}>
                <option value="neutral">Neutral</option>
                <option value="confident">Confident</option>
                <option value="skeptical">Skeptical</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Length</label>
              <select className="w-full border rounded-md h-10 px-3 bg-background" value={length} onChange={e => setLength(e.target.value as any)}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Focus Areas (comma-separated)</label>
              <Input value={focus} onChange={e => setFocus(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm">Custom Instructions</label>
              <Textarea placeholder="Optional additional guidance..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm">Output Format</label>
              <select className="w-full border rounded-md h-10 px-3 bg-background" value={format} onChange={e => setFormat(e.target.value as any)}>
                <option value="bullets">Bullet Points</option>
                <option value="narrative">Narrative</option>
                <option value="table">Table</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Focus Area Analysis</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topWords}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Mentions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={analyze} disabled={isLoading} className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              {isLoading ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Generate insights based on your scraped data and analysis parameters.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader><CardTitle>Analysis Output</CardTitle></CardHeader>
          <CardContent>
            {output ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Run an analysis to see results here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
