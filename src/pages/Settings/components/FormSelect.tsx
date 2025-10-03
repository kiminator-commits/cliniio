import React, { forwardRef } from 'react';
import { Icon } from '@mdi/react';
import { mdiAlertCircle, mdiCheckCircle, mdiChevronDown } from '@mdi/js';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: SelectOption[];
  error?: string | null;
  touched?: boolean;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'success' | 'error';
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      options,
      error,
      touched,
      required = false,
      helperText,
      placeholder,
      onChange,
      variant = 'default',
      className = '',
      id,
      value,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    // Determine variant based on error state
    const selectVariant = error && touched ? 'error' : variant;

    // Base classes
    const baseClasses =
      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors appearance-none bg-white';

    // Variant-specific classes
    const variantClasses = {
      default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
      success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    };

    // Select classes
    const selectClasses = `${baseClasses} ${variantClasses[selectVariant]} ${className}`;

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="space-y-1">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            value={value}
            onChange={handleChange}
            aria-invalid={error && touched ? 'true' : 'false'}
            aria-describedby={
              error && touched
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
            <Icon path={mdiChevronDown} size={1} className="text-gray-400" />
          </div>

          {/* Status icons */}
          {touched && (
            <div className="absolute top-1/2 transform -translate-y-1/2 right-8">
              {error ? (
                <Icon path={mdiAlertCircle} size={1} className="text-red-500" />
              ) : (
                <Icon
                  path={mdiCheckCircle}
                  size={1}
                  className="text-green-500"
                />
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && touched && (
          <p
            id={`${selectId}-error`}
            className="text-sm text-red-600 flex items-center space-x-1"
          >
            <Icon path={mdiAlertCircle} size={0.8} />
            <span>{error}</span>
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
