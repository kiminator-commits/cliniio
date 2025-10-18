import { TokenUsageService } from '../TokenUsageService';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: 'sterilization' | 'compliance' | 'procedures' | 'safety' | 'technical' | 'general';
  source: string; // File path or URL
  tags: string[];
  lastUpdated: Date;
}

export interface SearchResult {
  document: KnowledgeDocument;
  relevanceScore: number;
  matchedSections: string[];
}

export interface RAGContext {
  relevantDocuments: SearchResult[];
  userRole: string;
  question: string;
  context: string;
}

/**
 * Knowledge Base Service for RAG-enhanced help system
 * Manages document storage, vectorization, and semantic search
 */
export class KnowledgeBaseService {
  private static instance: KnowledgeBaseService;
  private documents: Map<string, KnowledgeDocument> = new Map();
  private tokenService: TokenUsageService;

  private constructor() {
    this.tokenService = TokenUsageService.getInstance();
    this.initializeKnowledgeBase();
  }

  static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
    }
    return KnowledgeBaseService.instance;
  }

  /**
   * Initialize the knowledge base with existing documentation
   */
  private initializeKnowledgeBase(): void {
    // Sterilization Procedures
    this.addDocument({
      id: 'sterilization-aami-compliance',
      title: 'AAMI ST79 Compliance Checklist',
      content: `AAMI ST79 Compliance Requirements:
      
Required by AAMI ST79:
- Pre-cleaning with enzymatic solution or manual scrubbing
- Two rinsing stages (Bath 1 and Bath 2)
- Drying with airflow or dedicated cabinet
- Sterilization via autoclave (minimum 4-minute exposure at 132°C)
- Daily BI (Biological Indicator) test logging
- Use of CI (Chemical Indicator) strips in every package
- Documentation of failed sterilization cycles
- Operator accountability for all actions
- Retention of audit logs for 2 years minimum

Important Notes:
- BI test failure should trigger quarantine and retesting
- Operator identity must be recorded and immutable
- Timer logic must support real-time logging and backup
- No manual overrides without administrative approval`,
      category: 'compliance',
      source: 'src/components/Sterilization/COMPLIANCE.md',
      tags: ['aami', 'st79', 'compliance', 'sterilization', 'standards'],
      lastUpdated: new Date()
    });

    // Sterilization Workflows
    this.addDocument({
      id: 'sterilization-workflows',
      title: 'Sterilization Workflow Procedures',
      content: `Sterilization Workflow Types:

1. Clean Workflow:
- Tool is scanned via barcode
- System verifies tool is clean and ready
- Tool is marked as "dirty" after use
- Generates traceability code for audit trail

2. Dirty Workflow:
- Tool is scanned
- Begins sterilization cycle: Bath 1 → Bath 2 → Drying → Autoclave
- Each phase has timed countdown with temperature/pressure requirements
- Chemical and Biological indicators required for autoclave phase

3. Tool Problem Workflow:
- Tool is scanned
- Problem type is selected (damage, malfunction, etc.)
- Voice input for detailed notes
- Tool is flagged in system for attention

4. Packaging Workflow:
- Tools are scanned (single or batch mode)
- Proper packaging procedures followed
- Batch creation and tracking`,
      category: 'procedures',
      source: 'docs/components/SterilizationWorkflows.md',
      tags: ['workflows', 'sterilization', 'procedures', 'barcode', 'tracking'],
      lastUpdated: new Date()
    });

    // BI Testing Procedures
    this.addDocument({
      id: 'bi-testing-procedures',
      title: 'Biological Indicator Testing Procedures',
      content: `Biological Indicator Testing Requirements:

Daily BI Testing:
- Must be performed daily before first sterilization cycle
- Use appropriate BI for sterilization method (steam, chemical, etc.)
- Record results in system with operator verification
- Failed tests trigger quarantine procedures

BI Failure Resolution:
- Immediately quarantine all items from failed cycle
- Document failure details and operator actions
- Retest with new BI before releasing items
- Investigate root cause of failure
- Update procedures if systemic issue identified

Compliance Requirements:
- All BI tests must be documented
- Operator identity must be recorded
- Results must be retained for audit purposes
- Failed tests require immediate corrective action`,
      category: 'procedures',
      source: 'src/components/Sterilization/README.md',
      tags: ['bi', 'biological', 'indicator', 'testing', 'compliance', 'failure'],
      lastUpdated: new Date()
    });

    // Safety Protocols
    this.addDocument({
      id: 'sterilization-safety',
      title: 'Sterilization Safety Protocols',
      content: `Sterilization Safety Requirements:

Personal Protective Equipment (PPE):
- Gloves must be worn during all sterilization activities
- Eye protection required when handling chemicals
- Appropriate clothing to prevent contamination

Chemical Safety:
- Follow SDS (Safety Data Sheet) instructions
- Proper ventilation in sterilization areas
- Chemical storage according to manufacturer guidelines
- Emergency procedures for chemical exposure

Equipment Safety:
- Regular maintenance and calibration required
- Temperature and pressure monitoring
- Emergency shutdown procedures
- Lockout/tagout procedures for maintenance

Emergency Procedures:
- Chemical spill response
- Equipment malfunction protocols
- Power failure procedures
- Contamination incident response`,
      category: 'safety',
      source: 'docs/LIBRARY_SEED_DATA.md',
      tags: ['safety', 'ppe', 'chemicals', 'emergency', 'procedures'],
      lastUpdated: new Date()
    });

    // Tool Problem Workflow - Detailed
    this.addDocument({
      id: 'tool-problem-workflow-detailed',
      title: 'Tool Problem Workflow - Detailed Procedures',
      content: `Tool Problem Workflow - Step by Step Procedures:

When a tool has a problem, follow these specific steps:

1. SCAN THE TOOL:
   - Use barcode scanner to identify the tool
   - System will recognize tool and current status
   - Verify tool identity matches physical tool

2. SELECT PROBLEM TYPE:
   - Damage: Physical damage to tool (cracks, breaks, bent parts)
   - Malfunction: Tool not working properly (mechanical issues)
   - Contamination: Suspected contamination or exposure
   - Maintenance: Routine maintenance needed
   - Other: Specify in notes

3. DOCUMENT THE PROBLEM:
   - Use voice input for detailed description
   - Include: What happened, when, who was using it
   - Note any safety concerns
   - Take photos if possible

4. SYSTEM ACTIONS:
   - Tool is automatically flagged in system
   - Quarantine status applied if contamination suspected
   - Maintenance ticket created if needed
   - Audit trail established

5. IMMEDIATE ACTIONS:
   - Remove tool from service immediately
   - Place in designated quarantine area
   - Notify supervisor if safety issue
   - Document all actions taken

6. FOLLOW-UP:
   - Check if replacement tool available
   - Schedule repair or replacement
   - Update inventory records
   - Complete incident report if required

SAFETY PRIORITY: Always prioritize safety over convenience. When in doubt, quarantine the tool.`,
      category: 'procedures',
      source: 'src/components/Sterilization/ToolProblemWorkflow',
      tags: ['tool', 'problem', 'workflow', 'damage', 'malfunction', 'contamination', 'quarantine'],
      lastUpdated: new Date()
    });

    // Technical Troubleshooting
    this.addDocument({
      id: 'technical-troubleshooting',
      title: 'Technical Troubleshooting Guide',
      content: `Common Technical Issues and Solutions:

Scanner Issues:
- Clean scanner lens regularly
- Check barcode quality and readability
- Verify scanner connectivity
- Restart scanner if unresponsive

Timer Problems:
- Check system clock synchronization
- Verify phase configuration settings
- Clear browser cache if web-based
- Restart application if persistent

Data Sync Issues:
- Check network connectivity
- Verify database connection
- Clear local storage cache
- Contact IT support if persistent

Performance Issues:
- Close unnecessary browser tabs
- Clear browser cache and cookies
- Check available disk space
- Restart application`,
      category: 'technical',
      source: 'src/components/Sterilization/README.md',
      tags: ['troubleshooting', 'technical', 'scanner', 'timer', 'performance'],
      lastUpdated: new Date()
    });
  }

  /**
   * Add a document to the knowledge base
   */
  private addDocument(document: KnowledgeDocument): void {
    this.documents.set(document.id, document);
  }

  /**
   * Search for relevant documents based on query
   */
  searchDocuments(query: string, userRole: string, limit: number = 5): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const document of this.documents.values()) {
      let relevanceScore = 0;
      const matchedSections: string[] = [];

      // Check title relevance
      if (document.title.toLowerCase().includes(queryLower)) {
        relevanceScore += 10;
        matchedSections.push('title');
      }

      // Check content relevance
      const contentLower = document.content.toLowerCase();
      const queryWords = queryLower.split(' ');
      
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          relevanceScore += 2;
          matchedSections.push(`content: ${word}`);
        }
      }

      // Check tags relevance
      for (const tag of document.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          relevanceScore += 5;
          matchedSections.push(`tag: ${tag}`);
        }
      }

      // Role-based relevance boost
      if (this.isRelevantForRole(document, userRole)) {
        relevanceScore += 3;
        matchedSections.push('role-relevant');
      }

      if (relevanceScore > 0) {
        results.push({
          document,
          relevanceScore,
          matchedSections
        });
      }
    }

    // Sort by relevance score and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Check if document is relevant for user role
   */
  private isRelevantForRole(document: KnowledgeDocument, userRole: string): boolean {
    const roleLower = userRole.toLowerCase();
    
    // Admin/Manager roles get access to all documents
    if (roleLower.includes('admin') || roleLower.includes('manager')) {
      return true;
    }

    // Technician roles get sterilization and procedure documents
    if (roleLower.includes('technician') || roleLower.includes('operator')) {
      return ['sterilization', 'procedures', 'safety'].includes(document.category);
    }

    // Default: return true for safety and general documents
    return ['safety', 'general'].includes(document.category);
  }

  /**
   * Get RAG context for help generation
   */
  getRAGContext(question: string, userRole: string, context: string): RAGContext {
    const relevantDocuments = this.searchDocuments(question, userRole, 3);
    
    return {
      relevantDocuments,
      userRole,
      question,
      context
    };
  }

  /**
   * Get all documents (for debugging)
   */
  getAllDocuments(): KnowledgeDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Add custom document (for future expansion)
   */
  addCustomDocument(document: KnowledgeDocument): void {
    this.addDocument(document);
  }
}

// Export singleton instance
export const knowledgeBaseService = KnowledgeBaseService.getInstance();
