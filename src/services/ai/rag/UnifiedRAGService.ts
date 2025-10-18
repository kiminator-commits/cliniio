import { SupabaseRAGService } from './SupabaseRAGService';
import { SmartRAGRouter } from './SmartRAGRouter';
import { KnowledgeBaseService } from './KnowledgeBaseService';

export interface UnifiedRAGRequest {
  query: string;
  userRole: string;
  context?: string;
  feature: 'help' | 'analytics' | 'task-assignments' | 'forecasts' | 'course-generation';
  additionalContext?: Record<string, any>;
}

export interface UnifiedRAGResponse {
  answer: string;
  sources: string[];
  confidence: number;
  ragEnabled: boolean;
  questionType: string;
  sourceBreakdown: {
    helpArticles?: number;
    knowledgeArticles?: number;
    policies?: number;
    procedures?: number;
    courses?: number;
    analytics?: number;
    workflows?: number;
  };
  metadata?: {
    feature: string;
    processingTime: number;
    tokensUsed?: number;
  };
}

/**
 * Unified RAG Service for all AI features
 * Provides intelligent content retrieval and response generation
 */
export class UnifiedRAGService {
  private static instance: UnifiedRAGService;
  private supabaseRAG: SupabaseRAGService;
  private smartRouter: SmartRAGRouter;
  private knowledgeBase: KnowledgeBaseService;

  private constructor() {
    this.supabaseRAG = SupabaseRAGService.getInstance();
    this.smartRouter = SmartRAGRouter.getInstance();
    this.knowledgeBase = KnowledgeBaseService.getInstance();
  }

  public static getInstance(): UnifiedRAGService {
    if (!UnifiedRAGService.instance) {
      UnifiedRAGService.instance = new UnifiedRAGService();
    }
    return UnifiedRAGService.instance;
  }

