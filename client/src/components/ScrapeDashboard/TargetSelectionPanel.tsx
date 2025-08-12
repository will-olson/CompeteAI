import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useScrapeStore, useScrapeConfiguration } from '@/state/ScrapeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Globe, 
  Link, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2, 
  ExternalLink,
  Settings,
  Eye,
  Edit3,
  AlertTriangle,
  Switch
} from 'lucide-react';

interface ScrapingTarget {
  company: string;
  category: string;
  url: string;
  enabled: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export function TargetSelectionPanel() {
  const { toast } = useToast();
  const { updateTargets, addTarget, removeTarget, updateTarget } = useScrapeStore();
  const configuration = useScrapeConfiguration();
  
  // Target state
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ company: '', category: '', url: '' });
  
  // URL generation state
  const [showUrlGenerator, setShowUrlGenerator] = useState(false);
  const [urlPatterns, setUrlPatterns] = useState<Record<string, string[]>>({
    marketing: ['', '/features', '/about', '/solutions'],
    docs: ['/docs', '/help', '/guides', '/support'],
    api: ['/api', '/docs/api', '/developers', '/integrations'],
    blog: ['/blog', '/news', '/updates', '/insights'],
    pricing: ['/pricing', '/plans', '/cost', '/billing'],
    security: ['/security', '/trust', '/compliance', '/privacy']
  });

  // Generate targets from configuration
  const generatedTargets = useMemo(() => {
    if (!configuration.customCompanies.length || !configuration.selectedCategories.length) {
      return [];
    }

    return configuration.customCompanies
      .filter(company => company.trim()) // Filter out empty company names
      .flatMap(company => 
        configuration.selectedCategories.map(category => ({
          company: company.trim(),
          category,
          url: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
          enabled: true,
          priority: 'medium' as const
        }))
      );
  }, [configuration.customCompanies, configuration.selectedCategories]);

  // Update targets when configuration changes
  React.useEffect(() => {
    if (generatedTargets.length > 0) {
      updateTargets(generatedTargets);
    }
  }, [generatedTargets, updateTargets]);

  const toggleTargetSelection = (targetId: string) => {
    const newSelected = new Set(selectedTargets);
    if (newSelected.has(targetId)) {
      newSelected.delete(targetId);
    } else {
      newSelected.add(targetId);
    }
    setSelectedTargets(newSelected);
  };

  const toggleTargetEnabled = (targetId: string) => {
    const target = configuration.targets.find(t => `${t.company}-${t.category}` === targetId);
    if (target) {
      updateTarget(targetId, { enabled: !target.enabled });
    }
  };

  const deleteTarget = (targetId: string) => {
    removeTarget(targetId);
    setSelectedTargets(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(targetId);
      return newSelected;
    });
  };

  const startEditing = (target: ScrapingTarget) => {
    setEditingTarget(`${target.company}-${target.category}`);
    setEditForm({
      company: target.company,
      category: target.category,
      url: target.url
    });
  };

  const saveEdit = () => {
    if (editingTarget && editForm.company && editForm.category) {
      updateTarget(editingTarget, {
        company: editForm.company,
        category: editForm.category,
        url: editForm.url
      });
      setEditingTarget(null);
      setEditForm({ company: '', category: '', url: '' });
      toast({ title: 'Target updated successfully' });
    }
  };

  const cancelEdit = () => {
    setEditingTarget(null);
    setEditForm({ company: '', category: '', url: '' });
  };

  const generateUrlVariations = (company: string, category: string) => {
    const patterns = urlPatterns[category] || [''];
    return patterns.map(pattern => {
      const baseUrl = `https://${company.toLowerCase().replace(/\s+/g, '')}.com`;
      return pattern ? `${baseUrl}${pattern}` : baseUrl;
    });
  };

  const addUrlVariation = (company: string, category: string, url: string) => {
    const newTarget: ScrapingTarget = {
      company,
      category,
      url,
      enabled: true,
      priority: 'medium'
    };
    addTarget(newTarget);
    toast({ title: 'URL variation added' });
  };

  const getTargetCount = () => configuration.targets.length;
  const getEnabledTargetCount = () => configuration.targets.filter(t => t.enabled).length;
  const getSelectedTargetCount = () => selectedTargets.size;

  // Show warning if no configuration is set
  if (!configuration.customCompanies.length || !configuration.selectedCategories.length) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Configuration Set</AlertTitle>
          <AlertDescription>
            Please go to the Configuration tab and select companies and categories before configuring targets.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{getTargetCount()}</div>
            <div className="text-sm text-gray-600">Total Targets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{getEnabledTargetCount()}</div>
            <div className="text-sm text-gray-600">Enabled Targets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{configuration.customCompanies.filter(c => c.trim()).length}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{configuration.selectedCategories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Target Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Scraping Targets</span>
            <Badge variant="secondary">{getTargetCount()} targets</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configuration.targets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No targets configured yet.</p>
              <p className="text-sm">Configure companies and categories in the Configuration tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {configuration.targets.map((target) => {
                const targetId = `${target.company}-${target.category}`;
                const isEditing = editingTarget === targetId;
                const isSelected = selectedTargets.has(targetId);
                
                return (
                  <div key={targetId} className="border rounded-lg p-4 hover:bg-gray-50">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            placeholder="Company name"
                            value={editForm.company}
                            onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                          />
                          <Input
                            placeholder="Category"
                            value={editForm.category}
                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                          />
                          <Input
                            placeholder="URL"
                            value={editForm.url}
                            onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={saveEdit} size="sm">Save</Button>
                          <Button onClick={cancelEdit} variant="outline" size="sm">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTargetSelection(targetId)}
                            className="rounded"
                          />
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant={target.enabled ? 'default' : 'secondary'}>
                              {target.company}
                            </Badge>
                            <Badge variant="outline">{target.category}</Badge>
                            {target.priority && (
                              <Badge variant={target.priority === 'high' ? 'destructive' : target.priority === 'medium' ? 'default' : 'secondary'}>
                                {target.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => toggleTargetEnabled(targetId)}
                            variant={target.enabled ? 'default' : 'outline'}
                            size="sm"
                          >
                            {target.enabled ? 'Enabled' : 'Disabled'}
                          </Button>
                          
                          <Button
                            onClick={() => startEditing(target)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            onClick={() => deleteTarget(targetId)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <a href={target.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {target.url}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* URL Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>URL Pattern Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-url-generator"
                checked={showUrlGenerator}
                onCheckedChange={setShowUrlGenerator}
              />
              <Label htmlFor="show-url-generator">Show URL pattern suggestions</Label>
            </div>
            
            {showUrlGenerator && (
              <div className="space-y-4">
                {Object.entries(urlPatterns).map(([category, patterns]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 capitalize">{category} URLs</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {patterns.map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-mono">
                            {pattern || '/'}
                          </span>
                          <Button
                            onClick={() => {
                              // Add URL variations for all configured companies
                              configuration.customCompanies
                                .filter(company => company.trim())
                                .forEach(company => {
                                  const url = `https://${company.toLowerCase().replace(/\s+/g, '')}.com${pattern}`;
                                  addUrlVariation(company.trim(), category, url);
                                });
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Add All
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {getSelectedTargetCount() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Bulk Actions</span>
              <Badge variant="secondary">{getSelectedTargetCount()} selected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  configuration.targets.forEach(target => {
                    const targetId = `${target.company}-${target.category}`;
                    if (selectedTargets.has(targetId)) {
                      updateTarget(targetId, { enabled: true });
                    }
                  });
                  setSelectedTargets(new Set());
                  toast({ title: 'All selected targets enabled' });
                }}
                variant="outline"
              >
                Enable Selected
              </Button>
              
              <Button
                onClick={() => {
                  configuration.targets.forEach(target => {
                    const targetId = `${target.company}-${target.category}`;
                    if (selectedTargets.has(targetId)) {
                      updateTarget(targetId, { enabled: false });
                    }
                  });
                  setSelectedTargets(new Set());
                  toast({ title: 'All selected targets disabled' });
                }}
                variant="outline"
              >
                Disable Selected
              </Button>
              
              <Button
                onClick={() => {
                  selectedTargets.forEach(targetId => deleteTarget(targetId));
                  setSelectedTargets(new Set());
                  toast({ title: 'All selected targets deleted' });
                }}
                variant="destructive"
              >
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 