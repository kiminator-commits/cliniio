import { useState, useCallback, useMemo } from 'react';
import { LoginFormData, FormErrors } from '../pages/Login/types';
import { LOGIN_CONFIG } from '../constants/loginConstants';

export interface ValidationRule {
  field: keyof LoginFormData;
  validator: (value: string) => string | null;
  message: string;
}

export const useLoginValidation = () => {
  const [touchedFields, setTouchedFields] = useState<Set<keyof LoginFormData>>(
    new Set()
  );

  // Validation rules
  const validationRules = useMemo<ValidationRule[]>(
    () => [
      {
        field: 'email',
        validator: (email: string) => {
          if (!email.trim()) return 'Email is required';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return 'Please enter a valid email address';
          }
          return null;
        },
        message: 'Invalid email format',
      },
      {
        field: 'password',
        validator: (password: string) => {
          if (!password) return 'Password is required';
          if (password.length < LOGIN_CONFIG.MIN_PASSWORD_LENGTH)
            return `Password must be at least ${LOGIN_CONFIG.MIN_PASSWORD_LENGTH} characters long`;
          return null;
        },
        message: 'Password too short',
      },
      {
        field: 'otp',
        validator: (otp: string) => {
          if (!otp) return 'Verification code is required';
          if (otp.length !== LOGIN_CONFIG.OTP_LENGTH)
            return `Verification code must be ${LOGIN_CONFIG.OTP_LENGTH} digits`;
          if (!/^\d{6}$/.test(otp))
            return 'Verification code must contain only numbers';
          return null;
        },
        message: 'Invalid OTP format',
      },
    ],
    []
  );

  // Validate a single field
  const validateField = useCallback(
    (field: keyof LoginFormData, value: string): string | null => {
      const rule = validationRules.find((r) => r.field === field);
      if (!rule) return null;
      return rule.validator(value);
    },
    [validationRules]
  );

  // Validate all fields
  const validateForm = useCallback(
    (formData: LoginFormData): FormErrors => {
      const errors: FormErrors = {};

      validationRules.forEach((rule) => {
        const value = formData[rule.field];
        // Only validate string fields, skip boolean fields like rememberMe and rememberDevice
        if (typeof value === 'string') {
          const error = rule.validator(value);
          if (error) {
            errors[rule.field] = error;
          }
        }
      });

      // OTP validation only applies in OTP stage
      if (formData.stage !== 'otp' && errors.otp) {
        delete errors.otp;
      }

      return errors;
    },
    [validationRules]
  );

  // Mark field as touched
  const markFieldTouched = useCallback((field: keyof LoginFormData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  }, []);

  // Check if field should show error
  const shouldShowError = useCallback(
    (field: keyof LoginFormData): boolean => {
      return touchedFields.has(field);
    },
    [touchedFields]
  );

  // Get field error
  const getFieldError = useCallback(
    (field: keyof LoginFormData, formData: LoginFormData): string | null => {
      if (!shouldShowError(field)) return null;
      const value = formData[field];
      if (typeof value === 'string') {
        return validateField(field, value);
      }
      return null;
    },
    [shouldShowError, validateField]
  );

  // Reset touched fields
  const resetTouchedFields = useCallback(() => {
    setTouchedFields(new Set());
  }, []);

  return {
    validateField,
    validateForm,
    markFieldTouched,
    shouldShowError,
    getFieldError,
    resetTouchedFields,
    touchedFields,
  };
};
