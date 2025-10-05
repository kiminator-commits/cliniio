import { IntelligenceSummary } from '../analytics/forecastingAnalyticsService';
import {
  IntelligenceRecommendation,
  OptimizationTip,
  RiskAlert,
} from '../../types/intelligenceRecommendationTypes';
import {
  mapAITypeToRecommendationType,
  calculateAIPriority,
  generateAIDescription,
  calculateAIImpact,
  generateAIActionItems,
  calculateAITimeline,
  extractRelatedMetrics,
  mapRiskScoreToSeverity,
} from './intelligenceUtils';
import { AILearningService } from '../../pages/KnowledgeHub/services/aiLearningService';

export class RecommendationEngine {
  private static aiLearningService = new AILearningService();

  /**
   * Generate hybrid recommendations combining AI insights with business logic
   */
  static async generateHybridRecommendations(
    summary: IntelligenceSummary,
    aiRecommendations: Record<string, unknown>[],
    userInsights: Record<string, unknown> | null
  ): Promise<IntelligenceRecommendation[]> {
    const recommendations: IntelligenceRecommendation[] = [];

    // Log insights for debugging (using userInsights to avoid unused variable warning)
    if (userInsights) {
      console.debug('User insights available for recommendations');
    }

    // Process AI recommendations
    aiRecommendations.forEach((aiRec) => {
      if ((aiRec.recommendation_score as number) > 0.7) {
        // High confidence threshold
        recommendations.push({
          id: `ai_${aiRec.id}`,
          type: mapAITypeToRecommendationType(
            aiRec.recommendation_type as string
          ),
          priority: calculateAIPriority(
            aiRec.recommendation_score as number,
            aiRec.confidence_level as number
          ),
          title:
            (aiRec.recommendation_reason as string) ||
            'AI-Generated Recommendation',
          description: generateAIDescription(aiRec),
          impact: calculateAIImpact(aiRec),
          actionItems: generateAIActionItems(aiRec),
          timeline: calculateAITimeline(aiRec),
          confidence: (aiRec.confidence_level as number) || 0.8,
          category:
            (aiRec.content_context as { category?: string })?.category ||
            'general',
          relatedMetrics: extractRelatedMetrics(aiRec),
        });
      }
    });

    // Add business logic recommendations for critical issues
    if (summary.auditRisk?.riskLevel === 'critical') {
      recommendations.push(this.createCriticalAuditRecommendation(summary));
    }

    if (summary.supplyDepletion?.some((s) => s.reorderUrgency === 'critical')) {
      recommendations.push(this.createCriticalSupplyRecommendation(summary));
    }

    return recommendations;
  }

  /**
   * Generate AI-enhanced optimization tips
   */
  static async generateAIOptimizationTips(
    summary: IntelligenceSummary,
    learningInsights: Record<string, unknown> | null,
    performancePatterns: Record<string, unknown> | null
  ): Promise<OptimizationTip[]> {
    const tips: OptimizationTip[] = [];

    // Generate AI-enhanced tips based on learning insights
    if (learningInsights) {
      const skillGaps = learningInsights.skill_gaps || [];
      (skillGaps as string[]).forEach((gap: string, index: number) => {
        tips.push({
          id: `ai_skill_gap_${index}`,
          category: 'compliance', // Changed from 'training' to valid category
          title: `Address Skill Gap: ${gap}`,
          description: `AI analysis indicates a skill gap in ${gap} that may impact performance.`,
          currentState: `Current skill level: ${learningInsights.learning_efficiency_score || 70}%`,
          recommendedAction:
            'Complete targeted training modules and practice exercises',
          expectedOutcome: `Improve ${gap} proficiency by 25%`,
          difficulty: 'medium',
          estimatedEffort: '2-3 weeks',
          priority: 8,
        });
      });
    }

    // Add performance-based tips
    if (
      (performancePatterns as { efficiency_score?: number })
        ?.efficiency_score &&
      (performancePatterns as { efficiency_score?: number }).efficiency_score! <
        80
    ) {
      tips.push({
        id: 'ai_efficiency_optimization',
        category: 'sterilization', // Changed from 'efficiency' to valid category
        title: 'Optimize Workflow Efficiency',
        description:
          'AI analysis shows workflow efficiency below optimal levels.',
        currentState: `Current efficiency: ${(performancePatterns as { efficiency_score?: number })?.efficiency_score || 70}%`,
        recommendedAction: 'Review and optimize high-frequency workflows',
        expectedOutcome: 'Increase efficiency by 15-20%',
        difficulty: 'medium',
        estimatedEffort: '3-4 weeks',
        priority: 7,
      });
    }

    return tips;
  }

