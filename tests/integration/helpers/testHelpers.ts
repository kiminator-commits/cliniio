import { vi } from 'vitest';
import { createEnhancedMockSupabaseClient } from '../mocks/supabaseMockFactory';
import { testInventoryItem, testLargeDataset } from '../fixtures/testData';

// Test helper functions for Supabase integration tests

export const setupMockSupabase = () => {
  const mockSupabase = createEnhancedMockSupabaseClient();
  return mockSupabase;
};

export const setupMockTable = (
  mockSupabase: Record<string, unknown>,
  response: Record<string, unknown>
) => {
  // Create a mock query object that can be chained
  const createMockQuery = (finalResponse: Record<string, unknown>) => {
    const mockOrder = vi.fn().mockResolvedValue(finalResponse);
    const mockEq = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(finalResponse),
      }),
      order: mockOrder,
    });
    const mockOr = vi.fn().mockReturnValue({ order: mockOrder });
    const mockNot = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(finalResponse),
    });

    return {
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(finalResponse),
        order: mockOrder,
        eq: mockEq,
        or: mockOr,
        not: mockNot,
      }),
      eq: mockEq,
      or: mockOr,
      not: mockNot,
      order: mockOrder,
    };
  };

  // Create mock methods for different operations
  const mockQuery = createMockQuery(response);

  const mockInsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue(response),
    }),
  });

  const mockUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(response),
      }),
    }),
  });

  const mockDelete = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue(response),
  });

  // Set up the from method to return the table with all methods
  mockSupabase.from = vi.fn().mockReturnValue({
    select: mockQuery.select,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    // Add query methods directly on the table object
    eq: mockQuery.eq,
    order: mockQuery.order,
    or: mockQuery.or,
    not: mockQuery.not,
  });
};

export const setupMockAuth = (
  mockSupabase: Record<string, unknown>,
  response: Record<string, unknown>
) => {
  const auth = mockSupabase.auth as Record<string, unknown>;
  auth.signInWithPassword = vi.fn().mockResolvedValue(response);
  auth.signUp = vi.fn().mockResolvedValue(response);
  auth.signOut = vi.fn().mockResolvedValue(response);
  auth.getUser = vi.fn().mockResolvedValue(response);
  auth.getSession = vi.fn().mockResolvedValue(response);
  auth.resetPasswordForEmail = vi.fn().mockResolvedValue(response);
};

export const setupMockSubscription = (
  mockSupabase: Record<string, unknown>
) => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  };
  (mockSupabase as Record<string, unknown>).channel = vi
    .fn()
    .mockReturnValue(mockChannel);
};

export const createMockInventoryResponse = (
  data: Record<string, unknown>[] = [],
  count?: number
) => ({
  data,
  error: null,
  count,
});

export const createMockAuthResponse = (
  user: Record<string, unknown> | null = null,
  session: Record<string, unknown> | null = null,
  error: string | null = null
) => {
  if (error) {
    // Return Supabase-style error response
    return {
      data: { user: null, session: null },
      error: { message: error, status: 400 },
    };
  }

  // Return success response
  return {
    data: { user, session },
    error: null,
  };
};

export const createMockErrorResponse = (message: string, code?: string) => ({
  data: null,
  error: { message, code },
});

export const createMockLargeDatasetResponse = (
  count: number = 1000,
  pageSize: number = 50
) => {
  const data = testLargeDataset.slice(0, pageSize);
  return {
    data,
    error: null,
    count,
    success: true,
    processedCount: count,
    errorCount: 0,
  };
};

export const createMockBulkResponse = (items: Record<string, unknown>[]) => {
  const data = items.map((item, i) => ({ ...item, id: `bulk-${i}` }));
  return createMockInventoryResponse(data);
};

export const createMockCategoriesResponse = (categories: string[]) => {
  const data = categories.map((cat) => ({ category: cat }));
  return createMockInventoryResponse(data);
};

export const createMockLocationsResponse = (locations: string[]) => {
  const data = locations.map((loc) => ({ location: loc }));
  return createMockInventoryResponse(data);
};

export const createMockSearchResponse = (query: string) => {
  // Simulate search results based on query
  const results = testLargeDataset.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );
  return createMockInventoryResponse(results, results.length);
};

export const createMockPaginationResponse = (
  data: Record<string, unknown>[],
  page: number,
  limit: number,
  total: number
) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);
  return createMockInventoryResponse(paginatedData, total);
};

