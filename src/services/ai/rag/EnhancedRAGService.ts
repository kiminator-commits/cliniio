import { vectorRAGService, RAGContext, VectorSearchResult } from './VectorRAGService';
import { logger } from '../../logging/structuredLogger';
import { supabase } from '../../../lib/supabaseClient';

export interface EnhancedRAGRequest {
  query: string;
  userRole: string;
  feature: string;
  facilityId?: string;
  category?: string;
  maxResults?: number;
  additionalContext?: Record<string, unknown>;
}

export interface EnhancedRAGResponse {
  answer: string;
  sources: string[];
  confidence: number;
  contextUsed: RAGContext;
  questionType: string;
  sourceBreakdown: {
    vectorResults: number;
    knowledgeArticles: number;
    courses: number;
    policies: number;
    procedures: number;
  };
  processingTime: number;
  ragEnabled: boolean;
}

/**
 * Enhanced RAG Service with Vector Search
 * Combines semantic search with traditional keyword matching
 */
export class EnhancedRAGService {
  private static instance: EnhancedRAGService;

  private constructor() {}

  static getInstance(): EnhancedRAGService {
    if (!EnhancedRAGService.instance) {
      EnhancedRAGService.instance = new EnhancedRAGService();
    }
    return EnhancedRAGService.instance;
  }

  /**
   * Generate enhanced RAG response using vector search
   */
  async generateEnhancedResponse(request: EnhancedRAGRequest): Promise<EnhancedRAGResponse> {
    const startTime = Date.now();

    try {
      // Get current user for proper tracking
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || 'unknown-user';

      logger.info('Generating enhanced RAG response', {
        module: 'enhanced-rag',
        facilityId: request.facilityId || 'unknown'
      }, {
        query: request.query.substring(0, 100),
        feature: request.feature,
        category: request.category
      });

      // Perform vector semantic search
      const vectorContext = await vectorRAGService.semanticSearch(
        request.query,
        request.facilityId,
        request.category,
        request.maxResults || 10
      );

      // Build enhanced prompt with vector context
      const enhancedPrompt = this.buildEnhancedPrompt(request, vectorContext);

      // Generate AI response using UnifiedAIService
      const { UnifiedAIService } = await import('../UnifiedAIService');
      const answer = await UnifiedAIService.askAI(enhancedPrompt, {
        module: request.feature,
        facilityId: request.facilityId,
        userId: currentUserId
      });

      // Calculate confidence based on vector similarity
      const confidence = this.calculateConfidence(vectorContext);

      // Extract sources from vector results
      const sources = vectorContext.results.map(result => result.document.source);
      const uniqueSources = [...new Set(sources)];

      // Build source breakdown
      const sourceBreakdown = this.buildSourceBreakdown(vectorContext.results);

      const processingTime = Date.now() - startTime;

      logger.info('Enhanced RAG response generated', {
        module: 'enhanced-rag',
        facilityId: request.facilityId || 'unknown'
      }, {
        query: request.query.substring(0, 100),
        resultsFound: vectorContext.results.length,
        confidence,
        processingTimeMs: processingTime
      });

      return {
        answer,
        sources: uniqueSources,
        confidence,
        contextUsed: vectorContext,
        questionType: this.classifyQuestionType(request.query),
        sourceBreakdown,
        processingTime,
        ragEnabled: true
      };

    } catch (error) {
      logger.error('Enhanced RAG response generation failed', {
        module: 'enhanced-rag',
        facilityId: request.facilityId || 'unknown'
      }, {
        query: request.query.substring(0, 100),
        error: error instanceof Error ? error.message : String(error)
      });

      // Fallback to basic response
      return this.generateFallbackResponse(request, startTime);
    }
  }

  /**
   * Build enhanced prompt with vector context
   */
  private buildEnhancedPrompt(request: EnhancedRAGRequest, context: RAGContext): string {
    let prompt = `You are Cliniio's AI assistant, specializing in healthcare facility management, sterilization protocols, inventory management, and compliance workflows.

USER ROLE: ${request.userRole}
FEATURE: ${request.feature}
QUESTION: ${request.query}

RELEVANT FACILITY DOCUMENTATION (from semantic search):`;

    if (context.results.length > 0) {
      context.results.forEach((result, index) => {
        prompt += `\n\n--- Document ${index + 1}: ${result.document.title} ---`;
        prompt += `\nCategory: ${result.document.category}`;
        prompt += `\nSource: ${result.document.source}`;
        prompt += `\nRelevance Score: ${result.relevance_score.toFixed(3)}`;
        prompt += `\nContent: ${result.chunk.content}`;
      });
      
      prompt += `\n\n--- End of Documentation ---\n\n`;
    } else {
      prompt += `\nNo specific documentation found for this question.\n\n`;
    }

    // Add additional context if provided
    if (request.additionalContext) {
      prompt += `\nADDITIONAL CONTEXT:\n${JSON.stringify(request.additionalContext, null, 2)}\n\n`;
    }

    prompt += `INSTRUCTIONS:
1. Use the facility documentation above to provide accurate, specific guidance
2. If the documentation doesn't cover the question, provide general best practices
3. Always prioritize safety and compliance
4. Include specific steps and procedures when available
5. Mention relevant regulations (AAMI ST79, FDA guidelines) when applicable
6. Provide clear, actionable advice
7. Reference the specific documents that support your answer

FORMAT YOUR RESPONSE AS:
- Clear, structured guidance
- Specific steps when available
- Safety considerations
- Compliance requirements
- Additional resources if needed

Answer:`;

    return prompt;
  }

