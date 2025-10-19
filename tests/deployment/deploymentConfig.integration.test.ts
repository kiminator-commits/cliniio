import { describe, it, expect } from 'vitest';

describe('Deployment Configuration Validation', () => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  it('ensures Supabase credentials are configured', () => {
    expect(env.SUPABASE_URL, 'Missing SUPABASE_URL').toBeTruthy();
    expect(env.SUPABASE_ANON_KEY, 'Missing SUPABASE_ANON_KEY').toBeTruthy();
    expect(env.SUPABASE_URL?.startsWith('https://')).toBe(true);
    expect(env.SUPABASE_ANON_KEY?.length).toBeGreaterThan(30);
  });

  it('validates deployment environment variables for Vercel', () => {
    const validEnvs = ['production', 'preview', 'development'];
    expect(validEnvs.includes(env.VERCEL_ENV || '')).toBe(true);
  });

  it('ensures NEXT_PUBLIC_APP_URL is defined and valid', () => {
    expect(env.NEXT_PUBLIC_APP_URL, 'Missing NEXT_PUBLIC_APP_URL').toBeTruthy();
    expect(env.NEXT_PUBLIC_APP_URL?.startsWith('https://')).toBe(true);
  });

  it('ensures environment is configured for production-ready build', () => {
    if (env.VERCEL_ENV === 'production') {
      expect(env.SUPABASE_URL).toBeDefined();
      expect(env.SUPABASE_ANON_KEY).toBeDefined();
      expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
    }
  });
});
