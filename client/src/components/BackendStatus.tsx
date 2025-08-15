import { useState, useEffect } from 'react';
import APIService from '@/utils/APIService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function BackendStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const response = await APIService.checkHealth();
      if (response.status === 'healthy') {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
      setLastCheck(new Date());
    } catch (error) {
      console.error('Backend connection check failed:', error);
      setStatus('disconnected');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-5 w-5 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-5 w-5 text-red-600" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-yellow-600 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'checking':
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-5 w-5" />
          Backend Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </Badge>
        </div>
        
        {lastCheck && (
          <div className="text-xs text-gray-500">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}
        
        <Button 
          onClick={checkConnection} 
          disabled={status === 'checking'}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Connected to InsightForge API on localhost:5001
        </p>
      </CardContent>
    </Card>
  );
} 