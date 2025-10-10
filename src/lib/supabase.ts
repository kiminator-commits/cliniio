// Re-export the centralized Supabase client to avoid multiple instances
import { supabase } from './supabaseClient';
export { supabase };
import { getEnvVar } from './getEnv';
import { getSupabaseCredentials } from '../config/supabaseCredentials';

// Export types for better TypeScript support
export type SupabaseClientType = typeof supabase;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  // Function to get environment variables dynamically
  function getEnvironmentVariables() {
    // Try environment variables first
    let supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
    let supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

    // Fallback to permanent credentials if environment variables are missing
    if (!supabaseUrl || !supabaseAnonKey) {
      const permanentCreds = getSupabaseCredentials();
      supabaseUrl = permanentCreds.url;
      supabaseAnonKey = permanentCreds.anonKey;
    }

    return {
      supabaseUrl,
      supabaseAnonKey,
    };
  }

  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://mock.supabase.co'
  );
};

// Helper function to get database URL for debugging
export const getSupabaseUrl = (): string => {
  function getEnvironmentVariables() {
    let supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
    let supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

    // Fallback to permanent credentials if environment variables are missing
    if (!supabaseUrl || !supabaseAnonKey) {
      const permanentCreds = getSupabaseCredentials();
      supabaseUrl = permanentCreds.url;
      supabaseAnonKey = permanentCreds.anonKey;
    }

    return {
      supabaseUrl,
      supabaseAnonKey,
    };
  }

  const { supabaseUrl } = getEnvironmentVariables();
  return supabaseUrl || '';
};

// Error handling wrapper for Supabase operations
export const handleSupabaseError = (
  error: Error | { message?: string; error_description?: string } | string
): Error => {
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (error?.message) {
    return new Error(error.message);
  }
  if (
    typeof error === 'object' &&
    'error_description' in error &&
    error.error_description
  ) {
    return new Error(error.error_description);
  }
  return new Error('An unexpected error occurred with Supabase');
};
