import { useCallback, useState } from 'react';
import { inventoryItemSchema } from '../../validation/inventoryValidation';
import { LocalInventoryItem } from '../../types/inventoryTypes';

interface ValidationErrors {
  [key: string]: string;
}

interface UseInventoryFormValidationReturn {
  errors: ValidationErrors;
  isValid: boolean;
  validateField: (field: string, value: unknown) => Promise<string | null>;
  validateForm: (formData: Partial<LocalInventoryItem>) => Promise<boolean>;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
}

export const useInventoryFormValidation =
  (): UseInventoryFormValidationReturn => {
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateField = useCallback(
      async (field: string, value: unknown): Promise<string | null> => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inventoryItemSchema.pick({ [field]: true } as any).parse({ [field]: value });
          return null;
        } catch (error: unknown) {
          return error instanceof Error ? error.message : 'Validation failed';
        }
      },
      []
    );

    const validateForm = useCallback(
      async (formData: Partial<LocalInventoryItem>): Promise<boolean> => {
        try {
          inventoryItemSchema.parse(formData);
          setErrors({});
          return true;
        } catch (error: unknown) {
          const newErrors: ValidationErrors = {};
          if (error && typeof error === 'object' && 'issues' in error) {
            const validationError = error as {
              issues: Array<{ path: string[]; message: string }>;
            };
            validationError.issues.forEach((err) => {
              const fieldPath = err.path.join('.');
              newErrors[fieldPath] = err.message;
            });
          }
          setErrors(newErrors);
          return false;
        }
      },
      []
    );

    const clearErrors = useCallback(() => {
      setErrors({});
    }, []);

    const setFieldError = useCallback((field: string, error: string) => {
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }, []);

    const isValid = Object.keys(errors).length === 0;

    return {
      errors,
      isValid,
      validateField,
      validateForm,
      clearErrors,
      setFieldError,
    };
  };
