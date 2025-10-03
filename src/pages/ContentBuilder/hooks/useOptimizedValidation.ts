import { useState, useCallback, useMemo } from 'react';
import { useDebounce, useThrottle } from './usePerformanceOptimization';
import { ValidationError } from './useValidation';

interface OptimizedValidationState {
  isValid: boolean;
  errors: ValidationError[];
  isDirty: boolean;
  isValidationPending: boolean;
}

interface OptimizedValidationActions {
  validateField: (field: string, value: unknown) => void;
  validateForm: (data: unknown) => void;
  clearErrors: () => void;
  getFieldError: (field: string) => string | null;
  hasErrors: () => boolean;
}

export function useOptimizedValidation(
  validationFunction: (data: unknown) => ValidationError[],
  debounceDelay: number = 300,
  throttleDelay: number = 100
): OptimizedValidationState & OptimizedValidationActions {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isValidationPending, setIsValidationPending] = useState(false);

  const isValid = useMemo(() => errors.length === 0, [errors]);

  // Debounced field validation
  const debouncedFieldValidation = useDebounce(
    useCallback((...args: unknown[]) => {
      const [field, value] = args as [string, unknown];
      // This would call the actual validation logic
      // For now, we'll simulate validation
      const mockError =
        value === ''
          ? {
              field,
              message: `${field} is required`,
              path: [field],
            }
          : null;

      setErrors((prev) => {
        const filtered = prev.filter((err) => err.field !== field);
        return mockError ? [...filtered, mockError] : filtered;
      });

      setIsValidationPending(false);
    }, []),
    debounceDelay
  );

  // Throttled form validation
  const throttledFormValidation = useThrottle(
    useCallback(
      (data: unknown) => {
        setIsValidationPending(true);

        // Simulate async validation
        setTimeout(() => {
          const validationErrors = validationFunction(data);
          setErrors(validationErrors);
          setIsValidationPending(false);
        }, 100);
      },
      [validationFunction]
    ),
    throttleDelay
  );

  // Optimized field validation
  const validateField = useCallback(
    (field: string, value: unknown) => {
      setIsDirty(true);
      setIsValidationPending(true);

      // Debounce the actual validation
      debouncedFieldValidation(field, value);
    },
    [debouncedFieldValidation]
  );

  // Optimized form validation
  const validateForm = useCallback(
    (data: unknown) => {
      setIsDirty(true);
      throttledFormValidation(data);
    },
    [throttledFormValidation]
  );

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    setIsValidationPending(false);
  }, []);

  // Get field error
  const getFieldError = useCallback(
    (field: string): string | null => {
      const error = errors.find((err) => err.field === field);
      return error ? error.message : null;
    },
    [errors]
  );

  // Check if there are any errors
  const hasErrors = useCallback(() => {
    return errors.length > 0;
  }, [errors]);

  return {
    isValid,
    errors,
    isDirty,
    isValidationPending,
    validateField,
    validateForm,
    clearErrors,
    getFieldError,
    hasErrors,
  };
}

// Specialized optimized validation hooks
export function useOptimizedPolicyValidation() {
  const validationFunction = useCallback(() => {
    // This would use the actual policy validation schema
    // For now, return empty array
    return [];
  }, []);

  return useOptimizedValidation(validationFunction);
}

export function useOptimizedProcedureValidation() {
  const validationFunction = useCallback(() => {
    // This would use the actual procedure validation schema
    return [];
  }, []);

  return useOptimizedValidation(validationFunction);
}

export function useOptimizedSMSValidation() {
  const validationFunction = useCallback(() => {
    // This would use the actual SMS validation schema
    return [];
  }, []);

  return useOptimizedValidation(validationFunction);
}

export function useOptimizedPathwayValidation() {
  const validationFunction = useCallback(() => {
    // This would use the actual pathway validation schema
    return [];
  }, []);

  return useOptimizedValidation(validationFunction);
}
