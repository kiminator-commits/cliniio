import { ContentCategory } from '../../../../pages/KnowledgeHub/types';

export interface CategoryMapping {
  libraryCategory: string;
  knowledgeHubCategory: ContentCategory;
  confidence: number; // 0-1 confidence score
  reasoning: string;
}

export interface AutoCategorizationResult {
  category: ContentCategory;
  confidence: number;
  reasoning: string[];
  suggestedTags: string[];
}

export interface CategorySyncResult {
  success: boolean;
  mappedCategory: ContentCategory;
  originalCategory: string;
  confidence: number;
  reasoning: string[];
  needsReview: boolean;
}

export interface CategoryMetadata {
  name: string;
  description: string;
  icon: string;
  color: string;
  examples: string[];
}

export interface CategoryStatistics {
  [key: string]: number;
}
