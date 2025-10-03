// Risk level thresholds and configurations
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const RISK_THRESHOLDS = {
  LOW: { min: 0, max: 30, color: 'green' },
  MEDIUM: { min: 31, max: 60, color: 'yellow' },
  HIGH: { min: 61, max: 80, color: 'orange' },
  CRITICAL: { min: 81, max: 100, color: 'red' },
} as const;

// Performance score thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: { min: 90, max: 100, label: 'Excellent', color: 'green' },
  GOOD: { min: 80, max: 89, label: 'Good', color: 'yellow' },
  FAIR: { min: 70, max: 79, label: 'Fair', color: 'orange' },
  NEEDS_IMPROVEMENT: {
    min: 0,
    max: 69,
    label: 'Needs Improvement',
    color: 'red',
  },
} as const;

// Urgency levels for supply depletion
export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const URGENCY_THRESHOLDS = {
  LOW: { days: 30, color: 'green' },
  MEDIUM: { days: 14, color: 'yellow' },
  HIGH: { days: 7, color: 'orange' },
  CRITICAL: { days: 3, color: 'red' },
} as const;

// Priority levels for recommendations
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Difficulty levels for optimization tips
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// Tab configuration
export const INTELLIGENCE_TABS = [
  {
    id: 'overview',
    name: 'Overview',
    icon: 'mdiBrain',
    description: 'High-level intelligence summary',
  },
  {
    id: 'forecasting',
    name: 'Forecasting',
    icon: 'mdiTrendingDown',
    description: 'Predictive analytics and forecasts',
  },
  {
    id: 'risks',
    name: 'Risk Analysis',
    icon: 'mdiShieldAlert',
    description: 'Risk assessment and mitigation',
  },
  {
    id: 'actions',
    name: 'Action Items',
    icon: 'mdiLightbulbOn',
    description: 'Required actions and recommendations',
  },
  {
    id: 'insights',
    name: 'Smart Insights',
    icon: 'mdiLightningBolt',
    description: 'AI-powered insights and analysis',
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: 'mdiLink',
    description: 'System integrations and health',
  },
] as const;

// Color schemes for different data types
export const COLOR_SCHEMES = {
  RISK: {
    low: 'bg-green-100 text-green-800 border-green-500',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-500',
    high: 'bg-orange-100 text-orange-800 border-orange-500',
    critical: 'bg-red-100 text-red-800 border-red-500',
  },
  PERFORMANCE: {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-yellow-100 text-yellow-800',
    fair: 'bg-orange-100 text-orange-800',
    needsImprovement: 'bg-red-100 text-red-800',
  },
  URGENCY: {
    low: 'bg-green-50 border-green-500',
    medium: 'bg-yellow-50 border-yellow-500',
    high: 'bg-orange-50 border-orange-500',
    critical: 'bg-red-50 border-red-500',
  },
} as const;

// Default values and limits
export const DEFAULTS = {
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_RECOMMENDATIONS: 5,
  MAX_OPTIMIZATION_TIPS: 6,
  MAX_TOOL_DISPLAY: 3,
  MAX_SUPPLY_DISPLAY: 3,
  MAX_USER_DISPLAY: 5,
  MAX_RISK_FACTORS: 5,
} as const;

// Time constants
export const TIME_CONSTANTS = {
  DAYS_IN_WEEK: 7,
  DAYS_IN_MONTH: 30,
  DAYS_IN_YEAR: 365,
  HOURS_IN_DAY: 24,
  MINUTES_IN_HOUR: 60,
  SECONDS_IN_MINUTE: 60,
  MILLISECONDS_IN_DAY: 24 * 60 * 60 * 1000,
} as const;

// Currency and number formatting
export const FORMATTING = {
  CURRENCY: {
    locale: 'en-US',
    style: 'currency',
    currency: 'USD',
  },
  PERCENTAGE: {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  },
  DATE: {
    locale: 'en-US',
    options: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  },
  DATETIME: {
    locale: 'en-US',
    options: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  },
} as const;

// API endpoints and service configurations
export const API_CONFIG = {
  BASE_URL: '/api/intelligence',
  ENDPOINTS: {
    SUMMARY: '/summary',
    RECOMMENDATIONS: '/recommendations',
    OPTIMIZATION_TIPS: '/optimization-tips',
    INTEGRATION_METRICS: '/integration-metrics',
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Error messages and user feedback
export const MESSAGES = {
  ERRORS: {
    LOADING_FAILED: 'Failed to load intelligence data',
    REFRESH_FAILED: 'Failed to refresh data',
    NO_DATA: 'No intelligence data available',
    NETWORK_ERROR: 'Network error occurred',
    TIMEOUT_ERROR: 'Request timed out',
  },
  SUCCESS: {
    DATA_LOADED: 'Intelligence data loaded successfully',
    DATA_REFRESHED: 'Data refreshed successfully',
  },
  INFO: {
    LOADING: 'Loading intelligence data...',
    REFRESHING: 'Refreshing data...',
    NO_FORECASTS: 'No forecasts available yet',
    NO_RISKS: 'No risk factors identified',
    NO_ACTIONS: 'No urgent actions required',
  },
} as const;
