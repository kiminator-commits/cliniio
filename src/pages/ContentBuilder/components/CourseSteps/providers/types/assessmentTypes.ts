export interface Assessment {
  id: string;
  title: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
}

export interface AssessmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QuestionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AssessmentStatistics {
  totalQuestions: number;
  totalPoints: number;
  averagePointsPerQuestion: number;
  estimatedTimeMinutes: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface QuestionStatistics {
  wordCount: number;
  characterCount: number;
  readingTimeSeconds: number;
  difficultyScore: number;
}

export interface Recommendation {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  action: string;
}

export interface QuestionTypeInfo {
  value: Question['type'];
  label: string;
  description: string;
  icon: string;
}

export interface AssessmentTemplate {
  name: string;
  description: string;
  template: Assessment;
}

export interface AssessmentScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  questionScores: Record<string, number>;
}

export interface ImportResult {
  success: boolean;
  assessment: Assessment | null;
  errors: string[];
}
