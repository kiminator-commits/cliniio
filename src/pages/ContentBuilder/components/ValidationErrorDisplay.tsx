import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiCheckCircle, mdiInformation } from '@mdi/js';

export interface ValidationError {
  field: string;
  message: string;
  path: string[];
}

interface ValidationErrorDisplayProps {
  error: ValidationError | null;
  touched: boolean;
  isValid?: boolean;
  showSuccess?: boolean;
  className?: string;
}

interface FieldErrorDisplayProps {
  field: string;
  errors: ValidationError[];
  touched: Set<string>;
  className?: string;
}

interface FormErrorsSummaryProps {
  errors: ValidationError[];
  className?: string;
}

export const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  error,
  touched,
  isValid = true,
  showSuccess = false,
  className = '',
}) => {
  if (!touched) return null;

  if (error) {
    return (
      <div
        className={`flex items-center space-x-2 text-red-600 text-sm mt-1 ${className}`}
      >
        <Icon path={mdiAlertCircle} size={0.75} />
        <span>{error.message}</span>
      </div>
    );
  }

  if (showSuccess && isValid) {
    return (
      <div
        className={`flex items-center space-x-2 text-green-600 text-sm mt-1 ${className}`}
      >
        <Icon path={mdiCheckCircle} size={0.75} />
        <span>Field is valid</span>
      </div>
    );
  }

  return null;
};

export const FieldErrorDisplay: React.FC<FieldErrorDisplayProps> = ({
  field,
  errors,
  touched,
  className = '',
}) => {
  const fieldError = errors.find((error) => error.field === field);
  const isTouched = touched.has(field);

  if (!isTouched || !fieldError) return null;

  return (
    <div
      className={`flex items-center space-x-2 text-red-600 text-sm mt-1 ${className}`}
    >
      <Icon path={mdiAlertCircle} size={0.75} />
      <span>{fieldError.message}</span>
    </div>
  );
};

export const FormErrorsSummary: React.FC<FormErrorsSummaryProps> = ({
  errors,
  className = '',
}) => {
  if (errors.length === 0) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}
    >
      <div className="flex items-center space-x-2 mb-3">
        <Icon path={mdiAlertCircle} size={1.25} className="text-red-500" />
        <h4 className="text-sm font-medium text-red-800">
          Please fix the following errors:
        </h4>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-red-700">
            <span className="font-medium">{error.field}:</span> {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ValidationStatus: React.FC<{
  isValid: boolean;
  isDirty: boolean;
}> = ({ isValid, isDirty }) => {
  if (!isDirty) return null;

  return (
    <div
      className={`flex items-center space-x-2 text-sm ${
        isValid ? 'text-green-600' : 'text-red-600'
      }`}
    >
      <Icon path={isValid ? mdiCheckCircle : mdiAlertCircle} size={1} />
      <span>{isValid ? 'Form is valid' : 'Form has validation errors'}</span>
    </div>
  );
};

export const FieldValidationHint: React.FC<{
  hint: string;
  className?: string;
}> = ({ hint, className = '' }) => {
  return (
    <div
      className={`flex items-center space-x-2 text-gray-500 text-xs mt-1 ${className}`}
    >
      <Icon path={mdiInformation} size={0.75} />
      <span>{hint}</span>
    </div>
  );
};
