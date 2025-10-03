import { useState, useCallback, useMemo } from 'react';
import {
  ValidationErrors,
  ValidationRules,
  validateForm,
  isFormValid,
} from '../utils/formValidation';

interface UseValidatedFormOptions<T> {
  initialData: T;
  validationRules: ValidationRules;
  onSubmit?: (data: T) => Promise<boolean>;
  onValidationError?: (errors: ValidationErrors) => void;
}

export function useValidatedForm<T extends Record<string, unknown>>({
  initialData,
  validationRules,
  onSubmit,
  onValidationError,
}: UseValidatedFormOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());

  // Validate the entire form
  const validateFormData = useCallback(
    (formData: T = data): ValidationErrors => {
      return validateForm(formData, validationRules);
    },
    [data, validationRules]
  );

  // Validate a single field
  const validateField = useCallback(
    (fieldName: keyof T, value: unknown): string | null => {
      const fieldRules = validationRules[fieldName as string];
      if (!fieldRules) return null;

      const fieldErrors = validateForm(
        { [fieldName]: value },
        { [fieldName]: fieldRules }
      );
      return fieldErrors[fieldName as string] || null;
    },
    [validationRules]
  );

  // Update a single field
  const updateField = useCallback(
    (fieldName: keyof T, value: unknown) => {
      setData((prev) => ({ ...prev, [fieldName]: value }));

      // Clear error when field is updated
      if (errors[fieldName as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));

    // Clear errors for updated fields
    const updatedFields = Object.keys(updates) as (keyof T)[];
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedFields.forEach((field) => {
        delete newErrors[field as string];
      });
      return newErrors;
    });
  }, []);

  // Mark field as touched
  const touchField = useCallback((fieldName: keyof T) => {
    setTouched((prev) => new Set(prev).add(fieldName));
  }, []);

  // Mark multiple fields as touched
  const touchFields = useCallback((fieldNames: (keyof T)[]) => {
    setTouched((prev) => {
      const newTouched = new Set(prev);
      fieldNames.forEach((field) => newTouched.add(field));
      return newTouched;
    });
  }, []);

  // Get field error (only show if field is touched)
  const getFieldError = useCallback(
    (fieldName: keyof T): string | null => {
      if (!touched.has(fieldName)) return null;
      return errors[fieldName as string] || null;
    },
    [errors, touched]
  );

  // Check if field has error
  const hasFieldError = useCallback(
    (fieldName: keyof T): boolean => {
      return touched.has(fieldName) && !!errors[fieldName as string];
    },
    [errors, touched]
  );

  // Submit the form
  const submitForm = useCallback(async (): Promise<boolean> => {
    // Mark all fields as touched
    const allFields = Object.keys(data) as (keyof T)[];
    touchFields(allFields);

    // Validate form
    const validationErrors = validateFormData();
    setErrors(validationErrors);

    if (!isFormValid(validationErrors)) {
      onValidationError?.(validationErrors);
      return false;
    }

    if (!onSubmit) return true;

    try {
      setIsSubmitting(true);
      const success = await onSubmit(data);
      return success;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validateFormData, touchFields, onValidationError, onSubmit]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched(new Set());
    setIsSubmitting(false);
  }, [initialData]);

  // Reset form to new data
  const resetToData = useCallback((newData: T) => {
    setData(newData);
    setErrors({});
    setTouched(new Set());
    setIsSubmitting(false);
  }, []);

  // Check if form is valid
  const isValid = useMemo(() => isFormValid(errors), [errors]);

  // Check if form has been modified
  const isModified = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  return {
    // Data and state
    data,
    errors,
    touched,
    isSubmitting,
    isValid,
    isModified,

    // Actions
    updateField,
    updateFields,
    touchField,
    touchFields,
    submitForm,
    resetForm,
    resetToData,

    // Utilities
    getFieldError,
    hasFieldError,
    validateFormData,
    validateField,
  };
}
