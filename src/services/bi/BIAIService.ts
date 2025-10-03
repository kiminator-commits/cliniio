import { supabase } from '../../lib/supabaseClient';

/**
 * BI AI Service
 * Handles all AI/ML integration operations for BI workflow
 */
export class BIAIService {
  /**
   * Get training data for AI models
   */
  static async getAITrainingData(
    facilityId: string,
    daysBack: number = 90
  ): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('bi_test_analytics')
      .select('*')
      .eq('facility_id', facilityId)
      .gte(
        'test_date',
        new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('test_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch AI training data: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get predictive analytics data
   */
  static async getPredictiveAnalyticsData(
    facilityId: string
  ): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select(
        `
        *,
        sterilization_cycles(cycle_parameters, environmental_factors),
        operators(performance_metrics)
      `
      )
      .eq('facility_id', facilityId)
      .order('test_date', { ascending: false })
      .limit(1000);

    if (error) {
      throw new Error(
        `Failed to fetch predictive analytics data: ${error.message}`
      );
    }

    return data || [];
  }
}
