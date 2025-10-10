/**
 * Example usage of the type-safe Supabase mock client
 * This demonstrates how to use the new mock in different scenarios
 */
import { vi } from 'vitest';

// Define proper interfaces for mock client options
interface MockClientOptions {
  delay?: number;
  errorRate?: number;
  dataSize?: number;
  [key: string]: unknown;
}

interface MockSupabaseClient {
  from: (table: string) => MockQueryBuilder;
  auth: MockAuthClient;
  [key: string]: unknown;
}

interface MockQueryBuilder {
  select: (columns?: string) => MockQueryBuilder;
  insert: (data: unknown) => MockQueryBuilder;
  update: (data: unknown) => MockQueryBuilder;
  delete: () => MockQueryBuilder;
  eq: (column: string, value: unknown) => MockQueryBuilder;
  single: () => Promise<{ data: unknown; error: unknown }>;
  limit: (count: number) => MockQueryBuilder;
  range: (from: number, to: number) => MockQueryBuilder;
  order: (
    column: string,
    options?: { ascending?: boolean }
  ) => MockQueryBuilder;
  [key: string]: unknown;
}

interface MockAuthClient {
  getUser: () => Promise<{ data: { user: unknown }; error: unknown }>;
  signIn: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ data: unknown; error: unknown }>;
  signOut: () => Promise<{ error: unknown }>;
  getSession: () => Promise<{ data: { session: unknown }; error: unknown }>;
  [key: string]: unknown;
}

// Mock function declarations for examples
declare function createRealisticMockClient(
  options: MockClientOptions
): MockSupabaseClient;
declare function createErrorTestingMockClient(
  options: MockClientOptions
): MockSupabaseClient;
declare function createPerformanceTestingMockClient(
  options: MockClientOptions
): MockSupabaseClient;
declare function createTypeSafeMockSupabaseClient(
  options: MockClientOptions
): MockSupabaseClient;

// import {
//   createTypeSafeMockSupabaseClient,
//   createRealisticMockClient,
//   createErrorTestingMockClient,
//   createPerformanceTestingMockClient,
// } from '../__mocks__/supabase/supabaseMockClient';
import { TestMockClients } from '../lib/supabaseMockIntegration';

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic mock client usage
 */
export async function basicUsageExample() {
  // Create a basic mock client
  // const mockClient = createTypeSafeMockSupabaseClient();
  // Use it like a real Supabase client
  // const { data, error } = await mockClient
  //   .from('inventory_items')
  //   .select('*')
  //   .eq('category', 'sterilization_tools');
  // console.log('Basic usage result:', { data, error });
}

/**
 * Example 2: Realistic mock client with generated data
 */
export async function realisticUsageExample() {
  // Create a realistic mock client that generates data based on schema
  const mockClient: MockSupabaseClient = createRealisticMockClient({
    mockData: {
      defaultListSize: 10,
      useRealisticData: true,
    },
  }) as MockSupabaseClient;

  // This will return realistic inventory items
  const { data } = await mockClient
    .from('inventory_items')
    .select('*')
    .limit(5);

  console.log('Realistic data:', data);
}

/**
 * Example 3: Error testing mock client
 */
export async function errorTestingExample() {
  // Create a mock client that simulates errors
  const mockClient: MockSupabaseClient = createErrorTestingMockClient({
    errorSimulation: {
      errorProbability: 0.8, // 80% chance of error
      errorTypes: ['UNAUTHORIZED', 'UNIQUE_VIOLATION'],
    },
  }) as MockSupabaseClient;

  try {
    const { data, error } = await mockClient
      .from('inventory_items')
      .select('*');

    if (error) {
      console.log('Expected error:', error);
    } else {
      console.log('Unexpected success:', data);
    }
  } catch (err) {
    console.log('Caught error:', err);
  }
}

/**
 * Example 4: Performance testing mock client
 */
export async function performanceTestingExample() {
  // Create a mock client for performance testing
  const mockClient: MockSupabaseClient = createPerformanceTestingMockClient({
    mockData: {
      defaultListSize: 1000,
    },
  }) as MockSupabaseClient;

  const startTime = Date.now();

  const { data } = await mockClient
    .from('inventory_items')
    .select('*')
    .limit(1000);

  const endTime = Date.now();
  console.log(
    `Performance test: ${endTime - startTime}ms for ${(data as unknown[] | null)?.length || 0} items`
  );
}

// ============================================================================
// AUTHENTICATION EXAMPLES
// ============================================================================

/**
 * Example 5: Authentication flow
 */
export async function authenticationExample() {
  const mockClient: MockSupabaseClient = createRealisticMockClient(
    {}
  ) as MockSupabaseClient;

  // Sign in
  const { data: signInData, error: signInError } = await mockClient.auth.signIn(
    {
      email: 'test@example.com',
      password: 'password123',
    }
  );

  if (signInError) {
    console.log('Sign in failed:', signInError);
    return;
  }

  console.log('Signed in user:', (signInData as { user: unknown }).user);

  // Get current user
  const { data: userData } = await mockClient.auth.getUser();
  console.log('Current user:', (userData as { user: unknown } | null)?.user);

  // Sign out
  const { error: signOutError } = await mockClient.auth.signOut();
  if (signOutError) {
    console.log('Sign out failed:', signOutError);
  } else {
    console.log('Successfully signed out');
  }
}

