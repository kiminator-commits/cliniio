import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, isValidOrigin } from '../auth-login/cors.ts';
import { getSecurityMonitoringService } from '../auth-login/monitoring.ts';
import { getThreatIntelligenceService } from '../auth-login/threatIntelligence.ts';
import { getDistributedRateLimiter } from '../auth-login/redisCluster.ts';

interface DashboardRequest {
  action: 'get_metrics' | 'get_alerts' | 'get_threat_stats' | 'get_cluster_health' | 'acknowledge_alert' | 'resolve_alert';
  alertId?: string;
  timeRange?: number; // minutes
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin);
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate origin
  if (!isValidOrigin(origin)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized origin',
        message: 'Request from this origin is not allowed',
      }),
      {
        status: 403,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
        message: 'Only POST requests are allowed',
      }),
      {
        status: 405,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const body: DashboardRequest = await req.json();
    const { action, alertId, timeRange = 60 } = body;

    const monitoringService = getSecurityMonitoringService();
    const threatIntelligence = getThreatIntelligenceService();
    const distributedRateLimiter = await getDistributedRateLimiter();

    let response: any = { success: true };

    switch (action) {
      case 'get_metrics':
        response.data = {
          metrics: monitoringService.getMetrics(timeRange),
          dashboard: monitoringService.getDashboardData(),
        };
        break;

      case 'get_alerts':
        response.data = {
          alerts: monitoringService.getAlerts(timeRange),
          activeAlerts: monitoringService.getActiveAlerts(),
        };
        break;

      case 'get_threat_stats':
        response.data = await threatIntelligence.getThreatStatistics();
        break;

      case 'get_cluster_health':
        response.data = await distributedRateLimiter.getClusterHealth();
        break;

      case 'acknowledge_alert':
        if (!alertId) {
          throw new Error('Alert ID is required');
        }
        response.data = {
          acknowledged: monitoringService.acknowledgeAlert(alertId),
        };
        break;

      case 'resolve_alert':
        if (!alertId) {
          throw new Error('Alert ID is required');
        }
        response.data = {
          resolved: monitoringService.resolveAlert(alertId),
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );

  } catch (error) {
    console.error('Security dashboard error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
