import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, isValidOrigin } from './cors.ts';
import {
  checkRateLimit,
  getClientId,
  getRateLimitConfig,
} from './rateLimiting.ts';
import { logSecurityEvent, detectSuspiciousActivity } from './security.ts';
import { validateFeedbackInput } from './validation.ts';
import {
  sendEmail,
  DEV_TEAM_EMAILS,
  EmailServiceConfig,
} from './emailService.ts';

serve(async (req) => {
  // Get the origin from the request
  const origin = req.headers.get('origin');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin);
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate origin for non-OPTIONS requests
  if (!isValidOrigin(origin)) {
    const clientId = getClientId(req);
    logSecurityEvent({
      type: 'unauthorized_origin',
      severity: 'high',
      details: {
        origin,
        clientId,
        userAgent: req.headers.get('user-agent') || 'Unknown',
      },
    });

    return new Response(
      JSON.stringify({
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

  // Check rate limiting
  const clientId = getClientId(req);
  const rateLimitResult = checkRateLimit(clientId);

  if (!rateLimitResult.allowed) {
    logSecurityEvent({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      details: {
        clientId,
        origin,
        userAgent: req.headers.get('user-agent') || 'Unknown',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
    });

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ).toString(),
          'X-RateLimit-Limit': getRateLimitConfig().maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(
            rateLimitResult.resetTime / 1000
          ).toString(),
        },
      }
    );
  }

  // Check for suspicious activity patterns
  if (detectSuspiciousActivity(clientId, origin)) {
    return new Response(
      JSON.stringify({
        error: 'Suspicious activity detected',
        message: 'Request blocked due to suspicious activity patterns',
      }),
      {
        status: 429,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    // Parse and validate the request body
    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.warn(`🚨 Invalid JSON in request from ${origin}:`, parseError);
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
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

    // Validate input data
    const validation = validateFeedbackInput(requestBody);
    if (!validation.isValid) {
      logSecurityEvent({
        type: 'validation_failed',
        severity: 'medium',
        details: {
          clientId,
          origin,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          validationErrors: validation.errors,
          requestBody: JSON.stringify(requestBody).substring(0, 500), // Limit size
        },
      });

      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          message: 'Invalid input data',
          details: validation.errors,
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

    // Use validated and sanitized data
    const { feedback_id, feedback_type, title, priority, facility_name } =
      validation.data!;

    // Log successful request for security monitoring
    console.log(`✅ Valid feedback request from ${origin}:`, {
      feedback_id,
      feedback_type,
      priority,
      facility: facility_name || 'Unknown',
      timestamp: new Date().toISOString(),
      origin,
      clientId,
      rateLimitRemaining: rateLimitResult.remaining,
    });

    // Create Supabase client with security validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      logSecurityEvent({
        type: 'invalid_config',
        severity: 'critical',
        details: {
          clientId,
          origin,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          supabaseUrl: !!supabaseUrl,
          serviceRoleKey: !!serviceRoleKey,
        },
      });

      return new Response(
        JSON.stringify({
          error: 'Service configuration error',
          message: 'Service temporarily unavailable',
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

    // Additional security check: Validate service role key format
    if (!serviceRoleKey.startsWith('eyJ') || serviceRoleKey.length < 100) {
      logSecurityEvent({
        type: 'invalid_config',
        severity: 'critical',
        details: {
          clientId,
          origin,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          keyLength: serviceRoleKey.length,
          keyPrefix: serviceRoleKey.substring(0, 10),
        },
      });

      return new Response(
        JSON.stringify({
          error: 'Service configuration error',
          message: 'Service temporarily unavailable',
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

    // Use hardcoded dev team emails instead of looking up admin users
    const recipientEmails = DEV_TEAM_EMAILS;

    if (recipientEmails.length === 0) {
      console.log('No dev team emails configured for feedback notification');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No dev team emails configured',
          recipient_count: 0,
        }),
        {
          headers: {
            ...getCorsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get email service configuration for the facility (if available)
    let emailConfig: EmailServiceConfig = { enabled: false, provider: 'none' };

    if (facility_name) {
      const { data: facilityData, error: facilityError } = await supabaseClient
        .from('facilities')
        .select('id')
        .eq('name', facility_name)
        .single();

      if (facilityData) {
        const { data: configData, error: configError } = await supabaseClient
          .from('facility_notification_config')
          .select('email_service_config')
          .eq('facility_id', facilityData.id)
          .single();

        if (configData?.email_service_config) {
          emailConfig = configData.email_service_config as EmailServiceConfig;
        }
      }
    }

    // Prepare email content
    const emailSubject = `[PRODUCT FEEDBACK - ${priority.toUpperCase()}] ${feedback_type}: ${title}`;
    const emailBody = `New product feedback submitted:

Type: ${feedback_type}
Title: ${title}
Priority: ${priority}
Facility: ${facility_name || 'Unknown'}
Feedback ID: ${feedback_id}
Submitted: ${new Date().toISOString()}

This feedback requires attention from the development team for product improvements. Please review and prioritize accordingly.`;

    // Send email notification to dev team
    try {
      await sendEmail(
        {
          to: recipientEmails,
          subject: emailSubject,
          body: emailBody,
          fromEmail: emailConfig.fromEmail || 'noreply@cliniio.com',
        },
        emailConfig
      );

      console.log('✅ Product feedback email sent to dev team:', {
        feedback_id,
        type: feedback_type,
        title,
        priority,
        facility: facility_name,
        dev_team_emails: recipientEmails,
        email_provider: emailConfig.provider,
        timestamp: new Date().toISOString(),
      });
    } catch (emailError) {
      // Enhanced error logging for email failures
      console.error(
        `❌ Failed to send product feedback email from ${origin}:`,
        {
          error:
            emailError instanceof Error
              ? emailError.message
              : String(emailError),
          feedback_id,
          type: feedback_type,
          priority,
          facility: facility_name,
          origin,
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || 'Unknown',
        }
      );

      // Log the notification details as fallback
      console.log('🔔 PRODUCT FEEDBACK NOTIFICATION (email failed):', {
        feedback_id,
        type: feedback_type,
        title,
        priority,
        facility: facility_name,
        dev_team_emails: recipientEmails,
        origin,
        timestamp: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Product feedback notification sent to dev team',
        recipient_count: recipientEmails.length,
        email_sent: emailConfig.enabled && emailConfig.provider !== 'none',
        email_provider: emailConfig.provider,
      }),
      {
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': getRateLimitConfig().maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(
            rateLimitResult.resetTime / 1000
          ).toString(),
        },
      }
    );
  } catch (error) {
    // Enhanced error logging for security monitoring
    console.error(`🚨 Error in product feedback notification from ${origin}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      origin,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent') || 'Unknown',
    });

    // Return generic error without exposing internal details
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
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
