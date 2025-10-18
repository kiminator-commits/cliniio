// Mock Next.js API types for Vite project
interface NextApiRequest {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

interface NextApiResponse {
  status: (code: number) => NextApiResponse;
  json: (data: Record<string, unknown>) => NextApiResponse;
  send: (data: Record<string, unknown>) => NextApiResponse;
}
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // This needs to be set in your environment
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, userData } = req.body as { email: string; userData: Record<string, unknown> };

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Send invitation via Supabase Auth Admin API
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: userData.first_name as string,
        last_name: userData.last_name as string,
        facility_id: userData.facility_id as string,
        role: userData.role as string,
        permissions: userData.permissions as Record<string, unknown>
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?invitation=true`
    });

    if (error) {
      console.error('Supabase invitation error:', error);
      return res.status(400).json({ 
        error: 'Failed to send invitation',
        details: error.message 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: data,
      message: 'Invitation sent successfully' 
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
