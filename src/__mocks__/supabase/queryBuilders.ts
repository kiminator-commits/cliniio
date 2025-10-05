// Typed Query Builders
import {
  SupabaseResponse,
  SupabaseSingleResponse,
  SelectQueryBuilder,
  InsertQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
  TableQueryBuilder,
  MockConfig,
} from '../types/supabaseMockTypes';
import { createMockError } from './mockGenerators';

/* eslint-disable @typescript-eslint/no-unused-vars */
export class TypedMockSelectQueryBuilder<T = unknown>
  implements SelectQueryBuilder<T>
{
  private mockData: T[] = [];
  private config: MockConfig;

  constructor(mockData: T[] = [], config: MockConfig = {}) {
    this.mockData = mockData;
    this.config = config;
  }

  eq(column: string, value: unknown): SelectQueryBuilder<T> {
    return this;
  }

  ne(column: string, value: unknown): SelectQueryBuilder<T> {
    return this;
  }

  gt(column: string, value: unknown): SelectQueryBuilder<T> {
    return this;
  }

  gte(column: string, value: unknown): SelectQueryBuilder<T> {
    return this;
  }

  lt(column: string, value: unknown): SelectQueryBuilder<T> {
    return this;
  }

  lte(column: string, value: unknown): SelectQueryBuilder<T> {
    return this;
  }

  like(column: string, pattern: string): SelectQueryBuilder<T> {
    return this;
  }

  ilike(column: string, pattern: string): SelectQueryBuilder<T> {
    return this;
  }

  in(column: string, values: unknown[]): SelectQueryBuilder<T> {
    return this;
  }

  not(column: string, value: unknown): SelectQueryBuilder<T> {
    return this;
  }

  or(filter: string): SelectQueryBuilder<T> {
    return this;
  }

  and(filter: string): SelectQueryBuilder<T> {
    return this;
  }

  order(
    column: string,
    options?: { ascending?: boolean }
  ): SelectQueryBuilder<T> {
    return this;
  }

  limit(count: number): SelectQueryBuilder<T> {
    return this;
  }

  range(from: number, to: number): SelectQueryBuilder<T> {
    return this;
  }

  async single(): Promise<SupabaseSingleResponse<T>> {
    if (this.config.shouldError) {
      return {
        data: null,
        error: createMockError(this.config.errorMessage),
      };
    }

    return {
      data: this.mockData[0] || null,
      error: null,
    };
  }

  async maybeSingle(): Promise<SupabaseSingleResponse<T>> {
    return this.single();
  }

  async count(
    _mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>> {
    return {
      data: this.mockData.length,
      error: null,
    };
  }

  abortSignal(_signal: AbortSignal): SelectQueryBuilder<T> {
    return this;
  }

  async then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    _onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result: SupabaseResponse<T[]> = {
      data: this.mockData,
      error: this.config.shouldError
        ? createMockError(this.config.errorMessage)
        : null,
      count: this.mockData.length,
    };

    if (onfulfilled) {
      return onfulfilled(result);
    }

    return result as TResult1;
  }
}

export class TypedMockInsertQueryBuilder<T = unknown>
  implements InsertQueryBuilder<T>
{
  private config: MockConfig;

  constructor(config: MockConfig = {}) {
    this.config = config;
  }

  select(_columns?: string): SelectQueryBuilder<T> {
    return new TypedMockSelectQueryBuilder<T>([], this.config);
  }

  async single(): Promise<SupabaseSingleResponse<T>> {
    if (this.config.shouldError) {
      return {
        data: null,
        error: createMockError(this.config.errorMessage),
      };
    }

    return {
      data: {} as T,
      error: null,
    };
  }

  async maybeSingle(): Promise<SupabaseSingleResponse<T>> {
    return this.single();
  }

  async count(
    _mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>> {
    return {
      data: 0,
      error: null,
    };
  }

  async then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    _onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result: SupabaseResponse<T[]> = {
      data: [],
      error: this.config.shouldError
        ? createMockError(this.config.errorMessage)
        : null,
    };

    if (onfulfilled) {
      return onfulfilled(result);
    }

    return result as TResult1;
  }
}

