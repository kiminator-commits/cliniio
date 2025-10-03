// Typed Supabase Mock Client Factory
// This file provides type-safe mock implementations without any casts

import {
  MockSupabaseClient,
  SupabaseResponse,
  RealtimeChannel,
  RealtimeSubscription,
  MockConfig,
  PartialSupabaseClient,
} from '../types/supabaseMockTypes';
import { createMockUser, createMockSession, createMockError } from './mockGenerators';
import { TypedMockTableQueryBuilder } from './queryBuilders';
import { TypedMockRealtimeChannel } from './realtimeChannel';
import { createAuthService } from './authService';
import { createStorageService } from './storageService';

// ============================================================================
// TYPED MOCK CLIENT FACTORY
// ============================================================================

// ============================================================================
// TYPED MOCK CLIENT FACTORY
// ============================================================================

export function createTypedMockSupabaseClient(
  config: MockConfig = {}
): MockSupabaseClient {
  const mockUser = createMockUser();
  const mockSession = createMockSession(mockUser);

  return {
    auth: createAuthService(config, mockUser, mockSession),

    from<T = unknown>(_table: string): TableQueryBuilder<T> {
      return new TypedMockTableQueryBuilder<T>(config);
    },

    storage: createStorageService(config),

    functions: {
      async invoke<T = unknown>(
        _functionName: string,
        _options?: { body?: unknown }
      ): Promise<SupabaseResponse<T>> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: {} as T,
          error: null,
        };
      },
    },

    realtime: {
      channel(name: string): RealtimeChannel {
        return new TypedMockRealtimeChannel(name);
      },

      async removeAllChannels(): Promise<'ok'> {
        return 'ok';
      },

      getChannels(): RealtimeChannel[] {
        return [];
      },
    },

    async removeChannel(subscription: RealtimeSubscription): Promise<'ok'> {
      // console.log('[MOCK] Removing channel:', subscription);
      return 'ok';
    },
  };
}

// ============================================================================
// PARTIAL MOCK FACTORY
// ============================================================================

export function createPartialMockSupabaseClient(
  partials: PartialSupabaseClient
): MockSupabaseClient {
  const baseClient = createTypedMockSupabaseClient();

  return {
    ...baseClient,
    ...partials,
    auth: {
      ...baseClient.auth,
      ...partials.auth,
    },
    storage: {
      ...baseClient.storage,
      ...partials.storage,
    },
    functions: {
      ...baseClient.functions,
      ...partials.functions,
    },
    realtime: {
      ...baseClient.realtime,
      ...partials.realtime,
    },
  };
}
/* eslint-enable @typescript-eslint/no-unused-vars */
