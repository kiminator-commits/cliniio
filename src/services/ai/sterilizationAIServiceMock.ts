/**
 * @deprecated This mock service is deprecated and will be removed
 * Use the real SterilizationAIService from '@/services/ai/sterilization/sterilizationAIService' instead
 *
 * Mock service for SterilizationAIService to resolve import issues
 */
export class SterilizationAIService {
  static async getInsights() {
    console.warn(
      'SterilizationAIService mock is deprecated. Use the real SterilizationAIService instead.'
    );
    return [];
  }

  static async getPredictiveAnalytics() {
    return null;
  }

  static async getRealTimeInsights() {
    return [];
  }

  static async getHistoricalTrends() {
    return {
      success: true,
      trends: {
        efficiency: [],
        quality: [],
        duration: [],
        temperature: [],
      },
      insights: [],
      predictions: [],
    };
  }

  static async exportAnalyticsReport() {
    return {
      success: true,
      downloadUrl: 'mock-url',
      error: null,
    };
  }
}
