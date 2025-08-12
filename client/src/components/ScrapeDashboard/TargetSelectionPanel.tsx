import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
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
  Edit3
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
  
  // Target state
  const [targets, setTargets] = useState<ScrapingTarget[]>([]);
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

  // Sample targets for demonstration
  const sampleTargets: ScrapingTarget[] = [
    { company: 'OpenAI', category: 'marketing', url: 'https://openai.com', enabled: true, priority: 'high' },
    { company: 'OpenAI', category: 'docs', url: 'https://openai.com/docs', enabled: true, priority: 'high' },
    { company: 'OpenAI', category: 'api', url: 'https://openai.com/api', enabled: true, priority: 'high' },
    { company: 'Stripe', category: 'marketing', url: 'https://stripe.com', enabled: true, priority: 'high' },
    { company: 'Stripe', category: 'docs', url: 'https://stripe.com/docs', enabled: true, priority: 'high' },
    { company: 'Notion', category: 'marketing', url: 'https://notion.so', enabled: true, priority: 'medium' },
    { company: 'Notion', category: 'docs', url: 'https://notion.so/help', enabled: true, priority: 'medium' }
  ];

  // Initialize with sample targets
  React.useEffect(() => {
    setTargets(sampleTargets);
  }, []);

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
    setTargets(prev => prev.map(target => 
      target.company + '-' + target.category === targetId 
        ? { ...target, enabled: !target.enabled }
        : target
    ));
  };

  const deleteTarget = (targetId: string) => {
    setTargets(prev => prev.filter(target => target.company + '-' + target.category !== targetId));
    setSelectedTargets(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(targetId);
      return newSelected;
    });
  };

  const startEditing = (target: ScrapingTarget) => {
    setEditingTarget(target.company + '-' + target.category);
    setEditForm({
      company: target.company,
      category: target.category,
      url: target.url
    });
  };

  const saveEdit = () => {
    if (!editingTarget) return;
    
    setTargets(prev => prev.map(target => 
      target.company + '-' + target.category === editingTarget
        ? { ...target, ...editForm }
        : target
    ));
    
    setEditingTarget(null);
    setEditForm({ company: '', category: '', url: '' });
    toast({ title: 'Target updated successfully' });
  };

  const cancelEdit = () => {
    setEditingTarget(null);
    setEditForm({ company: '', category: '', url: '' });
  };

  const generateUrls = (company: string, categories: string[]) => {
    const newTargets: ScrapingTarget[] = [];
    
    categories.forEach(category => {
      const patterns = urlPatterns[category] || ['/' + category];
      patterns.forEach(pattern => {
        const baseDomain = company.toLowerCase().replace(/\s+/g, '') + '.com';
        const url = `https://www.${baseDomain}${pattern}`;
        
        newTargets.push({
          company,
          category,
          url,
          enabled: true,
          priority: 'medium'
        });
      });
    });
    
    setTargets(prev => [...prev, ...newTargets]);
    toast({ title: `Generated ${newTargets.length} URLs for ${company}` });
  };

  const selectAllTargets = () => {
    const allTargetIds = targets.map(target => target.company + '-' + target.category);
    setSelectedTargets(new Set(allTargetIds));
  };

  const clearAllTargets = () => {
    setSelectedTargets(new Set());
  };

  const getSelectedTargetsCount = () => selectedTargets.size;
  const getEnabledTargetsCount = () => targets.filter(t => t.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Target Selection</span>
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {getSelectedTargetsCount()} of {targets.length} selected
              </Badge>
              <Badge variant="secondary">
                {getEnabledTargetsCount()} enabled
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button onClick={selectAllTargets} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={clearAllTargets} variant="outline" size="sm">
              Clear All
            </Button>
            <Button 
              onClick={() => setShowUrlGenerator(!showUrlGenerator)} 
              variant="outline" 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              URL Generator
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* URL Generator */}
      {showUrlGenerator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Link className="h-5 w-5" />
              <span>URL Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="company-input">Company Name</Label>
                <Input
                  id="company-input"
                  placeholder="e.g., OpenAI"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      const company = input.value.trim();
                      if (company) {
                        generateUrls(company, Object.keys(urlPatterns));
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
              
              <div>
                <Label>Categories</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(urlPatterns).map(([category, patterns]) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`cat-${category}`}
                        defaultChecked={true}
                      />
                      <Label htmlFor={`cat-${category}`} className="text-sm capitalize">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>URL Patterns</Label>
                <div className="text-sm text-gray-600 mt-2">
                  {Object.entries(urlPatterns).map(([category, patterns]) => (
                    <div key={category} className="mb-2">
                      <span className="font-medium capitalize">{category}:</span>
                      <div className="text-xs text-gray-500">
                        {patterns.slice(0, 3).join(', ')}
                        {patterns.length > 3 && '...'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => {
                  const company = (document.getElementById('company-input') as HTMLInputElement)?.value.trim();
                  if (company) {
                    generateUrls(company, Object.keys(urlPatterns));
                  }
                }}
                size="sm"
              >
                Generate URLs
              </Button>
              <Button 
                onClick={() => setShowUrlGenerator(false)} 
                variant="outline" 
                size="sm"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Targets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Scraping Targets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {targets.map((target, index) => {
              const targetId = target.company + '-' + target.category;
              const isSelected = selectedTargets.has(targetId);
              const isEditing = editingTarget === targetId;
              
              return (
                <div key={targetId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  {isEditing ? (
                    // Edit Form
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`edit-company-${targetId}`}>Company</Label>
                          <Input
                            id={`edit-company-${targetId}`}
                            value={editForm.company}
                            onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-category-${targetId}`}>Category</Label>
                          <Input
                            id={`edit-category-${targetId}`}
                            value={editForm.category}
                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-url-${targetId}`}>URL</Label>
                          <Input
                            id={`edit-url-${targetId}`}
                            value={editForm.url}
                            onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={saveEdit} size="sm">
                          Save
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTargetSelection(targetId)}
                          className="h-4 w-4"
                        />
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant={target.enabled ? 'default' : 'secondary'}>
                            {target.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {target.category}
                          </Badge>
                          <Badge variant="secondary">
                            {target.priority || 'medium'}
                          </Badge>
                        </div>
                        
                        <div>
                          <div className="font-medium">{target.company}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            <span className="truncate max-w-xs">{target.url}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => startEditing(target)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => toggleTargetEnabled(targetId)}
                          size="sm"
                          variant={target.enabled ? 'outline' : 'default'}
                        >
                          {target.enabled ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={() => deleteTarget(targetId)}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => window.open(target.url, '_blank')}
                          size="sm"
                          variant="outline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {targets.length === 0 && (
            <Alert>
              <AlertDescription>
                No targets configured. Use the URL Generator to create your first targets.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Target Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{targets.length}</div>
              <div className="text-xs text-blue-600">Total Targets</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{getEnabledTargetsCount()}</div>
              <div className="text-xs text-green-600">Enabled</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">{getSelectedTargetsCount()}</div>
              <div className="text-xs text-purple-600">Selected</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-semibold text-orange-600">
                {targets.length > 0 ? Math.round((getEnabledTargetsCount() / targets.length) * 100) : 0}%
              </div>
              <div className="text-xs text-orange-600">Ready</div>
            </div>
          </div>
          
          {getSelectedTargetsCount() > 0 && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Ready to proceed</AlertTitle>
              <AlertDescription>
                You have {getSelectedTargetsCount()} targets selected and ready for scraping.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 