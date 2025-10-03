import type { LearningAISettings } from '../../../types/learningAITypes';

/**
 * Check if a feature is enabled in the AI settings
 */
export function isFeatureEnabled(settings: LearningAISettings, featurePath: string): boolean {
  const featureValue = getNestedProperty(
    settings as unknown as Record<string, unknown>,
    featurePath
  );
  return featureValue === true;
}

/**
 * Helper method to get nested property from an object using dot notation
 */
export function getNestedProperty(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path
    .split('.')
    .reduce(
      (current: unknown, key: string) =>
        (current as Record<string, unknown>)?.[key],
      obj
    );
}

/**
 * Calculate processing time in milliseconds
 */
export function calculateProcessingTime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Format recommendation reasoning array to string for database storage
 */
export function formatRecommendationReasoning(reasoning: string[] | string): string {
  return Array.isArray(reasoning)
    ? reasoning.join('; ')
    : reasoning;
}

/**
 * Parse recommendation reasoning string from database to array
 */
export function parseRecommendationReasoning(reasoning: string | string[]): string[] {
  return typeof reasoning === 'string'
    ? reasoning.split('; ')
    : (reasoning ?? []);
}

/**
 * Get current timestamp as ISO string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
