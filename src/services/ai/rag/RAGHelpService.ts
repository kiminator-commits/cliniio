import { KnowledgeBaseService, RAGContext } from './KnowledgeBaseService';
import { SmartRAGRouter, SmartRAGContext } from './SmartRAGRouter';
import { SupabaseRAGService, SupabaseRAGContext } from './SupabaseRAGService';
import { aiServiceIntegration } from '../AIServiceIntegration';
import { UnifiedAIService } from '../UnifiedAIService';
import { enhancedRAGService, EnhancedRAGRequest } from './EnhancedRAGService';
import { logger } from '../../logging/structuredLogger';

export interface RAGHelpResponse {
  answer: string;
  sources: string[];
  confidence: number;
  contextUsed: SupabaseRAGContext;
  questionType: string;
  sourceBreakdown: {
    helpArticles: number;
    knowledgeArticles: number;
    courses: number;
    policies: number;
    procedures: number;
  };
}

/**
 * RAG-Enhanced Help Service
 * Provides intelligent help responses using retrieval-augmented generation
 */
export class RAGHelpService {
  private static instance: RAGHelpService;
  private knowledgeBase: KnowledgeBaseService;
  private smartRouter: SmartRAGRouter;
  private supabaseRAG: SupabaseRAGService;

  private constructor() {
    this.knowledgeBase = KnowledgeBaseService.getInstance();
    this.smartRouter = SmartRAGRouter.getInstance();
    this.supabaseRAG = SupabaseRAGService.getInstance();
  }

  static getInstance(): RAGHelpService {
    if (!RAGHelpService.instance) {
      RAGHelpService.instance = new RAGHelpService();
    }
    return RAGHelpService.instance;
  }

  /**
   * Generate RAG-enhanced help response using vector search
   */
  async generateHelpResponse(
    question: string,
    userRole: string,
    context: string,
    facilityId?: string
  ): Promise<RAGHelpResponse> {
    try {
      logger.info('Generating RAG help response', {
        module: 'rag-help',
        facilityId: facilityId || 'unknown'
      }, {
        question: question.substring(0, 100),
        userRole
      });

      // Use enhanced RAG service with vector search
      const enhancedRequest: EnhancedRAGRequest = {
        query: question,
        userRole,
        feature: 'help-system',
        facilityId,
        category: 'help',
        additionalContext: { userContext: context }
      };

      const enhancedResponse = await enhancedRAGService.generateEnhancedResponse(enhancedRequest);
      
      // Track usage
      const inputTokens = Math.ceil(question.length / 4);
      const outputTokens = Math.ceil(enhancedResponse.answer.length / 4);
      aiServiceIntegration.trackHelpUsage(inputTokens, outputTokens, true);
      
      logger.info('RAG help response generated', {
        module: 'rag-help',
        facilityId: facilityId || 'unknown'
      }, {
        question: question.substring(0, 100),
        confidence: enhancedResponse.confidence,
        sourcesFound: enhancedResponse.sources.length
      });
      
      return {
        answer: enhancedResponse.answer,
        sources: enhancedResponse.sources,
        confidence: enhancedResponse.confidence,
        contextUsed: enhancedResponse.contextUsed as unknown as SupabaseRAGContext,
        questionType: enhancedResponse.questionType,
        sourceBreakdown: {
          ...enhancedResponse.sourceBreakdown,
          helpArticles: enhancedResponse.sourceBreakdown.knowledgeArticles || 0
        }
      };
    } catch (error) {
      logger.error('RAG Help Service error', {
        module: 'rag-help',
        facilityId: facilityId || 'unknown'
      }, {
        question: question.substring(0, 100),
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Track failed request
      aiServiceIntegration.trackHelpUsage(0, 0, false);
      
      throw error;
    }
  }

  /**
   * Build enhanced prompt with RAG context
   */
  private buildEnhancedPrompt(ragContext: RAGContext): string {
    const { question, userRole, context, relevantDocuments } = ragContext;
    
    let prompt = `You are a helpful assistant for a healthcare sterilization facility. Provide guidance for a ${userRole}.

QUESTION: ${question}
USER CONTEXT: ${context}

RELEVANT FACILITY DOCUMENTATION:
`;

    if (relevantDocuments.length > 0) {
      relevantDocuments.forEach((result, index) => {
        prompt += `\n--- Document ${index + 1}: ${result.document.title} ---\n`;
        prompt += `${result.document.content}\n`;
      });
      
      prompt += `\n--- End of Documentation ---\n\n`;
    } else {
      prompt += `No specific documentation found for this question.\n\n`;
    }

    prompt += `INSTRUCTIONS:
1. Use the facility documentation above to provide accurate, specific guidance
2. If the documentation doesn't cover the question, provide general best practices
3. Always prioritize safety and compliance
4. Include specific steps and procedures when available
5. Mention relevant regulations (AAMI ST79, FDA guidelines) when applicable
6. Provide clear, actionable advice

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
   * Calculate confidence score based on context relevance
   */
  private calculateConfidence(ragContext: RAGContext): number {
    const { relevantDocuments } = ragContext;
    
    if (relevantDocuments.length === 0) {
      return 0.3; // Low confidence without context
    }
    
    // Calculate average relevance score
    const avgRelevance = relevantDocuments.reduce(
      (sum, doc) => sum + doc.relevanceScore, 
      0
    ) / relevantDocuments.length;
    
    // Convert to confidence score (0-1)
    const confidence = Math.min(avgRelevance / 20, 1); // Max score of 20 = 100% confidence
    
    return Math.round(confidence * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get knowledge base statistics
   */
  getKnowledgeBaseStats() {
    const documents = this.knowledgeBase.getAllDocuments();
    const categories = documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDocuments: documents.length,
      categories,
      lastUpdated: new Date()
    };
  }
}

// Export singleton instance
export const ragHelpService = RAGHelpService.getInstance();
