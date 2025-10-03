import {
  MockSupabaseClient,
  SupabaseResponse,
  PostgrestError,
  AuthResponse,
  User,
  Session,
  RealtimeChannel,
  RealtimeSubscription,
  RealtimeCallback,
  RealtimeEventType,
  RealtimeEventFilter,
  TableQueryBuilder,
  SelectQueryBuilder,
  InsertQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
  StorageBucket,
  StorageFile,
  StorageUploadOptions,
  TableName,
  TableRow,
  StorageListOptions,
  Functions,
  SignInCredentials,
  SignUpCredentials,
  VerifyOtpParams,
  ResendParams,
  MockQueryState,
  AuthError,
} from '../types/supabaseMockTypes';
import {
  generateMockError,
  generateTableDataList,
  RealtimeEventSimulator,
  createRealisticMockConfig,
  createErrorTestingMockConfig,
  createPerformanceTestingMockConfig,
} from './supabaseMockEnhancements';
import type { EnhancedMockConfig } from './supabaseMockEnhancements';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock user data
 */
const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'mock-user-id',
  email: 'mock@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  ...overrides,
});

/**
 * Generate mock session data
 */
const createMockSession = (user?: User): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: user || createMockUser(),
});

/**
 * Generate mock PostgrestError
 */
const createMockError = (message = 'Mock error'): PostgrestError => ({
  code: 'MOCK_ERROR',
  message,
  details: 'This is a mock error for testing purposes',
  hint: 'Check your mock configuration',
  name: 'PostgrestError',
});

/**
 * Create AuthError for authentication failures
 */
const createAuthError = (message = 'Auth error'): AuthError => {
  const error = new Error(message) as Error & {
    status: number;
    __isAuthError: boolean;
  };
  error.status = 400;
  error.__isAuthError = true;
  return error as AuthError;
};

// ============================================================================
// MOCK QUERY BUILDERS
// ============================================================================

/**
 * Type-safe mock select query builder
 */
class MockSelectQueryBuilder<T = unknown> implements SelectQueryBuilder<T> {
  private state: MockQueryState;
  private config: EnhancedMockConfig;
  private mockData: T[];

  constructor(
    state: MockQueryState,
    config: EnhancedMockConfig,
    mockData: T[] = []
  ) {
    this.state = state;
    this.config = config;
    this.mockData = mockData;
  }

  private async executeQuery(): Promise<SupabaseResponse<T[]>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    // Enhanced error simulation
    const error = generateMockError(this.config.errorSimulation || {});
    if (error) {
      return {
        data: null,
        error,
      };
    }

    if (this.config.enableLogging) {
      // console.log(`[MOCK] SELECT from ${this.state.table}:`, this.state);
    }

    // Generate realistic data if configured
    let data = this.mockData;
    if (this.config.mockData?.useRealisticData && data.length === 0) {
      const listSize = this.config.mockData.defaultListSize || 10;
      data = generateTableDataList(
        this.state.table as TableName,
        listSize
      ) as T[];
    }

