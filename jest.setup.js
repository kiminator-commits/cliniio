// Polyfills for Node
import { TextEncoder, TextDecoder } from 'util';
import { vi } from 'vitest';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set test environment defaults
process.env.NODE_ENV = 'development';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.location
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
  configurable: true,
});

// Make the mock available globally for tests
global.mockLocationReload = mockReload;

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

// Mock Vite's import.meta.env
global.import = {
  meta: {
    env: {
      DEV: true,
      PROD: false,
      VITE_SUPABASE_URL: 'https://mock-supabase-url.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
    },
  },
};

// Mock fetch for authentication service tests
global.fetch = vi.fn().mockImplementation((url, _options) => {
  // Handle relative URLs by converting them to absolute URLs
  const _absoluteUrl = url.startsWith('/') ? `http://localhost:3000${url}` : url;
  
  // Mock different responses based on URL
  if (url.includes('/auth-login')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        token: 'mock-token',
        expiry: new Date(Date.now() + 3600000).toISOString(),
      }),
      text: () => Promise.resolve('OK'),
    });
  }
  
  if (url.includes('/auth-validate')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        valid: true,
        user: { id: 'test-user', email: 'test@example.com' },
      }),
      text: () => Promise.resolve('OK'),
    });
  }
  
  // Default response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('OK'),
  });
});

// Mock Supabase globally to prevent authentication errors

// Mock Supabase client with authenticated user by default
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: mockUser,
};

vi.mock('./src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      }),
      signIn: vi.fn().mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          then: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          then: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            then: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          then: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          then: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  },
}));

vi.mock('./src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      }),
      signIn: vi.fn().mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          then: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          then: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            then: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          then: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          then: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  },
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
  getSupabaseUrl: vi.fn().mockReturnValue('https://mock-supabase-url.supabase.co'),
  handleSupabaseError: vi.fn().mockImplementation((error) => new Error(error?.message || 'Mock error')),
}));

// Mock PackagingService to prevent authentication errors
vi.mock('./src/services/packagingService', () => ({
  PackagingService: {
    getToolsReadyForPackaging: vi.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Tool 1',
        barcode: 'TEST001',
        category: 'Surgical Instruments',
        status: 'available',
        cycleCount: 0,
        currentPhase: 'complete',
        lastSterilized: new Date().toISOString(),
        operator: 'Test Operator',
      },
    ]),
    createPackage: vi.fn().mockResolvedValue({
      success: true,
      packageId: 'PKG-001',
      message: 'Package created successfully',
    }),
  },
}));

// OPTIMIZED Mock useSterilizationStore - minimal memory footprint
const createMinimalStore = () => ({
  // Store state - minimal data
  currentPackagingSession: null,
  currentBatch: null,
  batchLoading: false,
  packagingLoading: false,
  lastGeneratedCode: null,

  // Actions - lightweight functions
  startPackagingSession: vi.fn(),
  endPackagingSession: vi.fn(),
  addToolToSession: vi.fn(),
  removeToolFromSession: vi.fn(),
  addToolToBatch: vi.fn(),
  removeToolFromBatch: vi.fn(),
  createBatch: vi.fn(),
  finalizeBatch: vi.fn(),
  setShowBatchCodeModal: vi.fn(),
  setShowPackagingScanner: vi.fn(),
});

vi.mock('./src/store/sterilizationStore', () => ({
  useSterilizationStore: vi.fn(() => createMinimalStore()),
}));

// AGGRESSIVE Memory cleanup after each test
import { useLoginStore } from './src/stores/useLoginStore';

afterEach(() => {
  // Reset login store
  useLoginStore.getState().reset();

  // Force garbage collection
  if (global.gc) {
    global.gc();
  }

  // Clear all timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();

  // Clear console to reduce memory
  console.clear();
});

// Force garbage collection before each test
beforeEach(() => {
  if (global.gc) {
    global.gc();
  }
});

// Set memory limits
process.setMaxListeners(0);
