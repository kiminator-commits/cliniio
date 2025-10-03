import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { RealtimeManager } from '@/services/_core/realtimeManager';
import { RealtimeOptimizer } from '@/services/_core/realtimeOptimizer';

interface RealtimeStats {
  activeChannels: number;
  totalSubscribers: number;
  tableSubscribers: Record<string, number>;
  performance: {
    isHealthy: boolean;
    warnings: string[];
    recommendations: string[];
  };
}

export const RealtimePerformanceCard: React.FC = () => {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [optimizationStatus, setOptimizationStatus] =
    useState<string>('Starting...');

  // CRITICAL: Auto-start optimization when component mounts
  useEffect(() => {
    RealtimeOptimizer.startOptimization();

    // Check optimization status
    const checkStatus = () => {
      const status = RealtimeOptimizer.getStatus();
      setOptimizationStatus(
        status.isRunning ? `Active (${status.mode})` : 'Inactive'
      );
    };

    checkStatus();
    const statusInterval = setInterval(checkStatus, 30000); // Reduced from 5000ms to 30000ms

    return () => clearInterval(statusInterval);
  }, []);

  const updateStats = () => {
    const currentStats = RealtimeManager.getStats();
    setStats(currentStats);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const cleanupAll = () => {
    RealtimeManager.cleanup();
    updateStats();
  };

  const nuclearCleanup = () => {
    if (
      confirm(
        '☢️ NUCLEAR OPTION: This will force-disconnect ALL realtime connections from Supabase. Are you absolutely sure?'
      )
    ) {
      RealtimeManager.nuclearCleanup();
      updateStats();
    }
  };

  const emergencyCleanup = () => {
    if (
      confirm(
        '🚨 CRITICAL: This will remove ALL realtime subscriptions. Are you sure?'
      )
    ) {
      RealtimeOptimizer.emergencyCleanup();
      updateStats();
    }
  };

  const forceOptimization = () => {
    RealtimeOptimizer.startOptimization();
    updateStats();
  };

  useEffect(() => {
    updateStats();
  }, []);

  if (!stats) return null;

  const criticalTables = Object.entries(stats.tableSubscribers)
    .filter(([, count]) => count > 2) // Reduced threshold from 5 to 2
    .sort(([, a], [, b]) => b - a);

  const isCritical = stats.activeChannels > 3 || !stats.performance.isHealthy;

  return (
    <Card className={`w-full ${isCritical ? 'border-red-500 bg-red-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className={isCritical ? 'text-red-700' : ''}>
            {isCritical ? '🚨 CRITICAL ' : ''}Realtime Performance
          </span>
          <div className="flex gap-2">
            {!isMonitoring ? (
              <Button onClick={startMonitoring} size="sm" variant="outline">
                Start Monitoring
              </Button>
            ) : (
              <Button onClick={stopMonitoring} size="sm" variant="destructive">
                Stop Monitoring
              </Button>
            )}
            <Button onClick={cleanupAll} size="sm" variant="outline">
              Cleanup All
            </Button>
            <Button onClick={forceOptimization} size="sm" variant="outline">
              Force Optimize
            </Button>
            <Button onClick={emergencyCleanup} size="sm" variant="destructive">
              🚨 Emergency
            </Button>
            <Button onClick={nuclearCleanup} size="sm" variant="destructive">
              ☢️ Nuclear
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* CRITICAL: Optimization Status */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-800">
              Optimization Status:
            </span>
            <Badge
              variant={
                optimizationStatus.includes('Active')
                  ? 'default'
                  : 'destructive'
              }
            >
              {optimizationStatus}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${stats.activeChannels > 3 ? 'text-red-600' : stats.activeChannels > 2 ? 'text-yellow-600' : 'text-green-600'}`}
            >
              {stats.activeChannels}/5
            </div>
            <div className="text-sm text-muted-foreground">Active Channels</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${stats.totalSubscribers > 20 ? 'text-red-600' : stats.totalSubscribers > 10 ? 'text-yellow-600' : 'text-green-600'}`}
            >
              {stats.totalSubscribers}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Subscribers
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${criticalTables.length > 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {criticalTables.length}
            </div>
            <div className="text-sm text-muted-foreground">Critical Tables</div>
          </div>
        </div>

        {/* CRITICAL: Performance Health */}
        <div
          className={`mb-4 p-3 rounded-lg border ${stats.performance.isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          <div className="font-medium mb-2">
            Performance Health:{' '}
            {stats.performance.isHealthy ? '✅ Healthy' : '🚨 Critical'}
          </div>
          {stats.performance.warnings.length > 0 && (
            <div className="text-sm">
              <div className="font-medium text-red-700 mb-1">Warnings:</div>
              <ul className="list-disc list-inside text-red-600 space-y-1">
                {stats.performance.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          {stats.performance.recommendations.length > 0 && (
            <div className="text-sm mt-2">
              <div className="font-medium text-blue-700 mb-1">
                Recommendations:
              </div>
              <ul className="list-disc list-inside text-blue-600 space-y-1">
                {stats.performance.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CRITICAL: Table Subscribers */}
        {criticalTables.length > 0 && (
          <div className="mb-4">
            <div className="font-medium text-red-700 mb-2">
              🚨 Critical Tables (Over 2 Subscribers):
            </div>
            <div className="grid grid-cols-2 gap-2">
              {criticalTables.map(([table, count]) => (
                <div
                  key={table}
                  className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200"
                >
                  <span className="text-sm font-medium">{table}</span>
                  <Badge variant="destructive">{count} subscribers</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Table Subscribers */}
        {Object.keys(stats.tableSubscribers).length > 0 && (
          <div>
            <div className="font-medium mb-2">All Table Subscribers:</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(stats.tableSubscribers).map(([table, count]) => (
                <div
                  key={table}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded border"
                >
                  <span className="text-sm">{table}</span>
                  <Badge
                    variant={
                      count > 2
                        ? 'destructive'
                        : count > 1
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
