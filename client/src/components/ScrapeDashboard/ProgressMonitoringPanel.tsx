import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  TrendingUp,
  BarChart3,
  Calendar,
  Target,
  Globe,
  Database,
  Cpu,
  Network
} from 'lucide-react';

interface ScrapingProgress {
  totalTargets: number;
  completedTargets: number;
  currentTarget: string;
  currentCompany: string;
  currentCategory: string;
  pagesScraped: number;
  totalPages: number;
  errors: Array<{ target: string; error: string; timestamp: string }>;
  warnings: Array<{ target: string; warning: string; timestamp: string }>;
  startTime: Date;
  estimatedTimeRemaining: number;
  successRate: number;
}

interface SystemHealth {
  backend: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'disconnected' | 'error';
  scraping: 'idle' | 'active' | 'paused' | 'error';
  ai: 'available' | 'limited' | 'unavailable';
}

export function ProgressMonitoringPanel() {
  const { toast } = useToast();
  
  // Progress state
  const [progress, setProgress] = useState<ScrapingProgress>({
    totalTargets: 12,
    completedTargets: 0,
    currentTarget: '',
    currentCompany: '',
    currentCategory: '',
    pagesScraped: 0,
    totalPages: 0,
    errors: [],
    warnings: [],
    startTime: new Date(),
    estimatedTimeRemaining: 0,
    successRate: 100
  });

  // System health
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    backend: 'healthy',
    database: 'connected',
    scraping: 'idle',
    ai: 'available'
  });

  // Real-time updates
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate progress updates
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev.completedTargets >= prev.totalTargets) {
          return prev;
        }

        const newCompleted = Math.min(prev.completedTargets + 1, prev.totalTargets);
        const newPagesScraped = Math.min(prev.pagesScraped + Math.floor(Math.random() * 5) + 1, prev.totalPages);
        
        // Simulate errors occasionally
        const newErrors = [...prev.errors];
        if (Math.random() < 0.1) { // 10% chance of error
          newErrors.push({
            target: `Target ${newCompleted + 1}`,
            error: 'Connection timeout',
            timestamp: new Date().toISOString()
          });
        }

        // Simulate warnings occasionally
        const newWarnings = [...prev.warnings];
        if (Math.random() < 0.15) { // 15% chance of warning
          newWarnings.push({
            target: `Target ${newCompleted + 1}`,
            warning: 'Slow response time',
            timestamp: new Date().toISOString()
          });
        }

        const successRate = ((newCompleted - newErrors.length) / newCompleted) * 100;
        const estimatedTime = Math.max(0, (prev.totalTargets - newCompleted) * 2); // 2 minutes per target

        return {
          ...prev,
          completedTargets: newCompleted,
          pagesScraped: newPagesScraped,
          errors: newErrors,
          warnings: newWarnings,
          successRate,
          estimatedTimeRemaining: estimatedTime
        };
      });

      setLastUpdate(new Date());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  const startMonitoring = () => {
    setRealTimeUpdates(true);
    setProgress(prev => ({ ...prev, startTime: new Date() }));
    toast({ title: 'Real-time monitoring started' });
  };

  const stopMonitoring = () => {
    setRealTimeUpdates(false);
    toast({ title: 'Real-time monitoring stopped' });
  };

  const resetProgress = () => {
    setProgress({
      totalTargets: 12,
      completedTargets: 0,
      currentTarget: '',
      currentCompany: '',
      currentCategory: '',
      pagesScraped: 0,
      totalPages: 0,
      errors: [],
      warnings: [],
      startTime: new Date(),
      estimatedTimeRemaining: 0,
      successRate: 100
    });
    toast({ title: 'Progress reset' });
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'degraded':
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
      case 'disconnected':
      case 'error':
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return formatTime(diffMins);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Progress Monitoring</span>
            </span>
            <div className="flex items-center space-x-2">
              <Button
                onClick={realTimeUpdates ? stopMonitoring : startMonitoring}
                variant={realTimeUpdates ? 'outline' : 'default'}
                size="sm"
              >
                {realTimeUpdates ? 'Stop' : 'Start'} Monitoring
              </Button>
              <Button onClick={resetProgress} variant="outline" size="sm">
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            <span>Duration: {formatDuration(progress.startTime)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Overall Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Targets Completed</span>
              <span>{progress.completedTargets} / {progress.totalTargets}</span>
            </div>
            <Progress value={(progress.completedTargets / progress.totalTargets) * 100} className="h-3" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{progress.completedTargets}</div>
              <div className="text-xs text-blue-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{progress.pagesScraped}</div>
              <div className="text-xs text-green-600">Pages Scraped</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-600">{progress.errors.length}</div>
              <div className="text-xs text-red-600">Errors</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">{progress.warnings.length}</div>
              <div className="text-xs text-yellow-600">Warnings</div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{Math.round(progress.successRate)}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium">Backend</div>
              <Badge className={`mt-1 ${getHealthColor(systemHealth.backend)}`}>
                {systemHealth.backend}
              </Badge>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-medium">Database</div>
              <Badge className={`mt-1 ${getHealthColor(systemHealth.database)}`}>
                {systemHealth.database}
              </Badge>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Network className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium">Scraping</div>
              <Badge className={`mt-1 ${getHealthColor(systemHealth.scraping)}`}>
                {systemHealth.scraping}
              </Badge>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Cpu className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm font-medium">AI Service</div>
              <Badge className={`mt-1 ${getHealthColor(systemHealth.ai)}`}>
                {systemHealth.ai}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Current Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress.currentTarget ? (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Currently Processing</span>
              </div>
              <div className="text-sm text-gray-700">
                <div><strong>Target:</strong> {progress.currentTarget}</div>
                <div><strong>Company:</strong> {progress.currentCompany}</div>
                <div><strong>Category:</strong> {progress.currentCategory}</div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
              No active scraping target
            </div>
          )}

          {/* Time Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                {formatTime(progress.estimatedTimeRemaining)}
              </div>
              <div className="text-xs text-green-600">Estimated Time Remaining</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {formatDuration(progress.startTime)}
              </div>
              <div className="text-xs text-blue-600">Total Time Elapsed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors and Warnings */}
      {(progress.errors.length > 0 || progress.warnings.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Issues & Warnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Errors */}
            {progress.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2 flex items-center space-x-2">
                  <XCircle className="h-4 w-4" />
                  <span>Errors ({progress.errors.length})</span>
                </h4>
                <div className="space-y-2">
                  {progress.errors.slice(-5).map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">{error.target}</span>
                        <span className="text-xs text-red-600">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-red-700 mt-1">{error.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {progress.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 mb-2 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Warnings ({progress.warnings.length})</span>
                </h4>
                <div className="space-y-2">
                  {progress.warnings.slice(-5).map((warning, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-800">{warning.target}</span>
                        <span className="text-xs text-yellow-600">
                          {new Date(warning.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-yellow-700 mt-1">{warning.warning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">
                {progress.totalTargets > 0 ? Math.round((progress.completedTargets / progress.totalTargets) * 100) : 0}%
              </div>
              <div className="text-xs text-purple-600">Completion Rate</div>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-lg font-semibold text-indigo-600">
                {progress.completedTargets > 0 ? Math.round(progress.pagesScraped / progress.completedTargets) : 0}
              </div>
              <div className="text-xs text-indigo-600">Avg Pages per Target</div>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded-lg">
              <div className="text-lg font-semibold text-teal-600">
                {progress.startTime && progress.completedTargets > 0 
                  ? Math.round((Date.now() - progress.startTime.getTime()) / (progress.completedTargets * 1000 * 60))
                  : 0
                }m
              </div>
              <div className="text-xs text-teal-600">Avg Time per Target</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {realTimeUpdates && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Real-time Monitoring Active</AlertTitle>
          <AlertDescription>
            Progress is being updated in real-time. The system will automatically refresh every 3 seconds.
          </AlertDescription>
        </Alert>
      )}

      {progress.errors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Scraping Errors Detected</AlertTitle>
          <AlertDescription>
            {progress.errors.length} errors have occurred during scraping. Review the error details above.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 