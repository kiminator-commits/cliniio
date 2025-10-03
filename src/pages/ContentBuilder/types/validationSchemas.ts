import { z } from 'zod';

// Base validation schemas
export const baseContentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10,000 characters'),
});

// Policy-specific validation schema
export const policySchema = baseContentSchema.extend({
  policyVersion: z
    .string()
    .min(1, 'Policy version is required')
    .regex(/^\d+\.\d+$/, 'Version must be in format X.Y (e.g., 1.0)'),
  policyType: z.enum(['general', 'safety', 'compliance', 'operational'], {
    errorMap: () => ({ message: 'Please select a valid policy type' }),
  }),
  requiresSignature: z.boolean(),
  signatureDeadline: z
    .number()
    .min(1, 'Deadline must be at least 1 day')
    .max(365, 'Deadline cannot exceed 365 days')
    .optional(),
  acknowledgmentStatement: z
    .string()
    .min(10, 'Acknowledgment statement must be at least 10 characters')
    .max(500, 'Acknowledgment statement must be less than 500 characters')
    .optional(),
});

// Procedure-specific validation schema
export const procedureSchema = baseContentSchema.extend({
  isRequired: z.boolean(),
  reviewAnnually: z.boolean(),
  estimatedDuration: z
    .number()
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Please select a valid difficulty level' }),
  }),
  department: z
    .string()
    .min(1, 'Department is required')
    .max(100, 'Department must be less than 100 characters'),
  responsiblePerson: z
    .string()
    .min(1, 'Responsible person is required')
    .max(100, 'Responsible person must be less than 100 characters'),
});

// SMS-specific validation schema
export const smsSchema = baseContentSchema.extend({
  chemicalName: z
    .string()
    .min(1, 'Chemical name is required')
    .max(200, 'Chemical name must be less than 200 characters'),
  casNumber: z
    .string()
    .min(1, 'CAS number is required')
    .regex(/^\d{1,7}-\d{2}-\d$/, 'CAS number must be in format XXXX-XX-X'),
  hazardClass: z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
    errorMap: () => ({ message: 'Please select a valid hazard class' }),
  }),
  storageRequirements: z
    .string()
    .min(1, 'Storage requirements are required')
    .max(500, 'Storage requirements must be less than 500 characters'),
  handlingInstructions: z
    .string()
    .min(1, 'Handling instructions are required')
    .max(1000, 'Handling instructions must be less than 1,000 characters'),
  emergencyProcedures: z
    .string()
    .min(1, 'Emergency procedures are required')
    .max(1000, 'Emergency procedures must be less than 1,000 characters'),
});

// Pathway-specific validation schema
export const pathwaySchema = baseContentSchema.extend({
  pathwayDueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      return selectedDate > today;
    }, 'Due date must be in the future'),
  issueCertificate: z.boolean(),
  requireFinalQuiz: z.boolean(),
  quizQuestionCount: z
    .number()
    .min(1, 'Quiz must have at least 1 question')
    .max(50, 'Quiz cannot have more than 50 questions'),
  quizPassingRate: z
    .number()
    .min(50, 'Passing rate must be at least 50%')
    .max(100, 'Passing rate cannot exceed 100%'),
  quizTimeLimit: z
    .number()
    .min(5, 'Time limit must be at least 5 minutes')
    .max(180, 'Time limit cannot exceed 3 hours (180 minutes)'),
});

// Text formatting validation schema
export const textFormattingSchema = z.object({
  fontFamily: z.string().min(1, 'Font family is required'),
  fontSize: z.enum(['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'], {
    errorMap: () => ({ message: 'Please select a valid font size' }),
  }),
  textColor: z.string().min(1, 'Text color is required'),
});

// Table validation schema
export const tableSchema = z.object({
  headers: z
    .array(z.string().min(1, 'Header cannot be empty'))
    .min(1, 'Table must have at least one column')
    .max(10, 'Table cannot have more than 10 columns'),
  data: z
    .array(z.array(z.string()))
    .min(1, 'Table must have at least one row')
    .max(50, 'Table cannot have more than 50 rows'),
});

// Media validation schema
export const mediaSchema = z.object({
  pdfFile: z.instanceof(File).nullable(),
  isRecording: z.boolean(),
  pdfUploading: z.boolean(),
});

// Union type for all content schemas
export const contentValidationSchema = z.discriminatedUnion('type', [
  policySchema.extend({ type: z.literal('policy') }),
  procedureSchema.extend({ type: z.literal('procedure') }),
  smsSchema.extend({ type: z.literal('sms') }),
  pathwaySchema.extend({ type: z.literal('pathway') }),
]);

// Export types
export type PolicyValidationData = z.infer<typeof policySchema>;
export type ProcedureValidationData = z.infer<typeof procedureSchema>;
export type SMSValidationData = z.infer<typeof smsSchema>;
export type PathwayValidationData = z.infer<typeof pathwaySchema>;
export type TextFormattingData = z.infer<typeof textFormattingSchema>;
export type TableData = z.infer<typeof tableSchema>;
export type MediaData = z.infer<typeof mediaSchema>;
export type ContentValidationData = z.infer<typeof contentValidationSchema>;
