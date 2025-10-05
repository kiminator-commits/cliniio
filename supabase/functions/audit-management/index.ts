import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders, isValidOrigin } from '../auth-login/cors.ts';
import { getImmutableAuditTrail } from '../auth-login/auditTrail.ts';
import { getSecurityEventCorrelator } from '../auth-login/eventCorrelation.ts';
import { getAuditRetentionManager } from '../auth-login/auditRetention.ts';
import { getAuditMonitoringService } from '../auth-login/auditMonitoring.ts';

interface AuditManagementRequest {
  action:
    | 'get_events'
    | 'get_event'
    | 'get_chain'
    | 'verify_integrity'
    | 'export_events'
    | 'get_correlations'
    | 'get_correlation_stats'
    | 'add_correlation_rule'
    | 'get_retention_policies'
    | 'get_archival_jobs'
    | 'export_retention_report'
    | 'get_audit_alerts'
    | 'acknowledge_alert'
    | 'resolve_alert'
    | 'get_audit_metrics';
  filters?: any;
  eventId?: string;
  alertId?: string;
  ruleId?: string;
  policyId?: string;
  jobId?: string;
  timeRange?: number;
  format?: 'json' | 'csv';
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
    const body: AuditManagementRequest = await req.json();
    const {
      action,
      filters = {},
      eventId,
      alertId,
      ruleId,
      policyId,
      jobId,
      timeRange = 60,
      format = 'json',
    } = body;

    const auditTrail = getImmutableAuditTrail();
    const eventCorrelator = getSecurityEventCorrelator();
    const retentionManager = getAuditRetentionManager();
    const auditMonitoring = getAuditMonitoringService();

    let response: any = { success: true };

    switch (action) {
      case 'get_events':
        response.data = await auditTrail.queryEvents(filters);
        break;

      case 'get_event':
        if (!eventId) {
          throw new Error('Event ID is required');
        }
        response.data = await auditTrail.getEventById(eventId);
        break;

      case 'get_chain':
        if (!eventId) {
          throw new Error('Event ID is required');
        }
        response.data = await auditTrail.getEventChain(eventId);
        break;

      case 'verify_integrity':
        response.data = await auditTrail.verifyAllChains();
        break;

      case 'export_events':
        response.data = await auditTrail.exportEvents(format);
        break;

      case 'get_correlations':
        response.data = eventCorrelator.getCorrelationResults(
          timeRange * 60 * 1000
        );
        break;

      case 'get_correlation_stats':
        response.data = eventCorrelator.getStatistics();
        break;

      case 'add_correlation_rule':
        if (!filters.rule) {
          throw new Error('Correlation rule is required');
        }
        eventCorrelator.addRule(filters.rule);
        response.data = { message: 'Correlation rule added successfully' };
        break;

      case 'get_retention_policies':
        response.data = retentionManager.getRetentionPolicies();
        break;

      case 'get_archival_jobs':
        response.data = retentionManager.getArchivalJobs(filters.status);
        break;

      case 'export_retention_report':
        response.data = await retentionManager.exportRetentionReport();
        break;

      case 'get_audit_alerts':
        response.data = auditMonitoring.getAlerts(filters);
        break;

      case 'acknowledge_alert':
        if (!alertId) {
          throw new Error('Alert ID is required');
        }
        response.data = {
          acknowledged: auditMonitoring.acknowledgeAlert(
            alertId,
            filters.acknowledgedBy || 'system'
          ),
        };
        break;

      case 'resolve_alert':
        if (!alertId) {
          throw new Error('Alert ID is required');
        }
        response.data = {
          resolved: auditMonitoring.resolveAlert(
            alertId,
            filters.resolvedBy || 'system'
          ),
        };
        break;

      case 'get_audit_metrics':
        response.data = {
          metrics: auditMonitoring.getMetrics(timeRange),
          statistics: auditMonitoring.getStatistics(),
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Audit management error:', error);

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