    return {
      data,
      error: null,
    };
  }

  eq(column: string, value: unknown): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'eq', value });
    return this;
  }

  ne(column: string, value: unknown): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'ne', value });
    return this;
  }

  gt(column: string, value: unknown): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: unknown): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: unknown): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: unknown): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  in(column: string, values: unknown[]): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  not(column: string, value: unknown): SelectQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'not', value });
    return this;
  }

  or(filter: string): SelectQueryBuilder<T> {
    this.state.filters.push({ column: '', operator: 'or', value: filter });
    return this;
  }

  and(filter: string): SelectQueryBuilder<T> {
    this.state.filters.push({ column: '', operator: 'and', value: filter });
    return this;
  }

  order(
    column: string,
    options?: { ascending?: boolean }
  ): SelectQueryBuilder<T> {
    if (!this.state.orderBy) {
      this.state.orderBy = [];
    }
    this.state.orderBy.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  limit(count: number): SelectQueryBuilder<T> {
    this.state.limit = count;
    return this;
  }

  range(from: number, to: number): SelectQueryBuilder<T> {
    this.state.offset = from;
    this.state.limit = to - from + 1;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  abortSignal(_signal: AbortSignal): SelectQueryBuilder<T> {
    // Mock implementation - in real scenario, this would handle abort
    return this;
  }

  async then<R>(
    onfulfilled?: (value: SupabaseResponse<T[]>) => R | PromiseLike<R>
  ): Promise<R> {
    const result = await this.executeQuery();
    return onfulfilled ? onfulfilled(result) : (result as unknown as R);
  }

  async single(): Promise<SupabaseResponse<T>> {
    const result = await this.executeQuery();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  async maybeSingle(): Promise<SupabaseResponse<T>> {
    const result = await this.executeQuery();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async count(
    _mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>> {
    const result = await this.executeQuery();
    return {
      data: result.data?.length || 0,
      error: result.error,
    };
  }
}

/**
 * Type-safe mock insert query builder
 */
class MockInsertQueryBuilder<T = unknown> implements InsertQueryBuilder<T> {
  private state: MockQueryState;
  private config: EnhancedMockConfig;
  private data: T | T[];

  constructor(
    state: MockQueryState,
    config: EnhancedMockConfig,
    data: T | T[]
  ) {
    this.state = state;
    this.config = config;
    this.data = data;
  }

  private async executeInsert(): Promise<SupabaseResponse<T[]>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    // Enhanced error simulation
    const error = generateMockError(this.config.errorSimulation || {});
    if (error) {
      return {
        data: null,
        error,
      };
    }

    if (this.config.enableLogging) {
      // console.log(`[MOCK] INSERT into ${this.state.table}:`, this.data);
    }

    const insertedData = Array.isArray(this.data) ? this.data : [this.data];
    return {
      data: insertedData,
      error: null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  select<U = T>(_columns?: string): SelectQueryBuilder<U> {
    return new MockSelectQueryBuilder<U>(this.state, this.config);
  }

  async then<R>(
    onfulfilled?: (value: SupabaseResponse<T[]>) => R | PromiseLike<R>
  ): Promise<R> {
    const result = await this.executeInsert();
    return onfulfilled ? onfulfilled(result) : (result as R);
  }

  async single(): Promise<SupabaseResponse<T>> {
    const result = await this.executeInsert();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  async maybeSingle(): Promise<SupabaseResponse<T>> {
    const result = await this.executeInsert();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async count(
    _mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>> {
    const result = await this.executeInsert();
    return {
      data: result.data?.length || 0,
      error: result.error,
    };
  }
}

/**
 * Type-safe mock update query builder
 */
class MockUpdateQueryBuilder<T = unknown> implements UpdateQueryBuilder<T> {
  private state: MockQueryState;
  private config: EnhancedMockConfig;
  private data: Partial<T>;

  constructor(
    state: MockQueryState,
    config: EnhancedMockConfig,
    data: Partial<T>
  ) {
    this.state = state;
    this.config = config;
    this.data = data;
  }

  private async executeUpdate(): Promise<SupabaseResponse<T[]>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    // Enhanced error simulation
    const error = generateMockError(this.config.errorSimulation || {});
    if (error) {
      return {
        data: null,
        error,
      };
    }

    if (this.config.enableLogging) {
      // console.log(`[MOCK] UPDATE ${this.state.table}:`, this.data);
    }

    return {
      data: [],
      error: null,
    };
  }

  eq(column: string, value: unknown): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'eq', value });
    return this;
  }

  ne(column: string, value: unknown): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'ne', value });
    return this;
  }

  gt(column: string, value: unknown): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: unknown): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: unknown): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: unknown): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  in(column: string, values: unknown[]): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  not(column: string, value: unknown): UpdateQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'not', value });
    return this;
  }

  or(filter: string): UpdateQueryBuilder<T> {
    this.state.filters.push({ column: '', operator: 'or', value: filter });
    return this;
  }

  and(filter: string): UpdateQueryBuilder<T> {
    this.state.filters.push({ column: '', operator: 'and', value: filter });
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  select<U = T>(_columns?: string): SelectQueryBuilder<U> {
    return new MockSelectQueryBuilder<U>(this.state, this.config);
  }

  async then<R>(
    onfulfilled?: (value: SupabaseResponse<T[]>) => R | PromiseLike<R>
  ): Promise<R> {
    const result = await this.executeUpdate();
    return onfulfilled ? onfulfilled(result) : (result as R);
  }

  async single(): Promise<SupabaseResponse<T>> {
    const result = await this.executeUpdate();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  async maybeSingle(): Promise<SupabaseResponse<T>> {
    const result = await this.executeUpdate();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async count(
    _mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>> {
    const result = await this.executeUpdate();
    return {
      data: result.data?.length || 0,
      error: result.error,
    };
  }
}

/**
 * Type-safe mock delete query builder
 */
class MockDeleteQueryBuilder<T = unknown> implements DeleteQueryBuilder<T> {
  private state: MockQueryState;
  private config: EnhancedMockConfig;

  constructor(state: MockQueryState, config: EnhancedMockConfig) {
    this.state = state;
    this.config = config;
  }

  private async executeDelete(): Promise<SupabaseResponse<T[]>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    // Enhanced error simulation
    const error = generateMockError(this.config.errorSimulation || {});
    if (error) {
      return {
        data: null,
        error,
      };
    }

    if (this.config.enableLogging) {
      // console.log(
      //   `[MOCK] DELETE from ${this.state.table}:`,
      //   this.state.filters
      // );
    }

    return {
      data: [],
      error: null,
    };
  }

  eq(column: string, value: unknown): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'eq', value });
    return this;
  }

  ne(column: string, value: unknown): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'ne', value });
    return this;
  }

  gt(column: string, value: unknown): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: unknown): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: unknown): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: unknown): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  in(column: string, values: unknown[]): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  not(column: string, value: unknown): DeleteQueryBuilder<T> {
    this.state.filters.push({ column, operator: 'not', value });
    return this;
  }

  or(filter: string): DeleteQueryBuilder<T> {
    this.state.filters.push({ column: '', operator: 'or', value: filter });
    return this;
  }

  and(filter: string): DeleteQueryBuilder<T> {
    this.state.filters.push({ column: '', operator: 'and', value: filter });
    return this;
  }

  async then<R>(
    onfulfilled?: (value: SupabaseResponse<T[]>) => R | PromiseLike<R>
  ): Promise<R> {
    const result = await this.executeDelete();
    return onfulfilled ? onfulfilled(result) : (result as R);
  }

  async single(): Promise<SupabaseResponse<T>> {
    const result = await this.executeDelete();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  async maybeSingle(): Promise<SupabaseResponse<T>> {
    const result = await this.executeDelete();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async count(
    _mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>> {
    const result = await this.executeDelete();
    return {
      data: result.data?.length || 0,
      error: result.error,
    };
  }
}

/**
 * Type-safe mock table query builder
 */
class MockTableQueryBuilder<T = unknown> implements TableQueryBuilder<T> {
  private state: MockQueryState;
  private config: EnhancedMockConfig;

  constructor(table: string, config: EnhancedMockConfig) {
    this.state = {
      table,
      filters: [],
    };
    this.config = config;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  select<U = T>(_columns?: string): SelectQueryBuilder<U> {
    this.state.columns = _columns;
    return new MockSelectQueryBuilder<U>(this.state, this.config);
  }

  insert<U = T>(
    data: U,
    options?: { count?: 'exact' | 'planned' | 'estimated' }
  ): InsertQueryBuilder<U>;
  insert<U = T>(
    data: U[],
    _options?: { count?: 'exact' | 'planned' | 'estimated' }
  ): InsertQueryBuilder<U>;
  insert<U = T>(data: U | U[]): InsertQueryBuilder<U> {
    return new MockInsertQueryBuilder<U>(this.state, this.config, data);
  }

  update<U = T>(
    data: Partial<U>,
    options?: { count?: 'exact' | 'planned' | 'estimated' }
  ): UpdateQueryBuilder<U>;
  update<U = T>(
    data: Partial<U>[],
    _options?: { count?: 'exact' | 'planned' | 'estimated' }
  ): UpdateQueryBuilder<U>;
  update<U = T>(data: Partial<U> | Partial<U>[]): UpdateQueryBuilder<U> {
    return new MockUpdateQueryBuilder<U>(
      this.state,
      this.config,
      data as Partial<U>
    );
  }

  delete<U = T>(options?: {
    count?: 'exact' | 'planned' | 'estimated';
  }): DeleteQueryBuilder<U>;
  delete<U = T>(): DeleteQueryBuilder<U>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete<U = T>(_options?: {
    count?: 'exact' | 'planned' | 'estimated';
  }): DeleteQueryBuilder<U> {
    return new MockDeleteQueryBuilder<U>(this.state, this.config);
  }
}

// ============================================================================
// MOCK REALTIME IMPLEMENTATION
// ============================================================================

/**
 * Type-safe mock realtime channel
 */
class MockRealtimeChannel implements RealtimeChannel {
  private name: string;
  private config: EnhancedMockConfig;
  private subscriptions: RealtimeSubscription[] = [];

  constructor(name: string, config: EnhancedMockConfig) {
    this.name = name;
    this.config = config;
  }

  on<T = unknown>(
    event: RealtimeEventType,
    filter: RealtimeEventFilter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    callback: RealtimeCallback<T>
  ): { subscribe: (callback?: RealtimeCallback<T>) => RealtimeSubscription } {
    if (this.config.enableLogging) {
      // console.log(
      //   `[MOCK] Channel ${this.name}: Subscribed to ${event}`,
      //   filter
      // );
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscribe: (callback?: RealtimeCallback<T>): RealtimeSubscription => {
        const subscription: RealtimeSubscription = {
          unsubscribe: () => {
            this.subscriptions = this.subscriptions.filter(
              (s) => s !== subscription
            );
            if (this.config.enableLogging) {
              // console.log(`[MOCK] Channel ${this.name}: Unsubscribed`);
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          send: (event: string, payload: unknown) => {
            if (this.config.enableLogging) {
              // console.log(
              //   `[MOCK] Channel ${this.name}: Sending ${event}`,
              //   payload
              // );
            }
          },
        };

        this.subscriptions.push(subscription);
        if (this.config.enableLogging) {
          // console.log(`[MOCK] Channel ${this.name}: Subscription active`);
        }

        return subscription;
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribe<T = unknown>(callback?: RealtimeCallback<T>): RealtimeSubscription {
    const subscription: RealtimeSubscription = {
      unsubscribe: () => {
        this.subscriptions = this.subscriptions.filter(
          (s) => s !== subscription
        );
        if (this.config.enableLogging) {
          // console.log(`[MOCK] Channel ${this.name}: Direct unsubscription`);
        }
      },
      send: (event: string, payload: unknown) => {
        if (this.config.enableLogging) {
          // console.log(`[MOCK] Channel ${this.name}: Sending ${event}`, payload);
        }
      },
    };

    this.subscriptions.push(subscription);
    if (this.config.enableLogging) {
      // console.log(`[MOCK] Channel ${this.name}: Direct subscription active`);
    }

    return subscription;
  }

  unsubscribe(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  send(event: string, payload: unknown): void {
    if (this.config.enableLogging) {
      // console.log(`[MOCK] Channel ${this.name}: Sending ${event}`, payload);
    }
  }
}

// ============================================================================
// MOCK STORAGE IMPLEMENTATION
// ============================================================================

/**
 * Type-safe mock storage bucket
 */
class MockStorageBucket implements StorageBucket {
  private bucketName: string;
  private config: EnhancedMockConfig;

  public id: string;
  public name: string;
  public owner: string;
  public created_at: string;
  public updated_at: string;
  public public: boolean;

  constructor(bucketName: string, config: EnhancedMockConfig) {
    this.bucketName = bucketName;
    this.config = config;
    this.id = `mock-bucket-${bucketName}`;
    this.name = bucketName;
    this.owner = 'mock-owner';
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.public = false;
  }

  async upload(
    path: string,
    file: File | Blob,
    options?: StorageUploadOptions
  ): Promise<SupabaseResponse<StorageFile>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error: this.config.defaultError || createMockError('Upload failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(`[MOCK] Storage upload to ${this.bucketName}/${path}`);
    }

    const mockFile: StorageFile = {
      name: path.split('/').pop() || 'unknown',
      id: `mock-${Date.now()}`,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      metadata: (options || {}) as Record<string, unknown>,
      buckets: {
        id: `mock-bucket-${this.bucketName}`,
        name: this.bucketName,
        owner: 'mock-owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        public: false,
      },
    };

    return {
      data: mockFile,
      error: null,
    };
  }

  async download(path: string): Promise<SupabaseResponse<Blob>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error: this.config.defaultError || createMockError('Download failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(`[MOCK] Storage download from ${this.bucketName}/${path}`);
    }

    return {
      data: new Blob(['mock file content']),
      error: null,
    };
  }

  async list(
    path?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: StorageListOptions
  ): Promise<SupabaseResponse<StorageFile[]>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error: this.config.defaultError || createMockError('List failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(`[MOCK] Storage list ${this.bucketName}/${path || ''}`);
    }

    return {
      data: [],
      error: null,
    };
  }

  async remove(paths: string[]): Promise<SupabaseResponse<StorageFile[]>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error: this.config.defaultError || createMockError('Remove failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(`[MOCK] Storage remove from ${this.bucketName}:`, paths);
    }

    return {
      data: [],
      error: null,
    };
  }

  async createSignedUrl(
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expiresIn: number
  ): Promise<SupabaseResponse<{ signedUrl: string }>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error:
          this.config.defaultError ||
          createMockError('Signed URL creation failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(
      //   `[MOCK] Storage createSignedUrl for ${this.bucketName}/${path}`
      // );
    }

    return {
      data: {
        signedUrl: `https://mock-signed-url.com/${this.bucketName}/${path}`,
      },
      error: null,
    };
  }

  async createSignedUploadUrl(
    path: string
  ): Promise<
    SupabaseResponse<{ signedUrl: string; path: string; token: string }>
  > {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error:
          this.config.defaultError ||
          createMockError('Signed upload URL creation failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(
      //   `[MOCK] Storage createSignedUploadUrl for ${this.bucketName}/${path}`
      // );
    }

    return {
      data: {
        signedUrl: `https://mock-signed-upload-url.com/${this.bucketName}/${path}`,
        path: path,
        token: 'mock-upload-token',
      },
      error: null,
    };
  }

  getPublicUrl(path: string): { data: { publicUrl: string } } {
    return {
      data: {
        publicUrl: `https://mock-public-url.com/${this.bucketName}/${path}`,
      },
    };
  }

  async move(
    fromPath: string,
    toPath: string
  ): Promise<SupabaseResponse<StorageFile>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error: this.config.defaultError || createMockError('Move failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(
      //   `[MOCK] Storage move from ${this.bucketName}/${fromPath} to ${toPath}`
      // );
    }

    const mockFile: StorageFile = {
      name: toPath.split('/').pop() || 'unknown',
      id: `mock-${Date.now()}`,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      metadata: {},
      buckets: {
        id: `mock-bucket-${this.bucketName}`,
        name: this.bucketName,
        owner: 'mock-owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        public: false,
      },
    };

    return {
      data: mockFile,
      error: null,
    };
  }

  async copy(
    fromPath: string,
    toPath: string
  ): Promise<SupabaseResponse<StorageFile>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error: this.config.defaultError || createMockError('Copy failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(
      //   `[MOCK] Storage copy from ${this.bucketName}/${fromPath} to ${toPath}`
      // );
    }

    const mockFile: StorageFile = {
      name: toPath.split('/').pop() || 'unknown',
      id: `mock-${Date.now()}`,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      metadata: {},
      buckets: {
        id: `mock-bucket-${this.bucketName}`,
        name: this.bucketName,
        owner: 'mock-owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        public: false,
      },
    };

    return {
      data: mockFile,
      error: null,
    };
  }
}

// ============================================================================
// MOCK FUNCTIONS IMPLEMENTATION
// ============================================================================

/**
 * Type-safe mock functions
 */
class MockFunctions implements Functions {
  private config: EnhancedMockConfig;

  constructor(config: EnhancedMockConfig) {
    this.config = config;
  }

  async invoke<T = unknown>(
    functionName: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
    }
  ): Promise<SupabaseResponse<T>> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: null,
        error:
          this.config.defaultError ||
          createMockError('Function invocation failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log(`[MOCK] Functions invoke ${functionName}:`, options);
    }

    return {
      data: {} as T,
      error: null,
    };
  }
}

