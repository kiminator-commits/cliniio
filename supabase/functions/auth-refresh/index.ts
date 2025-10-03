import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, isValidOrigin } from '../auth-login/cors.ts';
import { checkRateLimit } from '../auth-login/rateLimiting.ts';
import { logSecurityEvent } from '../auth-login/security.ts';
import { logger } from '../../_shared/logger.ts';

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(origin) });
  }

  // Validate origin
  if (!isValidOrigin(origin)) {
    logger.warn('Token refresh request from unauthorized origin:', origin);
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
    const { refreshToken, csrfToken } = body;

    if (!refreshToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Refresh token is required' }),
        { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    // Get client information
    const clientId = req.headers.get('x-client-info') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limiting
    const rateLimitResult = await checkRateLimit('token_refresh', ipAddress, clientId);
    if (!rateLimitResult.allowed) {
      logger.warn('Token refresh rate limit exceeded:', { ipAddress, clientId });
      await logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        details: { 
          action: 'token_refresh',
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
      logger.error('Supabase configuration missing for token refresh');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error' }),
        { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Refresh session with Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      logger.warn('Invalid token refresh attempt:', { error: error?.message, ipAddress });
      await logSecurityEvent({
        type: 'invalid_token_refresh',
        severity: 'medium',
        details: { 
          ipAddress,
          clientId,
          error: error?.message || 'No session returned'
        },
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Invalid refresh token' }),
        { status: 401, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    const session = data.session;
    const expiresIn = Math.floor((session.expires_at! - Date.now() / 1000));

    // Log successful token refresh
    await logSecurityEvent({
      type: 'token_refresh_success',
      severity: 'low',
      details: { 
        userId: session.user.id,
        userEmail: session.user.email,
        ipAddress,
        clientId,
        expiresIn
      },
    });

    logger.info('Token refresh successful:', { 
      userId: session.user.id, 
      userEmail: session.user.email,
      expiresIn 
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn,
        },
      }),
      { headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Token refresh error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: 'Token refresh failed'
      }),
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});
