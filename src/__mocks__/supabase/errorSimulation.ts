// Enhanced Error Simulation
import { PostgrestError, MockConfig } from '../types/supabaseMockTypes';

/**
 * Common PostgrestError types for realistic error simulation
 */
export const PostgrestErrorTypes = {
  // Authentication errors
  UNAUTHORIZED: {
    code: 'PGRST301',
    message: 'JWT expired',
    details: 'The JWT token has expired',
    hint: 'Refresh your token',
  },
  INVALID_JWT: {
    code: 'PGRST302',
    message: 'JWT invalid',
    details: 'The JWT token is invalid',
    hint: 'Check your token format',
  },
  INSUFFICIENT_PRIVILEGE: {
    code: 'PGRST301',
    message: 'Insufficient privilege',
    details: 'You do not have permission to perform this action',
    hint: 'Contact your administrator',
  },

  // Database constraint errors
  UNIQUE_VIOLATION: {
    code: '23505',
    message: 'duplicate key value violates unique constraint',
    details: 'Key already exists',
    hint: 'Use a different value',
  },
  FOREIGN_KEY_VIOLATION: {
    code: '23503',
    message: 'insert or update on table violates foreign key constraint',
    details: 'Referenced record does not exist',
    hint: 'Check your foreign key references',
  },
  NOT_NULL_VIOLATION: {
    code: '23502',
    message: 'null value in column violates not-null constraint',
    details: 'Required field is missing',
    hint: 'Provide a value for the required field',
  },
  CHECK_VIOLATION: {
    code: '23514',
    message: 'new row for relation violates check constraint',
    details: 'Value does not meet constraint requirements',
    hint: 'Check your input values',
  },

  // Row Level Security errors
  RLS_VIOLATION: {
    code: '42501',
    message: 'new row violates row-level security policy',
    details: 'Access denied by RLS policy',
    hint: 'Check your RLS policies',
  },

  // Network/Connection errors
  CONNECTION_ERROR: {
    code: '08006',
    message: 'connection failure',
    details: 'Unable to connect to database',
    hint: 'Check your network connection',
  },
  TIMEOUT: {
    code: '57014',
    message: 'query timeout',
    details: 'Query took too long to execute',
    hint: 'Try optimizing your query',
  },

  // Generic errors
  INTERNAL_ERROR: {
    code: '500',
    message: 'Internal server error',
    details: 'An unexpected error occurred',
    hint: 'Try again later',
  },
  BAD_REQUEST: {
    code: '400',
    message: 'Bad request',
    details: 'Invalid request parameters',
    hint: 'Check your request format',
  },
};

/**
 * Error simulation configuration
 */
export interface ErrorSimulationConfig {
  /** Probability of error occurring (0-1) */
  errorProbability?: number;
  /** Specific error types to simulate */
  errorTypes?: Array<keyof typeof PostgrestErrorTypes>;
  /** Custom error messages */
  customErrors?: PostgrestError[];
  /** Error patterns based on operation type */
  operationErrors?: {
    select?: PostgrestError;
    insert?: PostgrestError;
    update?: PostgrestError;
    delete?: PostgrestError;
    auth?: PostgrestError;
    storage?: PostgrestError;
    realtime?: PostgrestError;
  };
}

/**
 * Enhanced mock configuration with error simulation
 */
export interface EnhancedMockConfig extends MockConfig {
  /** Enable console logging for mock operations */
  enableLogging?: boolean;
  /** Simulate errors in mock responses */
  simulateErrors?: boolean;
  /** Default error to return when simulating errors */
  defaultError?: PostgrestError;
  /** Delay in milliseconds for mock operations */
  delay?: number;
  errorSimulation?: ErrorSimulationConfig;
  /** Mock data configuration */
  mockData?: {
    /** Number of items to generate for list operations */
    defaultListSize?: number;
    /** Whether to generate realistic data based on schema */
    useRealisticData?: boolean;
    /** Custom data generators for specific tables */
    customGenerators?: Record<
      string,
      (overrides?: Record<string, unknown>) => Record<string, unknown>
    >;
  };
  /** Realtime simulation configuration */
  realtime?: {
    /** Simulate realtime events */
    simulateEvents?: boolean;
    /** Event simulation interval (ms) */
    eventInterval?: number;
    /** Event types to simulate */
    eventTypes?: Array<'INSERT' | 'UPDATE' | 'DELETE'>;
  };
}

/**
 * Generate realistic error based on configuration
 */
export function generateMockError(
  config: ErrorSimulationConfig
): PostgrestError | null {
  if (!config.errorProbability || Math.random() > config.errorProbability) {
    return null;
  }

  const errorTypes =
    config.errorTypes ||
    (Object.keys(PostgrestErrorTypes) as Array<
      keyof typeof PostgrestErrorTypes
    >);
  const randomErrorType =
    errorTypes[Math.floor(Math.random() * errorTypes.length)];

  if (config.customErrors && config.customErrors.length > 0) {
    return config.customErrors[
      Math.floor(Math.random() * config.customErrors.length)
    ];
  }

  return PostgrestErrorTypes[randomErrorType];
}