export class TypedMockUpdateQueryBuilder<T = unknown>
  implements UpdateQueryBuilder<T>
{
  private config: MockConfig;

  constructor(config: MockConfig = {}) {
    this.config = config;
  }

  eq(_column: string, _value: unknown): UpdateQueryBuilder<T> {
    return this;
  }

  ne(_column: string, _value: unknown): UpdateQueryBuilder<T> {
    return this;
  }

  gt(_column: string, _value: unknown): UpdateQueryBuilder<T> {
    return this;
  }

  gte(_column: string, _value: unknown): UpdateQueryBuilder<T> {
    return this;
  }

  lt(_column: string, _value: unknown): UpdateQueryBuilder<T> {
    return this;
  }

  lte(_column: string, _value: unknown): UpdateQueryBuilder<T> {
    return this;
  }

  like(_column: string, _pattern: string): UpdateQueryBuilder<T> {
    return this;
  }

  ilike(_column: string, _pattern: string): UpdateQueryBuilder<T> {
    return this;
  }

  in(_column: string, _values: unknown[]): UpdateQueryBuilder<T> {
    return this;
  }

  not(_column: string, _value: unknown): UpdateQueryBuilder<T> {
    return this;
  }

  or(_filter: string): UpdateQueryBuilder<T> {
    return this;
  }

  and(_filter: string): UpdateQueryBuilder<T> {
    return this;
  }

  order(
    _column: string,
    _options?: { ascending?: boolean }
  ): UpdateQueryBuilder<T> {
    return this;
  }

  limit(_count: number): UpdateQueryBuilder<T> {
    return this;
  }

  range(_from: number, _to: number): UpdateQueryBuilder<T> {
    return this;
  }

  select(_columns?: string): SelectQueryBuilder<T> {
    return new TypedMockSelectQueryBuilder<T>([], this.config);
  }

  async single(): Promise<SupabaseSingleResponse<T>> {
    if (this.config.shouldError) {
      return {
        data: null,
        error: createMockError(this.config.errorMessage),
      };
    }

    return {
      data: {} as T,
      error: null,
    };
  }

  async maybeSingle(): Promise<SupabaseSingleResponse<T>> {
    return this.single();
  }

  async count(
    _mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>> {
    return {
      data: 0,
      error: null,
    };
  }

  async then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    _onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result: SupabaseResponse<T[]> = {
      data: [],
      error: this.config.shouldError
        ? createMockError(this.config.errorMessage)
        : null,
    };

    if (onfulfilled) {
      return onfulfilled(result);
    }

    return result as TResult1;
  }
}

export class TypedMockDeleteQueryBuilder<T = unknown>
  implements DeleteQueryBuilder<T>
{
  private config: MockConfig;

  constructor(config: MockConfig = {}) {
    this.config = config;
  }

  eq(_column: string, _value: unknown): DeleteQueryBuilder<T> {
    return this;
  }

  ne(_column: string, _value: unknown): DeleteQueryBuilder<T> {
    return this;
  }

  gt(_column: string, _value: unknown): DeleteQueryBuilder<T> {
    return this;
  }

  gte(_column: string, _value: unknown): DeleteQueryBuilder<T> {
    return this;
  }

  lt(_column: string, _value: unknown): DeleteQueryBuilder<T> {
    return this;
  }

  lte(_column: string, _value: unknown): DeleteQueryBuilder<T> {
    return this;
  }

  like(_column: string, _pattern: string): DeleteQueryBuilder<T> {
    return this;
  }

  ilike(_column: string, _pattern: string): DeleteQueryBuilder<T> {
    return this;
  }

  in(_column: string, _values: unknown[]): DeleteQueryBuilder<T> {
    return this;
  }

  not(_column: string, _value: unknown): DeleteQueryBuilder<T> {
    return this;
  }

  or(_filter: string): DeleteQueryBuilder<T> {
    return this;
  }

  and(_filter: string): DeleteQueryBuilder<T> {
    return this;
  }

  order(
    _column: string,
    _options?: { ascending?: boolean }
  ): DeleteQueryBuilder<T> {
    return this;
  }

  limit(_count: number): DeleteQueryBuilder<T> {
    return this;
  }

  range(_from: number, _to: number): DeleteQueryBuilder<T> {
    return this;
  }

  select(_columns?: string): SelectQueryBuilder<T> {
    return new TypedMockSelectQueryBuilder<T>([], this.config);
  }

  async single(): Promise<SupabaseSingleResponse<T>> {
    if (this.config.shouldError) {
      return {
        data: null,
        error: createMockError(this.config.errorMessage),
      };
    }

    return {
      data: {} as T,
      error: null,
    };
  }

  async maybeSingle(): Promise<SupabaseSingleResponse<T>> {
    return this.single();
  }

  async count(
    _mode?: 'exact' | 'planned' | 'estimated'
  ): Promise<SupabaseResponse<number>> {
    return {
      data: 0,
      error: null,
    };
  }

  async then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    _onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result: SupabaseResponse<T[]> = {
      data: [],
      error: this.config.shouldError
        ? createMockError(this.config.errorMessage)
        : null,
    };

    if (onfulfilled) {
      return onfulfilled(result);
    }

    return result as TResult1;
  }
}

export class TypedMockTableQueryBuilder<T = unknown>
  implements TableQueryBuilder<T>
{
  private config: MockConfig;

  constructor(config: MockConfig = {}) {
    this.config = config;
  }

  select(_columns?: string): SelectQueryBuilder<T> {
    return new TypedMockSelectQueryBuilder<T>([], this.config);
  }

  insert(_data: T | T[]): InsertQueryBuilder<T> {
    return new TypedMockInsertQueryBuilder<T>(this.config);
  }

  update(_data: Partial<T>): UpdateQueryBuilder<T> {
    return new TypedMockUpdateQueryBuilder<T>(this.config);
  }

  delete(): DeleteQueryBuilder<T> {
    return new TypedMockDeleteQueryBuilder<T>(this.config);
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
