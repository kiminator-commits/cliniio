// Base content types for Content Builder
export type ContentType =
  | 'course'
  | 'policy'
  | 'procedure'
  | 'sms'
  | 'pathway'
  | 'table'
  | 'media';

export interface Content {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: number;
  department?: string;
  content?: string;
  media?: MediaItem[];
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: CourseLesson[];
  order: number;
  isRequired: boolean;
  estimatedDuration: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  content: string;
  order: number;
  moduleId: string;
  estimatedDuration: number;
  isRequired: boolean;
  type: 'video' | 'text' | 'interactive' | 'assessment' | 'resource' | 'quiz';
  quiz?: LessonQuiz; // New field for quiz data
}

export interface CourseAssessment {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit?: number;
  isRequired: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

// New LessonQuiz interface
export interface LessonQuiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  allowRetries: boolean;
  maxRetries: number;
  isRequired: boolean;
  showResults: boolean;
  randomizeQuestions: boolean;
}

// Enhanced QuizQuestion interface
export interface QuizQuestion {
  id: string;
  question: string;
  type:
    | 'multiple-choice'
    | 'true-false'
    | 'fill-blank'
    | 'matching'
    | 'drag-drop'
    | 'hotspot';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface QuestionBank {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
}

export interface CourseData {
  id: string;
  title: string;
  description: string;
  objectives?: string[];
  prerequisites?: string[];
  linkedPrerequisites?: string[]; // Array of course IDs from the library
  modules: CourseModule[];
  assessments: CourseAssessment[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isPublished: boolean;
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration: number;
    tags: string;
    allowRetakes: boolean;
    certificateOnCompletion: boolean;
  };
}

export interface AISuggestion {
  id: string;
  type: 'content-gap' | 'improvement' | 'new-topic';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  category?: string;
  content?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'presentation';
  url: string;
  title: string;
  description?: string;
  name?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: Date;
}

export interface ContentBuilderState {
  contentType: ContentType;
  selectedContentType?: string;
  activeTab?: string;
  courseStep?: number;
  courseData: CourseData;
  policyData: Record<string, unknown>;
  procedureData: Record<string, unknown>;
  smsData: Record<string, unknown>;
  pathwayData: Record<string, unknown>;
  textFormattingData: Record<string, unknown>;
  tableData: Record<string, unknown>;
  mediaData: Record<string, unknown>;
  currentContent?: Content;
  aiSuggestions?: AISuggestion[];
  mediaLibrary?: MediaItem[];
  isDirty: boolean;
  isSaving: boolean;
  validationErrors: Record<string, string>;
}
