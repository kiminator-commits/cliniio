import { isSupabaseConfigured, getSupabaseUrl } from '@/lib/supabase';
import { getEnvVar, isDevelopment } from '@/lib/getEnv';

export const INVENTORY_CONFIG = {
  // Default adapter configuration
  defaultAdapter: 'supabase',

  // Adapter configurations
  adapters: {
    supabase: {
      type: 'supabase',
      get endpoint() {
        return getSupabaseUrl();
      },
      get apiKey() {
        return getEnvVar('VITE_SUPABASE_ANON_KEY');
      },
      get isConfigured() {
        return isSupabaseConfigured();
      },
    },
    localStorage: {
      type: 'localStorage',
      prefix: 'cliniio_inventory_',
    },
    static: {
      type: 'static',
      get enabled() {
        return isDevelopment() || !isSupabaseConfigured();
      },
    },
  },

  // Database table names
  tables: {
    inventoryItems: 'inventory_items',
    inventoryTransactions: 'inventory_transactions',
    inventorySuppliers: 'inventory_suppliers',
    inventoryCategories: 'inventory_categories',
    inventoryAudits: 'inventory_audits',
    inventoryAlerts: 'inventory_alerts',
    inventoryReports: 'inventory_reports',
  },

  // Cache configuration
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Maximum number of cached items
  },

  // Real-time configuration
  realtime: {
    get enabled() {
      return isSupabaseConfigured();
    },
    channel: 'inventory_changes',
    events: ['INSERT', 'UPDATE', 'DELETE'],
  },

  // Pagination configuration
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Search configuration
  search: {
    minQueryLength: 2,
    maxResults: 50,
    fuzzySearch: true,
  },

  // Validation configuration
  validation: {
    strictMode: false,
    allowPartialUpdates: true,
    validateOnSave: true,
  },

  // Error handling
  errorHandling: {
    showUserFriendlyErrors: true,
    get logErrorsToConsole() {
      return isDevelopment();
    },
    retryOnNetworkError: true,
    maxRetryAttempts: 3,
  },

  // Performance settings
  performance: {
    enableQueryOptimization: true,
    enableConnectionPooling: true,
    maxConcurrentRequests: 10,
    requestTimeout: 30000, // 30 seconds
  },

  // Development settings
  development: {
    get enableLogging() {
      return isDevelopment();
    },
    get enableDebugMode() {
      return isDevelopment();
    },
    get mockDataEnabled() {
      return isDevelopment() && !isSupabaseConfigured();
    },
  },
} as const;

// Helper function to get current adapter configuration
export const getCurrentAdapterConfig = () => {
  const adapterType = INVENTORY_CONFIG.defaultAdapter;
  return INVENTORY_CONFIG.adapters[
    adapterType as keyof typeof INVENTORY_CONFIG.adapters
  ];
};

// Helper function to check if Supabase is active
export const isSupabaseActive = () => {
  return (
    isSupabaseConfigured() && INVENTORY_CONFIG.defaultAdapter === 'supabase'
  );
};

// Helper function to get table name
export const getTableName = (
  tableKey: keyof typeof INVENTORY_CONFIG.tables
) => {
  return INVENTORY_CONFIG.tables[tableKey];
};
