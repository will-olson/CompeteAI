import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { APIService } from '@/utils/APIService';
import { useScrapeStore } from '@/state/ScrapeStore';
import { SEO } from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BackendStatus } from '@/components/BackendStatus';

// Import refactored sub-components
import { ConfigurationPanel } from '@/components/ScrapeDashboard/ConfigurationPanel';
import { TargetSelectionPanel } from '@/components/ScrapeDashboard/TargetSelectionPanel';
import { ScrapingControlPanel } from '@/components/ScrapeDashboard/ScrapingControlPanel';
import { ProgressMonitoringPanel } from '@/components/ScrapeDashboard/ProgressMonitoringPanel';
import { DataViewPanel } from '@/components/ScrapeDashboard/DataViewPanel';
import { AnalyticsPanel } from '@/components/ScrapeDashboard/AnalyticsPanel';
import { AIAnalysisPanel } from '@/components/ScrapeDashboard/AIAnalysisPanel';
import { ExportPanel } from '@/components/ScrapeDashboard/ExportPanel';

// Types
interface BackendStatusType {
  status: 'connected' | 'disconnected' | 'checking';
  services?: {
    scraper: string;
    ai_analyzer: string;
    enterprise_analyzer: string;
  };
}

export default function ScrapeDashboard() {
  const { toast } = useToast();
  const { state } = useScrapeStore();
  const items = state.items;

  // Core state
  const [backendStatus, setBackendStatus] = useState<BackendStatusType>({ status: 'checking' });
  const [activeTab, setActiveTab] = useState('configuration');
  const [isLoading, setIsLoading] = useState(false);

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setBackendStatus({ status: 'checking' });
      const health = await APIService.healthCheck();
      if (health.status === 'healthy') {
        setBackendStatus({ 
          status: 'connected',
          services: {
            scraper: health.services?.scraper || 'unknown',
            ai_analyzer: health.services?.ai_analyzer || 'unknown',
            enterprise_analyzer: health.services?.enterprise_analyzer || 'unknown'
          }
        });
      } else {
        setBackendStatus({ status: 'disconnected' });
      }
    } catch (error) {
      setBackendStatus({ status: 'disconnected' });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Scrape Dashboard - Competitive Intelligence Platform"
        description="Advanced web scraping and competitive intelligence dashboard with AI-powered analysis"
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competitive Intelligence Dashboard</h1>
            <p className="text-gray-600 mt-1">Advanced web scraping and market analysis platform</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <BackendStatus />
            <Badge variant={items.length > 0 ? 'default' : 'secondary'}>
              {items.length} items scraped
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="targets">Targets</TabsTrigger>
            <TabsTrigger value="scraping">Scraping</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="data">Data View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Configuration Tab - Initial Setup */}
          <TabsContent value="configuration" className="space-y-6">
                        <ConfigurationPanel />
          </TabsContent>

          {/* Target Selection Tab */}
          <TabsContent value="targets" className="space-y-6">
            <TargetSelectionPanel />
          </TabsContent>

          {/* Scraping Control Tab */}
          <TabsContent value="scraping" className="space-y-6">
            <ScrapingControlPanel />
          </TabsContent>

          {/* Progress Monitoring Tab */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressMonitoringPanel />
          </TabsContent>

          {/* Data View Tab */}
          <TabsContent value="data" className="space-y-6">
            <DataViewPanel items={items} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsPanel items={items} />
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="space-y-6">
            <AIAnalysisPanel items={items} />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <ExportPanel items={items} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