// ============================================================================
// MOCK AUTH IMPLEMENTATION
// ============================================================================

/**
 * Type-safe mock auth
 */
class MockAuth {
  private config: EnhancedMockConfig;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  constructor(config: EnhancedMockConfig) {
    this.config = config;
  }

  async getUser(): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('Get user failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth getUser');
    }

    return {
      data: { user: this.currentUser, session: this.currentSession },
      error: null,
    };
  }

  async getSession(): Promise<{
    data: { session: Session | null };
    error: PostgrestError | null;
  }> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { session: null },
        error: createMockError('Get session failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth getSession');
    }

    return {
      data: { session: this.currentSession },
      error: null,
    };
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('Sign in failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth signIn:', credentials.email);
    }

    const user = createMockUser({ email: credentials.email });
    const session = createMockSession(user);
    this.currentUser = user;
    this.currentSession = session;

    return {
      data: { user, session },
      error: null,
    };
  }

  async signInWithPassword(
    credentials: SignInCredentials
  ): Promise<AuthResponse> {
    return this.signIn(credentials);
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('Sign up failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth signUp:', credentials.email);
    }

    const user = createMockUser({ email: credentials.email });
    const session = createMockSession(user);
    this.currentUser = user;
    this.currentSession = session;

    return {
      data: { user, session },
      error: null,
    };
  }

  async signOut(): Promise<{ error: PostgrestError | null }> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        error: createMockError('Sign out failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth signOut');
    }

    this.currentUser = null;
    this.currentSession = null;

    return { error: null };
  }

  async signInWithOAuth(provider: string): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('OAuth sign in failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth signInWithOAuth:', provider);
    }

    const user = createMockUser();
    const session = createMockSession(user);
    this.currentUser = user;
    this.currentSession = session;

    return {
      data: { user, session },
      error: null,
    };
  }

  async resetPasswordForEmail(
    email: string
  ): Promise<{ data: Record<string, never>; error: PostgrestError | null }> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: {},
        error: createMockError('Password reset failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth resetPasswordForEmail:', email);
    }

    return { data: {}, error: null };
  }

  async verifyOtp(params: VerifyOtpParams): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('OTP verification failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth verifyOtp:', params.type);
    }

    const user = createMockUser();
    const session = createMockSession(user);
    this.currentUser = user;
    this.currentSession = session;

    return {
      data: { user, session },
      error: null,
    };
  }

  async resend(
    params: ResendParams
  ): Promise<{ data: Record<string, never>; error: PostgrestError | null }> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: {},
        error: createMockError('Resend failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth resend:', params.type, params.email);
    }

    return { data: {}, error: null };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): {
    data: { subscription: { unsubscribe: () => void } };
  } {
    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth onAuthStateChange');
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            if (this.config.enableLogging) {
              // console.log('[MOCK] Auth onAuthStateChange unsubscribe');
            }
          },
        },
      },
    };
  }

  async refreshSession(): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('Session refresh failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth refreshSession');
    }

    return {
      data: { user: this.currentUser, session: this.currentSession },
      error: null,
    };
  }

  async setSession(session: Session): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('Set session failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth setSession');
    }

    this.currentSession = session;
    this.currentUser = session.user;

    return {
      data: { user: this.currentUser, session: this.currentSession },
      error: null,
    };
  }

  async setUser(user: User): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('Set user failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth setUser');
    }

    this.currentUser = user;

    return {
      data: { user: this.currentUser, session: this.currentSession },
      error: null,
    };
  }

  async updateUser(attributes: Partial<User>): Promise<AuthResponse> {
    if (this.config.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }

    if (this.config.simulateErrors) {
      return {
        data: { user: null, session: null },
        error: createAuthError('Update user failed'),
      };
    }

    if (this.config.enableLogging) {
      // console.log('[MOCK] Auth updateUser');
    }

    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...attributes };
    }

    return {
      data: { user: this.currentUser, session: this.currentSession },
      error: null,
    };
  }
}

