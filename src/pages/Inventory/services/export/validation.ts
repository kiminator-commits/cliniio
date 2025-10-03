import { ExportOptions } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ExportValidationService {
  /**
   * Validate export options
   */
  static validateExportOptions(options: ExportOptions): ValidationResult {
    const errors: string[] = [];

    if (!options.format || !['csv', 'json', 'excel'].includes(options.format)) {
      errors.push('Invalid export format. Must be csv, json, or excel.');
    }

    if (options.customFields && !Array.isArray(options.customFields)) {
      errors.push('Custom fields must be an array of strings.');
    }

    if (
      options.chunkSize !== undefined &&
      (options.chunkSize < 1 || options.chunkSize > 10000)
    ) {
      errors.push('Chunk size must be between 1 and 10000.');
    }

    if (
      options.maxMemoryUsage !== undefined &&
      options.maxMemoryUsage < 1024 * 1024
    ) {
      errors.push('Max memory usage must be at least 1MB.');
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
      errors.push('No items to export.');
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
   * Validate template
   */
  static validateTemplate(template: unknown): ValidationResult {
    const errors: string[] = [];

    if (!template) {
      errors.push('Template is required.');
    }

    if (template && typeof template === 'object' && 'format' in template) {
      const format = (template as { format: unknown }).format;
      if (!['csv', 'json', 'excel'].includes(format as string)) {
        errors.push('Template format must be csv, json, or excel.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