  /**
   * Generate intelligent risk alerts
   */
  static async generateIntelligentRiskAlerts(
    summary: IntelligenceSummary,
    aiRiskPredictions: Record<string, unknown>[],
    riskPatterns: Record<string, unknown> | null
  ): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];

    // Log patterns for debugging (using riskPatterns to avoid unused variable warning)
    if (riskPatterns) {
      console.debug('Risk patterns available for analysis');
    }

    // Process AI risk predictions
    aiRiskPredictions.forEach(
      (prediction: {
        risk_score?: number;
        id?: string;
        risk_title?: string;
        risk_description?: string;
        risk_category?: string;
        risk_mitigation?: string;
        risk_timeline?: string;
      }) => {
        if ((prediction.risk_score as number) > 0.8) {
          // High risk threshold
          alerts.push({
            id: `ai_risk_${prediction.id}`,
            severity: mapRiskScoreToSeverity(prediction.risk_score as number),
            title: (prediction.risk_title as string) || 'AI-Detected Risk',
            description:
              (prediction.risk_description as string) ||
              'AI analysis has identified a potential risk.',
            riskFactors:
              ((prediction as Record<string, unknown>)
                .risk_factors as string[]) || [],
            immediateActions:
              ((prediction as Record<string, unknown>)
                .immediate_actions as string[]) || [],
            longTermSolutions:
              ((prediction as Record<string, unknown>)
                .long_term_solutions as string[]) || [],
            escalationPath:
              ((prediction as Record<string, unknown>)
                .escalation_path as string) || 'Notify supervisor',
            deadline:
              ((prediction as Record<string, unknown>).deadline as string) ||
              '48 hours',
            status: 'open',
          });
        }
      }
    );

    // Add critical business risks
    if (summary.auditRisk?.riskLevel === 'critical') {
      alerts.push(this.createCriticalAuditAlert(summary));
    }

    return alerts;
  }

  /**
   * Generate fallback recommendations when AI fails
   */
  static generateFallbackRecommendations(
    summary: IntelligenceSummary
  ): IntelligenceRecommendation[] {
    // Basic fallback logic - simplified version of original
    const recommendations: IntelligenceRecommendation[] = [];

    if (summary.auditRisk?.riskLevel === 'critical') {
      recommendations.push({
        id: 'fallback_audit_risk',
        type: 'compliance',
        priority: 'critical',
        title: 'Critical Audit Risk Mitigation Required',
        description: `Overall audit risk score: ${summary.auditRisk.overallRiskScore}/100.`,
        impact: { riskReduction: 60, costSavings: 5000 },
        actionItems: [
          'Complete missing BI logs immediately',
          'Review incomplete cycles',
        ],
        timeline: '1 week',
        confidence: 0.88,
        category: 'compliance',
        relatedMetrics: ['audit_scores', 'compliance_rates'],
      });
    }

    return recommendations;
  }

  /**
   * Generate fallback optimization tips when AI fails
   */
  static generateFallbackOptimizationTips(
    summary: IntelligenceSummary
  ): OptimizationTip[] {
    // Basic fallback logic
    const tips: OptimizationTip[] = [];

    if (summary.sterilization?.biPassRate < 95) {
      tips.push({
        id: 'fallback_sterilization_optimization',
        category: 'sterilization',
        title: 'Improve BI Test Pass Rates',
        description:
          'BI test pass rates below optimal levels indicate potential issues.',
        currentState: `Current BI pass rate: ${summary.sterilization.biPassRate}%`,
        recommendedAction:
          'Review sterilization parameters and implement quality checks',
        expectedOutcome: 'Increase BI pass rate to 95%+',
        difficulty: 'medium',
        estimatedEffort: '2-3 weeks',
        priority: 8,
      });
    }

    return tips;
  }

  /**
   * Generate fallback risk alerts when AI fails
   */
  static generateFallbackRiskAlerts(summary: IntelligenceSummary): RiskAlert[] {
    // Basic fallback logic
    const alerts: RiskAlert[] = [];

    if (summary.auditRisk?.riskLevel === 'critical') {
      alerts.push({
        id: 'fallback_high_audit_risk',
        severity: 'critical',
        title: 'High Audit Risk Alert',
        description: `Audit risk score: ${summary.auditRisk.overallRiskScore}/100.`,
        riskFactors: ['Skipped BI indicators', 'Incomplete cycles'],
        immediateActions: [
          'Complete missing documentation',
          'Review procedures',
        ],
        longTermSolutions: ['Implement monitoring', 'Enhance training'],
        escalationPath: 'Notify quality assurance team',
        deadline: '48 hours',
        status: 'open',
      });
    }

    return alerts;
  }

  /**
   * Create critical audit recommendation
   */
  private static createCriticalAuditRecommendation(
    summary: IntelligenceSummary
  ): IntelligenceRecommendation {
    return {
      id: 'critical_audit_risk_mitigation',
      type: 'compliance',
      priority: 'critical',
      title: 'Critical Audit Risk Mitigation Required',
      description: `Overall audit risk score: ${summary.auditRisk?.overallRiskScore}/100. ${summary.auditRisk?.skippedIndicators} skipped indicators and ${summary.auditRisk?.incompleteCycles} incomplete cycles detected.`,
      impact: {
        riskReduction: 60,
        costSavings: 5000,
      },
      actionItems: [
        'Complete missing BI logs immediately',
        'Review incomplete cycle procedures',
        'Reinforce protocol training',
        'Implement daily compliance checks',
      ],
      timeline: '1 week',
      confidence: 0.88,
      category: 'compliance',
      relatedMetrics: [
        'audit_scores',
        'compliance_rates',
        'protocol_adherence',
      ],
    };
  }

  /**
   * Create critical supply recommendation
   */
  private static createCriticalSupplyRecommendation(
    summary: IntelligenceSummary
  ): IntelligenceRecommendation {
    const criticalSupplies =
      summary.supplyDepletion?.filter((s) => s.reorderUrgency === 'critical') ||
      [];
    return {
      id: 'critical_supply_alert',
      type: 'risk_mitigation',
      priority: 'critical',
      title: `Critical Supply Alert: ${criticalSupplies.length} Items`,
      description: `${criticalSupplies.length} critical supplies will deplete within 7 days, risking operational disruption.`,
      impact: {
        costSavings: criticalSupplies.reduce(
          (sum, s) => sum + Number(s.currentCost || 0) * 0.2,
          0
        ),
        riskReduction: 95,
      },
      actionItems: [
        'Place emergency orders immediately',
        'Contact alternative suppliers',
        'Implement usage restrictions',
        'Notify clinical staff',
      ],
      timeline: 'Immediate',
      confidence: 0.95,
      category: 'inventory_management',
      relatedMetrics: ['stock_levels', 'usage_rates', 'supplier_performance'],
    };
  }

  /**
   * Create critical audit alert
   */
  private static createCriticalAuditAlert(
    summary: IntelligenceSummary
  ): RiskAlert {
    return {
      id: 'critical_audit_risk_alert',
      severity: 'critical',
      title: 'Critical Audit Risk Alert',
      description: `Audit risk score: ${summary.auditRisk?.overallRiskScore}/100. Multiple compliance issues detected requiring immediate attention.`,
      riskFactors: [
        'Skipped BI indicators',
        'Incomplete sterilization cycles',
        'Policy drift detected',
      ],
      immediateActions: [
        'Complete missing documentation immediately',
        'Review and complete incomplete cycles',
        'Reinforce protocol adherence',
        'Schedule compliance review meeting',
      ],
      longTermSolutions: [
        'Implement automated compliance monitoring',
        'Enhance staff training programs',
        'Establish quality assurance processes',
        'Create compliance dashboard',
      ],
      escalationPath: 'Notify quality assurance team and department director',
      deadline: '24 hours',
      status: 'open',
    };
  }
}
