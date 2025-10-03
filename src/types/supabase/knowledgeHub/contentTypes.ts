// Knowledge Hub Content Types
import { Json } from '../common';

// Knowledge Hub content types - using any for now since tables are not defined in generated types
export type KnowledgeHubContent = any;
export type KnowledgeHubContentInsert = any;
export type KnowledgeHubContentUpdate = any;

// Knowledge Hub content table definition
export interface KnowledgeHubContentTable {
  knowledge_hub_content: {
    Row: {
      id: string;
      title: string;
      content_type: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      content: Json;
      domain: string;
      tags: string[];
      status: 'draft' | 'published' | 'archived';
      author_id: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      title: string;
      content_type: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      content: Json;
      domain: string;
      tags?: string[];
      status?: 'draft' | 'published' | 'archived';
      author_id: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      title?: string;
      content_type?: 'course' | 'procedure' | 'policy' | 'learning_pathway';
      content?: Json;
      domain?: string;
      tags?: string[];
      status?: 'draft' | 'published' | 'archived';
      author_id?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
}
