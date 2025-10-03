// UI Constants - only keeping the constants that are actually used
export const UI_CONSTANTS = {
  borderLeftColor: 'rgba(78, 205, 196, 0.5)',
  primaryTextColor: '#5b5b5b',
  primaryIconColor: '#4ECDC4',
  defaultBorderColor: 'border-gray-200',
  defaultHoverBorderColor: 'hover:border-gray-300',
} as const;

// Color schemes for different UI elements
export const COLOR_SCHEMES = {
  primary: {
    main: '#4ECDC4',
    hover: '#3db8b0',
    light: '#4ECDC4',
  },
  success: {
    main: '#16a34a',
    light: '#dcfce7',
    border: '#bbf7d0',
  },
  warning: {
    main: '#ca8a04',
    light: '#fef3c7',
    border: '#fde68a',
  },
  error: {
    main: '#dc2626',
    light: '#fee2e2',
    border: '#fecaca',
  },
  info: {
    main: '#3b82f6',
    light: '#dbeafe',
    border: '#bfdbfe',
  },
} as const;
