// Storage Service Implementation
import {
  SupabaseResponse,
  StorageFile,
  StorageUploadOptions,
  StorageListOptions,
  MockConfig,
} from '../types/supabaseMockTypes';
import { createMockError } from './mockGenerators';

export const createStorageService = (config: MockConfig) => ({
  from(bucket: string) {
    return {
      async upload(
        path: string,
        _file: File | Blob,
        _options?: StorageUploadOptions
      ): Promise<SupabaseResponse<StorageFile>> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: {
            name: path,
            id: 'mock-file-id',
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            metadata: {},
            buckets: {
              id: 'mock-bucket-id',
              name: bucket,
              owner: 'mock-owner',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              public: false,
            },
          },
          error: null,
        };
      },

      async download(
        _path: string
      ): Promise<{ data: Blob | null; error: PostgrestError | null }> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: new Blob(['mock file content']),
          error: null,
        };
      },

      async list(
        _path?: string,
        _options?: StorageListOptions
      ): Promise<SupabaseResponse<StorageFile[]>> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: [],
          error: null,
        };
      },

      async remove(_paths: string[]): Promise<SupabaseResponse<StorageFile[]>> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: [],
          error: null,
        };
      },

      async createSignedUrl(
        path: string,
        _expiresIn: number
      ): Promise<{
        data: { signedUrl: string } | null;
        error: PostgrestError | null;
      }> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: { signedUrl: `https://mock-signed-url.com/${path}` },
          error: null,
        };
      },

      async createSignedUploadUrl(path: string): Promise<{
        data: { signedUrl: string; path: string; token: string } | null;
        error: PostgrestError | null;
      }> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: {
            signedUrl: `https://mock-upload-url.com/${path}`,
            path,
            token: 'mock-token',
          },
          error: null,
        };
      },

      getPublicUrl(path: string): { data: { publicUrl: string } } {
        return {
          data: { publicUrl: `https://mock-public-url.com/${path}` },
        };
      },

      async move(
        fromPath: string,
        toPath: string
      ): Promise<SupabaseResponse<StorageFile>> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: {
            name: toPath,
            id: 'mock-file-id',
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            metadata: {},
            buckets: {
              id: 'mock-bucket-id',
              name: bucket,
              owner: 'mock-owner',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              public: false,
            },
          },
          error: null,
        };
      },

      async copy(
        fromPath: string,
        toPath: string
      ): Promise<SupabaseResponse<StorageFile>> {
        if (config.shouldError) {
          return {
            data: null,
            error: createMockError(config.errorMessage),
          };
        }
        return {
          data: {
            name: toPath,
            id: 'mock-file-id',
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            metadata: {},
            buckets: {
              id: 'mock-bucket-id',
              name: bucket,
              owner: 'mock-owner',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              public: false,
            },
          },
          error: null,
        };
      },
    };
  },
});
