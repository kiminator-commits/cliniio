// Supabase credentials from environment variables only
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';

export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// This ensures the credentials are always available, regardless of environment variable loading
export const getSupabaseCredentials = () => ({
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
});