// ============================================================================
// MAIN MOCK CLIENT IMPLEMENTATION
// ============================================================================

/**
 * Type-safe Supabase mock client
 */
export class TypeSafeMockSupabaseClient implements MockSupabaseClient {
  public auth: MockAuth;
  public storage: { from: (bucket: string) => MockStorageBucket };
  public functions: MockFunctions;
  public realtime: {
    channel: (name: string) => RealtimeChannel;
    removeChannel: (subscription: RealtimeSubscription) => Promise<'ok'>;
    removeAllChannels: () => Promise<'ok'>;
    getChannels: () => RealtimeChannel[];
  };
  private config: EnhancedMockConfig;
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventSimulator: RealtimeEventSimulator;

  constructor(config: EnhancedMockConfig = {}) {
    this.config = {
      simulateErrors: false,
      enableLogging: true,
      delay: 0,
      errorSimulation: {
        errorProbability: 0,
      },
      mockData: {
        defaultListSize: 10,
        useRealisticData: false,
      },
      realtime: {
        simulateEvents: false,
        eventInterval: 5000,
        eventTypes: ['INSERT', 'UPDATE', 'DELETE'],
      },
      ...config,
    };

    this.eventSimulator = new RealtimeEventSimulator(this.config);

    this.auth = new MockAuth(this.config);
    this.functions = new MockFunctions(this.config);

    this.storage = {
      from: (bucket: string) => new MockStorageBucket(bucket, this.config),
    };

    this.realtime = {
      channel: (name: string) => {
        if (!this.channels.has(name)) {
          const channel = new MockRealtimeChannel(name, this.config);
          this.channels.set(name, channel);

          // Start realtime simulation if configured
          if (this.config.realtime?.simulateEvents) {
            // Extract table name from channel name (e.g., "public:inventory_items" -> "inventory_items")
            const tableName = name.split(':').pop() as TableName;
            this.eventSimulator.startSimulation(name, tableName);
          }
        }
        return this.channels.get(name)!;
      },
      removeChannel: async (subscription: RealtimeSubscription) => {
        subscription.unsubscribe();
        this.eventSimulator.stopSimulation(subscription.toString());
        if (this.config.enableLogging) {
          // console.log('[MOCK] Realtime removeChannel');
        }
        return 'ok';
      },
      removeAllChannels: async () => {
        this.channels.forEach((channel) => channel.unsubscribe());
        this.eventSimulator.stopAllSimulations();
        this.channels.clear();
        if (this.config.enableLogging) {
          // console.log('[MOCK] Realtime removeAllChannels');
        }
        return 'ok';
      },
      getChannels: () => Array.from(this.channels.values()),
    };
  }

