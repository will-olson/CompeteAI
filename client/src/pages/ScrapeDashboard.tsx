import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigurationPanel } from '@/components/ScrapeDashboard/ConfigurationPanel';
import { TargetSelectionPanel } from '@/components/ScrapeDashboard/TargetSelectionPanel';
import { ScrapingControlPanel } from '@/components/ScrapeDashboard/ScrapingControlPanel';
import { ProgressMonitoringPanel } from '@/components/ScrapeDashboard/ProgressMonitoringPanel';
import { DataViewPanel } from '@/components/ScrapeDashboard/DataViewPanel';
import { AnalyticsPanel } from '@/components/ScrapeDashboard/AnalyticsPanel';
import { AIAnalysisPanel } from '@/components/ScrapeDashboard/AIAnalysisPanel';
import { ExportPanel } from '@/components/ScrapeDashboard/ExportPanel';
import { BackendStatus } from '@/components/BackendStatus';
import { useScrapeItems, useScrapeConfiguration, usePresetGroups } from '@/state/ScrapeStore';
import { useToast } from '@/hooks/use-toast';

const ScrapeDashboard: React.FC = () => {
  const { toast } = useToast();
  
  // Get data from ScrapeStore
  const scrapedItems = useScrapeItems();
  const configuration = useScrapeConfiguration();
  const presetGroups = usePresetGroups();

  // Local state for dashboard
  const [activeTab, setActiveTab] = useState('configuration');
  const [dashboardStats, setDashboardStats] = useState({
    totalItems: 0,
    totalCompanies: 0,
    totalCategories: 0,
    lastScrapeTime: null as string | null,
    systemHealth: 'healthy' as 'healthy' | 'degraded' | 'down'
  });

  // Update dashboard stats when data changes
  useEffect(() => {
    if (scrapedItems) {
      const companies = new Set(scrapedItems.map(item => item.company));
      const categories = new Set(scrapedItems.map(item => item.category));
      
      setDashboardStats(prev => ({
        ...prev,
        totalItems: scrapedItems.length,
        totalCompanies: companies.size,
        totalCategories: categories.size
      }));
    }
  }, [scrapedItems]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Dashboard Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">ScrapeDashboard</h1>
          <p className="text-gray-600 mt-2">
            Advanced competitive intelligence platform with AI-powered analysis
          </p>
        </div>
        <BackendStatus />
      </div>

      {/* Dashboard Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{dashboardStats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold">{dashboardStats.totalCompanies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{dashboardStats.totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className={`text-sm font-medium ${
                  dashboardStats.systemHealth === 'healthy' ? 'text-green-600' : 
                  dashboardStats.systemHealth === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dashboardStats.systemHealth.charAt(0).toUpperCase() + dashboardStats.systemHealth.slice(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Status */}
      {configuration && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">Configuration Active</p>
                <p className="text-sm text-green-600">
                  Preset: {configuration.selectedPreset || 'Custom'} | 
                  Categories: {configuration.selectedCategories.join(', ')} | 
                  Targets: {configuration.targets?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="scraping">Scraping</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="data">Data View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <ConfigurationPanel />
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <TargetSelectionPanel />
        </TabsContent>

        <TabsContent value="scraping" className="space-y-4">
          <ScrapingControlPanel />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <ProgressMonitoringPanel />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <DataViewPanel items={scrapedItems || []} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsPanel items={scrapedItems || []} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <AIAnalysisPanel items={scrapedItems || []} />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportPanel items={scrapedItems || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapeDashboard;
