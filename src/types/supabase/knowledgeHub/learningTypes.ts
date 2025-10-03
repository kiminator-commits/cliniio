// Knowledge Hub Learning Path and Certificate Types
import { Json } from '../common';

// Knowledge Hub learning path and certificate types - using any for now since tables are not defined in generated types
export type KnowledgeHubLearningPath = any;
export type KnowledgeHubLearningPathInsert = any;
export type KnowledgeHubLearningPathUpdate = any;
export type KnowledgeHubCertificate = any;
export type KnowledgeHubCertificateInsert = any;
export type KnowledgeHubCertificateUpdate = any;

// Knowledge Hub learning paths table definition
export interface KnowledgeHubLearningPathsTable {
  knowledge_hub_learning_paths: {
    Row: {
      id: string;
      title: string;
      description: string | null;
      domain: string;
      path_items: Json;
      total_items: number;
      estimated_total_duration: number | null;
      is_sequential: boolean;
      allow_parallel: boolean;
      completion_threshold: number;
      status: 'draft' | 'published' | 'archived';
      is_active: boolean;
      difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      department: string | null;
      tags: string[];
      prerequisites: Json;
      author_id: string | null;
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
      path_items?: Json;
      total_items?: number;
      estimated_total_duration?: number | null;
      is_sequential?: boolean;
      allow_parallel?: boolean;
      completion_threshold?: number;
      status?: 'draft' | 'published' | 'archived';
      is_active?: boolean;
      difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      department?: string | null;
      tags?: string[];
      prerequisites?: Json;
      author_id?: string | null;
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
      path_items?: Json;
      total_items?: number;
      estimated_total_duration?: number | null;
      is_sequential?: boolean;
      allow_parallel?: boolean;
      completion_threshold?: number;
      status?: 'draft' | 'published' | 'archived';
      is_active?: boolean;
      difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      department?: string | null;
      tags?: string[];
      prerequisites?: Json;
      author_id?: string | null;
      created_at?: string;
      updated_at?: string;
      published_at?: string | null;
      archived_at?: string | null;
    };
  };
}

// Knowledge Hub certificates table definition
export interface KnowledgeHubCertificatesTable {
  knowledge_hub_certificates: {
    Row: {
      id: string;
      certificate_number: string;
      title: string;
      description: string | null;
      user_id: string;
      content_id: string | null;
      learning_path_id: string | null;
      content_type: 'course' | 'learning_pathway';
      completion_score: number | null;
      completion_date: string;
      expiry_date: string | null;
      is_expired: boolean;
      certificate_url: string | null;
      certificate_data: Json;
      issued_by: string | null;
      status: 'active' | 'expired' | 'revoked';
      revoked_at: string | null;
      revoked_by: string | null;
      revocation_reason: string | null;
      department: string | null;
      role: string | null;
      notes: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      certificate_number: string;
      title: string;
      description?: string | null;
      user_id: string;
      content_id?: string | null;
      learning_path_id?: string | null;
      content_type: 'course' | 'learning_pathway';
      completion_score?: number | null;
      completion_date?: string;
      expiry_date?: string | null;
      is_expired?: boolean;
      certificate_url?: string | null;
      certificate_data?: Json;
      issued_by?: string | null;
      status?: 'active' | 'expired' | 'revoked';
      revoked_at?: string | null;
      revoked_by?: string | null;
      revocation_reason?: string | null;
      department?: string | null;
      role?: string | null;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      certificate_number?: string;
      title?: string;
      description?: string | null;
      user_id?: string;
      content_id?: string | null;
      learning_path_id?: string | null;
      content_type?: 'course' | 'learning_pathway';
      completion_score?: number | null;
      completion_date?: string;
      expiry_date?: string | null;
      is_expired?: boolean;
      certificate_url?: string | null;
      certificate_data?: Json;
      issued_by?: string | null;
      status?: 'active' | 'expired' | 'revoked';
      revoked_at?: string | null;
      revoked_by?: string | null;
      revocation_reason?: string | null;
      department?: string | null;
      role?: string | null;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  };
}
