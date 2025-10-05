import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Simple CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://localhost:3000',
  'https://localhost:3001',
  'https://127.0.0.1:3000',
  'https://127.0.0.1:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

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
}

serve(async (req) => {
  const origin = req.headers.get('origin');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin);
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate origin for non-OPTIONS requests
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
    // Parse request body
    const body: LoginRequest = await req.json();

    // Basic validation
    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required',
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

    // Initialize Supabase client with your project credentials
    const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
    const supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Authenticate user
    console.log('Attempting to authenticate user:', body.email);
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: body.email.trim().toLowerCase(),
        password: body.password,
      });

    console.log('Auth result:', {
      authData: !!authData,
      authError: authError?.message,
    });

    if (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication failed',
          message: authError.message,
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

    if (!authData.user || !authData.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication failed',
          message: 'No user or session returned',
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

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    const userRole = profileData?.role || 'user';

    const response: LoginResponse = {
      success: true,
      data: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresIn: authData.session.expires_in,
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: userRole,
        },
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred',
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
