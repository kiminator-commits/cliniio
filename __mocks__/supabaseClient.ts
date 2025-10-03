import { vi } from 'vitest';

// Global Supabase client mock for Vitest
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { id: 'mock-user' } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
};

export default mockSupabaseClient;
