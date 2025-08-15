import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import APIService from '@/utils/APIService';
import { useScrapeStore, useScrapeConfiguration } from '@/state/ScrapeStore';
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
  const { addItems } = useScrapeStore();
  const configuration = useScrapeConfiguration();
  
  // Scraping state
  const [isScraping, setIsScraping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<string>('');
  const [scrapedCount, setScrapedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [scrapingLog, setScrapingLog] = useState<string[]>([]);
  
  // Configuration
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addLogEntry = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setScrapingLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]); // Keep last 100 entries
  };

  const startScraping = async () => {
    if (isScraping) return;
    
    try {
      setIsScraping(true);
      setIsPaused(false);
      setScrapingProgress(0);
      setScrapedCount(0);
      setErrorCount(0);
      setScrapingLog([]);
      
      // Get enabled targets from configuration
      const enabledTargets = configuration.targets.filter(t => t.enabled);
      const totalTargets = enabledTargets.length;
      
      if (totalTargets === 0) {
        toast({ 
          title: 'No targets enabled', 
          description: 'Please go to the Targets tab and enable at least one scraping target.',
          variant: 'destructive'
        });
        setIsScraping(false);
        return;
      }

      addLogEntry(`Starting scraping for ${totalTargets} targets...`);
      
      // Process each target
      for (let i = 0; i < enabledTargets.length; i++) {
        if (isPaused) {
          addLogEntry('Scraping paused by user');
          break;
        }

        const target = enabledTargets[i];
        const progress = ((i + 1) / totalTargets) * 100;
        
        setCurrentTarget(`${target.company} - ${target.category}`);
        setScrapingProgress(progress);
        
        addLogEntry(`Processing ${target.company} (${target.category}): ${target.url}`);
        
        try {
          // Call the backend scraping API
          const result = await APIService.scrapeCompany({
            company: target.company,
            urls: { [target.category]: target.url },
            categories: [target.category],
            page_limit: configuration.advancedConfig.pageLimit
          });
          
          if (result.error) {
            addLogEntry(`Error scraping ${target.company}: ${result.error}`);
            setErrorCount(prev => prev + 1);
          } else {
            addLogEntry(`Successfully scraped ${target.company} (${target.category})`);
            setScrapedCount(prev => prev + 1);
            
            // Convert backend result to ScrapedItem format and add to store
            if (result.categories && result.categories[target.category]) {
              const categoryData = result.categories[target.category];
              if (categoryData.items && Array.isArray(categoryData.items)) {
                const scrapedItems = categoryData.items.map((item: any) => ({
                  id: item.id || `${target.company}-${target.category}-${Date.now()}`,
                  company: target.company,
                  category: target.category as any,
                  url: item.url || target.url,
                  title: item.title || '',
                  markdown: item.content || '',
                  html: item.content || '',
                  scrapedAt: new Date().toISOString(),
                  source: target.category,
                  metadata: {
                    word_count: item.word_count,
                    char_count: item.char_count,
                    link_count: item.link_count,
                    image_count: item.image_count,
                    content_quality: item.content_quality
                  }
                }));
                
                addItems(scrapedItems);
                addLogEntry(`Added ${scrapedItems.length} items to store`);
              }
            }
          }
          
          // Add delay between requests
          if (i < enabledTargets.length - 1) {
            const delay = configuration.advancedConfig.delayBetweenRequests;
            addLogEntry(`Waiting ${delay}ms before next request...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (error) {
          addLogEntry(`Error processing ${target.company}: ${error}`);
          setErrorCount(prev => prev + 1);
        }
      }
      
      if (!isPaused) {
        addLogEntry('Scraping completed successfully!');
        toast({ 
          title: 'Scraping completed', 
          description: `Processed ${scrapedCount} targets with ${errorCount} errors.`,
          variant: errorCount > 0 ? 'destructive' : 'default'
        });
      }
      
    } catch (error) {
      addLogEntry(`Fatal error: ${error}`);
      toast({ 
        title: 'Scraping failed', 
        description: 'An unexpected error occurred during scraping.',
        variant: 'destructive'
      });
    } finally {
      setIsScraping(false);
      setIsPaused(false);
    }
  };

  const pauseScraping = () => {
    setIsPaused(true);
    addLogEntry('Scraping paused by user');
  };

  const resumeScraping = () => {
    setIsPaused(false);
    addLogEntry('Scraping resumed');
  };

  const stopScraping = () => {
    setIsScraping(false);
    setIsPaused(false);
    setScrapingProgress(0);
    setCurrentTarget('');
    addLogEntry('Scraping stopped by user');
  };

  const resetScraping = () => {
    setIsScraping(false);
    setIsPaused(false);
    setScrapingProgress(0);
    setCurrentTarget('');
    setScrapedCount(0);
    setErrorCount(0);
    setScrapingLog([]);
  };

  // Get enabled targets count
  const enabledTargetsCount = configuration.targets.filter(t => t.enabled).length;
  const totalTargetsCount = configuration.targets.length;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTargetsCount}</div>
            <div className="text-sm text-gray-600">Total Targets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{enabledTargetsCount}</div>
            <div className="text-sm text-gray-600">Enabled Targets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{scrapedCount}</div>
            <div className="text-sm text-gray-600">Successfully Scraped</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Scraping Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {isScraping && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(scrapingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scrapingProgress}%` }}
                />
              </div>
              {currentTarget && (
                <p className="text-sm text-gray-600">Current: {currentTarget}</p>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            {!isScraping ? (
              <Button 
                onClick={startScraping}
                disabled={enabledTargetsCount === 0}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Start Scraping
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button onClick={resumeScraping} className="gap-2">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseScraping} className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={stopScraping} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
            
            <Button onClick={resetScraping} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Configuration Warning */}
          {enabledTargetsCount === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Targets Enabled</AlertTitle>
              <AlertDescription>
                Please go to the Targets tab and enable at least one scraping target before starting.
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium mb-2">Current Configuration</h4>
              <div className="space-y-1 text-sm">
                <div>Page Limit: {configuration.advancedConfig.pageLimit}</div>
                <div>Depth Limit: {configuration.advancedConfig.depthLimit}</div>
                <div>Delay: {configuration.advancedConfig.delayBetweenRequests}ms</div>
                <div>Respect Robots: {configuration.advancedConfig.respectRobots ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Target Summary</h4>
              <div className="space-y-1 text-sm">
                <div>Companies: {configuration.customCompanies.filter(c => c.trim()).length}</div>
                <div>Categories: {configuration.selectedCategories.length}</div>
                <div>Total Targets: {totalTargetsCount}</div>
                <div>Ready: {enabledTargetsCount}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Scraping Log</span>
            <Badge variant="secondary">{scrapingLog.length} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scrapingLog.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No scraping activity yet.</p>
              <p className="text-sm">Start scraping to see detailed logs.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scrapingLog.map((entry, index) => (
                <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {entry}
                </div>
              ))}
            </div>
          )}
          
          {scrapingLog.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <Button 
                onClick={() => setScrapingLog([])} 
                variant="outline" 
                size="sm"
              >
                Clear Log
              </Button>
              <span className="text-sm text-gray-500">
                Showing last {scrapingLog.length} entries
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 