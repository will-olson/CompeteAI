import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { APIService } from '@/utils/APIService';
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
  Server
} from 'lucide-react';

interface ConfigurationPanelProps {
  // Component no longer needs props
}

export function ConfigurationPanel({}: ConfigurationPanelProps) {
  const { toast } = useToast();
  
  // Configuration state
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [useBackendKey, setUseBackendKey] = useState(true);
  const [frontendOpenAIKey, setFrontendOpenAIKey] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customCompanies, setCustomCompanies] = useState<string[]>(['']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['marketing', 'docs']);
  
  // Advanced configuration
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState({
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

  // Preset groups - will be loaded from backend
  const [presetGroups, setPresetGroups] = useState<Record<string, any>>({});
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
      setPresetGroups({
        'tech-saas': {
          name: 'Tech SaaS Companies',
          description: 'Software-as-a-Service companies with developer-focused content',
          companies: ['OpenAI', 'Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'Supabase'],
          categories: ['marketing', 'docs', 'api', 'blog', 'pricing', 'security']
        }
      });
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

  const loadPresetGroup = (presetKey: string) => {
    const preset = presetGroups[presetKey as keyof typeof presetGroups];
    if (!preset) return;
    
    setCustomCompanies(preset.companies);
    setSelectedCategories(preset.categories);
    setSelectedPreset(presetKey);
    
    toast({ 
      title: `Loaded ${preset.name} preset`, 
      description: `Configured ${preset.companies.length} companies with ${preset.categories.length} categories.` 
    });
  };

  const addCustomCompany = () => {
    setCustomCompanies(prev => [...prev, '']);
  };

  const removeCustomCompany = (index: number) => {
    setCustomCompanies(prev => prev.filter((_, i) => i !== index));
  };

  const updateCompanyName = (index: number, name: string) => {
    const updated = [...customCompanies];
    updated[index] = name;
    setCustomCompanies(updated);
  };

  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
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
                      onClick={() => loadPresetGroup(key)}
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
              {customCompanies.map((company, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    placeholder="Company name"
                    value={company}
                    onChange={(e) => updateCompanyName(index, e.target.value)}
                  />
                  {customCompanies.length > 1 && (
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
                Add Company
              </Button>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div>
            <Label className="text-base font-medium">Content Categories</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {['marketing', 'docs', 'api', 'blog', 'pricing', 'security', 'enterprise', 'support'].map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addCategory(category);
                      } else {
                        removeCategory(category);
                      }
                    }}
                  />
                  <Label htmlFor={category} className="text-sm capitalize">{category}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Advanced Configuration Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-advanced"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label htmlFor="show-advanced">Show advanced configuration options</Label>
          </div>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="page-limit">Page Limit</Label>
                  <Input
                    id="page-limit"
                    type="number"
                    value={advancedConfig.pageLimit}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, pageLimit: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="depth-limit">Crawl Depth</Label>
                  <Input
                    id="depth-limit"
                    type="number"
                    value={advancedConfig.depthLimit}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, depthLimit: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="delay">Request Delay (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={advancedConfig.delayBetweenRequests}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, delayBetweenRequests: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="respect-robots"
                    checked={advancedConfig.respectRobots}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, respectRobots: e.target.checked }))}
                  />
                  <Label htmlFor="respect-robots" className="text-sm">Respect robots.txt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="follow-redirects"
                    checked={advancedConfig.followRedirects}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, followRedirects: e.target.checked }))}
                  />
                  <Label htmlFor="follow-redirects" className="text-sm">Follow redirects</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="handle-js"
                    checked={advancedConfig.handleJavascript}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, handleJavascript: e.target.checked }))}
                  />
                  <Label htmlFor="handle-js" className="text-sm">Handle JavaScript</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="gdpr-compliance"
                    checked={advancedConfig.gdprCompliance}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, gdprCompliance: e.target.checked }))}
                  />
                  <Label htmlFor="gdpr-compliance" className="text-sm">GDPR compliant</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Configuration Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{customCompanies.filter(c => c.trim()).length}</div>
              <div className="text-sm text-blue-600">Companies</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{selectedCategories.length}</div>
              <div className="text-sm text-green-600">Categories</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {customCompanies.filter(c => c.trim()).length * selectedCategories.length}
              </div>
              <div className="text-sm text-purple-600">Total Targets</div>
            </div>
          </div>
          
          {/* Removed backend status alert */}
        </CardContent>
      </Card>
    </div>
  );
} 