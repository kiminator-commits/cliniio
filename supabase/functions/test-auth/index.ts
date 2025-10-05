import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const origin = req.headers.get('origin');

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Test Supabase connection
    const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
    const supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test authentication
    const body = await req.json();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authError.message,
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Authentication successful',
        userId: authData.user?.id,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
