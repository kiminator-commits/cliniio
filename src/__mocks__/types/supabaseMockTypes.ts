// ============================================================================
// SUPABASE MOCK TYPES
// ============================================================================

export interface PostgrestError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
  name?: string;
}

export interface AuthError extends Error {
  status: number;
  __isAuthError: boolean;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
  send: (event: string, payload: unknown) => void;
}

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
export type RealtimeEventFilter = Record<string, unknown>;

export interface RealtimeCallback<_T> {
  (payload: unknown): void;
}

export interface RealtimeChannel {
  on<_T = unknown>(
    event: RealtimeEventType,
    filter: RealtimeEventFilter,
    callback: RealtimeCallback<_T>
  ): { subscribe: (callback?: RealtimeCallback<_T>) => RealtimeSubscription };
  subscribe<_T = unknown>(
    callback?: RealtimeCallback<_T>
  ): RealtimeSubscription;
  unsubscribe(): void;
  send(event: string, payload: unknown): void;
}

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
  search?: string;
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

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  options?: {
    data?: Record<string, unknown>;
  };
}

export interface VerifyOtpParams {
  token: string;
  type: 'signup' | 'recovery' | 'email_change' | 'phone_change';
}

export interface ResendParams {
  type: 'signup' | 'recovery' | 'email_change' | 'phone_change';
  email: string;
}

export interface MockQueryState {
  table: string;
  columns?: string;
  filters: Array<{
    column: string;
    operator: string;
    value: unknown;
  }>;
  orderBy?: Array<{
    column: string;
    ascending: boolean;
  }>;
  limit?: number;
  offset?: number;
}

export interface TableQueryBuilder<T = unknown> {
  select<U = T>(columns?: string): SelectQueryBuilder<U>;
  insert<U = T>(data: U): InsertQueryBuilder<U>;
  insert<U = T>(data: U[]): InsertQueryBuilder<U>;
  update<U = T>(data: Partial<U>): UpdateQueryBuilder<U>;
  update<U = T>(data: Partial<U>[]): UpdateQueryBuilder<U>;
  delete<U = T>(): DeleteQueryBuilder<U>;
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
  abortSignal(signal: AbortSignal): SelectQueryBuilder<T>;
  then<R>(
    onfulfilled?: (value: SupabaseResponse<T[]>) => R | PromiseLike<R>
  ): Promise<R>;
  single(): Promise<SupabaseResponse<T>>;
  maybeSingle(): Promise<SupabaseResponse<T>>;
  count(
    mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>>;
}

export interface InsertQueryBuilder<T = unknown> {
  select<U = T>(columns?: string): SelectQueryBuilder<U>;
  then<R>(
    onfulfilled?: (value: SupabaseResponse<T[]>) => R | PromiseLike<R>
  ): Promise<R>;
  single(): Promise<SupabaseResponse<T>>;
  maybeSingle(): Promise<SupabaseResponse<T>>;
  count(
    mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>>;
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
  select<U = T>(columns?: string): SelectQueryBuilder<U>;
  then<R>(
    onfulfilled?: (value: SupabaseResponse<T[]>) => R | PromiseLike<R>
  ): Promise<R>;
  single(): Promise<SupabaseResponse<T>>;
  maybeSingle(): Promise<SupabaseResponse<T>>;
  count(
    mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>>;
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
  then<R>(
    onfulfilled?: (value: SupabaseResponse<T[]>) => R | PromiseLike<R>
  ): Promise<R>;
  single(): Promise<SupabaseResponse<T>>;
  maybeSingle(): Promise<SupabaseResponse<T>>;
  count(
    mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>>;
}

export interface StorageBucket {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  updated_at: string;
  public: boolean;
  upload(
    path: string,
    file: File | Blob,
    options?: StorageUploadOptions
  ): Promise<SupabaseResponse<StorageFile>>;
  download(path: string): Promise<SupabaseResponse<Blob>>;
  list(
    path?: string,
    options?: StorageListOptions
  ): Promise<SupabaseResponse<StorageFile[]>>;
  remove(paths: string[]): Promise<SupabaseResponse<StorageFile[]>>;
  createSignedUrl(
    path: string,
    expiresIn: number
  ): Promise<SupabaseResponse<{ signedUrl: string }>>;
  createSignedUploadUrl(
    path: string
  ): Promise<
    SupabaseResponse<{ signedUrl: string; path: string; token: string }>
  >;
  getPublicUrl(path: string): { data: { publicUrl: string } };
  move(
    fromPath: string,
    toPath: string
  ): Promise<SupabaseResponse<StorageFile>>;
  copy(
    fromPath: string,
    toPath: string
  ): Promise<SupabaseResponse<StorageFile>>;
}

export interface MockSupabaseClient {
  auth: {
    getUser(): Promise<AuthResponse>;
    getSession(): Promise<{
      data: { session: Session | null };
      error: PostgrestError | null;
    }>;
    signIn(credentials: SignInCredentials): Promise<AuthResponse>;
    signInWithPassword(credentials: SignInCredentials): Promise<AuthResponse>;
    signUp(credentials: SignUpCredentials): Promise<AuthResponse>;
    signOut(): Promise<{ error: PostgrestError | null }>;
    signInWithOAuth(provider: string): Promise<AuthResponse>;
    resetPasswordForEmail(
      email: string
    ): Promise<{ data: Record<string, never>; error: PostgrestError | null }>;
    verifyOtp(params: VerifyOtpParams): Promise<AuthResponse>;
    resend(
      params: ResendParams
    ): Promise<{ data: Record<string, never>; error: PostgrestError | null }>;
    onAuthStateChange(
      callback: (event: string, session: Session | null) => void
    ): {
      data: { subscription: { unsubscribe: () => void } };
    };
    refreshSession(): Promise<AuthResponse>;
    setSession(session: Session): Promise<AuthResponse>;
    setUser(user: User): Promise<AuthResponse>;
    updateUser(attributes: Partial<User>): Promise<AuthResponse>;
  };
  storage: {
    from(bucket: string): StorageBucket;
  };
  functions: Functions;
  realtime: {
    channel(name: string): RealtimeChannel;
    removeChannel(subscription: RealtimeSubscription): Promise<'ok'>;
    removeAllChannels(): Promise<'ok'>;
    getChannels(): RealtimeChannel[];
  };
  from<T = unknown>(table: string): TableQueryBuilder<T>;
  channel(name: string): RealtimeChannel;
  removeChannel(subscription: RealtimeSubscription): Promise<'ok'>;
}

// Table types
export type TableName = string;
export type TableRow<_T extends TableName> = Record<string, unknown>;

// Base mock configuration
export interface MockConfig {
  delay?: number;
}
