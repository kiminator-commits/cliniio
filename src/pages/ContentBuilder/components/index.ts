// Main content builder components
export { default as ContentEditor } from './ContentEditor';
export { default as ContentTypeSelector } from './ContentTypeSelector';
export { default as CourseBuilder } from './CourseBuilder';
export { default as SimpleContentEditor } from './SimpleContentEditor';

// Course step components
export * from './CourseSteps';
export { default as LinkedPrerequisiteInput } from './CourseSteps/LinkedPrerequisiteInput';

// AI and suggestions components
export { default as AISuggestions } from './AISuggestions';
export { default as SDSAIAssistant } from './SDSAIAssistant';

// Media and library components
export { default as MediaLibrary } from './MediaLibrary';

// New refactored components
export { default as CommonEditorFields } from './CommonEditorFields';
export { default as ContentToolbar } from './ContentToolbar';
export { default as TextFormatting } from './TextFormatting';
export { TableBuilder } from './TableBuilder';
export { default as MediaUploader } from './MediaUploader';

// Content type specific editors
export { default as PolicyEditor } from './PolicyEditor';

// Validation components
export {
  ValidationErrorDisplay,
  FieldErrorDisplay,
  FormErrorsSummary,
  ValidationStatus,
  FieldValidationHint,
} from './ValidationErrorDisplay';

// Performance optimized components
export { default as LazyContentEditor } from './LazyContentEditor';
export { default as PerformanceMonitor } from './PerformanceMonitor';
