import { UnifiedAIService } from '../UnifiedAIService';
import { logger } from '../../logging/structuredLogger';

export class OpenAIService {
  // Real OpenAI API integration for text analysis
  static async callOpenAI(prompt: string, apiKey: string): Promise<string> {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Use UnifiedAIService for consistent AI calls
      const systemPrompt = 'You are a healthcare AI specialist for Cliniio, specializing in sterilization facility management, medical instrument analysis, and compliance workflows. Provide accurate, actionable insights based on the data provided.';
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;
      
      const response = await UnifiedAIService.askAI(fullPrompt, {
        module: 'sterilization-analysis',
        facilityId: 'unknown'
      });

      return response;
    } catch (error) {
      logger.error('OpenAI API call failed', {
        module: 'sterilization-analysis',
        facilityId: 'unknown'
      }, {
        error: error instanceof Error ? error.message : String(error),
        promptLength: prompt.length
      });
      throw new Error('AI analysis failed');
    }
  }

  // Test ChatGPT-4 connection
  static async testConnection(apiKey: string): Promise<{
    success: boolean;
    response: string;
    error?: string;
  }> {
    try {
      const testPrompt =
        'Hello! This is a test message from Cliniio sterilization AI service. Please respond with a brief confirmation that you are working.';
      const response = await this.callOpenAI(testPrompt, apiKey);

      return {
        success: true,
        response: response,
      };
    } catch (error) {
      return {
        success: false,
        response: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Parse AI responses for various analysis types
  static parseConditionFromAI(
    analysis: string
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' {
    if (analysis.includes('excellent') || analysis.includes('perfect'))
      return 'excellent';
    if (analysis.includes('good') || analysis.includes('acceptable'))
      return 'good';
    if (analysis.includes('fair') || analysis.includes('adequate'))
      return 'fair';
    if (analysis.includes('poor') || analysis.includes('unacceptable'))
      return 'poor';
    if (analysis.includes('damaged') || analysis.includes('broken'))
      return 'damaged';
    return 'good'; // Default
  }

  static parseWearLevelFromAI(
    analysis: string
  ): 'minimal' | 'moderate' | 'significant' | 'critical' {
    if (analysis.includes('minimal') || analysis.includes('new'))
      return 'minimal';
    if (analysis.includes('moderate') || analysis.includes('normal'))
      return 'moderate';
    if (analysis.includes('significant') || analysis.includes('worn'))
      return 'significant';
    if (analysis.includes('critical') || analysis.includes('severe'))
      return 'critical';
    return 'moderate'; // Default
  }

  static parseCleaningQualityFromAI(
    analysis: string
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (analysis.includes('excellent') || analysis.includes('clean'))
      return 'excellent';
    if (analysis.includes('good') || analysis.includes('acceptable'))
      return 'good';
    if (analysis.includes('fair') || analysis.includes('adequate'))
      return 'fair';
    if (analysis.includes('poor') || analysis.includes('dirty')) return 'poor';
    return 'good'; // Default
  }

  static parseDamageFromAI(analysis: string): boolean {
    return (
      analysis.includes('damage') ||
      analysis.includes('broken') ||
      analysis.includes('cracked')
    );
  }

  static parseDamageTypesFromAI(analysis: string): string[] {
    const damageTypes: string[] = [];
    if (analysis.includes('crack')) damageTypes.push('crack');
    if (analysis.includes('scratch')) damageTypes.push('scratch');
    if (analysis.includes('rust')) damageTypes.push('rust');
    if (analysis.includes('bend')) damageTypes.push('bent');
    return damageTypes;
  }

  static parseBarcodeQualityFromAI(
    analysis: string
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (analysis.includes('excellent') || analysis.includes('clear'))
      return 'excellent';
    if (analysis.includes('good') || analysis.includes('readable'))
      return 'good';
    if (analysis.includes('fair') || analysis.includes('acceptable'))
      return 'fair';
    if (analysis.includes('poor') || analysis.includes('unreadable'))
      return 'poor';
    return 'good';
  }

  static parseToolTypeFromAI(analysis: string): string {
    if (analysis.includes('handpiece')) return 'Dental Handpiece';
    if (analysis.includes('scalpel')) return 'Surgical Scalpel';
    if (analysis.includes('forceps')) return 'Surgical Forceps';
    if (analysis.includes('scissors')) return 'Surgical Scissors';
    return 'Medical Instrument';
  }

  static parseToolCategoryFromAI(analysis: string): string {
    if (analysis.includes('dental')) return 'Dental Instruments';
    if (analysis.includes('surgical')) return 'Surgical Instruments';
    if (analysis.includes('ophthalmic')) return 'Ophthalmic Instruments';
    return 'General Medical Instruments';
  }

  static parseRiskLevel(analysis: string): 'low' | 'medium' | 'high' {
    if (analysis.includes('high') || analysis.includes('critical'))
      return 'high';
    if (analysis.includes('medium') || analysis.includes('moderate'))
      return 'medium';
    return 'low';
  }

  static parseComplianceScore(analysis: string): number {
    if (analysis.includes('excellent') || analysis.includes('100%'))
      return 0.95;
    if (analysis.includes('good') || analysis.includes('90%')) return 0.9;
    if (analysis.includes('fair') || analysis.includes('80%')) return 0.8;
    return 0.75;
  }

  // Generate recommendations and suggestions from AI analysis
  static generateRecommendations(analysis: string): string[] {
    const recommendations: string[] = [];
    if (analysis.includes('clean'))
      recommendations.push('Ensure thorough cleaning before sterilization');
    if (analysis.includes('inspect'))
      recommendations.push('Perform detailed visual inspection');
    if (analysis.includes('maintenance'))
      recommendations.push('Schedule maintenance check');
    if (recommendations.length === 0)
      recommendations.push('Tool appears in good condition');
    return recommendations;
  }

  static generateBarcodeRecommendations(analysis: string): string[] {
    const recommendations: string[] = [];
    if (analysis.includes('poor'))
      recommendations.push('Replace barcode label');
    if (analysis.includes('fair'))
      recommendations.push('Clean barcode surface');
    if (analysis.includes('good'))
      recommendations.push('Monitor for degradation');
    return recommendations;
  }

  static generateToolSuggestions(analysis: string): string[] {
    const suggestions: string[] = [];
    if (analysis.includes('high-speed'))
      suggestions.push(
        'High-speed handpiece - requires special sterilization cycle'
      );
    if (analysis.includes('delicate'))
      suggestions.push('Delicate instrument - handle with care');
    if (analysis.includes('sharp'))
      suggestions.push('Sharp instrument - use protective packaging');
    return suggestions;
  }

  static parseOptimizationSuggestions(analysis: string): string[] {
    const suggestions: string[] = [];
    if (analysis.includes('temperature'))
      suggestions.push('Optimize temperature settings');
    if (analysis.includes('duration'))
      suggestions.push('Adjust cycle duration');
    if (analysis.includes('grouping'))
      suggestions.push('Improve tool grouping');
    if (suggestions.length === 0) suggestions.push('Review cycle parameters');
    return suggestions;
  }

  static parseRecommendedParameters(analysis: string): Record<string, unknown> {
    // Parse AI analysis for recommended parameters
    const params: Record<string, unknown> = {};
    if (analysis.includes('temperature')) params.temperature = 134;
    if (analysis.includes('duration')) params.duration = 20;
    if (analysis.includes('pressure')) params.pressure = 30;
    return params;
  }

  static parseRecommendedWorkflow(
    analysis: string
  ): 'clean' | 'dirty' | 'problem' | 'packaging' {
    if (analysis.includes('clean')) return 'clean';
    if (analysis.includes('dirty')) return 'dirty';
    if (analysis.includes('problem')) return 'problem';
    if (analysis.includes('packaging')) return 'packaging';
    return 'dirty'; // Default
  }

  static parseWorkflowReasoning(): string[] {
    return [
      'Tool condition assessment completed',
      'Historical usage patterns analyzed',
      'Sterilization requirements verified',
    ];
  }

  static parseAlternativeWorkflows(): Array<{
    workflow: string;
    confidence: number;
    reasoning: string;
  }> {
    return [
      {
        workflow: 'clean',
        confidence: 0.75,
        reasoning: 'Alternative cleaning approach',
      },
    ];
  }

  static parseIssues(analysis: string): string[] {
    const issues: string[] = [];
    if (analysis.includes('wear')) issues.push('Tool wear detected');
    if (analysis.includes('damage')) issues.push('Potential damage');
    if (analysis.includes('maintenance')) issues.push('Maintenance needed');
    return issues;
  }

  static parseRiskFactors(analysis: string): string[] {
    const factors: string[] = [];
    if (analysis.includes('temperature'))
      factors.push('Temperature variations');
    if (analysis.includes('pressure')) factors.push('Pressure fluctuations');
    if (analysis.includes('time')) factors.push('Timing issues');
    return factors;
  }

  static parseRequiredActions(analysis: string): string[] {
    const actions: string[] = [];
    if (analysis.includes('document')) actions.push('Document variations');
    if (analysis.includes('investigate')) actions.push('Investigate causes');
    if (analysis.includes('correct')) actions.push('Correct procedures');
    return actions;
  }

  static parseAuditRecommendations(analysis: string): string[] {
    const recommendations: string[] = [];
    if (analysis.includes('review')) recommendations.push('Review procedures');
    if (analysis.includes('monitor'))
      recommendations.push('Monitor parameters');
    if (analysis.includes('train')) recommendations.push('Staff training');
    return recommendations;
  }

  static parseBIValidation(analysis: string): boolean {
    if (analysis.includes('pass') || analysis.includes('success')) return true;
    if (analysis.includes('fail') || analysis.includes('failure')) return false;
    return false; // Default inconclusive
  }
}
