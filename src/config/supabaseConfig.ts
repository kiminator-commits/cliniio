import { isSupabaseConfigured, getSupabaseUrl } from '@/lib/supabase';
import { isDevelopment } from '@/lib/getEnv';

export const SUPABASE_CONFIG = {
  // Connection settings
  connection: {
    isConfigured: isSupabaseConfigured(),
    url: getSupabaseUrl(),
  },

  // Authentication settings
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
  },

  // Realtime settings
  realtime: {
    enabled: true,
    eventsPerSecond: 10,
    heartbeatIntervalMs: 30000,
  },

  // Database settings
  database: {
    // Table names
    tables: {
      users: 'users',
      inventoryItems: 'inventory_items',
      sterilizationCycles: 'sterilization_cycles',
      environmentalCleans: 'environmental_cleans',
      knowledgeHubContent: 'knowledge_hub_content',
      auditLogs: 'audit_logs',
    },

    // RLS (Row Level Security) settings
    rls: {
      enabled: true,
      policies: {
        users: {
          select: 'auth.uid() = id',
          insert: 'auth.uid() = id',
          update: 'auth.uid() = id',
          delete: 'auth.uid() = id',
        },
        inventoryItems: {
          select: 'true',
          insert: 'auth.uid() = user_id',
          update: 'auth.uid() = user_id',
          delete: 'auth.uid() = user_id',
        },
        sterilizationCycles: {
          select: 'true',
          insert: 'auth.uid() = operator_id',
          update: 'auth.uid() = operator_id',
          delete: 'auth.uid() = operator_id',
        },
        environmentalCleans: {
          select: 'true',
          insert: 'auth.uid() = cleaner_id',
          update: 'auth.uid() = cleaner_id',
          delete: 'auth.uid() = cleaner_id',
        },
        knowledgeHubContent: {
          select: 'true',
          insert: 'auth.uid() = author_id',
          update: 'auth.uid() = author_id',
          delete: 'auth.uid() = author_id',
        },
        auditLogs: {
          select: 'auth.uid() = user_id',
          insert: 'auth.uid() = user_id',
          update: 'false',
          delete: 'false',
        },
      },
    },
  },

  // Storage settings
  storage: {
    buckets: {
      avatars: 'avatars',
      documents: 'documents',
      images: 'images',
    },
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },

  // API settings
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    maxConcurrentRequests: 10,
  },

  // Development settings
  development: {
    enableLogging: isDevelopment(),

    mockDataEnabled: isDevelopment() && !isSupabaseConfigured(),
  },

  // Error handling
  errorHandling: {
    showUserFriendlyErrors: true,
    logErrorsToConsole: isDevelopment(),
    retryOnNetworkError: true,
    maxRetryAttempts: 3,
  },

  // Performance settings
  performance: {
    enableQueryOptimization: true,
    enableConnectionPooling: true,
    maxConnections: 20,
    connectionTimeout: 10000, // 10 seconds
  },
} as const;

// Helper functions
export const getSupabaseTableName = (
  tableKey: keyof typeof SUPABASE_CONFIG.database.tables
): string => {
  return SUPABASE_CONFIG.database.tables[tableKey];
};

export const isRLSEnabled = (): boolean => {
  return SUPABASE_CONFIG.database.rls.enabled;
};

export const getStorageBucket = (
  bucketKey: keyof typeof SUPABASE_CONFIG.storage.buckets
): string => {
  return SUPABASE_CONFIG.storage.buckets[bucketKey];
};

export const isDevelopmentMode = (): boolean => {
  return false;
};

export const shouldLogErrors = (): boolean => {
  return SUPABASE_CONFIG.errorHandling.logErrorsToConsole;
};

// Type exports
export type SupabaseTableName = keyof typeof SUPABASE_CONFIG.database.tables;
export type StorageBucketName = keyof typeof SUPABASE_CONFIG.storage.buckets;
