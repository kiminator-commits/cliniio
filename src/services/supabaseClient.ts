import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { getEnvVar } from '../lib/getEnv';

// Get environment variables with proper fallbacks
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://mock.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'mock-anon-key');

// Create Supabase client with fallback values for CI/testing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
