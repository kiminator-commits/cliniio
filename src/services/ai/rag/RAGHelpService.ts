import { KnowledgeBaseService, RAGContext } from './KnowledgeBaseService';
import { SmartRAGRouter, SmartRAGContext } from './SmartRAGRouter';
import { SupabaseRAGService, SupabaseRAGContext } from './SupabaseRAGService';
import { aiServiceIntegration } from '../AIServiceIntegration';

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
   * Generate RAG-enhanced help response
   */
  async generateHelpResponse(
    question: string,
    userRole: string,
    context: string
  ): Promise<RAGHelpResponse> {
    try {
      // Get relevant context from knowledge base
      const ragContext = this.knowledgeBase.getRAGContext(question, userRole, context);
      
      // Build enhanced prompt with retrieved context
      const enhancedPrompt = this.buildEnhancedPrompt(ragContext);
      
      // Call OpenAI with enhanced context
      const response = await this.callOpenAI(enhancedPrompt);
      
      // Track usage
      const inputTokens = Math.ceil(enhancedPrompt.length / 4);
      const outputTokens = Math.ceil(response.length / 4);
      aiServiceIntegration.trackHelpUsage(inputTokens, outputTokens, true);
      
      return {
        answer: response,
        sources: ragContext.relevantDocuments.map(doc => doc.document.source),
        confidence: this.calculateConfidence(ragContext),
        contextUsed: ragContext as unknown as SupabaseRAGContext,
        questionType: 'help',
        sourceBreakdown: {
          helpArticles: ragContext.relevantDocuments.filter(doc => doc.document.source === 'help').length,
          knowledgeArticles: ragContext.relevantDocuments.filter(doc => doc.document.source === 'knowledge').length,
          courses: ragContext.relevantDocuments.filter(doc => doc.document.source === 'courses').length,
          policies: ragContext.relevantDocuments.filter(doc => doc.document.source === 'policies').length,
          procedures: ragContext.relevantDocuments.filter(doc => doc.document.source === 'procedures').length,
        }
      };
    } catch (error) {
      console.error('RAG Help Service error:', error);
      
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
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    const { OpenAI } = await import('openai');
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
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
