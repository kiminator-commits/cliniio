import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, isValidOrigin } from '../auth-login/cors.ts';
import { checkRateLimit } from '../auth-login/rateLimiting.ts';
import { logSecurityEvent } from '../auth-login/security.ts';
import { validateLoginInput } from '../auth-login/validation.ts';
import { logger } from '../../_shared/logger.ts';

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(origin) });
  }

  // Validate origin
  if (!isValidOrigin(origin)) {
    logger.warn('Token validation request from unauthorized origin:', origin);
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized origin' }),
      { status: 403, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { token, csrfToken } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }),
        { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    // Get client information
    const clientId = req.headers.get('x-client-info') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limiting
    const rateLimitResult = await checkRateLimit('token_validation', ipAddress, clientId);
    if (!rateLimitResult.allowed) {
      logger.warn('Token validation rate limit exceeded:', { ipAddress, clientId });
      await logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        details: { 
          action: 'token_validation',
          ipAddress,
          clientId,
          message: rateLimitResult.message 
        },
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded',
          rateLimitInfo: {
            remainingAttempts: 0,
            resetTime: rateLimitResult.resetTime,
          }
        }),
        { status: 429, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      logger.error('Supabase configuration missing for token validation');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error' }),
        { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token validation attempt:', { error: error?.message, ipAddress });
      await logSecurityEvent({
        type: 'invalid_token_validation',
        severity: 'medium',
        details: { 
          ipAddress,
          clientId,
          error: error?.message || 'No user found'
        },
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    // Log successful token validation
    await logSecurityEvent({
      type: 'token_validation_success',
      severity: 'low',
      details: { 
        userId: user.id,
        userEmail: user.email,
        ipAddress,
        clientId
      },
    });

    logger.info('Token validation successful:', { userId: user.id, userEmail: user.email });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
          },
        },
      }),
      { headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Token validation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: 'Token validation failed'
      }),
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});
