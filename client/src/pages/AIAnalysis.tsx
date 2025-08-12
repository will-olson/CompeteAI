import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { useState, useMemo } from 'react';
import { useScrapeStore } from '@/state/ScrapeStore';
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
  const { state } = useScrapeStore();
  const items = state.items;

  const [tone, setTone] = useState<'neutral'|'confident'|'skeptical'|'enthusiastic'>('neutral');
  const [length, setLength] = useState<'short'|'medium'|'long'>('medium');
  const [format, setFormat] = useState<'bullets'|'narrative'|'table'>('bullets');
  const [focus, setFocus] = useState('positioning, differentiation, pricing, risks');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Advanced AI workflow automation state
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [scheduledAnalysis, setScheduledAnalysis] = useState(false);
  const [analysisInterval, setAnalysisInterval] = useState(24); // hours
  const [smartCategorization, setSmartCategorization] = useState(true);
  const [trendDetection, setTrendDetection] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);

  const corpus = useMemo(() => items.map(i => `# ${i.company} | ${i.title || i.url}\n\n${i.markdown || ''}`).join('\n\n---\n\n'), [items]);

  // Enhanced analytics and insights
  const insights = useMemo(() => {
    const companies = Array.from(new Set(items.map(i => i.company)));
    const categories = Array.from(new Set(items.map(i => i.category)));
    
    // Smart content categorization
    const contentThemes: Record<string, number> = {};
    const competitiveSignals: Record<string, number> = {};
    const riskIndicators: Record<string, number> = {};
    
    items.forEach(item => {
      if (item.markdown) {
        // Simple theme detection
        const text = item.markdown.toLowerCase();
        if (text.includes('pricing') || text.includes('cost') || text.includes('price')) {
          contentThemes['pricing'] = (contentThemes['pricing'] || 0) + 1;
        }
        if (text.includes('feature') || text.includes('benefit') || text.includes('advantage')) {
          contentThemes['features'] = (contentThemes['features'] || 0) + 1;
        }
        if (text.includes('integration') || text.includes('api') || text.includes('connect')) {
          contentThemes['integrations'] = (contentThemes['integrations'] || 0) + 1;
        }
        
        // Competitive signals
        if (text.includes('competitor') || text.includes('alternative') || text.includes('vs')) {
          competitiveSignals['competitive_mentions'] = (competitiveSignals['competitive_mentions'] || 0) + 1;
        }
        
        // Risk indicators
        if (text.includes('risk') || text.includes('challenge') || text.includes('limitation')) {
          riskIndicators['risk_mentions'] = (riskIndicators['risk_mentions'] || 0) + 1;
        }
      }
    });
    
    return {
      companies,
      categories,
      contentThemes: Object.entries(contentThemes).map(([theme, count]) => ({ theme, count })),
      competitiveSignals: Object.entries(competitiveSignals).map(([signal, count]) => ({ signal, count })),
      riskIndicators: Object.entries(riskIndicators).map(([indicator, count]) => ({ indicator, count })),
      totalContent: items.length,
      averageContentLength: items.reduce((acc, item) => acc + (item.markdown?.length || 0), 0) / Math.max(items.length, 1)
    };
  }, [items]);

  const generateAnalysis = async () => {
    if (items.length === 0) {
      toast({ title: 'No data to analyze', description: 'Please add some scraped data first', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = `# AI-Generated Competitive Analysis

## Executive Summary
Based on analysis of ${items.length} content pieces across ${insights.companies.length} companies, we've identified key competitive insights.

## Content Themes
${insights.contentThemes.map(t => `- **${t.theme}**: Mentioned ${t.count} times`).join('\n')}

## Competitive Signals
${insights.competitiveSignals.map(s => `- **${s.signal}**: ${s.count} mentions`).join('\n')}

## Risk Assessment
${insights.riskIndicators.map(r => `- **${r.indicator}**: ${r.count} mentions`).join('\n')}

## Recommendations
1. **Focus Areas**: Prioritize ${focus.split(',')[0]} based on current market positioning
2. **Content Strategy**: Develop content around identified themes
3. **Risk Mitigation**: Address identified risk factors proactively

*Analysis generated with ${tone} tone, ${length} format, and ${format} structure.*`;

      setOutput(mockAnalysis);
      setIsLoading(false);
      toast({ title: 'Analysis complete', description: 'AI-generated insights ready for review' });
    }, 2000);
  };

  return (
    <main className="container mx-auto py-8">
      <SEO title="AI Analysis | InsightForge" description="AI-powered competitive intelligence and market analysis." canonical={window.location.href} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Competitive Analysis</h1>
        <p className="text-muted-foreground">
          Generate intelligent insights from your scraped data using advanced AI analysis
        </p>
      </div>

      {/* Data Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{items.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{insights.companies.length}</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{insights.categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{Math.round(insights.averageContentLength)}</div>
              <div className="text-sm text-muted-foreground">Avg Chars</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Configuration */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Analysis Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Analysis Tone</Label>
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
              >
                <option value="neutral">Neutral</option>
                <option value="confident">Confident</option>
                <option value="skeptical">Skeptical</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Output Length</Label>
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={length}
                onChange={(e) => setLength(e.target.value as any)}
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Output Format</Label>
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
              >
                <option value="bullets">Bullet Points</option>
                <option value="narrative">Narrative</option>
                <option value="table">Table</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Focus Areas</Label>
              <Input 
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="positioning, differentiation, pricing, risks"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Workflow Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Auto Analysis</Label>
              <Switch checked={autoAnalysis} onCheckedChange={setAutoAnalysis} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Smart Categorization</Label>
              <Switch checked={smartCategorization} onCheckedChange={setSmartCategorization} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Trend Detection</Label>
              <Switch checked={trendDetection} onCheckedChange={setTrendDetection} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Risk Alerts</Label>
              <Switch checked={riskAlerts} onCheckedChange={setRiskAlerts} />
            </div>
            
            <div className="space-y-2">
              <Label>Analysis Interval (hours)</Label>
              <Input 
                type="number"
                value={analysisInterval}
                onChange={(e) => setAnalysisInterval(parseInt(e.target.value) || 24)}
                min={1}
                max={168}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generate Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={generateAnalysis} 
              disabled={isLoading || items.length === 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Analysis
                </>
              )}
            </Button>
          </div>
          
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data available for analysis. Please add some scraped data first.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Output */}
      {output && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{output}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
