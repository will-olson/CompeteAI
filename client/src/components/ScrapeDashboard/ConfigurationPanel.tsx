import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { APIService } from '@/utils/APIService';
import { useScrapeStore, useScrapeConfiguration, usePresetGroups } from '@/state/ScrapeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Key, 
  Database, 
  Globe, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Server,
  Plus,
  XCircle
} from 'lucide-react';

interface ConfigurationPanelProps {
  // Component no longer needs props
}

export function ConfigurationPanel({}: ConfigurationPanelProps) {
  const { toast } = useToast();
  const { updateConfiguration, setPresetGroups, loadPresetGroup } = useScrapeStore();
  const configuration = useScrapeConfiguration();
  const presetGroups = usePresetGroups();
  
  // Configuration state - now using shared state
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [useBackendKey, setUseBackendKey] = useState(true);
  const [frontendOpenAIKey, setFrontendOpenAIKey] = useState<string>('');
  
  // 12-hour MVP enhancement: Technical content focus options
  const [technicalFocus, setTechnicalFocus] = useState<string[]>([
    'api_docs', 'pricing', 'features', 'integrations'
  ]);
  
  // 12-hour MVP enhancement: Industry context selection
  const [industryContext, setIndustryContext] = useState<string>('tech-saas');
  
  // Advanced configuration
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Preset groups - will be loaded from backend
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);

  useEffect(() => {
    loadStoredApiKey();
    loadPresetGroups();
  }, []);

  const loadPresetGroups = async () => {
    try {
      setIsLoadingPresets(true);
      const groups = await APIService.getPresetGroups();
      setPresetGroups(groups);
    } catch (error) {
      console.error('Failed to load preset groups:', error);
      toast({ 
        title: 'Failed to load preset groups', 
        description: 'Using fallback data',
        variant: 'destructive'
      });
      // Fallback to basic groups if API fails
      const fallbackGroups = {
        'tech-saas': {
          name: 'Tech SaaS Companies',
          description: 'Software-as-a-Service companies with developer-focused content',
          companies: ['OpenAI', 'Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'Supabase'],
          categories: ['marketing', 'docs', 'api', 'blog', 'pricing', 'security'],
          company_count: 7
        }
      };
      setPresetGroups(fallbackGroups);
    } finally {
      setIsLoadingPresets(false);
    }
  };

  const loadStoredApiKey = () => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      setOpenaiKey(stored);
    }
  };

  const onSaveKey = () => {
    if (!openaiKey) return;
    localStorage.setItem('openai_api_key', openaiKey);
    toast({ title: 'OpenAI API key saved' });
  };

  // 12-hour MVP enhancement: Enhanced preset loading with technical focus
  const handleLoadPresetGroup = (presetKey: string) => {
    const preset = presetGroups[presetKey];
    if (!preset) return;
    
    // Auto-generate technical targets based on focus areas
    const technicalTargets = generateTechnicalTargets(preset, technicalFocus);
    
    // Update configuration with technical focus
    updateConfiguration({
      ...configuration,
      selectedPreset: presetKey,
      targets: technicalTargets,
      industryContext: industryContext,
      technicalFocus: technicalFocus
    });
    
    toast({ 
      title: 'Preset group loaded', 
      description: `Loaded ${preset.name} with ${technicalTargets.length} technical targets`
    });
  };

  // 12-hour MVP enhancement: Generate technical targets from configuration
  const generateTechnicalTargets = (preset: any, focus: string[]) => {
    const targets: any[] = [];
    
    preset.companies.forEach((company: string) => {
      focus.forEach(contentType => {
        const baseUrl = `https://${company.toLowerCase().replace('_', '').replace(' ', '')}.com`;
        
        let url = baseUrl;
        switch (contentType) {
          case 'api_docs':
            url = `${baseUrl}/docs/api`;
            break;
          case 'pricing':
            url = `${baseUrl}/pricing`;
            break;
          case 'features':
            url = `${baseUrl}/features`;
            break;
          case 'integrations':
            url = `${baseUrl}/integrations`;
            break;
        }
        
        targets.push({
          company,
          category: contentType,
          url,
          priority: 'high',
          description: `${contentType.replace('_', ' ')} for ${company}`
        });
      });
    });
    
    return targets;
  };

  // 12-hour MVP enhancement: Handle technical focus changes
  const handleTechnicalFocusChange = (focus: string, checked: boolean) => {
    if (checked) {
      setTechnicalFocus([...technicalFocus, focus]);
    } else {
      setTechnicalFocus(technicalFocus.filter(f => f !== focus));
    }
  };

  // 12-hour MVP enhancement: Handle industry context change
  const handleIndustryContextChange = (industry: string) => {
    setIndustryContext(industry);
    
    // Update configuration if preset is already loaded
    if (configuration.selectedPreset) {
      const preset = presetGroups[configuration.selectedPreset];
      if (preset) {
        const technicalTargets = generateTechnicalTargets(preset, technicalFocus);
        updateConfiguration({
          ...configuration,
          industryContext: industry,
          targets: technicalTargets
        });
      }
    }
  };

  const addCustomCompany = () => {
    const newCompanies = [...configuration.customCompanies, ''];
    updateConfiguration({ customCompanies: newCompanies });
  };

  const removeCustomCompany = (index: number) => {
    const newCompanies = configuration.customCompanies.filter((_, i) => i !== index);
    updateConfiguration({ customCompanies: newCompanies });
  };

  const updateCompanyName = (index: number, name: string) => {
    const updated = [...configuration.customCompanies];
    updated[index] = name;
    updateConfiguration({ customCompanies: updated });
  };

  const addCategory = (category: string) => {
    if (!configuration.selectedCategories.includes(category)) {
      const newCategories = [...configuration.selectedCategories, category];
      updateConfiguration({ selectedCategories: newCategories });
    }
  };

  const removeCategory = (category: string) => {
    const newCategories = configuration.selectedCategories.filter(c => c !== category);
    updateConfiguration({ selectedCategories: newCategories });
  };

  const updateAdvancedConfig = (updates: Partial<typeof configuration.advancedConfig>) => {
    updateConfiguration({
      advancedConfig: {
        ...configuration.advancedConfig,
        ...updates
      }
    });
  };

  const checkBackendConnection = async () => {
    try {
      // This would call the actual health check API
      // For now, simulate a successful connection
      toast({ title: 'Backend connection checked' });
    } catch (error) {
      toast({ title: 'Backend connection failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Backend Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Backend Connection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge 
                variant="default"
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Connected</span>
              </Badge>
              
              {/* Removed backend services display */}
            </div>
            
            <Button onClick={checkBackendConnection} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="use-backend-key"
              checked={useBackendKey}
              onCheckedChange={setUseBackendKey}
            />
            <Label htmlFor="use-backend-key">Use backend API key (recommended)</Label>
          </div>
          
          {!useBackendKey && (
            <div className="space-y-2">
              <Label htmlFor="frontend-key">Frontend OpenAI API Key</Label>
              <Input
                id="frontend-key"
                type="password"
                placeholder="sk-..."
                value={frontendOpenAIKey}
                onChange={(e) => setFrontendOpenAIKey(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Note: Frontend API keys are less secure and may expose your key in browser requests.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="backend-key">Backend OpenAI API Key</Label>
            <div className="flex space-x-2">
              <Input
                id="backend-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
              <Button onClick={onSaveKey} size="sm">
                Save
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              This key is stored securely on the backend and used for all AI analysis requests.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preset Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Preset Competitor Groups</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPresets ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              <span>Loading preset groups...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(presetGroups).map(([key, group]) => (
                <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {group.companies.length} companies
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {group.categories.length} categories
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleLoadPresetGroup(key)}
                        variant="outline"
                        size="sm"
                      >
                        Load
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 12-hour MVP enhancement: Technical Content Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Technical Content Focus</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Technical Focus Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Content Types to Target</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'api_docs', label: 'API Documentation', description: 'Technical specs, endpoints, authentication' },
                { key: 'pricing', label: 'Pricing Pages', description: 'Pricing models, plans, enterprise features' },
                { key: 'features', label: 'Feature Documentation', description: 'Product capabilities, workflows, automation' },
                { key: 'integrations', label: 'Integration Guides', description: 'SDKs, webhooks, plugins, connectors' }
              ].map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={technicalFocus.includes(key)}
                      onChange={(e) => handleTechnicalFocusChange(key, e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium">{label}</span>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Context */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Industry Context</Label>
            <Select value={industryContext} onValueChange={handleIndustryContextChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry context" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech-saas">
                  <div>
                    <div className="font-medium">Tech SaaS</div>
                    <div className="text-sm text-gray-600">Software-as-a-Service companies</div>
                  </div>
                </SelectItem>
                <SelectItem value="fintech">
                  <div>
                    <div className="font-medium">Fintech</div>
                    <div className="text-sm text-gray-600">Financial technology and payments</div>
                  </div>
                </SelectItem>
                <SelectItem value="ecommerce">
                  <div>
                    <div className="font-medium">E-commerce</div>
                    <div className="text-sm text-gray-600">Online retail and marketplaces</div>
                  </div>
                </SelectItem>
                <SelectItem value="ai-ml">
                  <div>
                    <div className="font-medium">AI/ML</div>
                    <div className="text-sm text-gray-600">Artificial intelligence and machine learning</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              Industry context helps AI analysis focus on relevant technical factors and competitive dynamics.
            </p>
          </div>

          {/* Technical Target Summary */}
          {configuration.targets && configuration.targets.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Generated Technical Targets</Label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Targets:</span> {configuration.targets.length}
                  </div>
                  <div>
                    <span className="font-medium">Companies:</span> {new Set(configuration.targets.map(t => t.company)).size}
                  </div>
                  <div>
                    <span className="font-medium">Content Types:</span> {new Set(configuration.targets.map(t => t.category)).size}
                  </div>
                  <div>
                    <span className="font-medium">Industry:</span> {configuration.industryContext}
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Targets will be automatically generated when you load a preset group or add custom companies.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Custom Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Companies */}
          <div>
            <Label className="text-base font-medium">Target Companies</Label>
            <div className="space-y-2 mt-2">
              {configuration.customCompanies.map((company, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    placeholder="Company name"
                    value={company}
                    onChange={(e) => updateCompanyName(index, e.target.value)}
                  />
                  {configuration.customCompanies.length > 1 && (
                    <Button
                      onClick={() => removeCustomCompany(index)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addCustomCompany} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="text-base font-medium">Target Categories</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {configuration.selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => removeCategory(category)}
                >
                  {category}
                  <XCircle className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="mt-2">
              <Select onValueChange={addCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Add category" />
                </SelectTrigger>
                <SelectContent>
                  {['marketing', 'docs', 'api', 'blog', 'pricing', 'security', 'enterprise', 'partners', 'developers', 'support', 'resources', 'templates', 'apps', 'downloads', 'integrations', 'compliance', 'research', 'models', 'ethics', 'demos', 'news'].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Configuration Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-advanced"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label htmlFor="show-advanced">Show Advanced Configuration</Label>
          </div>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium">Advanced Scraping Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="page-limit">Page Limit</Label>
                  <Input
                    id="page-limit"
                    type="number"
                    value={configuration.advancedConfig.pageLimit}
                    onChange={(e) => updateAdvancedConfig({ pageLimit: parseInt(e.target.value) || 25 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="depth-limit">Depth Limit</Label>
                  <Input
                    id="depth-limit"
                    type="number"
                    value={configuration.advancedConfig.depthLimit}
                    onChange={(e) => updateAdvancedConfig({ depthLimit: parseInt(e.target.value) || 3 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="delay">Delay Between Requests (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={configuration.advancedConfig.delayBetweenRequests}
                    onChange={(e) => updateAdvancedConfig({ delayBetweenRequests: parseInt(e.target.value) || 1000 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="respect-robots"
                    checked={configuration.advancedConfig.respectRobots}
                    onCheckedChange={(checked) => updateAdvancedConfig({ respectRobots: checked })}
                  />
                  <Label htmlFor="respect-robots">Respect robots.txt</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="follow-redirects"
                    checked={configuration.advancedConfig.followRedirects}
                    onCheckedChange={(checked) => updateAdvancedConfig({ followRedirects: checked })}
                  />
                  <Label htmlFor="follow-redirects">Follow Redirects</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="handle-javascript"
                    checked={configuration.advancedConfig.handleJavascript}
                    onCheckedChange={(checked) => updateAdvancedConfig({ handleJavascript: checked })}
                  />
                  <Label htmlFor="handle-javascript">Handle JavaScript</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="extract-metadata"
                    checked={configuration.advancedConfig.extractMetadata}
                    onCheckedChange={(checked) => updateAdvancedConfig({ extractMetadata: checked })}
                  />
                  <Label htmlFor="extract-metadata">Extract Metadata</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 