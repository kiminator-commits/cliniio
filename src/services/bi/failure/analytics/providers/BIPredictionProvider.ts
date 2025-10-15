import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/_core/logger';

export interface BIIncident {
  created_at: string;
  severity?: string;
  category?: string;
  [key: string]: unknown;
}

export class BIPredictionProvider {
  /**
   * Predict incident count for upcoming periods
   */
  static async predictIncidentCount(facilityId: string): Promise<number> {
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

      if (!incidents || incidents.length === 0) return 0;

      // Simple linear regression for prediction
      const monthlyData = this.groupIncidentsByMonth(
        incidents as Array<Record<string, unknown> & { created_at: string }>
      );
      const prediction = this.linearRegressionPrediction(monthlyData);

      return Math.max(0, Math.round(prediction));
    } catch (error) {
      logger.error('Error predicting incident count:', error);
      return 0;
    }
  }

  /**
   * Predict incidents for next week
   */
  static async predictNextWeek(facilityId: string): Promise<number> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      if (!incidents || incidents.length === 0) return 0;

      const monthlyData = this.groupIncidentsByMonth(
        incidents as Array<Record<string, unknown> & { created_at: string }>
      );
      const prediction = this.linearRegressionPrediction(monthlyData);
      return Math.max(0, Math.round(prediction / 4)); // Rough weekly estimate
    } catch (error) {
      logger.error('Error predicting next week:', error);
      return 0;
    }
  }

  /**
   * Predict incidents for next month
   */
  static async predictNextMonth(facilityId: string): Promise<number> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      if (!incidents || incidents.length === 0) return 0;

      const monthlyData = this.groupIncidentsByMonth(
        incidents as Array<Record<string, unknown> & { created_at: string }>
      );
      return Math.max(
        0,
        Math.round(this.linearRegressionPrediction(monthlyData))
      );
    } catch (error) {
      logger.error('Error predicting next month:', error);
      return 0;
    }
  }

  /**
   * Group incidents by month for analysis
   */
  static groupIncidentsByMonth(incidents: BIIncident[]): {
    [key: string]: number;
  } {
    const monthlyData: { [key: string]: number } = {};

    incidents.forEach((incident) => {
      const date = new Date(incident.created_at as string);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return monthlyData;
  }

  /**
   * Perform linear regression prediction
   */
  static linearRegressionPrediction(monthlyData: {
    [key: string]: number;
  }): number {
    const months = Object.keys(monthlyData).sort();
    const counts = months.map((month) => monthlyData[month]);

    if (counts.length < 2) return counts[0] || 0;

    // Simple linear regression
    const n = counts.length;
    const sumX = months.reduce((sum, _, i) => sum + i, 0);
    const sumY = counts.reduce((sum, count) => sum + count, 0);
    const sumXY = months.reduce((sum, _, i) => sum + i * counts[i], 0);
    const sumXX = months.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next month
    return slope * n + intercept;
  }

  /**
   * Calculate prediction confidence based on data quality
   */
  static calculatePredictionConfidence(monthlyData: {
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
}
