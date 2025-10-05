import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, isValidOrigin } from './cors.ts';
import {
  checkRateLimit,
  getClientId,
  getRateLimitConfig,
} from './rateLimiting.ts';
import { logSecurityEvent, detectSuspiciousActivity } from './security.ts';
import { validateLoginInput } from './validation.ts';
import { getDistributedRateLimiter } from './redisCluster.ts';
import { getThreatIntelligenceService } from './threatIntelligence.ts';
import { getSecurityMonitoringService } from './monitoring.ts';
import { getImmutableAuditTrail } from './auditTrail.ts';
import { getSecurityEventCorrelator } from './eventCorrelation.ts';
import { getAuditRetentionManager } from './auditRetention.ts';
import { getAuditMonitoringService } from './auditMonitoring.ts';

interface LoginRequest {
  email: string;
  password: string;
  csrfToken?: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
  error?: string;
  rateLimitInfo?: {
    remainingAttempts: number;
    resetTime: number;
  };
}

serve(async (req) => {
  const startTime = Date.now();
  const origin = req.headers.get('origin');
  const clientId = getClientId(req);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin);
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate origin for non-OPTIONS requests
  if (!isValidOrigin(origin)) {
    await logSecurityEvent({
      type: 'unauthorized_origin',
      severity: 'high',
      details: {
        origin,
        clientId,
        userAgent: req.headers.get('user-agent') || 'Unknown',
        timestamp: new Date().toISOString(),
      },
    });

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
    // Parse request body
    const body: LoginRequest = await req.json();

    // Validate input
    const validationResult = validateLoginInput(body);
    if (!validationResult.isValid) {
      await logSecurityEvent({
        type: 'invalid_input',
        severity: 'medium',
        details: {
          clientId,
          email: body.email,
          errors: validationResult.errors,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid input',
          message: validationResult.errors.join(', '),
        }),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { email, password, csrfToken, rememberMe } = body;
    const ipAddress =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Enhanced distributed rate limiting
    const distributedRateLimiter = await getDistributedRateLimiter();
    const rateLimitResult =
      await distributedRateLimiter.checkDistributedRateLimit(
        email,
        ipAddress,
        clientId
      );

    if (!rateLimitResult.allowed) {
      const monitoringService = getSecurityMonitoringService();
      monitoringService.recordRateLimitHit();

      await logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'high',
        details: {
          clientId,
          email,
          ipAddress,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          rateLimitInfo: rateLimitResult,
          distributed: rateLimitResult.distributed,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          message:
            rateLimitResult.message ||
            'Too many login attempts. Please try again later.',
          rateLimitInfo: {
            remainingAttempts: 0,
            resetTime: rateLimitResult.resetTime,
          },
        }),
        {
          status: 429,
          headers: {
            ...getCorsHeaders(origin),
            'Content-Type': 'application/json',
            'Retry-After': rateLimitResult.retryAfter?.toString() || '300',
          },
        }
      );
    }

    // Threat intelligence analysis
    const threatIntelligence = getThreatIntelligenceService();
    const threatAnalysis = await threatIntelligence.analyzeThreat(ipAddress);

    if (threatAnalysis.isThreat && threatAnalysis.threatLevel === 'critical') {
      const monitoringService = getSecurityMonitoringService();
      monitoringService.recordThreatDetection();

      await logSecurityEvent({
        type: 'threat_detected',
        severity: 'critical',
        details: {
          clientId,
          email,
          ipAddress,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          threatAnalysis,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Security threat detected',
          message: 'This IP address has been identified as a security threat.',
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

    // Detect suspicious activity patterns
    const suspiciousActivity = await detectSuspiciousActivity(
      email,
      ipAddress,
      clientId
    );
    if (suspiciousActivity.detected) {
      const monitoringService = getSecurityMonitoringService();
      monitoringService.recordSecurityEvent(
        'suspicious_activity',
        suspiciousActivity.severity,
        {
          clientId,
          email,
          ipAddress,
          patterns: suspiciousActivity.patterns,
        }
      );

      await logSecurityEvent({
        type: 'suspicious_activity',
        severity: suspiciousActivity.severity,
        details: {
          clientId,
          email,
          ipAddress,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          suspiciousPatterns: suspiciousActivity.patterns,
          threatAnalysis,
          timestamp: new Date().toISOString(),
        },
      });

      // Block the request if highly suspicious
      if (suspiciousActivity.severity === 'critical') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Security violation detected',
            message:
              'This request has been blocked due to suspicious activity.',
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
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      await logSecurityEvent({
        type: 'configuration_error',
        severity: 'critical',
        details: {
          clientId,
          email,
          supabaseUrlConfigured: !!supabaseUrl,
          serviceRoleKeyConfigured: !!serviceRoleKey,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Service configuration error',
          message: 'Authentication service temporarily unavailable',
        }),
        {
          status: 503,
          headers: {
            ...getCorsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    // Attempt authentication with Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    const processingTime = Date.now() - startTime;

    if (error) {
      const monitoringService = getSecurityMonitoringService();
      const auditTrail = getImmutableAuditTrail();
      const eventCorrelator = getSecurityEventCorrelator();
      const auditMonitoring = getAuditMonitoringService();

      monitoringService.recordLoginAttempt(false, processingTime);

      // Record failed attempt with enhanced rate limiting
      await distributedRateLimiter.checkDistributedRateLimit(
        email,
        ipAddress,
        clientId,
        true
      );

      // Create comprehensive audit event
      const auditEventId = await auditTrail.recordEvent(
        'login_failure',
        'medium',
        email,
        'authenticate',
        'user_account',
        'failure',
        {
          errorMessage: error.message,
          errorCode: error.status,
          processingTime,
          threatAnalysis,
          clientId,
          ipAddress,
          userAgent: req.headers.get('user-agent') || 'Unknown',
        },
        {
          ipAddress,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          sessionId: clientId,
        }
      );

      // Process event for correlation
      const correlationResults = await eventCorrelator.processEvent({
        id: auditEventId,
        eventType: 'login_failure',
        severity: 'medium',
        actor: email,
        action: 'authenticate',
        resource: 'user_account',
        outcome: 'failure',
        timestamp: Date.now(),
        details: {
          errorMessage: error.message,
          errorCode: error.status,
          processingTime,
          threatAnalysis,
        },
      });

      // Execute correlation actions
      for (const result of correlationResults) {
        await eventCorrelator.executeActions(result);
      }

      // Process for audit monitoring
      await auditMonitoring.processEvent({
        id: auditEventId,
        eventType: 'login_failure',
        severity: 'medium',
        actor: email,
        action: 'authenticate',
        resource: 'user_account',
        outcome: 'failure',
        timestamp: Date.now(),
        responseTime: processingTime,
        ipAddress,
        userAgent: req.headers.get('user-agent') || 'Unknown',
      });

      await logSecurityEvent({
        type: 'login_failure',
        severity: 'medium',
        details: {
          clientId,
          email,
          ipAddress,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          errorMessage: error.message,
          errorCode: error.status,
          processingTime,
          threatAnalysis,
          auditEventId,
          correlationResults: correlationResults.length,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication failed',
          message: 'Invalid email or password',
        }),
        {
          status: 401,
          headers: {
            ...getCorsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!data.session || !data.user) {
      await logSecurityEvent({
        type: 'login_failure',
        severity: 'high',
        details: {
          clientId,
          email,
          ipAddress,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          errorMessage: 'No session or user returned',
          processingTime,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication failed',
          message: 'No session returned from authentication',
        }),
        {
          status: 401,
          headers: {
            ...getCorsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Successful authentication
    const monitoringService = getSecurityMonitoringService();
    const auditTrail = getImmutableAuditTrail();
    const eventCorrelator = getSecurityEventCorrelator();
    const auditMonitoring = getAuditMonitoringService();

    monitoringService.recordLoginAttempt(true, processingTime);

    // Reset rate limiting on successful login
    await distributedRateLimiter.checkDistributedRateLimit(
      email,
      ipAddress,
      clientId,
      false,
      true
    );

    // Create comprehensive audit event for successful login
    const auditEventId = await auditTrail.recordEvent(
      'login_success',
      'low',
      email,
      'authenticate',
      'user_account',
      'success',
      {
        userId: data.user.id,
        processingTime,
        threatAnalysis,
        clientId,
        ipAddress,
        userAgent: req.headers.get('user-agent') || 'Unknown',
        sessionExpiry: data.session.expires_at,
      },
      {
        ipAddress,
        userAgent: req.headers.get('user-agent') || 'Unknown',
        sessionId: data.session.access_token.substring(0, 16),
      }
    );

    // Process event for correlation
    const correlationResults = await eventCorrelator.processEvent({
      id: auditEventId,
      eventType: 'login_success',
      severity: 'low',
      actor: email,
      action: 'authenticate',
      resource: 'user_account',
      outcome: 'success',
      timestamp: Date.now(),
      details: {
        userId: data.user.id,
        processingTime,
        threatAnalysis,
        sessionExpiry: data.session.expires_at,
      },
    });

    // Execute correlation actions
    for (const result of correlationResults) {
      await eventCorrelator.executeActions(result);
    }

    // Process for audit monitoring
    await auditMonitoring.processEvent({
      id: auditEventId,
      eventType: 'login_success',
      severity: 'low',
      actor: email,
      action: 'authenticate',
      resource: 'user_account',
      outcome: 'success',
      timestamp: Date.now(),
      responseTime: processingTime,
      ipAddress,
      userAgent: req.headers.get('user-agent') || 'Unknown',
    });

    await logSecurityEvent({
      type: 'login_success',
      severity: 'low',
      details: {
        clientId,
        email,
        ipAddress,
        userAgent: req.headers.get('user-agent') || 'Unknown',
        userId: data.user.id,
        processingTime,
        threatAnalysis,
        auditEventId,
        correlationResults: correlationResults.length,
        timestamp: new Date().toISOString(),
      },
    });

    const response: LoginResponse = {
      success: true,
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: data.user.user_metadata?.role || 'user',
        },
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    await logSecurityEvent({
      type: 'server_error',
      severity: 'high',
      details: {
        clientId,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
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
