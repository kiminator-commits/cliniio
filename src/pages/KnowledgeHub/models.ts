// Course types
export interface Course {
  id: string;
  title: string;
  description?: string;
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
}

export interface CourseState {
  assigned: Course[];
  library: Course[];
  completed: Course[];
  recommended: Course[];
}

// Policy types
export interface Policy {
  id: string;
  title: string;
  description: string;
  domain: string;
  tags?: string[];
  status: string;
  lastUpdated: string;
  assignedBy?: string;
  dueDate?: string;
  archivedDate?: string;
}

export interface PolicyState {
  forReview: Policy[];
  library: Policy[];
  archived: Policy[];
}

// Procedure types
export interface ProcedureMedia {
  type: string;
  url: string;
  title: string;
}

export interface Procedure {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  description: string;
  steps: string[];
  requirements: string[];
  media?: ProcedureMedia[];
}

// Learning Path types
export interface LearningPathItem {
  type: string;
  title: string;
  status: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  contentType: string;
  progress: number;
  status: string;
  completionDate: string | null;
  score: number | null;
  tags: string[];
  items: LearningPathItem[];
  certificateUrl?: string;
}

export interface LearningPathState {
  inProgress: LearningPath[];
  library: LearningPath[];
  completed: LearningPath[];
  recommended: LearningPath[];
}

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
}

// User profile
export interface UserProfile {
  role: string;
  tenure: string;
  performanceMetrics: {
    [key: string]: number;
  };
  lastPerformanceReview: string;
}
