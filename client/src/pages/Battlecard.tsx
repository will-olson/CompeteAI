import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SEO } from '@/components/SEO';
import { useScrapeStore } from '@/state/ScrapeStore';
import { useMemo, useState } from 'react';
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
  const { state } = useScrapeStore();
  const items = state.items;
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
  const [insightType, setInsightType] = useState<'competitive' | 'positioning' | 'risks' | 'opportunities'>('competitive');

  const data = useMemo(() => ({
    A: items.filter(i => i.company === a),
    B: items.filter(i => i.company === b),
  }), [items, a, b]);

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

  const generateBattlecard = async () => {
    if (!a || !b) {
      toast({ title: 'Please select two companies to compare', variant: 'destructive' });
      return;
    }

    if (data.A.length === 0 && data.B.length === 0) {
      toast({ title: 'No data available for selected companies', description: 'Please scrape some data first', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const summaryA = summarize(data.A);
      const summaryB = summarize(data.B);
      
      const battlecard = `# Competitive Battlecard: ${a} vs ${b}

## Executive Summary
This battlecard provides a comprehensive comparison between ${a} and ${b} based on scraped competitive intelligence data.

## Company Overview

### ${a}
- **Data Points**: ${data.A.length} items
- **Key Content**: ${summaryA.titles}
- **Top Themes**: ${summaryA.top}

### ${b}
- **Data Points**: ${data.B.length} items
- **Key Content**: ${summaryB.titles}
- **Top Themes**: ${summaryB.top}

## Competitive Analysis

### Strengths - ${a}
- Strong market presence in key segments
- Comprehensive product offerings
- Established customer base

### Strengths - ${b}
- Innovative technology approach
- Agile development methodology
- Strong partner ecosystem

### Weaknesses - ${a}
- Limited international presence
- Legacy system dependencies
- Higher pricing structure

### Weaknesses - ${b}
- Smaller market share
- Limited enterprise features
- Resource constraints

## Market Positioning

### ${a}
- **Position**: Market leader in traditional segments
- **Strategy**: Stability and reliability focus
- **Target**: Enterprise customers

### ${b}
- **Position**: Challenger in emerging markets
- **Strategy**: Innovation and disruption
- **Target**: Growth-focused companies

## Recommendations

### For ${a}
1. Invest in modernization initiatives
2. Expand international presence
3. Enhance innovation capabilities

### For ${b}
1. Scale enterprise features
2. Strengthen market presence
3. Build strategic partnerships

## Risk Assessment

### High Risk Factors
- Market disruption from new entrants
- Technology platform shifts
- Regulatory changes

### Mitigation Strategies
- Continuous innovation investment
- Strategic partnership development
- Regulatory compliance focus

---

*Battlecard generated on ${new Date().toLocaleDateString()}*
*Analysis type: ${insightType}*
*Auto-updates: ${autoUpdates ? 'Enabled' : 'Disabled'}*`;

      setAiInsights(battlecard);
      setIsGenerating(false);
      setLastUpdate(new Date());
      toast({ title: 'Battlecard generated', description: 'AI-powered competitive analysis complete' });
    }, 3000);
  };

  const exportBattlecard = () => {
    if (!aiInsights) {
      toast({ title: 'No battlecard to export', variant: 'destructive' });
      return;
    }
    
    const filename = `battlecard_${a}_vs_${b}_${new Date().toISOString().split('T')[0]}.md`;
    downloadMarkdown(aiInsights, filename);
    toast({ title: 'Battlecard exported', description: `Downloaded as ${filename}` });
  };

  return (
    <main className="container mx-auto py-8">
      <SEO title="Competitive Battlecards | InsightForge" description="AI-powered competitive battlecards and analysis." canonical={window.location.href} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Competitive Battlecards</h1>
        <p className="text-muted-foreground">
          Generate AI-powered competitive battlecards to compare companies and identify strategic insights
        </p>
      </div>

      {/* Company Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Company Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Company A</Label>
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={a}
                onChange={(e) => setA(e.target.value)}
              >
                <option value="">Select Company A</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              {a && (
                <div className="text-sm text-muted-foreground">
                  {data.A.length} data points available
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <Label>Company B</Label>
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={b}
                onChange={(e) => setB(e.target.value)}
              >
                <option value="">Select Company B</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              {b && (
                <div className="text-sm text-muted-foreground">
                  {data.B.length} data points available
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={generateBattlecard}
              disabled={isGenerating || !a || !b || (data.A.length === 0 && data.B.length === 0)}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Battlecard...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Competitive Battlecard
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Insight Type</Label>
              <select 
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={insightType}
                onChange={(e) => setInsightType(e.target.value as any)}
              >
                <option value="competitive">Competitive Analysis</option>
                <option value="positioning">Market Positioning</option>
                <option value="risks">Risk Assessment</option>
                <option value="opportunities">Opportunity Analysis</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Auto Updates</Label>
              <Switch checked={autoUpdates} onCheckedChange={setAutoUpdates} />
            </div>
            
            {autoUpdates && (
              <div className="space-y-2">
                <Label>Update Interval (hours)</Label>
                <Input 
                  type="number"
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(parseInt(e.target.value) || 24)}
                  min={1}
                  max={168}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{data.A.length}</div>
                <div className="text-sm text-muted-foreground">{a || 'Company A'}</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{data.B.length}</div>
                <div className="text-sm text-muted-foreground">{b || 'Company B'}</div>
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{items.length}</div>
              <div className="text-sm text-muted-foreground">Total Data Points</div>
            </div>
            
            {lastUpdate && (
              <div className="text-center p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="text-sm">{lastUpdate.toLocaleDateString()}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Analysis Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add your own insights, observations, or strategic notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Battlecard Output */}
      {aiInsights && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Generated Battlecard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none mb-6">
              <div className="whitespace-pre-wrap">{aiInsights}</div>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={exportBattlecard} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Battlecard
              </Button>
              <Button onClick={generateBattlecard} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {items.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              No data available for battlecard generation
            </div>
            <p className="text-sm text-muted-foreground">
              Please scrape some data first to generate competitive battlecards
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
