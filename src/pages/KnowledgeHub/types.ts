import * as yup from 'yup';

// Re-export Course from models to fix import issues
export interface Course {
  id: string;
  title: string;
  domain: string;
  contentType?: string;
  tags?: string[];
  progress: number;
  status: string;
  dueDate?: string;
  assignedBy?: string;
  lastCompleted?: string;
  isRepeat?: boolean;
  score?: number;
  media?: {
    type: string;
    url: string;
  };
  description?: string; // Add description property to fix CourseCard error
}

// Specific types for better type safety - Updated to match database schema
export type ContentStatus = 'draft' | 'published' | 'archived' | 'review';
export type ContentCategory =
  | 'Courses'
  | 'Procedures'
  | 'Policies'
  | 'Learning Pathways'
  | 'Advanced';

export interface ContentItem {
  id: string;
  title: string;
  category: ContentCategory;
  status: ContentStatus;
  dueDate: string; // ISO date string
  progress: number; // 0-100
  department?: string;
  lastUpdated?: string; // ISO date string
  description?: string; // Add description property to fix provider error
  tags?: string[]; // Add tags for filtering
  domain?: string; // Add domain for filtering
  contentType?: string; // Add contentType for filtering
  type?: string; // Add type property for table components
  createdAt?: string; // Add createdAt property for table components
  isActive?: boolean; // Add isActive property for filtering
  estimatedDuration?: number; // Add estimated duration in minutes
  difficultyLevel?: string; // Add difficulty level
  // Additional properties for course functionality
  repeatSettings?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    lastCompleted?: string;
  };
  mandatoryRepeat?: boolean;
  passingScore?: number;
  data?: {
    description?: string;
    tags?: string[];
    createdAt?: string;
    isActive?: boolean;
    [key: string]: unknown;
  };
}

export interface RecentUpdate {
  type: 'new' | 'completed' | 'assigned' | 'overdue';
  title: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    className?: string;
  }>;
  time: string;
}

// Validation schemas
export const contentItemSchema = yup.object({
  id: yup.string().required('ID is required'),
  title: yup
    .string()
    .required('Title is required')
    .min(1, 'Title cannot be empty'),
  category: yup
    .string()
    .oneOf([
      'Courses',
      'Procedures',
      'Policies',
      'Learning Pathways',
      'Advanced',
    ] as const)
    .required('Category is required'),
  status: yup
    .string()
    .oneOf(['draft', 'published', 'archived', 'review'] as const)
    .required('Status is required'),
  dueDate: yup
    .string()
    .required('Due date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),
  progress: yup
    .number()
    .required('Progress is required')
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100'),
  department: yup.string().optional(),
  lastUpdated: yup
    .string()
    .optional()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      'Last updated must be in YYYY-MM-DD format'
    ),
});

export const recentUpdateSchema = yup.object({
  type: yup
    .string()
    .oneOf(['new', 'completed', 'assigned', 'overdue'] as const)
    .required('Type is required'),
  title: yup.string().required('Title is required'),
  icon: yup.mixed().required('Icon is required'),
  time: yup.string().required('Time is required'),
});

// Type guards for runtime validation
export const isValidContentItem = (data: unknown): data is ContentItem => {
  try {
    contentItemSchema.validateSync(data);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const isValidRecentUpdate = (data: unknown): data is RecentUpdate => {
  try {
    recentUpdateSchema.validateSync(data);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

// Utility functions for validation
export const validateContentItem = (data: unknown): ContentItem => {
  return contentItemSchema.validateSync(data) as ContentItem;
};

export const validateRecentUpdate = (data: unknown): RecentUpdate => {
  return recentUpdateSchema.validateSync(data) as RecentUpdate;
};
