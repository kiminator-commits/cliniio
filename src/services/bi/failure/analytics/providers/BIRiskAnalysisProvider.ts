import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/_core/logger';

export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
  currentValue: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}

export class BIRiskAnalysisProvider {
  /**
   * Calculate overall risk level for a facility
   */
  static async calculateRiskLevel(
    facilityId: string
  ): Promise<'low' | 'medium' | 'high' | 'critical'> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        ); // Last 90 days

      if (error) throw error;

      if (!incidents || incidents.length === 0) return 'low';

      // Calculate risk score based on multiple factors
      let riskScore = 0;
      const totalIncidents = incidents.length;

      // Factor 1: Incident frequency (30% weight)
      const dailyIncidentRate = totalIncidents / 90;
      if (dailyIncidentRate > 0.5) riskScore += 30;
      else if (dailyIncidentRate > 0.2) riskScore += 20;
      else if (dailyIncidentRate > 0.1) riskScore += 10;

      // Factor 2: Severity distribution (25% weight)
      const criticalIncidents = incidents.filter(
        (i) => i.severity === 'critical'
      ).length;
      const highIncidents = incidents.filter(
        (i) => i.severity === 'high'
      ).length;
      const severityScore =
        (criticalIncidents * 3 + highIncidents * 2) / totalIncidents;
      if (severityScore > 0.5) riskScore += 25;
      else if (severityScore > 0.3) riskScore += 15;
      else if (severityScore > 0.1) riskScore += 10;

      // Factor 3: Resolution time (20% weight)
      const unresolvedIncidents = incidents.filter(
        (i) => i.status !== 'resolved'
      ).length;
      const resolutionRate =
        (totalIncidents - unresolvedIncidents) / totalIncidents;
      if (resolutionRate < 0.7) riskScore += 20;
      else if (resolutionRate < 0.85) riskScore += 15;
      else if (resolutionRate < 0.95) riskScore += 10;

      // Factor 4: Recent trend (15% weight)
      const recentIncidents = incidents.filter(
        (i) =>
          new Date(i.created_at as string) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;
      const trendScore =
        recentIncidents / Math.max(1, totalIncidents - recentIncidents);
      if (trendScore > 1.5) riskScore += 15;
      else if (trendScore > 1.2) riskScore += 10;
      else if (trendScore > 1.0) riskScore += 5;

      // Factor 5: Compliance score (10% weight)
      const complianceScore = await this.getComplianceScore(facilityId);
      if (complianceScore < 70) riskScore += 10;
      else if (complianceScore < 85) riskScore += 5;

      // Determine risk level based on total score
      if (riskScore >= 80) return 'critical';
      if (riskScore >= 60) return 'high';
      if (riskScore >= 40) return 'medium';
      return 'low';
    } catch (error) {
      logger.error('Error calculating risk level:', error);
      return 'medium';
    }
  }

  /**
   * Analyze risk factors for a facility
   */
  static async analyzeRiskFactors(facilityId: string): Promise<RiskFactor[]> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      const riskFactors: RiskFactor[] = [];

      if (incidents && incidents.length > 0) {
        // Incident frequency factor
        const dailyRate = incidents.length / 90;
        riskFactors.push({
          factor: 'Daily Incident Rate',
          weight: 0.3,
          description: 'Average incidents per day',
          currentValue: dailyRate,
          threshold: 0.3,
          status:
            dailyRate > 0.3
              ? ('critical' as const)
              : dailyRate > 0.2
                ? ('warning' as const)
                : ('normal' as const),
        });

        // Severity factor
        const criticalRate =
          incidents.filter((i) => i.severity === 'critical').length /
          incidents.length;
        riskFactors.push({
          factor: 'Critical Incident Rate',
          weight: 0.25,
          description: 'Percentage of critical severity incidents',
          currentValue: criticalRate * 100,
          threshold: 20,
          status:
            criticalRate > 0.2
              ? ('critical' as const)
              : criticalRate > 0.1
                ? ('warning' as const)
                : ('normal' as const),
        });

        // Resolution time factor
        const avgResolutionTime = this.calculateAverageResolutionTime(
          incidents as Array<Record<string, unknown> & { created_at: string }>
        );
        riskFactors.push({
          factor: 'Average Resolution Time',
          weight: 0.2,
          description: 'Average time to resolve incidents (hours)',
          currentValue: avgResolutionTime,
          threshold: 48,
          status:
            avgResolutionTime > 48
              ? ('critical' as const)
              : avgResolutionTime > 24
                ? ('warning' as const)
                : ('normal' as const),
        });

        // Unresolved factor
        const unresolvedRate =
          incidents.filter((i) => i.status !== 'resolved').length /
          incidents.length;
        riskFactors.push({
          factor: 'Unresolved Incident Rate',
          weight: 0.15,
          description: 'Percentage of unresolved incidents',
          currentValue: unresolvedRate * 100,
          threshold: 15,
          status:
            unresolvedRate > 0.15
              ? ('critical' as const)
              : unresolvedRate > 0.1
                ? ('warning' as const)
                : ('normal' as const),
        });

        // Compliance factor
        const complianceScore = await this.getComplianceScore(facilityId);
        riskFactors.push({
          factor: 'Compliance Score',
          weight: 0.1,
          description: 'Overall compliance percentage',
          currentValue: complianceScore,
          threshold: 85,
          status:
            complianceScore < 85
              ? ('critical' as const)
              : complianceScore < 90
                ? ('warning' as const)
                : ('normal' as const),
        });
      }

      return riskFactors;
    } catch (error) {
      logger.error('Error analyzing risk factors:', error);
      return [];
    }
  }

  /**
   * Get compliance score for a facility
   */
  private static async getComplianceScore(facilityId: string): Promise<number> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      if (!incidents || incidents.length === 0) return 100;

      const resolvedCount = incidents.filter(
        (i) => i.status === 'resolved'
      ).length;
      return Math.round((resolvedCount / incidents.length) * 100);
    } catch (error) {
      logger.error('Error getting compliance score:', error);
      return 0;
    }
  }

  /**
   * Calculate average resolution time for incidents
   */
  private static calculateAverageResolutionTime(
    incidents: Array<Record<string, unknown> & { created_at: string }>
  ): number {
    const resolvedIncidents = incidents.filter((i) => i.resolved_at);
    if (resolvedIncidents.length === 0) return 0;

    const totalTime = resolvedIncidents.reduce((sum, incident) => {
      return (
        sum +
        (new Date(incident.resolved_at as string).getTime() -
          new Date(incident.created_at as string).getTime())
      );
    }, 0);

    return totalTime / resolvedIncidents.length / (1000 * 60 * 60); // Convert to hours
  }
}