  from<T = unknown>(table: string): TableQueryBuilder<T> {
    return new MockTableQueryBuilder<T>(table, this.config);
  }

  channel(name: string): RealtimeChannel {
    return this.realtime.channel(name);
  }

  async removeChannel(subscription: RealtimeSubscription): Promise<'ok'> {
    return this.realtime.removeChannel(subscription);
  }
}

/**
 * Create a type-safe mock Supabase client
 */
export function createTypeSafeMockSupabaseClient(
  config?: EnhancedMockConfig
): TypeSafeMockSupabaseClient {
  return new TypeSafeMockSupabaseClient(config);
}

/**
 * Create a typed table query builder for a specific table
 */
export function createTypedTableQueryBuilder<T extends TableName>(
  table: T,
  config?: EnhancedMockConfig
): TableQueryBuilder<TableRow<T>> {
  return new MockTableQueryBuilder<TableRow<T>>(table, config || {});
}

// ============================================================================
// ENHANCED FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a realistic mock client for development/testing
 */
export function createRealisticMockClient(
  overrides?: Partial<EnhancedMockConfig>
): TypeSafeMockSupabaseClient {
  const config = createRealisticMockConfig(overrides);
  return new TypeSafeMockSupabaseClient(config);
}

/**
 * Create an error-testing mock client
 */
export function createErrorTestingMockClient(
  overrides?: Partial<EnhancedMockConfig>
): TypeSafeMockSupabaseClient {
  const config = createErrorTestingMockConfig(overrides);
  return new TypeSafeMockSupabaseClient(config);
}

/**
 * Create a performance-testing mock client
 */
export function createPerformanceTestingMockClient(
  overrides?: Partial<EnhancedMockConfig>
): TypeSafeMockSupabaseClient {
  const config = createPerformanceTestingMockConfig(overrides);
  return new TypeSafeMockSupabaseClient(config);
}

/**
 * Create a mock client with custom data generators
 */
export function createCustomDataMockClient(
  customGenerators: Record<
    string,
    (overrides?: Record<string, unknown>) => Record<string, unknown>
  >,
  overrides?: Partial<EnhancedMockConfig>
): TypeSafeMockSupabaseClient {
  const config: EnhancedMockConfig = {
    ...createRealisticMockConfig(overrides),
    mockData: {
      ...createRealisticMockConfig().mockData,
      customGenerators,
    },
  };
  return new TypeSafeMockSupabaseClient(config);
}

// Default export for easy importing
export const supabase = createRealisticMockClient();
