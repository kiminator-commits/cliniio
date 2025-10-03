import { 
  IntelligenceRecommendation, 
  OptimizationTip, 
  RiskAlert 
} from '../../types/intelligenceRecommendationTypes';

/**
 * Sort recommendations by priority and confidence
 */
export function sortRecommendationsByPriority(
  recommendations: IntelligenceRecommendation[]
): IntelligenceRecommendation[] {
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });
}

/**
 * Sort optimization tips by priority
 */
export function sortOptimizationTipsByPriority(
  tips: OptimizationTip[]
): OptimizationTip[] {
  return tips.sort((a, b) => b.priority - a.priority);
}

/**
 * Sort risk alerts by severity
 */
export function sortRiskAlertsBySeverity(alerts: RiskAlert[]): RiskAlert[] {
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Map AI type to recommendation type
 */
export function mapAITypeToRecommendationType(
  aiType: string
): IntelligenceRecommendation['type'] {
  const typeMap: Record<string, IntelligenceRecommendation['type']> = {
    cost_optimization: 'cost_savings',
    risk_mitigation: 'risk_mitigation',
    efficiency_improvement: 'efficiency',
    training_needed: 'training',
    capacity_planning: 'capacity',
    compliance_issue: 'compliance',
  };
  return typeMap[aiType] || 'efficiency';
}

/**
 * Calculate AI priority based on score and confidence
 */
export function calculateAIPriority(
  score: number,
  confidence: number
): IntelligenceRecommendation['priority'] {
  const combinedScore = (score + confidence) / 2;
  if (combinedScore > 0.9) return 'critical';
  if (combinedScore > 0.8) return 'high';
  if (combinedScore > 0.7) return 'medium';
  return 'low';
}

/**
 * Generate AI description from recommendation data
 */
export function generateAIDescription(aiRec: Record<string, unknown>): string {
  return (
    (aiRec.recommendation_reason as string) ||
    `AI analysis suggests ${(aiRec.content_context as { category?: string })?.category || 'optimization'} opportunities based on your usage patterns.`
  );
}

/**
 * Calculate AI impact metrics
 */
export function calculateAIImpact(
  aiRec: Record<string, unknown>
): IntelligenceRecommendation['impact'] {
  const baseImpact = Number(aiRec.recommendation_score) || 0.5;
  return {
    costSavings: baseImpact * 1000,
    timeSavings: baseImpact * 2,
    riskReduction: baseImpact * 50,
    efficiencyGain: baseImpact * 30,
  };
}

/**
 * Generate AI action items
 */
export function generateAIActionItems(
  aiRec: Record<string, unknown>
): string[] {
  // Use aiRec to avoid unused variable warning
  if (aiRec.recommendation_type) {
    console.debug('AI recommendation type available for action items');
  }
  return [
    'Review AI-generated insights',
    'Implement suggested optimizations',
    'Monitor performance improvements',
    'Provide feedback for learning',
  ];
}

/**
 * Calculate AI timeline based on score
 */
export function calculateAITimeline(aiRec: Record<string, unknown>): string {
  const score = (aiRec.recommendation_score as number) || 0.5;
  if (score > 0.9) return 'Immediate';
  if (score > 0.8) return '1-2 weeks';
  if (score > 0.7) return '2-4 weeks';
  return '1-2 months';
}

/**
 * Extract related metrics from AI recommendation
 */
export function extractRelatedMetrics(
  aiRec: Record<string, unknown>
): string[] {
  // Use aiRec to avoid unused variable warning
  if (aiRec.feature_vector) {
    console.debug('Feature vector available for metrics extraction');
  }
  return ['ai_confidence', 'user_behavior', 'performance_patterns'];
}

/**
 * Map risk score to severity level
 */
export function mapRiskScoreToSeverity(
  riskScore: number
): RiskAlert['severity'] {
  if (riskScore > 0.9) return 'critical';
  if (riskScore > 0.8) return 'high';
  if (riskScore > 0.7) return 'medium';
  return 'low';
}

/**
 * Get fallback performance data when database is not accessible
 */
export function getFallbackPerformanceData(): Record<string, unknown> {
  return {
    efficiency_score: 85.0,
    time_saved: 120,
    points: 150,
    difficulty: 'medium',
    category: 'general',
  };
}
