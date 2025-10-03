// Knowledge Hub Achievement Types
import { Json } from '../common';

// Knowledge Hub achievement types - using any for now since tables are not defined in generated types
export type KnowledgeHubAchievement = any;
export type KnowledgeHubAchievementInsert = any;
export type KnowledgeHubAchievementUpdate = any;
export type KnowledgeHubUserAchievement = any;
export type KnowledgeHubUserAchievementInsert = any;
export type KnowledgeHubUserAchievementUpdate = any;

// Knowledge Hub achievements table definition
export interface KnowledgeHubAchievementsTable {
  knowledge_hub_achievements: {
    Row: {
      id: string;
      title: string;
      description: string | null;
      icon_name: string | null;
      icon_color: string;
      achievement_type:
        | 'completion'
        | 'streak'
        | 'score'
        | 'participation'
        | 'milestone';
      criteria: Json;
      required_count: number;
      difficulty_level: 'bronze' | 'silver' | 'gold' | 'platinum';
      points_awarded: number;
      is_active: boolean;
      is_hidden: boolean;
      department_specific: string | null;
      role_specific: string | null;
      category: string | null;
      tags: string[];
      created_at: string;
      updated_at: string;
      expires_at: string | null;
    };
    Insert: {
      id?: string;
      title: string;
      description?: string | null;
      icon_name?: string | null;
      icon_color?: string;
      achievement_type:
        | 'completion'
        | 'streak'
        | 'score'
        | 'participation'
        | 'milestone';
      criteria?: Json;
      required_count?: number;
      difficulty_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
      points_awarded?: number;
      is_active?: boolean;
      is_hidden?: boolean;
      department_specific?: string | null;
      role_specific?: string | null;
      category?: string | null;
      tags?: string[];
      created_at?: string;
      updated_at?: string;
      expires_at?: string | null;
    };
    Update: {
      id?: string;
      title?: string;
      description?: string | null;
      icon_name?: string | null;
      icon_color?: string;
      achievement_type?:
        | 'completion'
        | 'streak'
        | 'score'
        | 'participation'
        | 'milestone';
      criteria?: Json;
      required_count?: number;
      difficulty_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
      points_awarded?: number;
      is_active?: boolean;
      is_hidden?: boolean;
      department_specific?: string | null;
      role_specific?: string | null;
      category?: string | null;
      tags?: string[];
      created_at?: string;
      updated_at?: string;
      expires_at?: string | null;
    };
  };
}

// Knowledge Hub user achievements table definition
export interface KnowledgeHubUserAchievementsTable {
  knowledge_hub_user_achievements: {
    Row: {
      id: string;
      user_id: string;
      achievement_id: string;
      progress_count: number;
      is_earned: boolean;
      earned_at: string | null;
      earned_title: string | null;
      earned_description: string | null;
      earned_icon_name: string | null;
      earned_icon_color: string | null;
      earned_difficulty_level: string | null;
      earned_points: number;
      notes: string | null;
      evidence_data: Json;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      achievement_id: string;
      progress_count?: number;
      is_earned?: boolean;
      earned_at?: string | null;
      earned_title?: string | null;
      earned_description?: string | null;
      earned_icon_name?: string | null;
      earned_icon_color?: string | null;
      earned_difficulty_level?: string | null;
      earned_points?: number;
      notes?: string | null;
      evidence_data?: Json;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      achievement_id?: string;
      progress_count?: number;
      is_earned?: boolean;
      earned_at?: string | null;
      earned_title?: string | null;
      earned_description?: string | null;
      earned_icon_name?: string | null;
      earned_icon_color?: string | null;
      earned_difficulty_level?: string | null;
      earned_points?: number;
      notes?: string | null;
      evidence_data?: Json;
      created_at?: string;
      updated_at?: string;
    };
  };
}
