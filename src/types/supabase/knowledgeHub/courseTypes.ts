// Knowledge Hub Course Types
import { Json } from '../common';

// Knowledge Hub course types - using any for now since tables are not defined in generated types
export type KnowledgeHubCourse = any;
export type KnowledgeHubCourseInsert = any;
export type KnowledgeHubCourseUpdate = any;

// Knowledge Hub course table definition
export interface KnowledgeHubCourseTable {
  knowledge_hub_courses: {
    Row: {
      id: string;
      title: string;
      description: string | null;
      domain: string;
      content_type: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      content: Json;
      media: Json;
      tags: string[];
      status: 'draft' | 'published' | 'archived';
      is_repeat: boolean;
      is_active: boolean;
      estimated_duration: number | null;
      difficulty_level: 'beginner' | 'intermediate' | 'advanced';
      department: string | null;
      author_id: string | null;
      assigned_by: string | null;
      created_at: string;
      updated_at: string;
      published_at: string | null;
      archived_at: string | null;
    };
    Insert: {
      id?: string;
      title: string;
      description?: string | null;
      domain: string;
      content_type?: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      content?: Json;
      media?: Json;
      tags?: string[];
      status?: 'draft' | 'published' | 'archived';
      is_repeat?: boolean;
      is_active?: boolean;
      estimated_duration?: number | null;
      difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
      department?: string | null;
      author_id?: string | null;
      assigned_by?: string | null;
      created_at?: string;
      updated_at?: string;
      published_at?: string | null;
      archived_at?: string | null;
    };
    Update: {
      id?: string;
      title?: string;
      description?: string | null;
      domain?: string;
      content_type?: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      content?: Json;
      media?: Json;
      tags?: string[];
      status?: 'draft' | 'published' | 'archived';
      is_repeat?: boolean;
      is_active?: boolean;
      estimated_duration?: number | null;
      difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
      department?: string | null;
      author_id?: string | null;
      assigned_by?: string | null;
      created_at?: string;
      updated_at?: string;
      published_at?: string | null;
      archived_at?: string | null;
    };
  };
}
