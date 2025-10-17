import {
  validateSearchQuery,
  validateStatusUpdate,
  ValidationResult,
  SearchValidationResult,
  StatusUpdateValidationResult,
} from '@/pages/KnowledgeHub/utils/inputValidation';
import { describe, test, expect } from 'vitest';

describe('Validation Types', () => {
  test('validateSearchQuery should return ValidationResult', () => {
    const result: ValidationResult = validateSearchQuery('test');
    expect(result).toHaveProperty('isValid');
    expect(typeof result.isValid).toBe('boolean');
  });

  test('validateStatusUpdate should return ValidationResult', () => {
    const result: ValidationResult = validateStatusUpdate(
      'test-id',
      'In Progress'
    );
    expect(result).toHaveProperty('isValid');
    expect(typeof result.isValid).toBe('boolean');
  });

  test('SearchValidationResult should have correct properties', () => {
    const result: SearchValidationResult = {
      isValid: true,
      sanitizedQuery: 'test',
    };
    expect(result.isValid).toBe(true);
    expect(result.sanitizedQuery).toBe('test');
  });

  test('StatusUpdateValidationResult should have correct properties', () => {
    const result: StatusUpdateValidationResult = {
      isValid: true,
      sanitizedId: 'test-id',
      status: 'In Progress',
    };
    expect(result.isValid).toBe(true);
    expect(result.sanitizedId).toBe('test-id');
    expect(result.status).toBe('In Progress');
  });
});
