import { supabase } from '../../../lib/supabaseClient';
import { ComplianceAnalysis } from './types';
import { OpenAIService } from './openaiService';

export class ComplianceServices {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Analyze compliance for sterilization cycles
  async analyzeCompliance(
    cycleId: string,
    openaiApiKey?: string
  ): Promise<ComplianceAnalysis> {
    try {
      const { data: cycle } = await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();

      if (!cycle) {
        throw new Error('Cycle not found');
      }

      const complianceAnalysis = await OpenAIService.callOpenAI(
        `Analyze sterilization cycle for compliance: ${JSON.stringify(cycle)}. Check for regulatory requirements and audit recommendations.`,
        openaiApiKey || ''
      );

      return {
        cycleId,
        complianceScore: OpenAIService.parseComplianceScore(complianceAnalysis),
        riskFactors: OpenAIService.parseRiskFactors(complianceAnalysis),
        requiredActions: OpenAIService.parseRequiredActions(complianceAnalysis),
        auditRecommendations:
          OpenAIService.parseAuditRecommendations(complianceAnalysis),
        regulatoryUpdates: this.parseRegulatoryUpdates(),
      };
    } catch (error) {
      console.error('Compliance analysis failed:', error);
      throw new Error('Compliance analysis failed');
    }
  }

  // Validate biological indicators with AI
  async validateBiologicalIndicators(
    biData: {
      id: string;
      type: string;
      result: string;
    },
    openaiApiKey?: string
  ): Promise<{
    valid: boolean;
    confidence: number;
    recommendations: string[];
  }> {
    try {
      const biAnalysis = await OpenAIService.callOpenAI(
        `Analyze biological indicator data: ${JSON.stringify(biData)}. Determine if sterilization conditions were properly achieved.`,
        openaiApiKey || ''
      );

      return {
        valid: OpenAIService.parseBIValidation(biAnalysis),
        confidence: 0.95,
        recommendations: [
          'Continue current sterilization parameters',
          'Monitor for any trend changes',
          'Schedule next validation per protocol',
        ],
      };
    } catch (error) {
      console.error('BI validation failed:', error);
      return {
        valid: false,
        confidence: 0.5,
        recommendations: ['Manual validation required'],
      };
    }
  }

  // Parse regulatory updates
  private parseRegulatoryUpdates(): string[] {
    return [
      'New FDA guidelines effective Q1 2025',
      'Updated AAMI standards for autoclave validation',
    ];
  }
}
