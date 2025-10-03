import React, { forwardRef } from 'react';
import { Icon } from '@mdi/react';
import { mdiAlertCircle, mdiCheckCircle } from '@mdi/js';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  touched?: boolean;
  required?: boolean;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  variant?: 'default' | 'success' | 'error';
  className?: string;
  id?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      touched,
      required = false,
      helperText,
      leftIcon,
      rightIcon,
      onLeftIconClick,
      onRightIconClick,
      variant = 'default',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    // Determine variant based on error state
    const inputVariant = error && touched ? 'error' : variant;

    // Base classes
    const baseClasses =
      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';

    // Variant-specific classes
    const variantClasses = {
      default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
      success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    };

    // Icon classes
    const iconClasses =
      'absolute top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors';

    // Input wrapper classes
    const wrapperClasses = leftIcon || rightIcon ? 'relative' : '';

    // Input classes
    const inputClasses = `${baseClasses} ${variantClasses[inputVariant]} ${className}`;

    // Padding adjustments for icons
    const inputPadding = {
      paddingLeft: leftIcon ? '2.75rem' : undefined,
      paddingRight: rightIcon ? '2.75rem' : undefined,
    };

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className={wrapperClasses}>
          {leftIcon && (
            <div
              onClick={onLeftIconClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onLeftIconClick?.();
                }
              }}
              role="button"
              tabIndex={onLeftIconClick ? 0 : -1}
              aria-label={`Click ${leftIcon} icon`}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            >
              <Icon
                path={leftIcon}
                size={1}
                className={`${iconClasses} ${onLeftIconClick ? 'cursor-pointer' : ''}`}
              />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            style={inputPadding}
            aria-invalid={error && touched ? 'true' : 'false'}
            aria-describedby={
              error && touched
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div
              onClick={onRightIconClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRightIconClick?.();
                }
              }}
              role="button"
              tabIndex={onRightIconClick ? 0 : -1}
              aria-label={`Click ${rightIcon} icon`}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Icon
                path={rightIcon}
                size={1}
                className={`${iconClasses} ${onRightIconClick ? 'cursor-pointer' : ''}`}
              />
            </div>
          )}

          {/* Status icons */}
          {touched && (
            <div className="absolute top-1/2 transform -translate-y-1/2 right-3">
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
            id={`${inputId}-error`}
            className="text-sm text-red-600 flex items-center space-x-1"
          >
            <Icon path={mdiAlertCircle} size={0.8} />
            <span>{error}</span>
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
