import { supabase } from '../../../lib/supabaseClient';
import { SmartRAGRouter, QuestionClassification } from './SmartRAGRouter';

export interface SupabaseDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  category?: string;
  tags?: string[];
  relevanceScore: number;
}

export interface SupabaseRAGContext {
  question: string;
  userRole: string;
  classification: QuestionClassification;
  documents: SupabaseDocument[];
  sourceBreakdown: {
    helpArticles: number;
    knowledgeArticles: number;
    courses: number;
    policies: number;
    procedures: number;
  };
}

/**
 * Supabase-integrated RAG service that pulls from actual database content
 */
export class SupabaseRAGService {
  private static instance: SupabaseRAGService;
  private smartRouter: SmartRAGRouter;

  private constructor() {
    this.smartRouter = SmartRAGRouter.getInstance();
  }

  static getInstance(): SupabaseRAGService {
    if (!SupabaseRAGService.instance) {
      SupabaseRAGService.instance = new SupabaseRAGService();
    }
    return SupabaseRAGService.instance;
  }

  /**
   * Search Supabase content based on question classification
   */
  async searchContent(question: string, userRole: string, facilityId: string): Promise<SupabaseRAGContext> {
    const classification = this.smartRouter.classifyQuestion(question, userRole);
    const documents: SupabaseDocument[] = [];
    
    // Search each source based on classification
    for (const source of classification.sources) {
      const sourceDocs = await this.searchSource(source, question, facilityId);
      documents.push(...sourceDocs);
    }

    // Calculate source breakdown
    const sourceBreakdown = this.calculateSourceBreakdown(documents);

    return {
      question,
      userRole,
      classification,
      documents: documents.sort((a, b) => b.relevanceScore - a.relevanceScore),
      sourceBreakdown
    };
  }

  /**
   * Search a specific source (help articles, policies, etc.)
   */
  private async searchSource(source: string, question: string, facilityId: string): Promise<SupabaseDocument[]> {
    const documents: SupabaseDocument[] = [];
    const questionLower = question.toLowerCase();

    try {
      switch (source) {
        case 'helpArticles':
          documents.push(...await this.searchHelpArticles(questionLower, facilityId));
          break;
          
        case 'knowledgeArticles':
          documents.push(...await this.searchKnowledgeArticles(questionLower, facilityId));
          break;
          
        case 'courses':
          documents.push(...await this.searchCourses(questionLower, facilityId));
          break;
          
        case 'policies':
          documents.push(...await this.searchPolicies(questionLower, facilityId));
          break;
          
        case 'procedures':
          documents.push(...await this.searchProcedures(questionLower, facilityId));
          break;
      }
    } catch (error) {
      console.error(`Error searching ${source}:`, error);
    }

    return documents;
  }

