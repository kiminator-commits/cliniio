import { ContentStatus } from '../../types';

// Database row interfaces
export interface UserLearningProgressRow {
  id: string;
  user_id: string;
  content_id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  completed_at?: string;
  time_spent: number;
  score?: number;
  last_accessed: string;
  department?: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentItemRow {
  id: string;
  title: string;
  category: string;
  status: string;
  description?: string;
  tags?: string[];
  domain: string;
  content_type: string;
  type: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  archived_at?: string;
  estimated_duration?: number;
  difficulty_level: string;
  department?: string;
  author_id?: string;
  assigned_by?: string;
  is_repeat: boolean;
  is_active: boolean;
  content: Record<string, unknown>;
  media: Record<string, unknown>[];
  due_date?: string;
  progress?: number;
}

// User learning progress interface
export interface UserLearningProgress {
  contentId: string;
  title: string;
  category: string;
  status: ContentStatus;
  progress: number;
  completedAt?: string;
  timeSpent: number; // minutes
  score?: number;
  lastAccessed: string;
  department?: string;
  assignedBy?: string;
}

// User performance metrics interface
export interface UserPerformanceMetrics {
  userId: string;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  averageProgress: number;
  completionRate: number;
  timeSpent: number;
  certificatesEarned: number;
  progressByCategory: Record<string, number>;
  recentActivity: Array<{
    contentId: string;
    action: string;
    timestamp: string;
  }>;
  skillGaps: string[];
  recommendedContent: string[];
}

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  role: string;
  department?: string;
  title?: string;
  specialization?: string;
  yearsExperience?: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  learningPreferences: {
    interests: string[];
    learningGoals: string[];
    timeAvailability: number; // minutes per day
    difficultyPreference: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  lastUpdated: string;
}

// Content recommendation interface
export interface ContentRecommendation {
  contentId: string;
  title: string;
  category: string;
  reason: string;
  relevanceScore: number;
  estimatedDuration: number;
  difficulty: string;
  tags: string[];
}

// Learning activity interface
export interface LearningActivity {
  contentId: string;
  action: 'viewed' | 'started' | 'completed' | 'bookmarked';
  duration?: number;
  category?: string;
}
