import { vi } from 'vitest';
import { MockSupabaseClient } from '../types/supabaseMockTypes';

// Mock Supabase client for testing
export const createMockSupabaseClient = (): MockSupabaseClient => ({
  auth: {
    signInWithPassword: vi
      .fn<MockSupabaseClient['auth']['signInWithPassword']>()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signUp: vi
      .fn<MockSupabaseClient['auth']['signUp']>()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: vi
      .fn<MockSupabaseClient['auth']['signOut']>()
      .mockResolvedValue({ error: null }),
    getSession: vi
      .fn<MockSupabaseClient['auth']['getSession']>()
      .mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi
      .fn<MockSupabaseClient['auth']['getUser']>()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    onAuthStateChange: vi
      .fn<MockSupabaseClient['auth']['onAuthStateChange']>()
      .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    refreshSession: vi
      .fn<MockSupabaseClient['auth']['refreshSession']>()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    setSession: vi
      .fn<MockSupabaseClient['auth']['setSession']>()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    setUser: vi
      .fn<MockSupabaseClient['auth']['setUser']>()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    updateUser: vi
      .fn<MockSupabaseClient['auth']['updateUser']>()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    resetPasswordForEmail: vi
      .fn<MockSupabaseClient['auth']['resetPasswordForEmail']>()
      .mockResolvedValue({ data: {}, error: null }),
    verifyOtp: vi
      .fn<MockSupabaseClient['auth']['verifyOtp']>()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    resend: vi
      .fn<MockSupabaseClient['auth']['resend']>()
      .mockResolvedValue({ data: {}, error: null }),
  },
  from: vi.fn().mockImplementation(
    () =>
      ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ne: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        like: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        and: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        count: vi.fn().mockResolvedValue({ data: 0, error: null, count: 0 }),
        abortSignal: vi.fn().mockReturnThis(),
      }) as any
  ) as any,
  storage: {
    from: vi.fn(
      () =>
        ({
          upload: (vi.fn() as any).mockResolvedValue({
            data: null,
            error: null,
          }),
          download: (vi.fn() as any).mockResolvedValue({
            data: null,
            error: null,
          }),
          list: (vi.fn() as any).mockResolvedValue({ data: [], error: null }),
          remove: (vi.fn() as any).mockResolvedValue({
            data: [],
            error: null,
          }),
          createSignedUrl: (vi.fn() as any).mockResolvedValue({
            data: { signedUrl: '' },
            error: null,
          }),
          createSignedUploadUrl: (vi.fn() as any).mockResolvedValue({
            data: { signedUrl: '', path: '', token: '' },
            error: null,
          }),
          getPublicUrl: (vi.fn() as any).mockReturnValue({
            data: { publicUrl: '' },
          }),
          move: (vi.fn() as any).mockResolvedValue({
            data: null,
            error: null,
          }),
          copy: (vi.fn() as any).mockResolvedValue({
            data: null,
            error: null,
          }),
        }) as any
    ),
  },
  functions: {
    invoke: (vi.fn() as any).mockResolvedValue({ data: null, error: null }),
  },
  realtime: {
    channel: vi.fn(
      () =>
        ({
          on: vi.fn().mockReturnThis(),
          subscribe: (vi.fn() as any).mockReturnValue({
            unsubscribe: vi.fn(),
          }),
          unsubscribe: vi.fn(),
          send: vi.fn(),
        }) as any
    ),
    removeAllChannels: (vi.fn() as any).mockResolvedValue('ok'),
    getChannels: (vi.fn() as any).mockReturnValue([]),
  },
  removeChannel: (vi.fn() as any).mockResolvedValue('ok'),
});

// Mock Supabase module
export const mockSupabase = {
  supabase: createMockSupabaseClient(),
  getSupabaseUrl: vi.fn(() => 'https://test.supabase.co'),
  getSupabaseClient: vi.fn(() => createMockSupabaseClient()),
};

// Mock Supabase auth responses
export const mockAuthResponses = {
  success: {
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          name: 'Dr. Smith',
          role: 'User',
        },
      },
      session: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
    },
    error: null,
  },
  failure: {
    data: {
      user: null,
      session: null,
    },
    error: {
      message: 'Invalid login credentials',
      status: 400,
      code: 'INVALID_LOGIN_CREDENTIALS',
    },
  },
  networkError: {
    data: {
      user: null,
      session: null,
    },
    error: {
      message: 'Network error',
      status: 0,
      code: 'NETWORK_ERROR',
    },
  },
};

// Mock Supabase database responses
export const mockDatabaseResponses = {
  success: {
    data: [],
    error: null,
    count: 0,
  },
  error: {
    data: null,
    error: {
      message: 'Database error',
      code: 'DB_ERROR',
    },
    count: null,
  },
};

// Helper function to set up Supabase mocks for specific test scenarios
export const setupSupabaseMocks = (
  scenario: 'success' | 'failure' | 'networkError' = 'success'
) => {
  const mockClient = createMockSupabaseClient();

  // Set up auth mocks based on scenario
  (
    mockClient.auth.signInWithPassword as vi.MockedFunction<
      () => Promise<unknown>
    >
  ).mockResolvedValue(mockAuthResponses[scenario] as any);
  (
    mockClient.auth.signUp as vi.MockedFunction<() => Promise<unknown>>
  ).mockResolvedValue(mockAuthResponses[scenario] as any);
  (
    mockClient.auth.getSession as vi.MockedFunction<() => Promise<unknown>>
  ).mockResolvedValue(mockAuthResponses[scenario] as any);
  (
    mockClient.auth.getUser as vi.MockedFunction<() => Promise<unknown>>
  ).mockResolvedValue(mockAuthResponses[scenario] as any);

  // Set up database mocks
  const mockFrom = mockClient.from as any;
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ne: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: (
      vi.fn() as vi.MockedFunction<() => Promise<unknown>>
    ).mockResolvedValue(mockDatabaseResponses.success as any),
    maybeSingle: (
      vi.fn() as vi.MockedFunction<() => Promise<unknown>>
    ).mockResolvedValue(mockDatabaseResponses.success as any),
    count: (
      vi.fn() as vi.MockedFunction<() => Promise<unknown>>
    ).mockResolvedValue(mockDatabaseResponses.success as any),
    abortSignal: vi.fn().mockReturnThis(),
  } as any);

  return mockClient;
};

// Export default mock
export default mockSupabase;
