import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, isValidOrigin } from '../auth-login/cors.ts';
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
    logger.warn('Logout request from unauthorized origin:', origin);
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
    const { csrfToken } = body;

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get client information
    const clientId = req.headers.get('x-client-info') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      logger.error('Supabase configuration missing for logout');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error' }),
        { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get user info before logout for logging
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      logger.warn('Invalid token during logout:', { error: userError.message, ipAddress });
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Supabase logout error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Logout failed' }),
        { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    // Log successful logout
    await logSecurityEvent({
      type: 'logout_success',
      severity: 'low',
      details: { 
        userId: user?.id || 'unknown',
        userEmail: user?.email || 'unknown',
        ipAddress,
        clientId
      },
    });

    logger.info('Logout successful:', { 
      userId: user?.id, 
      userEmail: user?.email,
      ipAddress 
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Logout successful',
      }),
      { headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Logout error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: 'Logout failed'
      }),
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});
