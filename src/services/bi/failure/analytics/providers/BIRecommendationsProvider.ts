import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/_core/logger';

export interface PredictiveRecommendation {
  id: string;
  type: 'preventive' | 'reactive' | 'optimization';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: 'low' | 'medium' | 'high';
  confidence: number;
  timeframe: string;
}

export interface IncidentPatterns {
  highFrequencyPeriods: string[];
  commonRootCauses: string[];
  equipmentFailureRate: number;
  responseTimeTrend: number;
}

export class BIRecommendationsProvider {
  /**
   * Generate predictive recommendations for a facility
   */
  static async generatePredictiveRecommendations(
    facilityId: string
  ): Promise<PredictiveRecommendation[]> {
    try {
      const recommendations: PredictiveRecommendation[] = [];
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      if (incidents && incidents.length > 0) {
        // Analyze patterns and generate recommendations
        const patterns = this.analyzeIncidentPatterns(
          incidents as Array<Record<string, unknown> & { created_at: string }>
        );

        // Pattern-based recommendations
        if (patterns.highFrequencyPeriods.length > 0) {
          recommendations.push({
            id: 'frequency-pattern',
            type: 'preventive' as const,
            title:
              'Implement Preventive Measures During High-Frequency Periods',
            description: `Increase monitoring and preventive maintenance during identified high-frequency periods: ${patterns.highFrequencyPeriods.join(', ')}`,
            priority: 'high' as const,
            estimatedImpact: 'high' as const,
            confidence: 0.85,
            timeframe: '2-4 weeks',
          });
        }

        if (patterns.commonRootCauses.length > 0) {
          recommendations.push({
            id: 'root-cause-prevention',
            type: 'preventive' as const,
            title: 'Address Common Root Causes',
            description: `Focus on preventing the most common root causes: ${patterns.commonRootCauses.slice(0, 3).join(', ')}`,
            priority: 'high' as const,
            estimatedImpact: 'high' as const,
            confidence: 0.9,
            timeframe: '4-6 weeks',
          });
        }

        if (patterns.equipmentFailureRate > 0.3) {
          recommendations.push({
            id: 'equipment-maintenance',
            type: 'preventive' as const,
            title: 'Enhance Equipment Maintenance Schedule',
            description:
              'Implement more frequent preventive maintenance for equipment showing high failure rates',
            priority: 'medium' as const,
            estimatedImpact: 'medium' as const,
            confidence: 0.8,
            timeframe: '3-5 weeks',
          });
        }

        if (patterns.responseTimeTrend > 1.2) {
          recommendations.push({
            id: 'response-time-optimization',
            type: 'optimization' as const,
            title: 'Optimize Incident Response Procedures',
            description:
              'Review and streamline incident response procedures to reduce response times',
            priority: 'medium' as const,
            estimatedImpact: 'medium' as const,
            confidence: 0.75,
            timeframe: '2-3 weeks',
          });
        }
      }

      // Add general predictive recommendations
      recommendations.push({
        id: 'staff-training',
        type: 'preventive' as const,
        title: 'Implement Predictive Training Program',
        description:
          'Develop training programs based on predicted incident patterns and risk factors',
        priority: 'medium' as const,
        estimatedImpact: 'medium' as const,
        confidence: 0.7,
        timeframe: '6-8 weeks',
      });

      recommendations.push({
        id: 'monitoring-enhancement',
        type: 'preventive' as const,
        title: 'Enhance Real-Time Monitoring',
        description:
          'Implement advanced monitoring systems to detect early warning signs of potential failures',
        priority: 'low' as const,
        estimatedImpact: 'high' as const,
        confidence: 0.65,
        timeframe: '8-12 weeks',
      });

      return recommendations;
    } catch (error) {
      logger.error('Error generating predictive recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze incident patterns for recommendations
   */
  static analyzeIncidentPatterns(
    incidents: Array<Record<string, unknown> & { created_at: string }>
  ): IncidentPatterns {
    const patterns: IncidentPatterns = {
      highFrequencyPeriods: [],
      commonRootCauses: [],
      equipmentFailureRate: 0,
      responseTimeTrend: 1,
    };

    // Analyze time patterns
    const hourlyData: { [key: number]: number } = {};
    incidents.forEach((incident) => {
      const hour = new Date(incident.created_at as string).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    const avgHourlyRate = incidents.length / 24;
    for (const [hour, count] of Object.entries(hourlyData)) {
      if (count > avgHourlyRate * 1.5) {
        patterns.highFrequencyPeriods.push(`${hour}:00`);
      }
    }

    // Analyze root causes (simplified)
    // Removed root_cause_analysis filter since column doesn't exist
    const rootCauses: string[] = [];

    if (rootCauses.length > 0) {
      const causeCounts: { [key: string]: number } = {};
      rootCauses.forEach((cause) => {
        causeCounts[cause as string] = (causeCounts[cause as string] || 0) + 1;
      });

      patterns.commonRootCauses = Object.entries(causeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([cause]) => cause);
    }

    // Calculate equipment failure rate
    const equipmentFailures = incidents.filter(
      (i) => i.incident_type === 'equipment_failure'
    );
    patterns.equipmentFailureRate = equipmentFailures.length / incidents.length;

    // Calculate response time trend
    const recentIncidents = incidents.filter(
      (i) =>
        new Date(i.created_at as string) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const earlierIncidents = incidents.filter(
      (i) =>
        new Date(i.created_at as string) >
          new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
        new Date(i.created_at as string) <=
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (earlierIncidents.length > 0) {
      patterns.responseTimeTrend =
        recentIncidents.length / earlierIncidents.length;
    }

    return patterns;
  }

  /**
   * Generate recommendations based on risk level
   */
  static generateRiskBasedRecommendations(
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): PredictiveRecommendation[] {
    const recommendations: PredictiveRecommendation[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push({
          id: 'immediate-action',
          type: 'reactive' as const,
          title: 'Immediate Action Required',
          description:
            'Critical risk level detected. Implement immediate corrective actions and emergency protocols.',
          priority: 'critical' as const,
          estimatedImpact: 'high' as const,
          confidence: 0.95,
          timeframe: 'Immediate',
        });
        recommendations.push({
          id: 'management-review',
          type: 'reactive' as const,
          title: 'Management Review Required',
          description:
            'Schedule immediate management review of all processes and procedures.',
          priority: 'critical' as const,
          estimatedImpact: 'high' as const,
          confidence: 0.9,
          timeframe: '1-2 days',
        });
        break;

      case 'high':
        recommendations.push({
          id: 'enhanced-monitoring',
          type: 'preventive' as const,
          title: 'Enhanced Monitoring Protocol',
          description:
            'Implement enhanced monitoring and frequent status checks.',
          priority: 'high' as const,
          estimatedImpact: 'high' as const,
          confidence: 0.85,
          timeframe: '1-2 weeks',
        });
        break;

      case 'medium':
        recommendations.push({
          id: 'standard-review',
          type: 'preventive' as const,
          title: 'Standard Review Process',
          description:
            'Conduct standard review of processes and implement preventive measures.',
          priority: 'medium' as const,
          estimatedImpact: 'medium' as const,
          confidence: 0.75,
          timeframe: '2-4 weeks',
        });
        break;

      case 'low':
        recommendations.push({
          id: 'maintenance-schedule',
          type: 'preventive' as const,
          title: 'Maintain Current Standards',
          description:
            'Continue current preventive maintenance schedule and monitoring.',
          priority: 'low' as const,
          estimatedImpact: 'low' as const,
          confidence: 0.7,
          timeframe: '4-6 weeks',
        });
        break;
    }

    return recommendations;
  }
}
