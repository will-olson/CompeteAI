import { useState, useEffect } from 'react';
import { APIService } from '@/utils/APIService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, Server } from 'lucide-react';

export function BackendStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [presetGroups, setPresetGroups] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      // Test health endpoint
      const health = await APIService.healthCheck();
      console.log('Health check result:', health);
      
      if (health.status === 'healthy') {
        setStatus('connected');
        
        // Test preset groups endpoint
        try {
          const groups = await APIService.getPresetGroups();
          console.log('Preset groups result:', groups);
          setPresetGroups(groups);
        } catch (groupError) {
          console.warn('Failed to get preset groups:', groupError);
          setError('Health check passed but preset groups failed');
        }
      } else {
        setStatus('disconnected');
        setError('Backend reported unhealthy status');
      }
    } catch (err: any) {
      console.error('Backend connection failed:', err);
      setStatus('disconnected');
      setError(err.message || 'Connection failed');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Backend Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          {status === 'connected' && (
            <>
              <Wifi className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Connected</span>
            </>
          )}
          {status === 'disconnected' && (
            <>
              <WifiOff className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-600">Disconnected</span>
            </>
          )}
          {status === 'checking' && (
            <>
              <Wifi className="h-5 w-5 text-yellow-500 animate-spin" />
              <span className="text-sm font-medium text-yellow-600">Checking...</span>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Preset Groups Display */}
        {presetGroups && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Preset Groups:</h4>
            <div className="space-y-1">
              {Object.entries(presetGroups).map(([key, group]: [string, any]) => (
                <div key={key} className="text-sm p-2 bg-gray-50 rounded">
                  <strong>{group.name}</strong> ({group.company_count} companies)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Button */}
        <Button 
          onClick={checkConnection} 
          disabled={status === 'checking'}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Test Connection
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Testing connection to InsightForge API on localhost:3001
        </p>
      </CardContent>
    </Card>
  );
} 