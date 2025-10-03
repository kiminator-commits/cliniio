import { supabase } from '../../../../../lib/supabaseClient';
import { logger } from '../../../../../utils/_core/logger';
import { BIPredictionProvider } from './BIPredictionProvider';

export interface TrendAnalysis {
  incidentTrend: 'decreasing' | 'stable' | 'increasing';
  riskTrend: 'decreasing' | 'stable' | 'increasing';
  confidence: number;
  nextWeekPrediction: number;
  nextMonthPrediction: number;
}

export interface BIIncident {
  created_at: string;
  severity?: string;
  category?: string;
  [key: string]: unknown;
}

export class BITrendAnalysisProvider {
  /**
   * Analyze trends for a facility
   */
  static async analyzeTrends(facilityId: string): Promise<TrendAnalysis> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        ); // Last 6 months

      if (error) throw error;

      if (!incidents || incidents.length === 0) {
        return {
          incidentTrend: 'stable' as const,
          riskTrend: 'stable' as const,
          confidence: 0.9,
          nextWeekPrediction: 0,
          nextMonthPrediction: 0,
        };
      }

      const monthlyData = BIPredictionProvider.groupIncidentsByMonth(
        incidents as Array<Record<string, unknown> & { created_at: string }>
      );
      const incidentTrend = this.determineTrend(monthlyData);
      const riskTrend = this.determineRiskTrend(
        incidents as Array<Record<string, unknown> & { created_at: string }>
      );
      const nextWeekPrediction = await BIPredictionProvider.predictNextWeek(facilityId);
      const nextMonthPrediction = await BIPredictionProvider.predictNextMonth(facilityId);

      // Calculate confidence based on data consistency
      const confidence = this.calculateTrendConfidence(monthlyData);

      return {
        incidentTrend,
        riskTrend,
        confidence,
        nextWeekPrediction,
        nextMonthPrediction,
      };
    } catch (error) {
      logger.error('Error analyzing trends:', error);
      return {
        incidentTrend: 'stable' as const,
        riskTrend: 'stable' as const,
        confidence: 0.5,
        nextWeekPrediction: 0,
        nextMonthPrediction: 0,
      };
    }
  }

  /**
   * Determine incident trend from monthly data
   */
  static determineTrend(monthlyData: {
    [key: string]: number;
  }): 'decreasing' | 'stable' | 'increasing' {
    const months = Object.keys(monthlyData).sort();
    const counts = months.map((month) => monthlyData[month]);

    if (counts.length < 2) return 'stable';

    const recent = counts.slice(-3);
    const earlier = counts.slice(0, 3);

    const recentAvg =
      recent.reduce((sum, count) => sum + count, 0) / recent.length;
    const earlierAvg =
      earlier.reduce((sum, count) => sum + count, 0) / earlier.length;

    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Determine risk trend from incident data
   */
  static determineRiskTrend(
    incidents: BIIncident[]
  ): 'decreasing' | 'stable' | 'increasing' {
    // Simplified risk trend calculation
    const recent = incidents.filter(
      (i) =>
        new Date(i.created_at as string) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const earlier = incidents.filter(
      (i) =>
        new Date(i.created_at as string) >
          new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
        new Date(i.created_at as string) <=
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (recent.length > earlier.length * 1.2) return 'increasing';
    if (recent.length < earlier.length * 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate trend confidence based on data consistency
   */
  static calculateTrendConfidence(monthlyData: {
    [key: string]: number;
  }): number {
    const counts = Object.values(monthlyData);
    if (counts.length < 2) return 0.5;

    // Calculate variance to determine confidence
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance =
      counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) /
      counts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Higher confidence for more consistent data
    return Math.max(0.3, Math.min(0.95, 1 - coefficientOfVariation));
  }

  /**
   * Analyze trend patterns over different time periods
   */
  static async analyzeTrendPatterns(facilityId: string): Promise<{
    weeklyTrend: 'decreasing' | 'stable' | 'increasing';
    monthlyTrend: 'decreasing' | 'stable' | 'increasing';
    quarterlyTrend: 'decreasing' | 'stable' | 'increasing';
    confidence: number;
  }> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        ); // Last year

      if (error) throw error;

      if (!incidents || incidents.length === 0) {
        return {
          weeklyTrend: 'stable' as const,
          monthlyTrend: 'stable' as const,
          quarterlyTrend: 'stable' as const,
          confidence: 0.5,
        };
      }

      // Analyze weekly trend (last 8 weeks vs previous 8 weeks)
      const weeklyTrend = this.analyzeWeeklyTrend(incidents as Array<Record<string, unknown> & { created_at: string }>);
      
      // Analyze monthly trend (last 3 months vs previous 3 months)
      const monthlyTrend = this.analyzeMonthlyTrend(incidents as Array<Record<string, unknown> & { created_at: string }>);
      
      // Analyze quarterly trend (last quarter vs previous quarter)
      const quarterlyTrend = this.analyzeQuarterlyTrend(incidents as Array<Record<string, unknown> & { created_at: string }>);

      // Calculate overall confidence
      const confidence = this.calculatePatternConfidence(weeklyTrend, monthlyTrend, quarterlyTrend);

      return {
        weeklyTrend,
        monthlyTrend,
        quarterlyTrend,
        confidence,
      };
    } catch (error) {
      logger.error('Error analyzing trend patterns:', error);
      return {
        weeklyTrend: 'stable' as const,
        monthlyTrend: 'stable' as const,
        quarterlyTrend: 'stable' as const,
        confidence: 0.5,
      };
    }
  }

  /**
   * Analyze weekly trend
   */
  private static analyzeWeeklyTrend(incidents: Array<Record<string, unknown> & { created_at: string }>): 'decreasing' | 'stable' | 'increasing' {
    const now = Date.now();
    const recent = incidents.filter(
      (i) => new Date(i.created_at as string) > new Date(now - 8 * 7 * 24 * 60 * 60 * 1000)
    );
    const earlier = incidents.filter(
      (i) => {
        const date = new Date(i.created_at as string);
        return date > new Date(now - 16 * 7 * 24 * 60 * 60 * 1000) && 
               date <= new Date(now - 8 * 7 * 24 * 60 * 60 * 1000);
      }
    );

    if (recent.length > earlier.length * 1.2) return 'increasing';
    if (recent.length < earlier.length * 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Analyze monthly trend
   */
  private static analyzeMonthlyTrend(incidents: Array<Record<string, unknown> & { created_at: string }>): 'decreasing' | 'stable' | 'increasing' {
    const now = Date.now();
    const recent = incidents.filter(
      (i) => new Date(i.created_at as string) > new Date(now - 3 * 30 * 24 * 60 * 60 * 1000)
    );
    const earlier = incidents.filter(
      (i) => {
        const date = new Date(i.created_at as string);
        return date > new Date(now - 6 * 30 * 24 * 60 * 60 * 1000) && 
               date <= new Date(now - 3 * 30 * 24 * 60 * 60 * 1000);
      }
    );

    if (recent.length > earlier.length * 1.2) return 'increasing';
    if (recent.length < earlier.length * 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Analyze quarterly trend
   */
  private static analyzeQuarterlyTrend(incidents: Array<Record<string, unknown> & { created_at: string }>): 'decreasing' | 'stable' | 'increasing' {
    const now = Date.now();
    const recent = incidents.filter(
      (i) => new Date(i.created_at as string) > new Date(now - 3 * 90 * 24 * 60 * 60 * 1000)
    );
    const earlier = incidents.filter(
      (i) => {
        const date = new Date(i.created_at as string);
        return date > new Date(now - 6 * 90 * 24 * 60 * 60 * 1000) && 
               date <= new Date(now - 3 * 90 * 24 * 60 * 60 * 1000);
      }
    );

    if (recent.length > earlier.length * 1.2) return 'increasing';
    if (recent.length < earlier.length * 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate pattern confidence
   */
  private static calculatePatternConfidence(
    weeklyTrend: 'decreasing' | 'stable' | 'increasing',
    monthlyTrend: 'decreasing' | 'stable' | 'increasing',
    quarterlyTrend: 'decreasing' | 'stable' | 'increasing'
  ): number {
    // Higher confidence when trends are consistent across time periods
    const trends = [weeklyTrend, monthlyTrend, quarterlyTrend];
    const uniqueTrends = new Set(trends).size;
    
    // Lower confidence for inconsistent trends
    if (uniqueTrends === 1) return 0.9; // All trends are the same
    if (uniqueTrends === 2) return 0.7; // Two different trends
    return 0.5; // All trends are different
  }
}
