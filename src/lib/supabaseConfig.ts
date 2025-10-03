// This file is only used in non-test environments
// It uses import.meta.env which Jest cannot parse
export const getSupabaseConfig = () => {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
};

export const isSupabaseConfigured = (): boolean => {
  const config = getSupabaseConfig();
  return !!(config.supabaseUrl && config.supabaseAnonKey);
};