export const createMockFilterResponse = (
  data: Record<string, unknown>[],
  filters: Record<string, unknown>
) => {
  let filteredData = [...data];

  if (filters.category) {
    filteredData = filteredData.filter(
      (item) => item.category === filters.category
    );
  }

  if (filters.location) {
    filteredData = filteredData.filter(
      (item) => item.location === filters.location
    );
  }

  if (filters.status) {
    filteredData = filteredData.filter(
      (item) => item.status === filters.status
    );
  }

  if (filters.minQuantity !== undefined) {
    filteredData = filteredData.filter(
      (item) => (item.quantity as number) >= (filters.minQuantity as number)
    );
  }

  if (filters.maxQuantity !== undefined) {
    filteredData = filteredData.filter(
      (item) => (item.quantity as number) <= (filters.maxQuantity as number)
    );
  }

  if (filters.minCost !== undefined) {
    filteredData = filteredData.filter(
      (item) => (item.unit_cost as number) >= (filters.minCost as number)
    );
  }

  if (filters.maxCost !== undefined) {
    filteredData = filteredData.filter(
      (item) => (item.unit_cost as number) <= (filters.maxCost as number)
    );
  }

  return createMockInventoryResponse(filteredData, filteredData.length);
};

export const createMockSortResponse = (
  data: Record<string, unknown>[],
  field: string,
  direction: 'asc' | 'desc'
) => {
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (direction === 'asc') {
      return (aValue as number) < (bValue as number)
        ? -1
        : (aValue as number) > (bValue as number)
          ? 1
          : 0;
    } else {
      return (aValue as number) > (bValue as number)
        ? -1
        : (aValue as number) < (bValue as number)
          ? 1
          : 0;
    }
  });

  return createMockInventoryResponse(sortedData, sortedData.length);
};

export const createMockConcurrentUpdateResponse = (
  itemId: string,
  updates: Record<string, unknown>[]
) => {
  // Simulate the last update winning
  const lastUpdate = updates[updates.length - 1];
  const updatedItem = { ...testInventoryItem, id: itemId, ...lastUpdate };

  return createMockInventoryResponse([updatedItem]);
};

export const createMockTransactionResponse = (
  operations: Record<string, unknown>[]
) => {
  const results = operations.map((op) => {
    if (op.success) {
      return { data: op.data, error: null };
    } else {
      return { data: null, error: { message: op.error } };
    }
  });

  return results;
};

export const createMockRealTimeEvent = (
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  table: string,
  record: Record<string, unknown>
) => ({
  type,
  table,
  record,
  timestamp: new Date().toISOString(),
});

export const createMockPerformanceResponse = (
  data: Record<string, unknown>[],
  executionTime: number
) => ({
  data,
  error: null,
  count: data.length,
  executionTime,
});

export const createMockDataIntegrityResponse = (
  initial: Record<string, unknown>,
  updated: Record<string, unknown>
) => ({
  initial: createMockInventoryResponse([initial]),
  updated: createMockInventoryResponse([updated]),
});

export const validateResponseStructure = (
  response: Record<string, unknown>
) => {
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('error');
  expect(response).toHaveProperty('count');
};

export const validateErrorResponse = (
  response: Record<string, unknown>,
  expectedError: string
) => {
  if (response === null) {
    expect(response).toBeNull();
    return;
  }

  expect(response.error).toBe(expectedError);
  // Handle both AuthResponse and InventoryResponse structures
  if (response.data !== undefined) {
    expect(response.data).toBeNull();
  }
  if (response.user !== undefined) {
    expect(response.user).toBeNull();
  }
};

export const validateSuccessResponse = (
  response: Record<string, unknown>,
  expectedData?: Record<string, unknown>
) => {
  expect(response.error === null || response.error === undefined).toBe(true);

  // Handle different response structures
  if (response.data !== undefined) {
    expect(response.data).toBeDefined();
    if (expectedData) {
      expect(response.data).toEqual(expectedData);
    }
  }

  if (response.user !== undefined) {
    expect(response.user).toBeDefined();
    if (expectedData) {
      expect(response.user).toEqual(expectedData);
    }
  }
};

export const validatePerformance = async (
  fn: () => Promise<unknown>,
  maxTime: number = 1000
) => {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();
  const executionTime = endTime - startTime;

  expect(executionTime).toBeLessThan(maxTime);
  return result;
};

export const validateConcurrency = async (operations: Promise<unknown>[]) => {
  const startTime = Date.now();
  const results = await Promise.all(operations);
  const endTime = Date.now();

  const executionTime = endTime - startTime;
  expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds

  return results;
};

