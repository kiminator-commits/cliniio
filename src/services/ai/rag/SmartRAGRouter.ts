import { KnowledgeDocument, SearchResult, RAGContext } from './KnowledgeBaseService';

export interface QuestionClassification {
  type: 'workflow' | 'compliance' | 'safety' | 'technical' | 'policy' | 'general';
  sources: string[];
  priority: number;
}

export interface SmartRAGContext extends RAGContext {
  classification: QuestionClassification;
  sourceBreakdown: {
    code: SearchResult[];
    helpArticles: SearchResult[];
    knowledgeBase: SearchResult[];
    policies: SearchResult[];
    procedures: SearchResult[];
  };
}

/**
 * Smart RAG Router - Routes questions to appropriate sources based on content type
 */
export class SmartRAGRouter {
  private static instance: SmartRAGRouter;

  static getInstance(): SmartRAGRouter {
    if (!SmartRAGRouter.instance) {
      SmartRAGRouter.instance = new SmartRAGRouter();
    }
    return SmartRAGRouter.instance;
  }

  /**
   * Classify question and determine which sources to search
   */
  classifyQuestion(question: string, userRole: string): QuestionClassification {
    const questionLower = question.toLowerCase();
    
    // Workflow questions - Code + Help Articles + Procedures
    if (this.isWorkflowQuestion(questionLower)) {
      return {
        type: 'workflow',
        sources: ['code', 'helpArticles', 'procedures'],
        priority: 1
      };
    }
    
    // Compliance questions - Knowledge Base + Policies + Procedures
    if (this.isComplianceQuestion(questionLower)) {
      return {
        type: 'compliance',
        sources: ['knowledgeBase', 'policies', 'procedures'],
        priority: 1
      };
    }
    
    // Safety questions - Policies + Procedures + Knowledge Base
    if (this.isSafetyQuestion(questionLower)) {
      return {
        type: 'safety',
        sources: ['policies', 'procedures', 'knowledgeBase'],
        priority: 1
      };
    }
    
    // Technical questions - Code + Help Articles
    if (this.isTechnicalQuestion(questionLower)) {
      return {
        type: 'technical',
        sources: ['code', 'helpArticles'],
        priority: 1
      };
    }
    
    // Policy questions - Policies + Knowledge Base
    if (this.isPolicyQuestion(questionLower)) {
      return {
        type: 'policy',
        sources: ['policies', 'knowledgeBase'],
        priority: 1
      };
    }
    
    // Default - All sources
    return {
      type: 'general',
      sources: ['code', 'helpArticles', 'knowledgeBase', 'policies', 'procedures'],
      priority: 2
    };
  }

  /**
   * Check if question is about workflows
   */
  private isWorkflowQuestion(question: string): boolean {
    const workflowKeywords = [
      'workflow', 'steps', 'process', 'procedure', 'how to', 'what do i do',
      'dirty workflow', 'clean workflow', 'tool problem', 'packaging',
      'sterilization cycle', 'bath 1', 'bath 2', 'drying', 'autoclave',
      'scan', 'barcode', 'timer', 'phase'
    ];
    return workflowKeywords.some(keyword => question.includes(keyword));
  }

  /**
   * Check if question is about compliance
   */
  private isComplianceQuestion(question: string): boolean {
    const complianceKeywords = [
      'aami', 'st79', 'compliance', 'requirements', 'standards',
      'regulations', 'audit', 'documentation', 'retention',
      'operator accountability', 'immutable'
    ];
    return complianceKeywords.some(keyword => question.includes(keyword));
  }

  /**
   * Check if question is about safety
   */
  private isSafetyQuestion(question: string): boolean {
    const safetyKeywords = [
      'ppe', 'safety', 'protective', 'equipment', 'chemical',
      'spill', 'emergency', 'contamination', 'quarantine',
      'hazard', 'risk', 'incident'
    ];
    return safetyKeywords.some(keyword => question.includes(keyword));
  }

  /**
   * Check if question is about technical issues
   */
  private isTechnicalQuestion(question: string): boolean {
    const technicalKeywords = [
      'scanner', 'not working', 'error', 'problem', 'issue',
      'troubleshoot', 'fix', 'repair', 'malfunction',
      'performance', 'slow', 'crash', 'bug'
    ];
    return technicalKeywords.some(keyword => question.includes(keyword));
  }

  /**
   * Check if question is about policies
   */
  private isPolicyQuestion(question: string): boolean {
    const policyKeywords = [
      'policy', 'policies', 'rules', 'guidelines',
      'requirements', 'standards', 'protocol'
    ];
    return policyKeywords.some(keyword => question.includes(keyword));
  }

  /**
   * Get source-specific search queries
   */
  getSourceQueries(question: string, classification: QuestionClassification): Record<string, string[]> {
    const queries: Record<string, string[]> = {};
    
    classification.sources.forEach(source => {
      switch (source) {
        case 'code':
          queries.code = [
            question,
            this.extractCodeKeywords(question),
            'workflow implementation',
            'sterilization process'
          ];
          break;
          
        case 'helpArticles':
          queries.helpArticles = [
            question,
            this.extractHelpKeywords(question),
            'user guide',
            'instructions'
          ];
          break;
          
        case 'knowledgeBase':
          queries.knowledgeBase = [
            question,
            this.extractKnowledgeKeywords(question),
            'compliance',
            'standards'
          ];
          break;
          
        case 'policies':
          queries.policies = [
            question,
            this.extractPolicyKeywords(question),
            'policy',
            'requirements'
          ];
          break;
          
        case 'procedures':
          queries.procedures = [
            question,
            this.extractProcedureKeywords(question),
            'procedure',
            'steps'
          ];
          break;
      }
    });
    
    return queries;
  }

  /**
   * Extract keywords for code searches
   */
  private extractCodeKeywords(question: string): string {
    const codeKeywords = ['workflow', 'scan', 'timer', 'phase', 'cycle', 'barcode'];
    return codeKeywords.filter(keyword => question.toLowerCase().includes(keyword)).join(' ');
  }

  /**
   * Extract keywords for help article searches
   */
  private extractHelpKeywords(question: string): string {
    const helpKeywords = ['how', 'what', 'steps', 'process', 'guide', 'instructions'];
    return helpKeywords.filter(keyword => question.toLowerCase().includes(keyword)).join(' ');
  }

  /**
   * Extract keywords for knowledge base searches
   */
  private extractKnowledgeKeywords(question: string): string {
    const knowledgeKeywords = ['aami', 'compliance', 'standards', 'requirements', 'regulations'];
    return knowledgeKeywords.filter(keyword => question.toLowerCase().includes(keyword)).join(' ');
  }

  /**
   * Extract keywords for policy searches
   */
  private extractPolicyKeywords(question: string): string {
    const policyKeywords = ['policy', 'rules', 'guidelines', 'requirements', 'standards'];
    return policyKeywords.filter(keyword => question.toLowerCase().includes(keyword)).join(' ');
  }

  /**
   * Extract keywords for procedure searches
   */
  private extractProcedureKeywords(question: string): string {
    const procedureKeywords = ['procedure', 'steps', 'process', 'workflow', 'protocol'];
    return procedureKeywords.filter(keyword => question.toLowerCase().includes(keyword)).join(' ');
  }
}

// Export singleton instance
export const smartRAGRouter = SmartRAGRouter.getInstance();
