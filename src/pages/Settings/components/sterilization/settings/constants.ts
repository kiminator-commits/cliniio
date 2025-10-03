export const AI_SETTINGS_DEFAULTS = {
  AI_VERSION: '1.0.0',
  AI_CONFIDENCE_THRESHOLD: 0.85,
  AI_DATA_RETENTION_DAYS: 90,
  ENCRYPTED_DATA_TRANSMISSION: true,
} as const;

export const AI_FEATURE_CATEGORIES = {
  COMPUTER_VISION: [
    {
      key: 'tool_condition_assessment',
      label: 'Tool Condition Assessment',
      desc: 'AI-powered visual inspection of tool wear and damage',
    },
    {
      key: 'barcode_quality_detection',
      label: 'Barcode Quality Detection',
      desc: 'Automated barcode readability assessment',
    },
    {
      key: 'tool_type_recognition',
      label: 'Tool Type Recognition',
      desc: 'Automatic tool identification from images',
    },
    {
      key: 'cleaning_validation',
      label: 'Cleaning Validation',
      desc: 'Visual verification of cleaning effectiveness',
    },
  ],
  PREDICTIVE_ANALYTICS: [
    {
      key: 'cycle_optimization',
      label: 'Cycle Optimization',
      desc: 'AI-driven sterilization cycle parameter optimization',
    },
    {
      key: 'failure_prediction',
      label: 'Failure Prediction',
      desc: 'Predictive maintenance and equipment failure alerts',
    },
    {
      key: 'efficiency_optimization',
      label: 'Efficiency Optimization',
      desc: 'Process efficiency analysis and recommendations',
    },
    {
      key: 'resource_planning',
      label: 'Resource Planning',
      desc: 'Intelligent resource allocation and scheduling',
    },
  ],
  SMART_WORKFLOW: [
    {
      key: 'intelligent_workflow_selection',
      label: 'Intelligent Workflow Selection',
      desc: 'AI-powered workflow recommendation based on tool type and condition',
    },
    {
      key: 'automated_problem_detection',
      label: 'Automated Problem Detection',
      desc: 'Real-time issue identification and alerting',
    },
    {
      key: 'smart_phase_transitions',
      label: 'Smart Phase Transitions',
      desc: 'Intelligent sterilization phase management',
    },
    {
      key: 'batch_optimization',
      label: 'Batch Optimization',
      desc: 'Optimal tool grouping and batch processing',
    },
  ],
} as const;

export const CYCLE_OPTIONS = [
  { value: 'unwrapped', label: 'Unwrapped (3 min, 132°C)' },
  { value: 'pouches', label: 'Pouches (5 min, 132°C)' },
  { value: 'packs', label: 'Packs (30 min, 121°C)' },
  { value: 'handpieces', label: 'Handpieces (6 min, 132°C)' },
  { value: 'custom', label: 'Custom' },
] as const;

export const RECEIPT_RETENTION_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '1 year (recommended)' },
  { value: 18, label: '18 months' },
  { value: 24, label: '2 years' },
] as const;

export const AI_DATA_RETENTION_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days (recommended)' },
  { value: 180, label: '180 days' },
  { value: 365, label: '1 year' },
] as const;

export const CUSTOM_CYCLE_LIMITS = {
  TEMPERATURE: { min: 100, max: 150 },
  PRESSURE: { min: 10, max: 30 },
  STERILIZE_TIME: { min: 1, max: 60 },
  DRY_TIME: { min: 10, max: 60 },
} as const;

export const AI_CONFIDENCE_THRESHOLD_LIMITS = {
  min: 0.5,
  max: 1,
  step: 0.05,
} as const;

export const MESSAGE_TIMEOUT = 3000;
