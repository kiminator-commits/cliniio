import { getEnvVar } from './getEnv';

export const supabaseUrl =
  getEnvVar('VITE_SUPABASE_URL') || 'https://test.supabase.co';
export const supabaseAnonKey =
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 'test-anon-key';
