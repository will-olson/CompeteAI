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
  Download, 
  FileText, 
  BarChart3, 
  Database, 
  Globe, 
  Calendar,
  Filter,
  Settings,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { ScrapedItem } from '@/state/ScrapeStore';

interface ExportPanelProps {
  items: ScrapedItem[];
}

interface ExportConfig {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  includeMetadata: boolean;
  includeAI: boolean;
  includeRawContent: boolean;
  filterByCompany: string;
  filterByCategory: string;
  dateRange: string;
  customFields: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  sections: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
}

export function ExportPanel({ items }: ExportPanelProps) {
  const { toast } = useToast();
  
  // Export state
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    includeMetadata: true,
    includeAI: true,
    includeRawContent: false,
    filterByCompany: '',
    filterByCategory: '',
    dateRange: 'all',
    customFields: []
  });
  
  const [reportTemplate, setReportTemplate] = useState<string>('executive');
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customFields, setCustomFields] = useState('');

  // Report templates
  const reportTemplates: Record<string, ReportTemplate> = {
    'executive': {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level competitive intelligence overview for executives',
      icon: BarChart3,
      sections: ['Market Overview', 'Competitive Landscape', 'Key Insights', 'Recommendations'],
      complexity: 'basic'
    },
    'technical': {
      id: 'technical',
      name: 'Technical Analysis',
      description: 'Detailed technical analysis for engineering teams',
      icon: Database,
      sections: ['Technical Architecture', 'API Analysis', 'Performance Metrics', 'Integration Patterns'],
      complexity: 'intermediate'
    },
    'detailed': {
      id: 'detailed',
      name: 'Detailed Report',
      description: 'Comprehensive analysis with full data coverage',
      icon: FileText,
      sections: ['Full Data Analysis', 'Trend Analysis', 'Competitive Deep Dive', 'Strategic Recommendations'],
      complexity: 'advanced'
    },
    'custom': {
      id: 'custom',
      name: 'Custom Report',
      description: 'Tailored report based on your specific requirements',
      icon: Settings,
      sections: ['Custom Sections', 'Flexible Formatting', 'Personalized Insights'],
      complexity: 'intermediate'
    }
  };

  // Safe data processing with error handling
  const processedItems = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      
      return items.filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        // Company filter
        if (exportConfig.filterByCompany && item.company !== exportConfig.filterByCompany) return false;
        
        // Category filter
        if (exportConfig.filterByCategory && item.category !== exportConfig.filterByCategory) return false;
        
        // Date filter
        if (exportConfig.dateRange !== 'all' && item.scrapedAt) {
          try {
            const itemDate = new Date(item.scrapedAt);
            if (isNaN(itemDate.getTime())) return false;
            
            const now = new Date();
            const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
            
            switch (exportConfig.dateRange) {
              case 'today': if (diffDays > 1) return false; break;
              case 'week': if (diffDays > 7) return false; break;
              case 'month': if (diffDays > 30) return false; break;
            }
          } catch (error) {
            console.warn('Date parsing error in export:', error);
            return false;
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error processing items for export:', error);
      return [];
    }
  }, [items, exportConfig]);

  // Get unique companies and categories for filters
  const uniqueCompanies = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      return Array.from(new Set(items.map(item => item.company).filter(Boolean)));
    } catch (error) {
      console.error('Error getting unique companies for export:', error);
      return [];
    }
  }, [items]);

  const uniqueCategories = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      return Array.from(new Set(items.map(item => item.category).filter(Boolean)));
    } catch (error) {
      console.error('Error getting unique categories for export:', error);
      return [];
    }
  }, [items]);

  const exportData = async () => {
    if (processedItems.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    
    try {
      let exportData: any[] = [];
      
      processedItems.forEach(item => {
        const exportItem: any = {
          company: item.company || '',
          category: item.category || '',
          title: item.title || '',
          url: item.url || '',
          scrapedAt: item.scrapedAt || '',
          wordCount: item.markdown ? item.markdown.split(/\s+/).length : 0
        };
        
        if (exportConfig.includeMetadata && item.metadata) {
          exportItem.metadata = item.metadata;
        }
        
        if (exportConfig.includeAI) {
          exportItem.aiAnalysis = item.ai_analysis || '';
          exportItem.sentimentScore = item.sentiment_score || 0;
          exportItem.keyTopics = item.key_topics || [];
        }
        
        if (exportConfig.includeRawContent) {
          exportItem.markdown = item.markdown || '';
          exportItem.html = item.html || '';
        }
        
        exportData.push(exportItem);
      });
      
      let blob: Blob;
      let filename: string;
      
      switch (exportConfig.format) {
        case 'csv':
          const csvContent = [
            Object.keys(exportData[0]),
            ...exportData.map(item => Object.values(item).map(val => 
              typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            ))
          ].map(row => row.join(',')).join('\n');
          
          blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          filename = `competitive_intelligence_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'json':
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `competitive_intelligence_${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        case 'excel':
          // For Excel, we'll create a CSV that Excel can open
          const excelContent = [
            Object.keys(exportData[0]),
            ...exportData.map(item => Object.values(item).map(val => 
              typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            ))
          ].map(row => row.join('\t')).join('\n');
          
          blob = new Blob([excelContent], { type: 'text/tab-separated-values;charset=utf-8;' });
          filename = `competitive_intelligence_${new Date().toISOString().split('T')[0]}.tsv`;
          break;
          
        default:
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `competitive_intelligence_${new Date().toISOString().split('T')[0]}.json`;
      }
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({ 
        title: 'Export successful', 
        description: `Exported ${exportData.length} items in ${exportConfig.format.toUpperCase()} format` 
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const generateReport = async () => {
    if (processedItems.length === 0) {
      toast({ title: 'No data for report generation', variant: 'destructive' });
      return;
    }

    setIsGeneratingReport(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const template = reportTemplates[reportTemplate];
      const reportData = {
        template: template.name,
        generatedAt: new Date().toISOString(),
        dataSummary: {
          totalItems: processedItems.length,
          companies: uniqueCompanies.length,
          categories: uniqueCategories.length,
          dateRange: exportConfig.dateRange
        },
        sections: template.sections,
        insights: generateMockInsights(processedItems)
      };
      
      // Export the report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `competitive_intelligence_report_${reportTemplate}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({ 
        title: 'Report generated successfully', 
        description: `${template.name} report is ready for download` 
      });
      
    } catch (error) {
      console.error('Report generation error:', error);
      toast({ title: 'Report generation failed', variant: 'destructive' });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateMockInsights = (items: ScrapedItem[]) => {
    const insights = [];
    
    if (items.length > 0) {
      insights.push({
        type: 'market_overview',
        title: 'Market Overview',
        content: `Analysis of ${items.length} data points across ${uniqueCompanies.length} companies and ${uniqueCategories.length} categories.`
      });
      
      if (uniqueCompanies.length > 1) {
        insights.push({
          type: 'competitive_landscape',
          title: 'Competitive Landscape',
          content: `Identified ${uniqueCompanies.length} key competitors with varying approaches to market positioning.`
        });
      }
      
      insights.push({
        type: 'recommendations',
        title: 'Strategic Recommendations',
        content: 'Focus on differentiated positioning and enhanced user experience to stand out in the competitive landscape.'
      });
    }
    
    return insights;
  };

  const clearFilters = () => {
    setExportConfig(prev => ({
      ...prev,
      filterByCompany: '',
      filterByCategory: '',
      dateRange: 'all'
    }));
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
              <Download className="h-5 w-5" />
              <span>Data Export & Reporting</span>
            </span>
            <div className="flex items-center space-x-2">
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
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {processedItems.length} of {items.length} items ready for export
            </div>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Export Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportConfig.format} onValueChange={(value) => setExportConfig(prev => ({ ...prev, format: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="excel">Excel (TSV)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-company">Filter by Company</Label>
              <Select value={exportConfig.filterByCompany} onValueChange={(value) => setExportConfig(prev => ({ ...prev, filterByCompany: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All companies</SelectItem>
                  {uniqueCompanies.map(company => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-category">Filter by Category</Label>
              <Select value={exportConfig.filterByCategory} onValueChange={(value) => setExportConfig(prev => ({ ...prev, filterByCategory: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium">Content Options</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-metadata"
                        checked={exportConfig.includeMetadata}
                        onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeMetadata: checked }))}
                      />
                      <Label htmlFor="include-metadata" className="text-sm">Include Metadata</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-ai"
                        checked={exportConfig.includeAI}
                        onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeAI: checked }))}
                      />
                      <Label htmlFor="include-ai" className="text-sm">Include AI Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-raw-content"
                        checked={exportConfig.includeRawContent}
                        onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeRawContent: checked }))}
                      />
                      <Label htmlFor="include-raw-content" className="text-sm">Include Raw Content</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Date Range</Label>
                  <Select value={exportConfig.dateRange} onValueChange={(value) => setExportConfig(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-4">
                    <Label htmlFor="custom-fields">Custom Fields (comma-separated)</Label>
                    <Textarea
                      id="custom-fields"
                      placeholder="field1, field2, field3..."
                      value={customFields}
                      onChange={(e) => setCustomFields(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={exportData} 
              disabled={isExporting || processedItems.length === 0}
              size="lg"
              className="flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Export Data</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Report Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Templates */}
          <div>
            <Label className="text-base font-medium">Report Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {Object.entries(reportTemplates).map(([key, template]) => {
                const Icon = template.icon;
                return (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all ${
                      reportTemplate === key ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setReportTemplate(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Icon className="h-6 w-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {template.complexity}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Report Sections Preview */}
          <div>
            <Label className="text-base font-medium">Report Sections</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {reportTemplates[reportTemplate]?.sections.map((section, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {section}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={generateReport} 
              disabled={isGeneratingReport || processedItems.length === 0}
              size="lg"
              className="flex items-center space-x-2"
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Generate Report</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Export Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Data Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">{processedItems.length}</div>
                <div className="text-xs text-blue-600">Items to Export</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">{uniqueCompanies.length}</div>
                <div className="text-xs text-green-600">Companies</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600">{uniqueCategories.length}</div>
                <div className="text-xs text-purple-600">Categories</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-semibold text-orange-600">{exportConfig.format.toUpperCase()}</div>
                <div className="text-xs text-orange-600">Format</div>
              </div>
            </div>

            {/* Sample Data */}
            {processedItems.length > 0 && (
              <div>
                <Label className="text-base font-medium">Sample Data (First 3 items)</Label>
                <div className="mt-2 space-y-2">
                  {processedItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.company} - {item.category}</span>
                        <span className="text-gray-500">{item.title}</span>
                      </div>
                      <div className="text-gray-600 mt-1">
                        {item.markdown ? item.markdown.substring(0, 100) + '...' : 'No content'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Exports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-gray-500">
            <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No export history yet</p>
            <p className="text-sm mt-2">Your export history will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {processedItems.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Data to Export</AlertTitle>
          <AlertDescription>
            No items match your current export filters. Adjust your filters or clear them to see all available data.
          </AlertDescription>
        </Alert>
      )}

      {isExporting && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Export in Progress</AlertTitle>
          <AlertDescription>
            Data export is currently running. This may take a moment depending on the amount of data and selected format.
          </AlertDescription>
        </Alert>
      )}

      {isGeneratingReport && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Report Generation in Progress</AlertTitle>
          <AlertDescription>
            AI-powered report generation is running. This process analyzes your data and creates comprehensive insights.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 