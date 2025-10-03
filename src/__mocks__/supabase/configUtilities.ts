// Enhanced Mock Configuration Utilities
import type { EnhancedMockConfig } from './errorSimulation';

/**
 * Create a realistic mock configuration for testing
 */
export function createRealisticMockConfig(
  overrides?: Partial<EnhancedMockConfig>
): EnhancedMockConfig {
  return {
    enableLogging: true,
    delay: 100, // Small delay to simulate network latency
    simulateErrors: false,
    errorSimulation: {
      errorProbability: 0.05, // 5% chance of error
      errorTypes: ['CONNECTION_ERROR', 'TIMEOUT', 'RLS_VIOLATION'],
    },
    mockData: {
      defaultListSize: 10,
      useRealisticData: true,
    },
    realtime: {
      simulateEvents: true,
      eventInterval: 10000, // 10 seconds
      eventTypes: ['INSERT', 'UPDATE', 'DELETE'],
    },
    ...overrides,
  };
}

/**
 * Create a mock configuration for error testing
 */
export function createErrorTestingMockConfig(
  overrides?: Partial<EnhancedMockConfig>
): EnhancedMockConfig {
  return {
    enableLogging: true,
    delay: 0,
    simulateErrors: true,
    errorSimulation: {
      errorProbability: 0.8, // 80% chance of error
      errorTypes: [
        'UNAUTHORIZED',
        'UNIQUE_VIOLATION',
        'FOREIGN_KEY_VIOLATION',
        'RLS_VIOLATION',
      ],
    },
    mockData: {
      defaultListSize: 0,
      useRealisticData: false,
    },
    realtime: {
      simulateEvents: false,
    },
    ...overrides,
  };
}

/**
 * Create a mock configuration for performance testing
 */
export function createPerformanceTestingMockConfig(
  overrides?: Partial<EnhancedMockConfig>
): EnhancedMockConfig {
  return {
    enableLogging: false,
    delay: 0,
    simulateErrors: false,
    mockData: {
      defaultListSize: 1000,
      useRealisticData: true,
    },
    realtime: {
      simulateEvents: false,
    },
    ...overrides,
  };
}