export const validateDataConsistency = (
  initial: Record<string, unknown>,
  updated: Record<string, unknown>,
  expectedChanges: Record<string, unknown>
) => {
  // Verify that only expected fields changed
  Object.keys(expectedChanges).forEach((key) => {
    expect(updated[key]).toBe(expectedChanges[key]);
  });

  // Verify that other fields remained unchanged
  Object.keys(initial).forEach((key) => {
    if (!(key in expectedChanges)) {
      expect(updated[key]).toBe(initial[key]);
    }
  });
};

export const validateSubscriptionSetup = (
  mockOn: ReturnType<typeof vi.fn>,
  mockSubscribe: ReturnType<typeof vi.fn>
) => {
  expect(mockOn).toHaveBeenCalledWith(
    'postgres_changes',
    expect.any(Object),
    expect.any(Function)
  );
  expect(mockSubscribe).toHaveBeenCalled();
};

export const validateAuthFlow = async (
  mockSupabase: Record<string, unknown>,
  credentials: Record<string, unknown>,
  expectedUser: Record<string, unknown>
) => {
  const mockResponse = createMockAuthResponse(expectedUser, {
    access_token: 'test-token',
  });
  setupMockAuth(mockSupabase, mockResponse);

  // This would be called by the auth service
  const result = await (
    mockSupabase.auth as {
      signInWithPassword: (
        credentials: Record<string, unknown>
      ) => Promise<{ user: Record<string, unknown>; error: null }>;
    }
  ).signInWithPassword(credentials);

  expect(result.user).toEqual(expectedUser);
  expect(result.error).toBeNull();
};

export const validateInventoryOperations = async (
  mockSupabase: Record<string, unknown>,
  operation: 'create' | 'update' | 'delete',
  item: Record<string, unknown>,
  expectedResponse: Record<string, unknown>
) => {
  const mockResponse = createMockInventoryResponse([expectedResponse]);
  setupMockTable(mockSupabase, mockResponse);

  let result;
  switch (operation) {
    case 'create':
      result = await (
        mockSupabase.from as (table: string) => {
          insert: (item: Record<string, unknown>) => {
            select: () => { single: () => Promise<Record<string, unknown>> };
          };
        }
      )('inventory_items')
        .insert(item)
        .select()
        .single();
      break;
    case 'update':
      result = await (
        mockSupabase.from as (table: string) => {
          update: (item: Record<string, unknown>) => {
            eq: (
              field: string,
              value: string
            ) => {
              select: () => { single: () => Promise<Record<string, unknown>> };
            };
          };
        }
      )('inventory_items')
        .update(item)
        .eq('id', item.id as string)
        .select()
        .single();
      break;
    case 'delete':
      result = await (
        mockSupabase.from as (table: string) => {
          delete: () => {
            eq: (
              field: string,
              value: string
            ) => {
              select: () => { single: () => Promise<Record<string, unknown>> };
            };
          };
        }
      )('inventory_items')
        .delete()
        .eq('id', item.id as string)
        .select()
        .single();
      break;
  }

  expect(result).toEqual(mockResponse);
};

export const simulateNetworkError = (
  mockSupabase: Record<string, unknown>,
  method: string
) => {
  const error = new Error('Network timeout');
  (mockSupabase[method] as ReturnType<typeof vi.fn>).mockRejectedValue(error);
};

export const simulateRateLimit = (
  mockSupabase: Record<string, unknown>,
  method: string
) => {
  const rateLimitResponse = createMockErrorResponse('Too many requests', '429');
  (mockSupabase[method] as ReturnType<typeof vi.fn>).mockResolvedValue(
    rateLimitResponse
  );
};

export const simulatePermissionDenied = (
  mockSupabase: Record<string, unknown>
) => {
  const permissionError = createMockErrorResponse(
    'Permission denied',
    'PGRST116'
  );

  // Ensure mockSupabase.from is a mock function
  if (!mockSupabase.from || typeof mockSupabase.from !== 'function') {
    mockSupabase.from = vi.fn();
  }

  // Create a mock query that returns the error
  const mockOrder = vi.fn().mockResolvedValue(permissionError);
  const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

  // Set up the from method to return the error
  (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
    select: mockSelect,
  });
};

export const simulateValidationError = (
  mockSupabase: Record<string, unknown>,
  method: string,
  details: string = 'Validation failed'
) => {
  const validationError = createMockErrorResponse(details, 'VALIDATION_ERROR');

  // Ensure mockSupabase.from is a mock function
  if (!mockSupabase.from || typeof mockSupabase.from !== 'function') {
    mockSupabase.from = vi.fn();
  }

  // Create a mock query that returns the error
  const mockSingle = vi.fn().mockResolvedValue(validationError);
  const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });

  // Set up the from method to return the error
  (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
    insert: vi.fn().mockReturnValue({ select: mockSelect }),
  });
};
