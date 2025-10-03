import { BulkOperationConfig, ValidationResult } from './types';

export class BulkOperationValidationService {
  /**
   * Validate bulk operation configuration
   */
  static validateConfig(config: BulkOperationConfig): ValidationResult {
    const errors: string[] = [];

    if (
      config.batchSize !== undefined &&
      (config.batchSize < 1 || config.batchSize > 1000)
    ) {
      errors.push('Batch size must be between 1 and 1000');
    }

    if (
      config.delayBetweenBatches !== undefined &&
      config.delayBetweenBatches < 0
    ) {
      errors.push('Delay between batches must be non-negative');
    }

    if (
      config.maxConcurrentWorkers !== undefined &&
      (config.maxConcurrentWorkers < 1 || config.maxConcurrentWorkers > 16)
    ) {
      errors.push('Max concurrent workers must be between 1 and 16');
    }

    if (
      config.cacheSize !== undefined &&
      (config.cacheSize < 1 || config.cacheSize > 10000)
    ) {
      errors.push('Cache size must be between 1 and 10000');
    }

    if (config.memoryLimit !== undefined && config.memoryLimit < 1024 * 1024) {
      errors.push('Memory limit must be at least 1MB');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate items array
   */
  static validateItems(items: unknown[]): ValidationResult {
    const errors: string[] = [];

    if (!items || items.length === 0) {
      errors.push('No items to process.');
    }

    if (!Array.isArray(items)) {
      errors.push('Items must be an array.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate operation function
   */
  static validateOperation(operation: unknown): ValidationResult {
    const errors: string[] = [];

    if (!operation || typeof operation !== 'function') {
      errors.push('Operation must be a function.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
