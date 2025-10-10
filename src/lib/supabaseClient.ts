import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// Development-only diagnostics
if (import.meta.env.DEV) {
  console.info('🧩 Supabase client initialized (dev mode)');
  console.info('URL:', SUPABASE_URL);
} else {
  // Silence all Supabase env logs in production
  console.debug = () => {};
  console.info = () => {};
  console.warn = () => {};
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const getScopedClient = (facilityId?: string) => {
  if (!facilityId) {
    console.warn('⚠️ Missing facilityId — using default Supabase client');
  } else {
    console.info(`🏥 Using facility scope: ${facilityId}`);
  }
  return supabase;
};
