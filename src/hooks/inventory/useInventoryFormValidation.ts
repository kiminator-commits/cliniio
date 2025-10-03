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
          await inventoryItemSchema.validateAt(field, { [field]: value });
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
          await inventoryItemSchema.validate(formData, { abortEarly: false });
          setErrors({});
          return true;
        } catch (error: unknown) {
          const newErrors: ValidationErrors = {};
          if (error && typeof error === 'object' && 'inner' in error) {
            const validationError = error as {
              inner: Array<{ path: string; message: string }>;
            };
            validationError.inner.forEach((err) => {
              newErrors[err.path] = err.message;
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
