// Knowledge Hub Content Types
import { Json } from '../common';

// Knowledge Hub content types - using proper types based on table definitions
export type KnowledgeHubContent = KnowledgeHubContentTable['knowledge_hub_content']['Row'];
export type KnowledgeHubContentInsert = KnowledgeHubContentTable['knowledge_hub_content']['Insert'];
export type KnowledgeHubContentUpdate = KnowledgeHubContentTable['knowledge_hub_content']['Update'];

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
