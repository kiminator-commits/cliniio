// BI Failure Recommendations Service
// Provides functions for generating predictive and pattern-based recommendations

import { BIIncident } from './biTrendAnalysis';
import { analyzeIncidentPatterns } from './biTrendAnalysis';

export interface IncidentPatterns {
  highFrequencyPeriods: string[];
  commonRootCauses: string[];
  equipmentFailureRate: number;
  responseTimeTrend: number;
}

export interface Recommendation {
  id: string;
  type: 'predictive' | 'pattern' | 'preventive' | 'corrective';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  timeframe: string;
  relatedIncidents: string[];
  confidence: number;
  category: string;
  tags: string[];
}

export interface PredictiveRecommendation extends Recommendation {
  type: 'predictive';
  predictionHorizon: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
}

export interface PatternRecommendation extends Recommendation {
  type: 'pattern';
  patternType: 'temporal' | 'equipment' | 'procedural' | 'environmental';
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Generates predictive recommendations based on trend analysis
 */
export function generatePredictiveRecommendations(
  incidents: BIIncident[],
  _facilityId: string
): PredictiveRecommendation[] {
  const recommendations: PredictiveRecommendation[] = [];

  if (!incidents || !Array.isArray(incidents) || incidents.length === 0) {
    return recommendations;
  }

  // Analyze trends and patterns
  const patterns = analyzeIncidentPatterns(incidents);

  // Generate recommendations based on patterns
  if (patterns.highFrequencyPeriods.length > 0) {
    recommendations.push({
      id: 'predictive-frequency',
      type: 'predictive',
      priority: 'high',
      title: 'Predictive Monitoring for High-Frequency Periods',
      description:
        'Implement predictive monitoring during identified high-frequency periods',
      actionItems: [
        'Deploy additional monitoring during peak periods',
        'Implement automated alerts',
        'Prepare response teams',
      ],
      estimatedImpact: 'Reduce incident impact by 40%',
      implementationEffort: 'medium',
      timeframe: '2-4 weeks',
      relatedIncidents: [],
      confidence: 0.8,
      category: 'predictive',
      tags: ['predictive', 'monitoring', 'frequency'],
      predictionHorizon: '2-4 weeks',
      riskLevel: 'high',
      probability: 0.8,
    });
  }

  return recommendations;
}

/**
 * Generates pattern-based recommendations
 */
export function generatePatternBasedRecommendations(
  patterns: IncidentPatterns
): PatternRecommendation[] {
  const recommendations: PatternRecommendation[] = [];

  if (!patterns) {
    return recommendations;
  }

  // Generate recommendations for high frequency periods
  if (patterns.highFrequencyPeriods.length > 0) {
    recommendations.push({
      id: 'frequency-pattern',
      type: 'preventive',
      priority: 'high',
      title: 'Implement Preventive Measures During High-Frequency Periods',
      description:
        'Increase monitoring and preventive measures during high-frequency periods',
      actionItems: [
        'Increase staffing during peak periods',
        'Implement additional monitoring',
      ],
      estimatedImpact: 'high',
      implementationEffort: 'medium',
      timeframe: '2-3 weeks',
      relatedIncidents: [],
      confidence: 0.85,
      category: 'pattern-analysis',
      tags: ['frequency', 'prevention', 'monitoring'],
      patternType: 'temporal',
      frequency: patterns.highFrequencyPeriods.length,
      trend: 'stable',
    });
  }

  // Generate recommendations for common root causes
  if (patterns.commonRootCauses.length > 0) {
    recommendations.push({
      id: 'root-cause-prevention',
      type: 'preventive',
      priority: 'high',
      title: 'Address Common Root Causes',
      description:
        'Focus on preventing the most common root causes of incidents',
      actionItems: [
        'Review and update procedures',
        'Implement additional training',
      ],
      estimatedImpact: 'high',
      implementationEffort: 'high',
      timeframe: '1-2 months',
      relatedIncidents: [],
      confidence: 0.9,
      category: 'pattern-analysis',
      tags: ['root-cause', 'prevention', 'training'],
      patternType: 'procedural',
      frequency: patterns.commonRootCauses.length,
      trend: 'stable',
    });
  }

  // Generate recommendations for high equipment failure rate
  if (patterns.equipmentFailureRate > 0.3) {
    recommendations.push({
      id: 'equipment-maintenance',
      type: 'preventive',
      priority: 'medium',
      title: 'Enhance Equipment Maintenance Schedule',
      description: 'Improve equipment maintenance to reduce failure rates',
      actionItems: [
        'Implement predictive maintenance',
        'Increase maintenance frequency',
      ],
      estimatedImpact: 'medium',
      implementationEffort: 'medium',
      timeframe: '3-4 weeks',
      relatedIncidents: [],
      confidence: 0.8,
      category: 'pattern-analysis',
      tags: ['equipment', 'maintenance', 'prevention'],
      patternType: 'equipment',
      frequency: Math.round(patterns.equipmentFailureRate * 10),
      trend: 'stable',
    });
  }

  // Generate recommendations for high response time trend
  if (patterns.responseTimeTrend > 1.2) {
    recommendations.push({
      id: 'response-time-optimization',
      type: 'preventive',
      priority: 'medium',
      title: 'Optimize Incident Response Procedures',
      description: 'Improve response times to incidents',
      actionItems: [
        'Streamline response procedures',
        'Implement automated alerts',
      ],
      estimatedImpact: 'medium',
      implementationEffort: 'medium',
      timeframe: '2-3 weeks',
      relatedIncidents: [],
      confidence: 0.75,
      category: 'pattern-analysis',
      tags: ['response-time', 'optimization', 'procedures'],
      patternType: 'procedural',
      frequency: Math.round(patterns.responseTimeTrend * 10),
      trend: 'increasing',
    });
  }

  return recommendations;
}

/**
 * Generates general recommendations
 */
export function generateGeneralRecommendations(): Recommendation[] {
  return [
    {
      id: 'general-training',
      type: 'preventive',
      priority: 'medium',
      title: 'Regular Staff Training Program',
      description:
        'Implement regular training programs to improve incident response',
      actionItems: [
        'Schedule monthly training sessions',
        'Create training materials',
        'Assess training effectiveness',
      ],
      estimatedImpact: 'Improve response quality by 30%',
      implementationEffort: 'medium',
      timeframe: '1-2 months',
      relatedIncidents: [],
      confidence: 0.8,
      category: 'general',
      tags: ['training', 'prevention', 'staff'],
    },
    {
      id: 'general-documentation',
      type: 'preventive',
      priority: 'low',
      title: 'Improve Documentation Standards',
      description: 'Enhance documentation practices to prevent incidents',
      actionItems: [
        'Create documentation templates',
        'Train staff on documentation',
        'Implement review processes',
      ],
      estimatedImpact: 'Reduce documentation-related incidents by 20%',
      implementationEffort: 'low',
      timeframe: '2-3 months',
      relatedIncidents: [],
      confidence: 0.7,
      category: 'general',
      tags: ['documentation', 'prevention', 'process'],
    },
  ];
}

/**
 * Generates risk-based recommendations
 */
interface RiskFactor {
  status: string;
  factor: string;
  description: string;
}

export function generateRiskBasedRecommendations(
  riskFactors: RiskFactor[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (!riskFactors || riskFactors.length === 0) {
    return recommendations;
  }

  riskFactors.forEach((factor) => {
    if (factor.status === 'critical') {
      recommendations.push({
        id: `critical-${factor.factor.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'reactive',
        priority: 'critical',
        title: `Address Critical ${factor.factor}`,
        description: `Critical risk factor detected: ${factor.description}`,
        actionItems: [
          'Immediate action required',
          'Escalate to management',
          'Implement emergency measures',
        ],
        estimatedImpact: 'high',
        implementationEffort: 'high',
        timeframe: '1-2 weeks',
        relatedIncidents: [],
        confidence: 0.9,
        category: 'risk-management',
        tags: ['critical', 'risk', 'urgent'],
      });
    } else if (factor.status === 'warning') {
      recommendations.push({
        id: `warning-${factor.factor.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'preventive',
        priority: 'medium',
        title: `Monitor ${factor.factor}`,
        description: `Warning level risk factor: ${factor.description}`,
        actionItems: [
          'Increase monitoring frequency',
          'Review current procedures',
          'Prepare mitigation plans',
        ],
        estimatedImpact: 'medium',
        implementationEffort: 'medium',
        timeframe: '2-4 weeks',
        relatedIncidents: [],
        confidence: 0.7,
        category: 'risk-management',
        tags: ['warning', 'risk', 'monitoring'],
      });
    }
  });

  return recommendations;
}

/**
 * Generates trend-based recommendations
 */
interface TrendAnalysis {
  incidentTrend: string;
  riskTrend: string;
  weeklyPrediction: number;
}

export function generateTrendBasedRecommendations(
  trendAnalysis: TrendAnalysis
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (!trendAnalysis) {
    return recommendations;
  }

  // Generate recommendations for increasing incident trend
  if (trendAnalysis.incidentTrend === 'increasing') {
    recommendations.push({
      id: 'increasing-incident-trend',
      type: 'preventive',
      priority: 'high',
      title: 'Address Increasing Incident Trend',
      description:
        'Incident frequency is increasing and requires immediate attention',
      actionItems: [
        'Investigate root causes of increase',
        'Implement additional preventive measures',
        'Review and update procedures',
      ],
      estimatedImpact: 'high',
      implementationEffort: 'high',
      timeframe: '2-3 weeks',
      relatedIncidents: [],
      confidence: 0.85,
      category: 'trend-analysis',
      tags: ['trend', 'increasing', 'prevention'],
    });
  }

  // Generate recommendations for increasing risk trend
  if (trendAnalysis.riskTrend === 'increasing') {
    recommendations.push({
      id: 'increasing-risk-trend',
      type: 'preventive',
      priority: 'high',
      title: 'Mitigate Increasing Risk Trend',
      description:
        'Risk levels are increasing and require immediate mitigation',
      actionItems: [
        'Conduct risk assessment',
        'Implement risk mitigation measures',
        'Monitor risk indicators closely',
      ],
      estimatedImpact: 'high',
      implementationEffort: 'high',
      timeframe: '1-2 weeks',
      relatedIncidents: [],
      confidence: 0.85,
      category: 'trend-analysis',
      tags: ['risk', 'increasing', 'mitigation'],
    });
  }

  // Generate recommendations for high weekly prediction
  if (trendAnalysis.weeklyPrediction > 5) {
    recommendations.push({
      id: 'high-weekly-prediction',
      type: 'reactive',
      priority: 'medium',
      title: 'Prepare for High Incident Volume',
      description: 'High incident volume predicted for next week',
      actionItems: [
        'Prepare additional resources',
        'Implement contingency plans',
        'Increase monitoring',
      ],
      estimatedImpact: 'medium',
      implementationEffort: 'medium',
      timeframe: '1 week',
      relatedIncidents: [],
      confidence: 0.85,
      category: 'trend-analysis',
      tags: ['prediction', 'volume', 'preparation'],
    });
  }

  return recommendations;
}

/**
 * Generates seasonal recommendations
 */
interface SeasonalPattern {
  period: string;
  incidentRate: number;
  description: string;
}

export function generateSeasonalRecommendations(
  seasonalPatterns: SeasonalPattern[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (!seasonalPatterns || seasonalPatterns.length === 0) {
    return recommendations;
  }

  seasonalPatterns.forEach((pattern) => {
    if (pattern.incidentRate >= 0.3) {
      recommendations.push({
        id: `high-${pattern.period.toLowerCase()}-incidents`,
        type: 'preventive',
        priority: 'medium',
        title: `Prepare for High ${pattern.period} Incident Rate`,
        description: `High incident rate predicted for ${pattern.period}: ${pattern.description}`,
        actionItems: [
          'Prepare for peak season',
          'Increase monitoring',
          'Implement seasonal procedures',
        ],
        estimatedImpact: 'medium',
        implementationEffort: 'medium',
        timeframe: '4-6 weeks',
        relatedIncidents: [],
        confidence: 0.8,
        category: 'seasonal-analysis',
        tags: ['seasonal', 'pattern', 'preparation'],
      });
    }
  });

  return recommendations;
}

/**
 * Prioritizes recommendations by impact and effort
 */
export function prioritizeRecommendations(
  recommendations: Recommendation[]
): Recommendation[] {
  const priorityWeights = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const impactWeights = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return recommendations.sort((a, b) => {
    // First sort by priority
    const priorityDiff =
      priorityWeights[b.priority] - priorityWeights[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by impact
    const impactDiff =
      impactWeights[b.estimatedImpact as keyof typeof impactWeights] -
      impactWeights[a.estimatedImpact as keyof typeof impactWeights];
    if (impactDiff !== 0) return impactDiff;

    // Finally by confidence
    return b.confidence - a.confidence;
  });
}

/**
 * Filters recommendations by type
 */
export function filterRecommendationsByType(
  recommendations: Recommendation[],
  type: string
): Recommendation[] {
  return recommendations.filter((rec) => rec.type === type);
}

/**
 * Filters recommendations by priority
 */
export function filterRecommendationsByPriority(
  recommendations: Recommendation[],
  priority: string
): Recommendation[] {
  return recommendations.filter((rec) => rec.priority === priority);
}

/**
 * Gets top N recommendations
 */
export function getTopRecommendations(
  recommendations: Recommendation[],
  limit: number = 5
): Recommendation[] {
  // Priority order: critical > high > medium > low
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  return recommendations
    .sort((a, b) => {
      const aPriority =
        priorityOrder[a.priority as keyof typeof priorityOrder] ?? 999;
      const bPriority =
        priorityOrder[b.priority as keyof typeof priorityOrder] ?? 999;
      return aPriority - bPriority;
    })
    .slice(0, limit);
}
