import { supabase } from '@/lib/supabaseClient';

export const BIAnalyticsService = {
  async getBIPassRate(facilityId: string) {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select('id')
      .eq('facility_id', facilityId)
      .eq('result', 'pass');

    if (error) return { data: null, error };
    return { data: data.length, error: null };
  },

  async getBIPassRateAnalytics(facilityId: string) {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) return { data: null, error };

    const totalTests = data.length;
    const passedTests = data.filter(
      (result) => result.result === 'pass'
    ).length;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      data: {
        totalTests,
        passedTests,
        passRate,
        facilityId,
      },
      error: null,
    };
  },

  async getOperatorPerformance(facilityId: string, operatorId: string) {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('operator_id', operatorId);

    if (error) return { data: null, error };
    return { data, error: null };
  },

  async getBITestAnalytics(facilityId: string) {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) return { data: null, error };

    const analytics = {
      totalTests: data.length,
      passedTests: data.filter((result) => result.result === 'pass').length,
      failedTests: data.filter((result) => result.result === 'fail').length,
      facilityId,
    };

    return { data: analytics, error: null };
  },

  async getAITrainingData(facilityId: string) {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) return { data: null, error };

    // Format data for AI training using existing columns
    const trainingData = data.map((result) => ({
      id: result.id,
      facilityId: result.facility_id,
      operatorId: result.operator_id,
      result: result.result,
      timestamp: result.created_at,
      features: {
        incubationTemperature: result.incubation_temperature_celsius,
        incubationTime: result.incubation_time_minutes,
        testConditions: result.test_conditions,
        status: result.status,
      },
    }));

    return { data: trainingData, error: null };
  },

  async getPredictiveAnalyticsData(facilityId: string) {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false })
      .limit(100); // Get last 100 tests for analysis

    if (error) return { data: null, error };

    // Calculate predictive metrics
    const totalTests = data.length;
    const recentTests = data.slice(0, 30); // Last 30 tests
    const recentPassRate =
      recentTests.length > 0
        ? (recentTests.filter((t) => t.result === 'pass').length /
            recentTests.length) *
          100
        : 0;

    const predictiveData = {
      facilityId,
      totalTests,
      recentPassRate,
      trendAnalysis: {
        isImproving: recentPassRate > 80,
        riskLevel:
          recentPassRate < 70 ? 'high' : recentPassRate < 85 ? 'medium' : 'low',
      },
      recommendations:
        recentPassRate < 70
          ? [
              'Review sterilization procedures',
              'Check equipment calibration',
              'Retrain operators',
            ]
          : recentPassRate < 85
            ? ['Monitor trends closely', 'Consider preventive maintenance']
            : ['Maintain current procedures'],
    };

    return { data: predictiveData, error: null };
  },
};