// ============================================================================
// REALTIME EXAMPLES
// ============================================================================

/**
 * Example 6: Realtime subscriptions
 */
export async function realtimeExample() {
  const mockClient: MockSupabaseClient = createRealisticMockClient({
    realtime: {
      simulateEvents: true,
      eventInterval: 2000, // Events every 2 seconds
      eventTypes: ['INSERT', 'UPDATE', 'DELETE'],
    },
  }) as MockSupabaseClient;

  // Subscribe to realtime events
  const subscription = (
    mockClient as {
      channel: (name: string) => {
        on: (
          event: string,
          config: unknown,
          callback: (payload: unknown) => void
        ) => { subscribe: () => { unsubscribe: () => void } };
      };
    }
  )
    .channel('public:inventory_items')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'inventory_items' },
      (payload) => {
        console.log('Realtime event:', payload);
      }
    )
    .subscribe();

  // Wait for some events
  setTimeout(() => {
    subscription.unsubscribe();
    console.log('Unsubscribed from realtime events');
  }, 10000);
}

// ============================================================================
// STORAGE EXAMPLES
// ============================================================================

/**
 * Example 7: Storage operations
 */
export async function storageExample() {
  const mockClient: MockSupabaseClient = createRealisticMockClient(
    {}
  ) as MockSupabaseClient;

  // Upload a file
  const file = new Blob(['test content'], { type: 'text/plain' });
  const { data: uploadData, error: uploadError } = await (
    mockClient as {
      storage: {
        from: (bucket: string) => {
          upload: (
            path: string,
            file: Blob
          ) => Promise<{ data: unknown; error: unknown }>;
        };
      };
    }
  ).storage
    .from('test-bucket')
    .upload('test-file.txt', file);

  if (uploadError) {
    console.log('Upload failed:', uploadError);
    return;
  }

  console.log('File uploaded:', uploadData);

  // Get public URL
  const { data: urlData } = (
    mockClient as {
      storage: {
        from: (bucket: string) => {
          getPublicUrl: (path: string) => { data: { publicUrl: string } };
        };
      };
    }
  ).storage
    .from('test-bucket')
    .getPublicUrl('test-file.txt');

  console.log('Public URL:', urlData.publicUrl);

  // Download file
  const { data: downloadData, error: downloadError } = await (
    mockClient as {
      storage: {
        from: (bucket: string) => {
          download: (
            path: string
          ) => Promise<{ data: unknown; error: unknown }>;
        };
      };
    }
  ).storage
    .from('test-bucket')
    .download('test-file.txt');

  if (downloadError) {
    console.log('Download failed:', downloadError);
  } else {
    console.log('File downloaded:', downloadData);
  }
}

// ============================================================================
// TEST INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example 8: Using with Jest tests
 */
export function jestIntegrationExample() {
  // In a test file, you would use:

  // Option 1: Use the test mock clients
  const basicMock = TestMockClients.basic();
  const realisticMock = TestMockClients.realistic();
  const errorMock = TestMockClients.errorTesting();

  // Option 2: Create custom mock with specific responses
  const customMock = createTypeSafeMockSupabaseClient({
    mockData: {
      customGenerators: {
        inventory_items: () => ({
          id: 'custom-id',
          name: 'Custom Item',
          category: 'custom-category',
          quantity: 100,
        }),
      },
    },
  } as Record<string, unknown>);

  return { basicMock, realisticMock, errorMock, customMock };
}

/**
 * Example 9: Migration from old mock patterns
 */
export function migrationExample() {
  // Old pattern (what you might have had before):
  const oldMockClient = {
    from: vi.fn(),
    auth: {
      signIn: vi.fn(),
      getUser: vi.fn(),
    },
  };

  // New pattern (type-safe and more powerful):
  const newMockClient = createTypeSafeMockSupabaseClient({
    enableLogging: true,
    mockData: {
      useRealisticData: true,
    },
  } as Record<string, unknown>);

  // The new client provides:
  // - Full type safety
  // - Realistic data generation
  // - Error simulation
  // - Realtime event simulation
  // - Storage operations
  // - Better Jest integration

  return { oldMockClient, newMockClient };
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

/**
 * Run all examples (for demonstration purposes)
 */
export async function runAllExamples() {
  console.log('=== Running Supabase Mock Examples ===\n');

  try {
    console.log('1. Basic Usage:');
    await basicUsageExample();
    console.log('');

    console.log('2. Realistic Usage:');
    await realisticUsageExample();
    console.log('');

    console.log('3. Error Testing:');
    await errorTestingExample();
    console.log('');

    console.log('4. Performance Testing:');
    await performanceTestingExample();
    console.log('');

    console.log('5. Authentication:');
    await authenticationExample();
    console.log('');

    console.log('6. Realtime:');
    await realtimeExample();
    console.log('');

    console.log('7. Storage:');
    await storageExample();
    console.log('');

    console.log('8. Jest Integration:');
    jestIntegrationExample();
    console.log('');

    console.log('9. Migration:');
    migrationExample();
    console.log('');

    console.log('=== All examples completed ===');
  } catch (error) {
    console.error('Example failed:', error);
  }
}