  /**
   * Search help articles
   */
  private async searchHelpArticles(question: string, facilityId: string): Promise<SupabaseDocument[]> {
    const { data, error } = await supabase
      .from('help_articles')
      .select('id, title, content, category, subcategory')
      .eq('is_published', true)
      .or(`title.ilike.%${question}%,content.ilike.%${question}%,category.ilike.%${question}%`)
      .limit(5);

    if (error) {
      console.error('Error searching help articles:', error);
      return [];
    }

    return (data || []).map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      source: 'help_articles',
      category: article.category,
      relevanceScore: this.calculateRelevanceScore(question, article.title, article.content)
    }));
  }

  /**
   * Search knowledge articles
   */
  private async searchKnowledgeArticles(question: string, facilityId: string): Promise<SupabaseDocument[]> {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('id, title, content, summary, tags')
      .eq('status', 'published')
      .eq('facility_id', facilityId)
      .or(`title.ilike.%${question}%,content.ilike.%${question}%,summary.ilike.%${question}%`)
      .limit(5);

    if (error) {
      console.error('Error searching knowledge articles:', error);
      return [];
    }

    return (data || []).map(article => ({
      id: article.id,
      title: article.title,
      content: article.content || article.summary || '',
      source: 'knowledge_articles',
      tags: article.tags,
      relevanceScore: this.calculateRelevanceScore(question, article.title, article.content || article.summary || '')
    }));
  }

  /**
   * Search courses
   */
  private async searchCourses(question: string, facilityId: string): Promise<SupabaseDocument[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, content, tags')
      .eq('is_active', true)
      .eq('facility_id', facilityId)
      .or(`title.ilike.%${question}%,description.ilike.%${question}%`)
      .limit(5);

    if (error) {
      console.error('Error searching courses:', error);
      return [];
    }

    return (data || []).map(course => {
      // Extract text content from jsonb content field
      const contentText = this.extractTextFromJsonb(course.content) || course.description || '';
      
      return {
        id: course.id,
        title: course.title,
        content: contentText,
        source: 'courses',
        tags: course.tags,
        relevanceScore: this.calculateRelevanceScore(question, course.title, contentText)
      };
    });
  }

  /**
   * Search policies
   */
  private async searchPolicies(question: string, facilityId: string): Promise<SupabaseDocument[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('id, title, description, content, tags, domain')
      .eq('is_active', true)
      .or(`title.ilike.%${question}%,description.ilike.%${question}%`)
      .limit(5);

    if (error) {
      console.error('Error searching policies:', error);
      return [];
    }

    return (data || []).map(policy => {
      const contentText = this.extractTextFromJsonb(policy.content) || policy.description || '';
      
      return {
        id: policy.id,
        title: policy.title,
        content: contentText,
        source: 'policies',
        category: policy.domain,
        tags: policy.tags,
        relevanceScore: this.calculateRelevanceScore(question, policy.title, contentText)
      };
    });
  }

  /**
   * Search procedures
   */
  private async searchProcedures(question: string, facilityId: string): Promise<SupabaseDocument[]> {
    const { data, error } = await supabase
      .from('procedures')
      .select('id, title, description, content, tags, department')
      .eq('is_active', true)
      .or(`title.ilike.%${question}%,description.ilike.%${question}%`)
      .limit(5);

    if (error) {
      console.error('Error searching procedures:', error);
      return [];
    }

    return (data || []).map(procedure => {
      const contentText = this.extractTextFromJsonb(procedure.content) || procedure.description || '';
      
      return {
        id: procedure.id,
        title: procedure.title,
        content: contentText,
        source: 'procedures',
        category: procedure.department,
        tags: procedure.tags,
        relevanceScore: this.calculateRelevanceScore(question, procedure.title, contentText)
      };
    });
  }

  /**
   * Extract text content from jsonb field
   */
  private extractTextFromJsonb(jsonbContent: any): string {
    if (!jsonbContent) return '';
    
    if (typeof jsonbContent === 'string') return jsonbContent;
    
    if (typeof jsonbContent === 'object') {
      // Try to extract text from common jsonb structures
      if (jsonbContent.text) return jsonbContent.text;
      if (jsonbContent.content) return jsonbContent.content;
      if (jsonbContent.body) return jsonbContent.body;
      if (jsonbContent.description) return jsonbContent.description;
      
      // If it's an array of blocks, extract text from each
      if (Array.isArray(jsonbContent)) {
        return jsonbContent
          .map(block => {
            if (typeof block === 'string') return block;
            if (block.text) return block.text;
            if (block.content) return block.content;
            return '';
          })
          .join(' ');
      }
      
      // Try to stringify and extract meaningful text
      return JSON.stringify(jsonbContent).replace(/[{}"\[\]]/g, ' ').trim();
    }
    
    return '';
  }

  /**
   * Calculate relevance score for a document
   */
  private calculateRelevanceScore(question: string, title: string, content: string): number {
    let score = 0;
    const questionWords = question.toLowerCase().split(' ');
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    // Title matches are worth more
    questionWords.forEach(word => {
      if (titleLower.includes(word)) score += 10;
      if (contentLower.includes(word)) score += 2;
    });

    // Boost score for exact phrase matches
    if (titleLower.includes(question)) score += 20;
    if (contentLower.includes(question)) score += 5;

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Calculate source breakdown
   */
  private calculateSourceBreakdown(documents: SupabaseDocument[]): SupabaseRAGContext['sourceBreakdown'] {
    return {
      helpArticles: documents.filter(d => d.source === 'help_articles').length,
      knowledgeArticles: documents.filter(d => d.source === 'knowledge_articles').length,
      courses: documents.filter(d => d.source === 'courses').length,
      policies: documents.filter(d => d.source === 'policies').length,
      procedures: documents.filter(d => d.source === 'procedures').length,
    };
  }
}

// Export singleton instance
export const supabaseRAGService = SupabaseRAGService.getInstance();
