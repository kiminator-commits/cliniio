import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import {
  policySchema,
  procedureSchema,
  smsSchema,
  pathwaySchema,
  textFormattingSchema,
  tableSchema,
  mediaSchema,
  baseContentSchema,
} from '../types/validationSchemas';

export interface ValidationError {
  field: string;
  message: string;
  path: string[];
}

export interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
  touched: Set<string>;
  isDirty: boolean;
}

export interface ValidationActions {
  validateField: (field: string, value: unknown) => ValidationError | null;
  validateForm: (data: unknown, schema: z.ZodSchema) => ValidationError[];
  markFieldAsTouched: (field: string) => void;
  markAllFieldsAsTouched: () => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  isFieldValid: (field: string) => boolean;
  getFieldError: (field: string) => string | null;
  hasErrors: () => boolean;
}

export function useValidation(): ValidationState & ValidationActions {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  const isValid = useMemo(() => errors.length === 0, [errors]);

  const validateField = useCallback(
    (field: string, value: unknown): ValidationError | null => {
      // Determine which schema to use based on field
      let schema: z.ZodSchema;

      if (field.includes('policy')) {
        schema = policySchema.pick({ [field]: true } as {
          [K in keyof typeof policySchema.shape]: true;
        });
      } else if (field.includes('procedure')) {
        schema = procedureSchema.pick({ [field]: true } as {
          [K in keyof typeof procedureSchema.shape]: true;
        });
      } else if (
        field.includes('sms') ||
        field.includes('chemical') ||
        field.includes('cas')
      ) {
        schema = smsSchema.pick({ [field]: true } as {
          [K in keyof typeof smsSchema.shape]: true;
        });
      } else if (field.includes('pathway') || field.includes('quiz')) {
        schema = pathwaySchema.pick({ [field]: true } as {
          [K in keyof typeof pathwaySchema.shape]: true;
        });
      } else if (field.includes('font') || field.includes('color')) {
        schema = textFormattingSchema.pick({ [field]: true } as {
          [K in keyof typeof textFormattingSchema.shape]: true;
        });
      } else if (field.includes('table')) {
        schema = tableSchema.pick({ [field]: true } as {
          [K in keyof typeof tableSchema.shape]: true;
        });
      } else if (field.includes('pdf') || field.includes('recording')) {
        schema = mediaSchema.pick({ [field]: true } as {
          [K in keyof typeof mediaSchema.shape]: true;
        });
      } else {
        // Default to base content schema for common fields
        schema = baseContentSchema.pick({ [field]: true } as {
          [K in keyof typeof baseContentSchema.shape]: true;
        });
      }

      try {
        schema.parse({ [field]: value });
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find((e) => e.path.includes(field));
          if (fieldError) {
            return {
              field,
              message: fieldError.message,
              path: fieldError.path.map(String),
            };
          }
        }
        return null;
      }
    },
    []
  );

  const validateForm = useCallback(
    (data: unknown, schema: z.ZodSchema): ValidationError[] => {
      try {
        schema.parse(data);
        return [];
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            path: err.path.map(String),
          }));
        }
        return [];
      }
    },
    []
  );

  const markFieldAsTouched = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    setIsDirty(true);
  }, []);

  const markAllFieldsAsTouched = useCallback(() => {
    setIsDirty(true);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => prev.filter((error) => error.field !== field));
  }, []);

  const isFieldValid = useCallback(
    (field: string) => {
      return !errors.some((error) => error.field === field);
    },
    [errors]
  );

  const getFieldError = useCallback(
    (field: string): string | null => {
      const error = errors.find((err) => err.field === field);
      return error ? error.message : null;
    },
    [errors]
  );

  const hasErrors = useCallback(() => {
    return errors.length > 0;
  }, [errors]);

  return {
    isValid,
    errors,
    touched,
    isDirty,
    validateField,
    validateForm,
    markFieldAsTouched,
    markAllFieldsAsTouched,
    clearErrors,
    clearFieldError,
    isFieldValid,
    getFieldError,
    hasErrors,
  };
}

// Specialized validation hooks for each content type
export function usePolicyValidation() {
  const validation = useValidation();

  const validatePolicy = useCallback(
    (data: unknown) => {
      return validation.validateForm(data, policySchema);
    },
    [validation]
  );

  return {
    ...validation,
    validatePolicy,
  };
}

export function useProcedureValidation() {
  const validation = useValidation();

  const validateProcedure = useCallback(
    (data: unknown) => {
      return validation.validateForm(data, procedureSchema);
    },
    [validation]
  );

  return {
    ...validation,
    validateProcedure,
  };
}

export function useSMSValidation() {
  const validation = useValidation();

  const validateSMS = useCallback(
    (data: unknown) => {
      return validation.validateForm(data, smsSchema);
    },
    [validation]
  );

  return {
    ...validation,
    validateSMS,
  };
}

export function usePathwayValidation() {
  const validation = useValidation();

  const validatePathway = useCallback(
    (data: unknown) => {
      return validation.validateForm(data, pathwaySchema);
    },
    [validation]
  );

  return {
    ...validation,
    validatePathway,
  };
}
