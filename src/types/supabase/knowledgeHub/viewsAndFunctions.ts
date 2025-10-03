// Knowledge Hub Views and Functions

// Knowledge Hub views
export interface KnowledgeHubViews {
  knowledge_hub_user_dashboard: {
    Row: {
      user_id: string;
      full_name: string | null;
      email: string;
      role: 'admin' | 'user' | 'manager';
      total_assigned_content: number;
      completed_content: number;
      in_progress_content: number;
      overdue_content: number;
      completion_percentage: number;
      total_achievements_earned: number;
      total_certificates: number;
    };
  };
  knowledge_hub_content_summary: {
    Row: {
      id: string;
      title: string;
      content_type: string;
      domain: string;
      status: string;
      difficulty_level: string;
      department: string | null;
      estimated_duration: number | null;
      created_at: string;
      published_at: string | null;
      author_name: string | null;
      total_assigned_users: number;
      completed_users: number;
      completion_rate: number;
      avg_progress: number | null;
      avg_score: number | null;
    };
  };
}

// Knowledge Hub functions
export interface KnowledgeHubFunctions {
  get_user_overdue_content: {
    Args: {
      user_uuid: string;
    };
    Returns: {
      content_id: string;
      content_title: string;
      content_type: string;
      due_date: string;
      days_overdue: number;
      progress_percentage: number;
    }[];
  };
  calculate_user_learning_score: {
    Args: {
      user_uuid: string;
    };
    Returns: number;
  };
  get_recommended_content: {
    Args: {
      user_uuid: string;
      limit_count?: number;
    };
    Returns: {
      content_id: string;
      title: string;
      content_type: string;
      domain: string;
      difficulty_level: string;
      estimated_duration: number | null;
      recommendation_reason: string;
    }[];
  };
}
