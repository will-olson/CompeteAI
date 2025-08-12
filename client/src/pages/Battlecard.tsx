import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SEO } from '@/components/SEO';
import { useScrapeStore } from '@/state/ScrapeStore';
import { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  RefreshCw, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Brain,
  Settings,
  BarChart3,
  Zap,
  Clock,
  Star,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';
import { LLMService, type LLMProvider } from '@/utils/LLMService';
import { APIService } from '@/utils/APIService';
import { useToast } from '@/hooks/use-toast';

const downloadMarkdown = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

export default function Battlecard() {
  const { items } = useScrapeStore();
  const { toast } = useToast();
  const companies = Array.from(new Set(items.map(i => i.company))).sort();
  const [a, setA] = useState<string>(companies[0] || '');
  const [b, setB] = useState<string>(companies[1] || '');
  const [notes, setNotes] = useState('');
  
  // Enhanced AI-powered features
  const [aiInsights, setAiInsights] = useState<string>('');
  const [autoUpdates, setAutoUpdates] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(24); // hours
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openai');
  const [apiKey, setApiKey] = useState<string>('');
  const [insightType, setInsightType] = useState<'competitive' | 'positioning' | 'risks' | 'opportunities'>('competitive');

  // Backend connection state
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [useBackend, setUseBackend] = useState(false);

  const data = useMemo(() => ({
    A: items.filter(i => i.company === a),
    B: items.filter(i => i.company === b),
  }), [items, a, b]);

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

  const summarize = (docs: typeof items) => {
    const titles = docs.map(d => d.title || d.url).slice(0, 8).join(', ');
    const corpus = docs.map(d => d.markdown || '').join('\n');
    const words = corpus.split(/\W+/).filter(Boolean);
    const counts = words.reduce<Record<string, number>>((acc, w: string) => { const k = w.toLowerCase(); acc[k] = (acc[k]||0)+1; return acc; }, {});
    const top = Object.entries(counts)
      .sort((x, y) => (y[1] as number) - (x[1] as number))
      .slice(0, 8)
      .map(([w]) => w)
      .join(', ');
    return { titles, top };
  };

  const aSum = summarize(data.A);
  const bSum = summarize(data.B);

  // Enhanced competitive analysis
  const competitiveAnalysis = useMemo(() => {
    if (!a || !b || data.A.length === 0 || data.B.length === 0) return null;
    
    const aCorpus = data.A.map(d => d.markdown || '').join('\n').toLowerCase();
    const bCorpus = data.B.map(d => d.markdown || '').join('\n').toLowerCase();
    
    // Market positioning analysis
    const positioning = {
      a: {
        strengths: [],
        weaknesses: [],
        focus: aSum.top.split(', ').slice(0, 5)
      },
      b: {
        strengths: [],
        weaknesses: [],
        focus: bSum.top.split(', ').slice(0, 5)
      }
    };
    
    // Detect strengths and weaknesses based on content analysis
    const strengthKeywords = ['innovative', 'leading', 'best', 'award', 'success', 'growth', 'partnership', 'expansion'];
    const weaknessKeywords = ['challenge', 'issue', 'problem', 'delay', 'restriction', 'limitation', 'cost', 'complexity'];
    
    strengthKeywords.forEach(keyword => {
      if (aCorpus.includes(keyword)) positioning.a.strengths.push(keyword);
      if (bCorpus.includes(keyword)) positioning.b.strengths.push(keyword);
    });
    
    weaknessKeywords.forEach(keyword => {
      if (aCorpus.includes(keyword)) positioning.a.weaknesses.push(keyword);
      if (bCorpus.includes(keyword)) positioning.b.weaknesses.push(keyword);
    });
    
    // Market share indicators
    const aMarketSignals = (aCorpus.match(/market|share|leader|dominant|position/g) || []).length;
    const bMarketSignals = (bCorpus.match(/market|share|leader|dominant|position/g) || []).length;
    
    // Innovation indicators
    const aInnovation = (aCorpus.match(/ai|artificial intelligence|machine learning|blockchain|cloud|saas/g) || []).length;
    const bInnovation = (bCorpus.match(/ai|artificial intelligence|machine learning|blockchain|cloud|saas/g) || []).length;
    
    return {
      positioning,
      marketSignals: { a: aMarketSignals, b: bMarketSignals },
      innovation: { a: aInnovation, b: bInnovation },
      recommendation: aInnovation > bInnovation ? a : b
    };
  }, [a, b, data.A, data.B, aSum.top, bSum.top]);

  // Generate AI insights
  const generateAIInsights = async () => {
    if (!a || !b || data.A.length === 0 || data.B.length === 0) {
      toast({ title: 'Please select two companies with data', variant: 'destructive' });
      return;
    }
    
    if (!apiKey) {
      toast({ title: 'Please enter an API key', variant: 'destructive' });
      return;
    }
    
    setIsGenerating(true);
    try {
      const corpus = `Company A (${a}): ${data.A.map(d => d.markdown || '').join('\n')}\n\nCompany B (${b}): ${data.B.map(d => d.markdown || '').join('\n')}`;
      
      const focusAreas = {
        competitive: 'competitive positioning, market share, differentiation',
        positioning: 'brand positioning, messaging, target audience',
        risks: 'competitive threats, vulnerabilities, market risks',
        opportunities: 'growth opportunities, market gaps, strategic advantages'
      };
      
      const insights = await LLMService.analyze(corpus, {
        provider: selectedProvider,
        tone: 'neutral',
        length: 'medium',
        format: 'bullets',
        focusAreas: focusAreas[insightType]
      });
      
      setAiInsights(insights);
      toast({ title: 'AI insights generated successfully' });
    } catch (error: any) {
      toast({ title: 'Failed to generate insights', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate backend battlecard
  const generateBackendBattlecard = async () => {
    if (!a || !b || data.A.length === 0 || data.B.length === 0) {
      toast({ title: 'Please select two companies with data', variant: 'destructive' });
      return;
    }
    
    setIsGenerating(true);
    try {
      const request = {
        company_a: {
          name: a,
          data: data.A.map(d => ({
            title: d.title || d.url,
            content: d.markdown || '',
            category: d.category,
            url: d.url
          }))
        },
        company_b: {
          name: b,
          data: data.B.map(d => ({
            title: d.title || d.url,
            content: d.markdown || '',
            category: d.category,
            url: d.url
          }))
        },
        analysis_type: 'battlecard',
        options: {
          focus_areas: [insightType],
          include_visuals: true,
          format: 'structured'
        }
      };

      const result = await APIService.generateBattlecard(request);
      
      if (result.success) {
        setAiInsights(result.battlecard || result.message || 'Backend battlecard generated');
        toast({ title: 'Backend battlecard generated successfully' });
      } else {
        throw new Error(result.error || 'Backend battlecard generation failed');
      }
    } catch (error: any) {
      toast({ title: 'Failed to generate backend battlecard', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-update effect
  useEffect(() => {
    if (!autoUpdates || !a || !b) return;
    
    const interval = setInterval(() => {
      if (lastUpdate && Date.now() - lastUpdate.getTime() < updateInterval * 60 * 60 * 1000) {
        return;
      }
      
      // Auto-refresh insights when new data is available
      if (items.length > 0) {
        setLastUpdate(new Date());
        toast({ title: 'Battlecard updated with new data' });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [autoUpdates, a, b, items, lastUpdate, updateInterval]);

  const md = `# Battlecard: ${a || 'Company A'} vs ${b || 'Company B'}\n\n`+
`## High-Level Positioning\n`+
`- ${a || 'A'}: Focus signals -> ${aSum.top || 'N/A'}\n`+
`- ${b || 'B'}: Focus signals -> ${bSum.top || 'N/A'}\n\n`+
`## Strengths\n`+
`- ${a || 'A'}: ${aSum.titles || 'N/A'}\n`+
`- ${b || 'B'}: ${bSum.titles || 'N/A'}\n\n`+
`## Weaknesses/Risks\n`+
`- ${a || 'A'}: [Add]\n`+
`- ${b || 'B'}: [Add]\n\n`+
`## Differentiators\n`+
`- ${a || 'A'}: [Add]\n`+
`- ${b || 'B'}: [Add]\n\n`+
`## Objection Handling\n`+
`- ${a || 'A'}: [Add]\n`+
`- ${b || 'B'}: [Add]\n\n`+
`## Notes\n${notes || '_None_'}\n\n`+
`${aiInsights ? `## AI-Generated Insights\n${aiInsights}\n\n` : ''}`+
`## Competitive Analysis\n`+
`${competitiveAnalysis ? `- Market Signals: ${a} (${competitiveAnalysis.marketSignals.a}), ${b} (${competitiveAnalysis.marketSignals.b})\n` : ''}`+
`${competitiveAnalysis ? `- Innovation Focus: ${a} (${competitiveAnalysis.innovation.a}), ${b} (${competitiveAnalysis.innovation.b})\n` : ''}`+
`${competitiveAnalysis ? `- Recommendation: ${competitiveAnalysis.recommendation}\n` : ''}`+
`Generated: ${new Date().toLocaleDateString()}`;

  return (
    <main className="container mx-auto py-8">
      <SEO title="Battlecards | InsightForge" description="Generate comparative battlecards from scraped and uploaded data." canonical={window.location.href} />

      {/* AI-Powered Battlecard Generation */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI-Powered Battlecard Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Backend Status */}
            <div className="mb-6 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Backend Connection Status</h4>
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
              
              <div className="flex items-center gap-2 mb-3">
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

              {backendStatus === 'connected' && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="use-backend"
                    checked={useBackend}
                    onCheckedChange={setUseBackend}
                  />
                  <Label htmlFor="use-backend">Use Backend Battlecard Generation</Label>
                </div>
              )}

              {backendStatus === 'disconnected' && (
                <p className="text-sm text-muted-foreground">
                  Backend battlecard generation requires InsightForge API connection. 
                  Please ensure the backend service is running on port 5001.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AI Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>LLM Provider</Label>
                  <select 
                    className="w-full border rounded-md h-10 px-3 bg-background"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as LLMProvider)}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-... or claude-..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Insight Type</Label>
                  <select 
                    className="w-full border rounded-md h-10 px-3 bg-background"
                    value={insightType}
                    onChange={(e) => setInsightType(e.target.value as any)}
                  >
                    <option value="competitive">Competitive Analysis</option>
                    <option value="positioning">Positioning Analysis</option>
                    <option value="risks">Risk Assessment</option>
                    <option value="opportunities">Opportunity Analysis</option>
                  </select>
                </div>
                
                <Button 
                  onClick={generateAIInsights} 
                  disabled={isGenerating || !a || !b || data.A.length === 0 || data.B.length === 0}
                  className="w-full"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate AI Insights'}
                </Button>

                {useBackend && backendStatus === 'connected' && (
                  <Button 
                    onClick={generateBackendBattlecard} 
                    disabled={isGenerating || !a || !b || data.A.length === 0 || data.B.length === 0}
                    className="w-full"
                    variant="default"
                  >
                    <Server className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Backend Battlecard'}
                  </Button>
                )}
              </div>
              
              {/* Automation Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-updates">Auto Updates</Label>
                  <Switch
                    id="auto-updates"
                    checked={autoUpdates}
                    onCheckedChange={setAutoUpdates}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Update Interval (hours)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={updateInterval}
                    onChange={(e) => setUpdateInterval(parseInt(e.target.value) || 24)}
                  />
                </div>
                
                {lastUpdate && (
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Last Update</div>
                    <div className="text-sm font-medium">{lastUpdate.toLocaleDateString()}</div>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => setLastUpdate(new Date())}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Mark as Updated
                </Button>
              </div>
              
              {/* Competitive Metrics */}
              <div className="space-y-4">
                {competitiveAnalysis && (
                  <>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Market Signals</div>
                      <div className="text-lg font-bold text-primary">
                        {a}: {competitiveAnalysis.marketSignals.a} | {b}: {competitiveAnalysis.marketSignals.b}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Innovation Focus</div>
                      <div className="text-lg font-bold text-primary">
                        {a}: {competitiveAnalysis.innovation.a} | {b}: {competitiveAnalysis.innovation.b}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">AI Recommendation</div>
                      <div className="text-lg font-bold text-accent">
                        {competitiveAnalysis.recommendation}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Data Points</div>
                  <div className="text-lg font-bold text-primary">
                    {a}: {data.A.length} | {b}: {data.B.length}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Selection and Battlecard Generation */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Companies</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm">Company A</label>
              <Input list="companies" value={a} onChange={e => setA(e.target.value)} placeholder="Acme Co" />
            </div>
            <div>
              <label className="text-sm">Company B</label>
              <Input list="companies" value={b} onChange={e => setB(e.target.value)} placeholder="Globex" />
            </div>
            <datalist id="companies">
              {companies.map(c => <option key={c} value={c} />)}
            </datalist>
            <div>
              <label className="text-sm">Notes</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Custom talking points..." />
            </div>
            <Button onClick={() => downloadMarkdown(md, `battlecard_${a || 'A'}_vs_${b || 'B'}.md`)}>
              <Download className="h-4 w-4 mr-2" />
              Export Markdown
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent className="prose dark:prose-invert max-h-[600px] overflow-auto">
            <ReactMarkdown>{md}</ReactMarkdown>
          </CardContent>
        </Card>
      </div>

      {/* AI-Generated Insights Display */}
      {aiInsights && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{aiInsights}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Competitive Analysis */}
      {competitiveAnalysis && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Competitive Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">{a} Analysis</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Strengths:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {competitiveAnalysis.positioning.a.strengths.map((strength, i) => (
                        <Badge key={i} variant="default" className="text-xs">{strength}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Focus Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {competitiveAnalysis.positioning.a.focus.map((focus, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{focus}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">{b} Analysis</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Strengths:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {competitiveAnalysis.positioning.b.strengths.map((strength, i) => (
                        <Badge key={i} variant="default" className="text-xs">{strength}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Focus Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {competitiveAnalysis.positioning.b.focus.map((focus, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{focus}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">AI Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                Based on the analysis, <strong>{competitiveAnalysis.recommendation}</strong> shows stronger innovation focus 
                and market positioning signals. Consider this when developing competitive strategies.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
