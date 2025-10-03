// Main settings service
export {
  settingsService,
  type BasicInfoForm,
  type PreferencesForm,
  type UserData,
  type PhotoUploadResult,
  type SaveProfileResult,
  type UpdatePreferencesResult,
} from './settingsService';

// Error handling service
export {
  errorHandlingService,
  createError,
  handleError,
  safeExecute,
  type AppError,
  type ErrorHandlingOptions,
  ERROR_CODES,
  ERROR_MESSAGES,
} from './errorHandlingService';
