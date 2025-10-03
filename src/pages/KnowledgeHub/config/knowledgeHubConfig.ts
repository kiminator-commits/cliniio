// KnowledgeHub Configuration - Centralized constants and settings
// This file consolidates all configuration values used throughout the KnowledgeHub feature

// ============================================================================
// CONTENT CATEGORIES
// ============================================================================
export const CONTENT_CATEGORIES = {
  COURSES: 'Courses',
  PROCEDURES: 'Procedures',
  POLICIES: 'Policies',
  LEARNING_PATHWAYS: 'Learning Pathways',
  ADVANCED: 'Advanced',
} as const;

export const ALL_CATEGORIES: readonly string[] = [
  CONTENT_CATEGORIES.COURSES,
  CONTENT_CATEGORIES.PROCEDURES,
  CONTENT_CATEGORIES.POLICIES,
  CONTENT_CATEGORIES.LEARNING_PATHWAYS,
  CONTENT_CATEGORIES.ADVANCED,
];

// ============================================================================
// CONTENT STATUSES
// ============================================================================
export const CONTENT_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const;

export const ALL_STATUSES: readonly string[] = [
  CONTENT_STATUSES.NOT_STARTED,
  CONTENT_STATUSES.IN_PROGRESS,
  CONTENT_STATUSES.COMPLETED,
];

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================
export const VALIDATION_LIMITS = {
  MAX_INPUT_LENGTH: 1000,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_SEARCH_QUERY_LENGTH: 100,
  MIN_SEARCH_QUERY_LENGTH: 1,
} as const;

export const SECURITY_PATTERNS = {
  DANGEROUS_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
  ],
  SQL_INJECTION_PATTERNS: [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
    /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
  ],
} as const;

export const VALIDATION_REGEX = {
  SEARCH_QUERY: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  CONTENT_ID: /^[a-zA-Z0-9\-_]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================
export const RATE_LIMITING = {
  INPUT_VALIDATION: {
    MAX_ATTEMPTS_PER_MINUTE: 10,
    WINDOW_MS: 60000, // 1 minute
  },
  API_REQUESTS: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000, // 1 minute
    BURST_LIMIT: 20,
  },
  SEARCH_OPERATIONS: {
    MAX_ATTEMPTS_PER_MINUTE: 15,
    WINDOW_MS: 60000,
  },
  STATUS_UPDATES: {
    MAX_ATTEMPTS_PER_MINUTE: 30,
    WINDOW_MS: 60000,
  },
} as const;

// ============================================================================
// PERFORMANCE MONITORING CONFIGURATION
// ============================================================================
export const PERFORMANCE_CONFIG = {
  MAX_METRICS: 1000,
  ENABLED: true,
  SLOW_OPERATION_THRESHOLD: 1000, // 1 second
  ERROR_THRESHOLD: 0.1, // 10% error rate
  METRICS_RETENTION_MS: 24 * 60 * 60 * 1000, // 24 hours
  RECENT_OPERATIONS_COUNT: 10,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export const ERROR_MESSAGES = {
  VALIDATION: {
    SEARCH_QUERY_REQUIRED: 'Search query is required',
    SEARCH_QUERY_EMPTY: 'Search query cannot be empty',
    SEARCH_QUERY_TOO_LONG: 'Search query cannot exceed 100 characters',
    SEARCH_QUERY_INVALID_CHARS: 'Search query contains invalid characters',
    CONTENT_ID_REQUIRED: 'Content ID is required',
    CONTENT_ID_INVALID: 'Invalid content ID format',
    STATUS_REQUIRED: 'Status is required',
    STATUS_FILTER_REQUIRED: 'Status filter is required',
    CATEGORY_FILTER_REQUIRED: 'Category filter is required',
  },
  RATE_LIMITING: {
    TOO_MANY_SEARCH_ATTEMPTS: 'Too many search attempts. Please wait a moment.',
    TOO_MANY_STATUS_UPDATES:
      'Too many status update attempts. Please wait a moment.',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  },
  NETWORK: {
    CONNECTION_FAILED: 'Network connection failed',
    TIMEOUT: 'Request timeout',
    REQUEST_CANCELLED: 'Request was cancelled',
  },
  CONTENT: {
    NOT_FOUND: 'Content not found',
    UPDATE_FAILED: 'Failed to update content',
    DELETE_FAILED: 'Failed to delete content',
    FETCH_FAILED: 'Failed to fetch content',
  },
  AUTH: {
    UNAUTHORIZED: 'Unauthorized access',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  },
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================
export const UI_CONSTANTS = {
  LOADING: {
    SPINNER_SIZE: 6,
    SPINNER_COLOR: '#4ECDC4',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
  ANIMATION: {
    TRANSITION_DURATION: 200,
    FADE_DURATION: 300,
  },
  COLORS: {
    PRIMARY: '#4ECDC4',
    PRIMARY_LIGHT: '#38b2ac',
    SUCCESS: '#22c55e',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6',
  },
} as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================
export const API_CONFIG = {
  TIMEOUT_MS: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 2000,
  BACKOFF_MULTIPLIER: 1.5,
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================================================
// USER ROLES AND PERMISSIONS
// ============================================================================
export const USER_ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
  VIEWER: 'Viewer',
} as const;

export const PERMISSIONS = {
  DELETE_CONTENT: 'canDeleteContent',
  UPDATE_STATUS: 'canUpdateStatus',
  CREATE_CONTENT: 'canCreateContent',
  VIEW_ALL_CATEGORIES: 'canViewAllCategories',
  MANAGE_USERS: 'canManageUsers',
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================
export const STORAGE_KEYS = {
  KNOWLEDGE_HUB_PREFERENCES: 'knowledgeHub_preferences',
  SELECTED_CATEGORY: 'knowledgeHub_selectedCategory',
  USER_PERMISSIONS: 'knowledgeHub_userPermissions',
  PERFORMANCE_METRICS: 'knowledgeHub_performanceMetrics',
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================
export const FEATURE_FLAGS = {
  PERFORMANCE_MONITORING: true,
  RATE_LIMITING: true,
  INPUT_VALIDATION: true,
  ERROR_BOUNDARIES: true,
  LAZY_LOADING: true,
  VIRTUALIZATION: true,
} as const;

// ============================================================================
// EXPORT ALL CONFIGURATION
// ============================================================================
export const KNOWLEDGE_HUB_CONFIG = {
  CONTENT_CATEGORIES,
  CONTENT_STATUSES,
  VALIDATION_LIMITS,
  SECURITY_PATTERNS,
  VALIDATION_REGEX,
  RATE_LIMITING,
  PERFORMANCE_CONFIG,
  ERROR_MESSAGES,
  UI_CONSTANTS,
  API_CONFIG,
  USER_ROLES,
  PERMISSIONS,
  STORAGE_KEYS,
  FEATURE_FLAGS,
} as const;

export default KNOWLEDGE_HUB_CONFIG;
