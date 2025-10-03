// Typed Supabase Mock Types
// This file provides proper TypeScript types for all Supabase mock implementations

import {
  User,
  Session,
  AuthResponse,
  PostgrestError,
  AuthError,
} from '@supabase/supabase-js';

// Re-export commonly used types
export type { User, Session, AuthResponse, PostgrestError, AuthError };

// ============================================================================
// CORE SUPABASE TYPES
// ============================================================================

export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: PostgrestError | null;
  count?: number | null;
}

export interface SupabaseSingleResponse<T = unknown> {
  data: T | null;
  error: PostgrestError | null;
}

// ============================================================================
// QUERY BUILDER TYPES
// ============================================================================

export interface MockQueryState {
  table: string;
  columns?: string;
  filters: Array<{ column: string; operator: string; value: unknown }>;
  orderBy?: Array<{ column: string; ascending: boolean }>;
  limit?: number;
  offset?: number;
}

export interface SelectQueryBuilder<T = unknown> {
  eq(column: string, value: unknown): SelectQueryBuilder<T>;
  ne(column: string, value: unknown): SelectQueryBuilder<T>;
  gt(column: string, value: unknown): SelectQueryBuilder<T>;
  gte(column: string, value: unknown): SelectQueryBuilder<T>;
  lt(column: string, value: unknown): SelectQueryBuilder<T>;
  lte(column: string, value: unknown): SelectQueryBuilder<T>;
  like(column: string, pattern: string): SelectQueryBuilder<T>;
  ilike(column: string, pattern: string): SelectQueryBuilder<T>;
  in(column: string, values: unknown[]): SelectQueryBuilder<T>;
  not(column: string, value: unknown): SelectQueryBuilder<T>;
  or(filter: string): SelectQueryBuilder<T>;
  and(filter: string): SelectQueryBuilder<T>;
  order(
    column: string,
    options?: { ascending?: boolean }
  ): SelectQueryBuilder<T>;
  limit(count: number): SelectQueryBuilder<T>;
  range(from: number, to: number): SelectQueryBuilder<T>;
  single(): Promise<SupabaseSingleResponse<T>>;
  maybeSingle(): Promise<SupabaseSingleResponse<T>>;
  count(
    mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>>;
  abortSignal(signal: AbortSignal): SelectQueryBuilder<T>;
  then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

export interface InsertQueryBuilder<T = unknown> {
  select(columns?: string): SelectQueryBuilder<T>;
  single(): Promise<SupabaseSingleResponse<T>>;
  maybeSingle(): Promise<SupabaseSingleResponse<T>>;
  count(
    mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>>;
  then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

export interface UpdateQueryBuilder<T = unknown> {
  eq(column: string, value: unknown): UpdateQueryBuilder<T>;
  ne(column: string, value: unknown): UpdateQueryBuilder<T>;
  gt(column: string, value: unknown): UpdateQueryBuilder<T>;
  gte(column: string, value: unknown): UpdateQueryBuilder<T>;
  lt(column: string, value: unknown): UpdateQueryBuilder<T>;
  lte(column: string, value: unknown): UpdateQueryBuilder<T>;
  like(column: string, pattern: string): UpdateQueryBuilder<T>;
  ilike(column: string, pattern: string): UpdateQueryBuilder<T>;
  in(column: string, values: unknown[]): UpdateQueryBuilder<T>;
  not(column: string, value: unknown): UpdateQueryBuilder<T>;
  or(filter: string): UpdateQueryBuilder<T>;
  and(filter: string): UpdateQueryBuilder<T>;
  select(columns?: string): SelectQueryBuilder<T>;
  single(): Promise<SupabaseSingleResponse<T>>;
  maybeSingle(): Promise<SupabaseSingleResponse<T>>;
  count(
    mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>>;
  then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

export interface DeleteQueryBuilder<T = unknown> {
  eq(column: string, value: unknown): DeleteQueryBuilder<T>;
  ne(column: string, value: unknown): DeleteQueryBuilder<T>;
  gt(column: string, value: unknown): DeleteQueryBuilder<T>;
  gte(column: string, value: unknown): DeleteQueryBuilder<T>;
  lt(column: string, value: unknown): DeleteQueryBuilder<T>;
  lte(column: string, value: unknown): DeleteQueryBuilder<T>;
  like(column: string, pattern: string): DeleteQueryBuilder<T>;
  ilike(column: string, pattern: string): DeleteQueryBuilder<T>;
  in(column: string, values: unknown[]): DeleteQueryBuilder<T>;
  not(column: string, value: unknown): DeleteQueryBuilder<T>;
  or(filter: string): DeleteQueryBuilder<T>;
  and(filter: string): DeleteQueryBuilder<T>;
  single(): Promise<SupabaseSingleResponse<T>>;
  maybeSingle(): Promise<SupabaseSingleResponse<T>>;
  count(
    mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>>;
  then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

export interface TableQueryBuilder<T = unknown> {
  select(columns?: string): SelectQueryBuilder<T>;
  insert(data: T | T[]): InsertQueryBuilder<T>;
  update(data: Partial<T>): UpdateQueryBuilder<T>;
  delete(): DeleteQueryBuilder<T>;
}

// ============================================================================
// REALTIME TYPES
// ============================================================================

// ============================================================================
// ADDITIONAL TYPE DEFINITIONS
// ============================================================================

export type RealtimeEventType =
  | 'postgres_changes'
  | 'broadcast'
  | 'presence'
  | 'phoenix_error';

export interface RealtimeEventFilter {
  event?: string;
  schema?: string;
  table?: string;
  filter?: string;
}

export type RealtimeCallback<T = unknown> = (payload: T) => void;

export interface RealtimePayload {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
  errors: string[] | null;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
  send: (event: string, payload: unknown) => void;
}

export type TableName = string;

export type TableRow = Record<string, unknown>;

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, unknown>;
  buckets: {
    id: string;
    name: string;
    owner: string;
    created_at: string;
    updated_at: string;
    public: boolean;
  };
}

export interface StorageUploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export interface StorageListOptions {
  limit?: number;
  offset?: number;
  sortBy?: { column: string; order: 'asc' | 'desc' };
}

export interface Functions {
  invoke<T = unknown>(
    functionName: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
    }
  ): Promise<SupabaseResponse<T>>;
}

export interface ResendParams {
  type:
    | 'signup'
    | 'magiclink'
    | 'recovery'
    | 'email_change'
    | 'phone_change'
    | 'invite';
  email?: string;
  phone?: string;
}

export interface RealtimeChannel {
  on<T = unknown>(
    event: RealtimeEventType,
    filter: RealtimeEventFilter,
    callback: RealtimeCallback<T>
  ): { subscribe: (callback?: RealtimeCallback<T>) => RealtimeSubscription };
  subscribe<T = unknown>(callback?: RealtimeCallback<T>): RealtimeSubscription;
  unsubscribe(): void;
  send(event: string, payload: unknown): void;
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface StorageBucket {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  updated_at: string;
  public: boolean;
}

export interface StorageUploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export interface StorageListOptions {
  limit?: number;
  offset?: number;
  sortBy?: { column: string; order: 'asc' | 'desc' };
  search?: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  options?: {
    data?: Record<string, unknown>;
    emailRedirectTo?: string;
  };
}

export interface VerifyOtpParams {
  token_hash: string;
  type:
    | 'signup'
    | 'magiclink'
    | 'recovery'
    | 'email_change'
    | 'phone_change'
    | 'invite';
}

// ============================================================================
// MOCK CLIENT INTERFACE
// ============================================================================

export interface MockSupabaseClient {
  auth: {
    getUser(): Promise<AuthResponse>;
    getSession(): Promise<{
      data: { session: Session | null };
      error: PostgrestError | null;
    }>;
    signInWithPassword(credentials: SignInCredentials): Promise<AuthResponse>;
    signUp(credentials: SignUpCredentials): Promise<AuthResponse>;
    signOut(): Promise<{ error: PostgrestError | null }>;
    onAuthStateChange(
      callback: (event: string, session: Session | null) => void
    ): {
      data: { subscription: { unsubscribe: () => void } };
    };
    refreshSession(): Promise<AuthResponse>;
    setSession(session: Session): Promise<AuthResponse>;
    setUser(user: User): Promise<AuthResponse>;
    updateUser(attributes: Partial<User>): Promise<AuthResponse>;
    resetPasswordForEmail(
      email: string,
      options?: { redirectTo?: string }
    ): Promise<{ data: Record<string, never>; error: PostgrestError | null }>;
    verifyOtp(params: VerifyOtpParams): Promise<AuthResponse>;
    resend(
      params: ResendParams
    ): Promise<{ data: Record<string, never>; error: PostgrestError | null }>;
  };
  from<T = unknown>(table: string): TableQueryBuilder<T>;
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        file: File | Blob,
        options?: StorageUploadOptions
      ): Promise<SupabaseResponse<StorageFile>>;
      download(
        path: string
      ): Promise<{ data: Blob | null; error: PostgrestError | null }>;
      list(
        path?: string,
        options?: StorageListOptions
      ): Promise<SupabaseResponse<StorageFile[]>>;
      remove(paths: string[]): Promise<SupabaseResponse<StorageFile[]>>;
      createSignedUrl(
        path: string,
        expiresIn: number
      ): Promise<{
        data: { signedUrl: string } | null;
        error: PostgrestError | null;
      }>;
      createSignedUploadUrl(path: string): Promise<{
        data: { signedUrl: string; path: string; token: string } | null;
        error: PostgrestError | null;
      }>;
      getPublicUrl(path: string): { data: { publicUrl: string } };
      move(
        fromPath: string,
        toPath: string
      ): Promise<SupabaseResponse<StorageFile>>;
      copy(
        fromPath: string,
        toPath: string
      ): Promise<SupabaseResponse<StorageFile>>;
    };
  };
  functions: {
    invoke<T = unknown>(
      functionName: string,
      options?: { body?: unknown }
    ): Promise<SupabaseResponse<T>>;
  };
  realtime: {
    channel(name: string): RealtimeChannel;
    removeAllChannels(): Promise<'ok'>;
    getChannels(): RealtimeChannel[];
  };
  removeChannel(subscription: RealtimeSubscription): Promise<'ok'>;
}

// ============================================================================
// PARTIAL TYPES FOR MOCKING
// ============================================================================

export type PartialSupabaseClient = Partial<MockSupabaseClient>;

export type PartialAuthClient = Partial<MockSupabaseClient['auth']>;

export type PartialTableQueryBuilder<T = unknown> = Partial<
  TableQueryBuilder<T>
>;

export type PartialSelectQueryBuilder<T = unknown> = Partial<
  SelectQueryBuilder<T>
>;

export type PartialRealtimeChannel = Partial<RealtimeChannel>;

// ============================================================================
// MOCK CONFIGURATION TYPES
// ============================================================================

export interface MockConfig {
  delay?: number;
  shouldError?: boolean;
  errorMessage?: string;
  mockData?: unknown[];
}

export interface EnhancedMockConfig extends MockConfig {
  realtimeEvents?: Array<{
    table: string;
    event: 'INSERT' | 'UPDATE' | 'DELETE';
    data: Record<string, unknown>;
  }>;
  performanceMode?: boolean;
  errorRate?: number;
  enableLogging?: boolean;
  simulateErrors?: boolean;
  defaultError?: PostgrestError;
  errorSimulation?: {
    errorProbability?: number;
    errorTypes?: string[];
  };
  enhancedMockData?: {
    defaultListSize?: number;
    useRealisticData?: boolean;
    customGenerators?: Record<
      string,
      (overrides?: Record<string, unknown>) => Record<string, unknown>
    >;
  };
  realtime?: {
    simulateEvents?: boolean;
    eventInterval?: number;
    eventTypes?: string[];
  };
}
