// Knowledge Hub Progress and Assignment Types
import { Json } from '../common';

// Knowledge Hub progress and assignment types - using any for now since tables are not defined in generated types
export type KnowledgeHubUserProgress = any;
export type KnowledgeHubUserProgressInsert = any;
export type KnowledgeHubUserProgressUpdate = any;
export type KnowledgeHubAssignment = any;
export type KnowledgeHubAssignmentInsert = any;
export type KnowledgeHubAssignmentUpdate = any;

// Knowledge Hub user progress table definition
export interface KnowledgeHubUserProgressTable {
  knowledge_hub_user_progress: {
    Row: {
      id: string;
      user_id: string;
      content_id: string;
      content_type: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
      progress_percentage: number;
      score: number | null;
      assigned_at: string;
      started_at: string | null;
      completed_at: string | null;
      due_date: string | null;
      last_accessed_at: string;
      is_repeat: boolean;
      repeat_count: number;
      last_completed_at: string | null;
      time_spent_minutes: number;
      attempts_count: number;
      notes: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      content_id: string;
      content_type: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      status?: 'not_started' | 'in_progress' | 'completed' | 'overdue';
      progress_percentage?: number;
      score?: number | null;
      assigned_at?: string;
      started_at?: string | null;
      completed_at?: string | null;
      due_date?: string | null;
      last_accessed_at?: string;
      is_repeat?: boolean;
      repeat_count?: number;
      last_completed_at?: string | null;
      time_spent_minutes?: number;
      attempts_count?: number;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      content_id?: string;
      content_type?: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      status?: 'not_started' | 'in_progress' | 'completed' | 'overdue';
      progress_percentage?: number;
      score?: number | null;
      assigned_at?: string;
      started_at?: string | null;
      completed_at?: string | null;
      due_date?: string | null;
      last_accessed_at?: string;
      is_repeat?: boolean;
      repeat_count?: number;
      last_completed_at?: string | null;
      time_spent_minutes?: number;
      attempts_count?: number;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  };
}

// Knowledge Hub assignments table definition
export interface KnowledgeHubAssignmentsTable {
  knowledge_hub_assignments: {
    Row: {
      id: string;
      content_id: string;
      assigned_user_id: string;
      assigned_by_id: string | null;
      assignment_type: 'required' | 'recommended' | 'optional';
      due_date: string | null;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      status: 'active' | 'completed' | 'overdue' | 'cancelled';
      completion_required: boolean;
      send_reminders: boolean;
      reminder_frequency_days: number;
      last_reminder_sent: string | null;
      notes: string | null;
      department: string | null;
      role_requirement: string | null;
      assigned_at: string;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
    };
    Insert: {
      id?: string;
      content_id: string;
      assigned_user_id: string;
      assigned_by_id?: string | null;
      assignment_type?: 'required' | 'recommended' | 'optional';
      due_date?: string | null;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      status?: 'active' | 'completed' | 'overdue' | 'cancelled';
      completion_required?: boolean;
      send_reminders?: boolean;
      reminder_frequency_days?: number;
      last_reminder_sent?: string | null;
      notes?: string | null;
      department?: string | null;
      role_requirement?: string | null;
      assigned_at?: string;
      created_at?: string;
      updated_at?: string;
      completed_at?: string | null;
    };
    Update: {
      id?: string;
      content_id?: string;
      assigned_user_id?: string;
      assigned_by_id?: string | null;
      assignment_type?: 'required' | 'recommended' | 'optional';
      due_date?: string | null;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      status?: 'active' | 'completed' | 'overdue' | 'cancelled';
      completion_required?: boolean;
      send_reminders?: boolean;
      reminder_frequency_days?: number;
      last_reminder_sent?: string | null;
      notes?: string | null;
      department?: string | null;
      role_requirement?: string | null;
      assigned_at?: string;
      created_at?: string;
      updated_at?: string;
      completed_at?: string | null;
    };
  };
}
