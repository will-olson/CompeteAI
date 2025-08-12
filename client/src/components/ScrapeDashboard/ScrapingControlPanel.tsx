import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Settings, 
  Zap, 
  Shield, 
  Globe,
  Clock,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ScrapingTarget {
  company: string;
  category: string;
  url: string;
  enabled: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export function ScrapingControlPanel() {
  const { toast } = useToast();
  
  // Scraping state
  const [isScraping, setIsScraping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<string>('');
  const [scrapedCount, setScrapedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  // Configuration
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState({
    pageLimit: 25,
    depthLimit: 3,
    delayBetweenRequests: 1000,
    respectRobots: true,
    followRedirects: true,
    handleJavascript: true,
    extractMetadata: true,
    extractLinks: true,
    extractImages: true,
    extractTables: true,
    filterDuplicates: true,
    filterLowQuality: true,
    gdprCompliance: true,
    rateLimiting: 'adaptive'
  });

  // Sample targets for demonstration
  const sampleTargets: ScrapingTarget[] = [
    { company: 'OpenAI', category: 'marketing', url: 'https://openai.com', enabled: true, priority: 'high' },
    { company: 'OpenAI', category: 'docs', url: 'https://openai.com/docs', enabled: true, priority: 'high' },
    { company: 'Stripe', category: 'marketing', url: 'https://stripe.com', enabled: true, priority: 'high' },
    { company: 'Notion', category: 'marketing', url: 'https://notion.so', enabled: true, priority: 'medium' }
  ];

  const startScraping = async () => {
    if (isScraping) return;
    
    setIsScraping(true);
    setIsPaused(false);
    setScrapingProgress(0);
    setScrapedCount(0);
    setErrorCount(0);
    
    // Simulate scraping progress
    const totalTargets = sampleTargets.length;
    let currentIndex = 0;
    
    const scrapingInterval = setInterval(() => {
      if (isPaused) return;
      
      if (currentIndex < totalTargets) {
        const target = sampleTargets[currentIndex];
        setCurrentTarget(`${target.company} - ${target.category}`);
        setScrapingProgress((currentIndex / totalTargets) * 100);
        
        // Simulate success/failure
        if (Math.random() > 0.2) { // 80% success rate
          setScrapedCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
        }
        
        currentIndex++;
      } else {
        // Scraping complete
        clearInterval(scrapingInterval);
        setIsScraping(false);
        setCurrentTarget('');
        toast({ 
          title: 'Scraping completed', 
          description: `Successfully scraped ${scrapedCount} targets with ${errorCount} errors.` 
        });
      }
    }, 2000); // 2 second intervals for demo
  };

  const pauseScraping = () => {
    setIsPaused(true);
    toast({ title: 'Scraping paused' });
  };

  const resumeScraping = () => {
    setIsPaused(false);
    toast({ title: 'Scraping resumed' });
  };

  const stopScraping = () => {
    setIsScraping(false);
    setIsPaused(false);
    setScrapingProgress(0);
    setCurrentTarget('');
    toast({ title: 'Scraping stopped' });
  };

  const resetScraping = () => {
    setIsScraping(false);
    setIsPaused(false);
    setScrapingProgress(0);
    setCurrentTarget('');
    setScrapedCount(0);
    setErrorCount(0);
  };

  const getStatusColor = () => {
    if (!isScraping) return 'bg-gray-100 text-gray-600';
    if (isPaused) return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const getStatusText = () => {
    if (!isScraping) return 'Idle';
    if (isPaused) return 'Paused';
    return 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Scraping Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Scraping Control</span>
            </span>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {!isScraping ? (
              <Button onClick={startScraping} size="lg" className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Start Scraping</span>
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button onClick={resumeScraping} size="lg" variant="outline" className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>Resume</span>
                  </Button>
                ) : (
                  <Button onClick={pauseScraping} size="lg" variant="outline" className="flex items-center space-x-2">
                    <Pause className="h-5 w-5" />
                    <span>Pause</span>
                  </Button>
                )}
                <Button onClick={stopScraping} size="lg" variant="destructive" className="flex items-center space-x-2">
                  <Square className="h-5 w-5" />
                  <span>Stop</span>
                </Button>
              </>
            )}
            <Button onClick={resetScraping} variant="outline" size="lg">
              <RefreshCw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Monitoring */}
      {isScraping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Scraping Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(scrapingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${scrapingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Target */}
            {currentTarget && (
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Currently scraping:</span>
                <span className="font-medium">{currentTarget}</span>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">{scrapedCount}</div>
                <div className="text-xs text-blue-600">Success</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-semibold text-red-600">{errorCount}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  {scrapedCount + errorCount > 0 ? Math.round((scrapedCount / (scrapedCount + errorCount)) * 100) : 0}%
                </div>
                <div className="text-xs text-green-600">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Scraping Configuration</span>
            </span>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              size="sm"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="page-limit">Page Limit</Label>
              <Input
                id="page-limit"
                type="number"
                value={config.pageLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, pageLimit: parseInt(e.target.value) }))}
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Max pages per target</p>
            </div>
            
            <div>
              <Label htmlFor="depth-limit">Crawl Depth</Label>
              <Input
                id="depth-limit"
                type="number"
                value={config.depthLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, depthLimit: parseInt(e.target.value) }))}
                min="1"
                max="5"
              />
              <p className="text-xs text-gray-500 mt-1">How deep to follow links</p>
            </div>
            
            <div>
              <Label htmlFor="delay">Request Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={config.delayBetweenRequests}
                onChange={(e) => setConfig(prev => ({ ...prev, delayBetweenRequests: parseInt(e.target.value) }))}
                min="100"
                max="5000"
                step="100"
              />
              <p className="text-xs text-gray-500 mt-1">Delay between requests</p>
            </div>
          </div>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <>
              <Separator />
              
              {/* Content Extraction */}
              <div>
                <Label className="text-base font-medium">Content Extraction</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="extract-metadata"
                      checked={config.extractMetadata}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, extractMetadata: checked }))}
                    />
                    <Label htmlFor="extract-metadata" className="text-sm">Metadata</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="extract-links"
                      checked={config.extractLinks}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, extractLinks: checked }))}
                    />
                    <Label htmlFor="extract-links" className="text-sm">Links</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="extract-images"
                      checked={config.extractImages}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, extractImages: checked }))}
                    />
                    <Label htmlFor="extract-images" className="text-sm">Images</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="extract-tables"
                      checked={config.extractTables}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, extractTables: checked }))}
                    />
                    <Label htmlFor="extract-tables" className="text-sm">Tables</Label>
                  </div>
                </div>
              </div>

              {/* Quality Filters */}
              <div>
                <Label className="text-base font-medium">Quality Filters</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="filter-duplicates"
                      checked={config.filterDuplicates}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, filterDuplicates: checked }))}
                    />
                    <Label htmlFor="filter-duplicates" className="text-sm">Filter Duplicates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="filter-low-quality"
                      checked={config.filterLowQuality}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, filterLowQuality: checked }))}
                    />
                    <Label htmlFor="filter-low-quality" className="text-sm">Filter Low Quality</Label>
                  </div>
                </div>
              </div>

              {/* Technical Settings */}
              <div>
                <Label className="text-base font-medium">Technical Settings</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="respect-robots"
                      checked={config.respectRobots}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, respectRobots: checked }))}
                    />
                    <Label htmlFor="respect-robots" className="text-sm">Respect robots.txt</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="follow-redirects"
                      checked={config.followRedirects}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, followRedirects: checked }))}
                    />
                    <Label htmlFor="follow-redirects" className="text-sm">Follow Redirects</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="handle-javascript"
                      checked={config.handleJavascript}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, handleJavascript: checked }))}
                    />
                    <Label htmlFor="handle-javascript" className="text-sm">Handle JavaScript</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="gdpr-compliance"
                      checked={config.gdprCompliance}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, gdprCompliance: checked }))}
                    />
                    <Label htmlFor="gdpr-compliance" className="text-sm">GDPR Compliant</Label>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Target Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Target Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleTargets.map((target, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index < Math.floor(scrapingProgress / 25) ? 'bg-green-500' : 
                    index === Math.floor(scrapingProgress / 25) && isScraping ? 'bg-blue-500 animate-pulse' : 
                    'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="font-medium">{target.company}</div>
                    <div className="text-sm text-gray-600 capitalize">{target.category}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={target.priority === 'high' ? 'destructive' : 'secondary'}>
                    {target.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {target.url}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {isScraping && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Scraping Active</AlertTitle>
          <AlertDescription>
            Web scraping is currently running. You can pause, resume, or stop the process at any time.
          </AlertDescription>
        </Alert>
      )}

      {errorCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Scraping Errors</AlertTitle>
          <AlertDescription>
            {errorCount} targets encountered errors during scraping. Check the logs for details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 