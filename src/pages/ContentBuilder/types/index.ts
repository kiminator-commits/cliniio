// Base content types
export type {
  ContentType,
  Content,
  CourseModule,
  CourseLesson,
  CourseAssessment,
  AssessmentQuestion,
  LessonQuiz,
  QuizQuestion,
  QuestionBank, // Added
  CourseData,
  AISuggestion,
  MediaItem,
  ContentBuilderState,
} from './contentTypes';

// Validation schemas and types
export type {
  PolicyValidationData,
  ProcedureValidationData,
  SMSValidationData,
  PathwayValidationData,
  TextFormattingData,
  TableData,
  MediaData,
  ContentValidationData,
} from './validationSchemas';

export {
  policySchema,
  procedureSchema,
  smsSchema,
  pathwaySchema,
  textFormattingSchema,
  tableSchema,
  mediaSchema,
  baseContentSchema,
  contentValidationSchema,
} from './validationSchemas';

// Validation error types
export type { ValidationError } from '../hooks/useValidation';