  /**
   * Calculate confidence score based on vector search results
   */
  private calculateConfidence(context: RAGContext): number {
    if (context.results.length === 0) {
      return 0.3; // Low confidence without context
    }

    // Calculate average relevance score
    const avgRelevance = context.results.reduce(
      (sum, result) => sum + result.relevance_score,
      0
    ) / context.results.length;

    // Convert to confidence score (0-1)
    const confidence = Math.min(avgRelevance, 1);
    
    return Math.round(confidence * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Build source breakdown from vector results
   */
  private buildSourceBreakdown(results: VectorSearchResult[]): {
    vectorResults: number;
    knowledgeArticles: number;
    courses: number;
    policies: number;
    procedures: number;
  } {
    const breakdown = {
      vectorResults: results.length,
      knowledgeArticles: 0,
      courses: 0,
      policies: 0,
      procedures: 0
    };

    results.forEach(result => {
      const category = result.document.category.toLowerCase();
      if (category.includes('knowledge')) {
        breakdown.knowledgeArticles++;
      } else if (category.includes('course')) {
        breakdown.courses++;
      } else if (category.includes('policy')) {
        breakdown.policies++;
      } else if (category.includes('procedure')) {
        breakdown.procedures++;
      }
    });

    return breakdown;
  }

  /**
   * Classify question type for better context
   */
  private classifyQuestionType(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('how') || lowerQuery.includes('step')) {
      return 'procedural';
    } else if (lowerQuery.includes('what') || lowerQuery.includes('define')) {
      return 'definitional';
    } else if (lowerQuery.includes('why') || lowerQuery.includes('reason')) {
      return 'explanatory';
    } else if (lowerQuery.includes('when') || lowerQuery.includes('time')) {
      return 'temporal';
    } else if (lowerQuery.includes('where') || lowerQuery.includes('location')) {
      return 'locational';
    } else {
      return 'general';
    }
  }

  /**
   * Generate fallback response when vector search fails
   */
  private generateFallbackResponse(request: EnhancedRAGRequest, startTime: number): EnhancedRAGResponse {
    const processingTime = Date.now() - startTime;

    return {
      answer: `I apologize, but I'm unable to access the facility documentation at the moment. For questions about ${request.feature}, please consult your facility's standard operating procedures or contact your supervisor for assistance.`,
      sources: [],
      confidence: 0.1,
      contextUsed: {
        query: request.query,
        results: [],
        total_results: 0,
        search_time_ms: 0
      },
      questionType: 'general',
      sourceBreakdown: {
        vectorResults: 0,
        knowledgeArticles: 0,
        courses: 0,
        policies: 0,
        procedures: 0
      },
      processingTime,
      ragEnabled: false
    };
  }

  /**
   * Process and index a document for vector search
   */
  async indexDocument(document: {
    id: string;
    title: string;
    content: string;
    category: string;
    source: string;
    facility_id?: string;
  }): Promise<void> {
    try {
      logger.info('Indexing document for vector search', {
        module: 'enhanced-rag',
        facilityId: document.facility_id || 'unknown'
      }, {
        documentId: document.id,
        title: document.title,
        category: document.category
      });

      await vectorRAGService.processDocument({
        ...document,
        created_at: (document as any).created_at || new Date().toISOString(),
        updated_at: (document as any).updated_at || new Date().toISOString()
      });

      logger.info('Document indexed successfully', {
        module: 'enhanced-rag',
        facilityId: document.facility_id || 'unknown'
      }, {
        documentId: document.id
      });

    } catch (error) {
      logger.error('Document indexing failed', {
        module: 'enhanced-rag',
        facilityId: document.facility_id || 'unknown'
      }, {
        documentId: document.id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get RAG system statistics
   */
  async getRAGStats(facilityId?: string): Promise<{
    totalDocuments: number;
    totalChunks: number;
    averageChunksPerDocument: number;
    categories: Record<string, number>;
  }> {
    return await vectorRAGService.getDocumentStats(facilityId);
  }
}

// Export singleton instance
export const enhancedRAGService = EnhancedRAGService.getInstance();