  /**
   * Generate RAG-enhanced response for any AI feature
   */
  public async generateResponse(request: UnifiedRAGRequest): Promise<UnifiedRAGResponse> {
    const startTime = Date.now();
    
    try {
      // Classify the question and determine routing strategy
      const questionType = this.smartRouter.classifyQuestion(request.query, request.userRole);
      
      // Get context based on feature and question type
      const context = await this.getContextForFeature(request);
      
      // Build enhanced prompt with context
      const enhancedPrompt = this.buildEnhancedPrompt(request, context, questionType.type);
      
      // Generate response (simulated for now - would call OpenAI in production)
      const response = await this.generateAIResponse(enhancedPrompt, request.feature);
      
      const processingTime = Date.now() - startTime;
      
      return {
        answer: response,
        sources: context.documents.map(doc => doc.source),
        confidence: context.confidence,
        ragEnabled: true,
        questionType: questionType.type,
        sourceBreakdown: context.sourceBreakdown,
        metadata: {
          feature: request.feature,
          processingTime,
          tokensUsed: this.estimateTokens(enhancedPrompt + response)
        }
      };
      
    } catch (error) {
      console.error('Unified RAG Service error:', error);
      
      // Fallback response
      return {
        answer: this.generateFallbackResponse(request),
        sources: ['fallback'],
        confidence: 0.5,
        ragEnabled: false,
        questionType: 'General',
        sourceBreakdown: {},
        metadata: {
          feature: request.feature,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Get context based on feature type and question classification
   */
  private async getContextForFeature(request: UnifiedRAGRequest): Promise<any> {
    const questionType = this.smartRouter.classifyQuestion(request.query, request.userRole);
    
    switch (request.feature) {
      case 'help':
        return this.getHelpContext(request.query, questionType.type, request.userRole);
        
      case 'analytics':
        return this.getAnalyticsContext(request.query, questionType.type, request.additionalContext);
        
      case 'task-assignments':
        return this.getTaskAssignmentContext(request.query, questionType.type, request.userRole);
        
      case 'forecasts':
        return this.getForecastContext(request.query, questionType.type, request.additionalContext);
        
      case 'course-generation':
        return this.getCourseGenerationContext(request.query, questionType.type, request.userRole);
        
      default:
        return this.getGeneralContext(request.query, questionType.type);
    }
  }

  /**
   * Help-specific context retrieval
   */
  private async getHelpContext(query: string, questionType: string, userRole: string): Promise<any> {
    // Use existing Supabase RAG service
    const context = await this.supabaseRAG.searchContent(query, userRole, 'default-facility');
    
    return {
      sources: context.documents.map(doc => doc.source),
      confidence: 0.85,
      sourceBreakdown: {
        helpArticles: context.sourceBreakdown.helpArticles || 0,
        knowledgeArticles: context.sourceBreakdown.knowledgeArticles || 0,
        policies: context.sourceBreakdown.policies || 0,
        procedures: context.sourceBreakdown.procedures || 0,
        courses: context.sourceBreakdown.courses || 0
      },
      content: context.documents.map(doc => doc.content).join('\n\n')
    };
  }

  /**
   * Analytics-specific context retrieval
   */
  private async getAnalyticsContext(query: string, questionType: string, additionalContext?: any): Promise<any> {
    // For analytics, we want to combine data insights with knowledge base
    const knowledgeContext = await this.knowledgeBase.getRAGContext(query, 'analytics', questionType);
    
    // Add analytics-specific data context
    const dataContext = additionalContext?.analyticsData || {};
    
    return {
      sources: [...knowledgeContext.relevantDocuments.map(doc => doc.document.source), 'analytics_data'],
      confidence: 0.85,
      sourceBreakdown: {
        knowledgeArticles: 1,
        analytics: 1,
        workflows: 1
      },
      content: {
        knowledge: knowledgeContext.context,
        data: dataContext
      }
    };
  }

  /**
   * Task assignment-specific context retrieval
   */
  private async getTaskAssignmentContext(query: string, questionType: string, userRole: string): Promise<any> {
    // Combine workflow procedures with user capabilities
    const workflowContext = await this.supabaseRAG.searchContent(query, userRole, 'default-facility');
    
    return {
      sources: [...workflowContext.documents.map(doc => doc.source), 'user_capabilities', 'task_history'],
      confidence: 0.80,
      sourceBreakdown: {
        procedures: 1,
        helpArticles: 1,
        workflows: 1
      },
      content: {
        procedures: workflowContext.documents.map(doc => doc.content).join('\n\n'),
        userRole,
        capabilities: this.getUserCapabilities(userRole)
      }
    };
  }

  /**
   * Forecast-specific context retrieval
   */
  private async getForecastContext(query: string, questionType: string, additionalContext?: any): Promise<any> {
    // Combine historical data with knowledge base insights
    const knowledgeContext = await this.knowledgeBase.getRAGContext(query, 'forecasting', questionType);
    
    return {
      sources: [...knowledgeContext.relevantDocuments.map(doc => doc.document.source), 'historical_data', 'trend_analysis'],
      confidence: 0.75,
      sourceBreakdown: {
        knowledgeArticles: 1,
        analytics: 1,
        workflows: 1
      },
      content: {
        knowledge: knowledgeContext.context,
        historicalData: additionalContext?.historicalData || {},
        trends: additionalContext?.trends || {}
      }
    };
  }

  /**
   * Course generation-specific context retrieval
   */
  private async getCourseGenerationContext(query: string, questionType: string, userRole: string): Promise<any> {
    // Combine course content with user progress and knowledge base
    const courseContext = await this.supabaseRAG.searchContent(query, userRole, 'default-facility');
    
    return {
      sources: [...courseContext.documents.map(doc => doc.source), 'user_progress', 'learning_paths'],
      confidence: 0.82,
      sourceBreakdown: {
        courses: 1,
        knowledgeArticles: 1,
        procedures: 1
      },
      content: {
        courses: courseContext.documents.map(doc => doc.content).join('\n\n'),
        userRole,
        learningPaths: this.getLearningPaths(userRole)
      }
    };
  }

  /**
   * General context retrieval
   */
  private async getGeneralContext(query: string, questionType: string): Promise<any> {
    const context = await this.knowledgeBase.getRAGContext(query, 'general', questionType);
    
    return {
      sources: context.relevantDocuments.map(doc => doc.document.source),
      confidence: 0.70,
      sourceBreakdown: {
        knowledgeArticles: 1,
        helpArticles: 1
      },
      content: context.context
    };
  }

  /**
   * Build enhanced prompt with context
   */
  private buildEnhancedPrompt(request: UnifiedRAGRequest, context: any, questionType: string): string {
    const basePrompt = `You are an AI assistant specialized in ${request.feature} for a sterilization facility.`;
    
    const roleContext = `User Role: ${request.userRole}`;
    const questionContext = `Question Type: ${questionType}`;
    const contentContext = `Relevant Context: ${JSON.stringify(context.content, null, 2)}`;
    
    const instruction = this.getFeatureInstruction(request.feature);
    
    return `${basePrompt}\n\n${roleContext}\n${questionContext}\n${contentContext}\n\n${instruction}\n\nQuestion: ${request.query}`;
  }

  /**
   * Get feature-specific instructions
   */
  private getFeatureInstruction(feature: string): string {
    const instructions = {
      'help': 'Provide detailed, step-by-step guidance based on sterilization best practices and facility procedures.',
      'analytics': 'Analyze the data and provide actionable insights with specific recommendations.',
      'task-assignments': 'Suggest appropriate task assignments based on user capabilities and workflow requirements.',
      'forecasts': 'Provide data-driven predictions with confidence levels and supporting rationale.',
      'course-generation': 'Create personalized learning content based on user role and knowledge gaps.'
    };
    
    return instructions[feature] || 'Provide helpful information based on the available context.';
  }

  /**
   * Generate AI response (simulated for now)
   */
  private async generateAIResponse(prompt: string, feature: string): Promise<string> {
    // Simulate AI response generation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return feature-specific mock response
    return this.getMockResponse(feature, prompt);
  }

  /**
   * Get mock response for testing
   */
  private getMockResponse(feature: string, prompt: string): string {
    const responses = {
      'help': 'Based on the available knowledge base and procedures, here is the guidance you requested...',
      'analytics': 'Analysis of your data shows the following trends and recommendations...',
      'task-assignments': 'Based on your role and capabilities, I recommend the following task assignments...',
      'forecasts': 'Based on historical data and current trends, here are the predicted outcomes...',
      'course-generation': 'Based on your learning needs and role, I recommend the following course content...'
    };
    
    return responses[feature] || 'I have analyzed your request and provided relevant information based on the available context.';
  }

  /**
   * Generate fallback response
   */
  private generateFallbackResponse(request: UnifiedRAGRequest): string {
    return `I apologize, but I'm unable to process your ${request.feature} request at the moment. Please try again or contact support if the issue persists.`;
  }

  /**
   * Get user capabilities based on role
   */
  private getUserCapabilities(userRole: string): string[] {
    const capabilities = {
      'Sterilization Technician': ['cleaning', 'sterilization', 'packaging', 'documentation'],
      'Supervisor': ['oversight', 'training', 'quality_control', 'scheduling'],
      'Manager': ['planning', 'budgeting', 'staff_management', 'compliance'],
      'Administrator': ['system_access', 'configuration', 'reporting', 'maintenance']
    };
    
    return capabilities[userRole] || ['general_operations'];
  }

  /**
   * Get learning paths based on role
   */
  private getLearningPaths(userRole: string): string[] {
    const paths = {
      'Sterilization Technician': ['basic_sterilization', 'safety_protocols', 'equipment_operation'],
      'Supervisor': ['leadership', 'quality_management', 'training_methods'],
      'Manager': ['strategic_planning', 'compliance_management', 'team_leadership'],
      'Administrator': ['system_administration', 'data_management', 'security_protocols']
    };
    
    return paths[userRole] || ['general_training'];
  }

  /**
   * Estimate token usage
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}

export const unifiedRAGService = UnifiedRAGService.getInstance();
