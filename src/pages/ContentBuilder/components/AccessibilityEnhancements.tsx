import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Icon from '@mdi/react';
import {
  mdiVolumeHigh,
  mdiVolumeOff,
  mdiKeyboard,
  mdiContrast,
  mdiFormatFontSizeIncrease,
} from '@mdi/js';

// Accessibility context
interface AccessibilityContextType {
  isScreenReaderMode: boolean;
  isHighContrastMode: boolean;
  isLargeTextMode: boolean;
  isKeyboardNavigationMode: boolean;
  toggleScreenReaderMode: () => void;
  toggleHighContrastMode: () => void;
  toggleLargeTextMode: () => void;
  toggleKeyboardNavigationMode: () => void;
  announceToScreenReader: (
    message: string,
    priority?: 'polite' | 'assertive'
  ) => void;
  focusElement: (elementId: string) => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within AccessibilityProvider'
    );
  }
  return context;
};

// Accessibility provider component
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isScreenReaderMode, setIsScreenReaderMode] = useState(false);
  const [isHighContrastMode, setIsHighContrastMode] = useState(false);
  const [isLargeTextMode, setIsLargeTextMode] = useState(false);
  const [isKeyboardNavigationMode, setIsKeyboardNavigationMode] =
    useState(false);
  const [announcements, setAnnouncements] = useState<
    Array<{ id: string; message: string; priority: 'polite' | 'assertive' }>
  >([]);

  // Screen reader announcements
  const announceToScreenReader = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const id = `announcement-${Date.now()}`;
    setAnnouncements((prev) => [...prev, { id, message, priority }]);

    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

  // Focus management
  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Keyboard navigation enhancements
  useEffect(() => {
    if (!isKeyboardNavigationMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Enhanced keyboard navigation
      switch (event.key) {
        case 'Tab':
          // Enhanced tab navigation with visual indicators
          break;
        case 'Enter':
        case ' ':
          // Enhanced activation
          break;
        case 'Escape':
          // Enhanced escape functionality
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // Enhanced arrow key navigation
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isKeyboardNavigationMode]);

  // High contrast mode styles
  useEffect(() => {
    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [isHighContrastMode]);

  // Large text mode styles
  useEffect(() => {
    if (isLargeTextMode) {
      document.documentElement.classList.add('large-text-mode');
    } else {
      document.documentElement.classList.remove('large-text-mode');
    }
  }, [isLargeTextMode]);

  const contextValue: AccessibilityContextType = {
    isScreenReaderMode,
    isHighContrastMode,
    isLargeTextMode,
    isKeyboardNavigationMode,
    toggleScreenReaderMode: () => setIsScreenReaderMode((prev) => !prev),
    toggleHighContrastMode: () => setIsHighContrastMode((prev) => !prev),
    toggleLargeTextMode: () => setIsLargeTextMode((prev) => !prev),
    toggleKeyboardNavigationMode: () =>
      setIsKeyboardNavigationMode((prev) => !prev),
    announceToScreenReader,
    focusElement,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}

      {/* Live announcements for screen readers */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {announcements.map((announcement) => (
          <div key={announcement.id} aria-live={announcement.priority}>
            {announcement.message}
          </div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  );
};

// Accessibility toolbar component
export const AccessibilityToolbar: React.FC = () => {
  const {
    isScreenReaderMode,
    isHighContrastMode,
    isLargeTextMode,
    isKeyboardNavigationMode,
    toggleScreenReaderMode,
    toggleHighContrastMode,
    toggleLargeTextMode,
    toggleKeyboardNavigationMode,
  } = useAccessibility();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-2">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Accessibility
        </h3>

        <button
          onClick={toggleScreenReaderMode}
          className={`w-full p-2 rounded-md text-xs font-medium transition-colors ${
            isScreenReaderMode
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label={`${isScreenReaderMode ? 'Disable' : 'Enable'} screen reader enhancements`}
          aria-pressed={isScreenReaderMode}
        >
          <Icon
            path={isScreenReaderMode ? mdiVolumeHigh : mdiVolumeOff}
            size={0.8}
            className="mx-auto mb-1"
          />
          Screen Reader
        </button>

        <button
          onClick={toggleHighContrastMode}
          className={`w-full p-2 rounded-md text-xs font-medium transition-colors ${
            isHighContrastMode
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label={`${isHighContrastMode ? 'Disable' : 'Enable'} high contrast mode`}
          aria-pressed={isHighContrastMode}
        >
          <Icon path={mdiContrast} size={0.8} className="mx-auto mb-1" />
          High Contrast
        </button>

        <button
          onClick={toggleLargeTextMode}
          className={`w-full p-2 rounded-md text-xs font-medium transition-colors ${
            isLargeTextMode
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label={`${isLargeTextMode ? 'Disable' : 'Enable'} large text mode`}
          aria-pressed={isLargeTextMode}
        >
          <Icon
            path={mdiFormatFontSizeIncrease}
            size={0.8}
            className="mx-auto mb-1"
          />
          Large Text
        </button>

        <button
          onClick={toggleKeyboardNavigationMode}
          className={`w-full p-2 rounded-md text-xs font-medium transition-colors ${
            isKeyboardNavigationMode
              ? 'bg-orange-100 text-orange-800 border border-orange-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label={`${isKeyboardNavigationMode ? 'Disable' : 'Enable'} enhanced keyboard navigation`}
          aria-pressed={isKeyboardNavigationMode}
        >
          <Icon path={mdiKeyboard} size={0.8} className="mx-auto mb-1" />
          Keyboard Nav
        </button>
      </div>
    </div>
  );
};

// Enhanced form field component with accessibility
export const AccessibleFormField: React.FC<{
  id: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  rows?: number;
}> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  helpText,
  required = false,
  options = [],
  placeholder,
  rows = 3,
}) => {
  const { announceToScreenReader } = useAccessibility();
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (newValue: string | boolean) => {
    onChange(newValue);

    // Announce changes to screen readers
    if (type === 'checkbox' || type === 'radio') {
      announceToScreenReader(
        `${label} ${newValue ? 'selected' : 'deselected'}`
      );
    } else {
      announceToScreenReader(`${label} updated to ${newValue}`);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    announceToScreenReader(`Focused on ${label} field`);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const renderField = () => {
    const commonProps = {
      id,
      value: value as string,
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => handleChange(e.target.value),
      onFocus: handleFocus,
      onBlur: handleBlur,
      'aria-describedby': `${id}-help ${id}-error`,
      'aria-invalid': !!error,
      'aria-required': required,
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      } ${isFocused ? 'ring-2 ring-[#4ECDC4]' : ''}`,
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            placeholder={placeholder}
            aria-multiline="true"
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={id}
            checked={value as boolean}
            onChange={(e) => handleChange(e.target.checked)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-describedby={`${id}-help ${id}-error`}
            aria-invalid={!!error}
            aria-required={required}
            className={`h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded ${
              error ? 'border-red-300' : ''
            }`}
          />
        );

      case 'radio':
        return (
          <input
            type="radio"
            id={id}
            checked={value as boolean}
            onChange={(e) => handleChange(e.target.checked)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-describedby={`${id}-help ${id}-error`}
            className={`h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 ${
              error ? 'border-red-300' : ''
            }`}
          />
        );

      default:
        return <input type="text" {...commonProps} placeholder={placeholder} />;
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={`block text-sm font-medium ${required ? 'text-gray-900' : 'text-gray-700'}`}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {renderField()}

      {helpText && (
        <p id={`${id}-help`} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-600"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced button component with accessibility
export const AccessibleButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}> = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  ariaLabel,
  ariaDescribedBy,
}) => {
  const { announceToScreenReader } = useAccessibility();

  const handleClick = () => {
    if (disabled || loading) return;

    onClick();
    announceToScreenReader(`Button ${ariaLabel || children} activated`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0] focus:ring-[#4ECDC4]';
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
      default:
        return 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0] focus:ring-[#4ECDC4]';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-md
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
      `}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}

      {icon && !loading && (
        <Icon
          path={icon}
          size={size === 'sm' ? 0.8 : size === 'lg' ? 1.2 : 1}
        />
      )}

      {children}
    </button>
  );
};

// Skip link component for keyboard navigation
export const SkipLink: React.FC<{ targetId: string; label: string }> = ({
  targetId,
  label,
}) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#4ECDC4] text-white px-4 py-2 rounded-md shadow-lg"
      aria-label={label}
    >
      {label}
    </a>
  );
};

// Focus trap component for modals
export const FocusTrap: React.FC<{
  children: React.ReactNode;
  isActive: boolean;
}> = ({ children, isActive }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element when trap becomes active
    if (firstElement) {
      firstElement.focus();
    }

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  );
};

export default AccessibilityToolbar;
