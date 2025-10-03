import type {
  AIForecastResult,
  DemandForecastingResult,
  HistoricalInventoryData,
} from './types';

export class InventoryForecastingService {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Generate demand forecast
  async generateDemandForecast(
    itemId: string,
    period: 'week' | 'month' | 'quarter' | 'year',
    historicalData?: HistoricalInventoryData[]
  ): Promise<DemandForecastingResult> {
    try {
      const startTime = Date.now();

      // Get historical data if not provided
      const data = historicalData || (await this.getHistoricalInventoryData());

      // Generate forecast using AI
      const forecast = await this.generateForecastWithAI(data, period);

      const processingTime = Date.now() - startTime;

      // Create result object
      const result: Partial<DemandForecastingResult> = {
        facility_id: this.facilityId,
        inventory_item_id: itemId,
        forecast_period: period,
        forecast_date: new Date().toISOString().split('T')[0],
        predicted_demand: forecast.predicted_demand,
        confidence_interval_lower: forecast.confidence_interval_lower,
        confidence_interval_upper: forecast.confidence_interval_upper,
        seasonal_factors: forecast.seasonal_factors,
        trend_analysis: forecast.trend_analysis,
        influencing_factors: forecast.influencing_factors,
        confidence_score: forecast.confidence_score,
        processing_time_ms: processingTime,
        historical_data_points: data.length,
        accuracy_metrics: forecast.accuracy_metrics,
        recommendations: forecast.recommendations,
      };

      return result as DemandForecastingResult;
    } catch (error) {
      console.error('Error generating demand forecast:', error);
      throw error;
    }
  }

  // Private helper methods
  private async generateForecastWithAI(
    historicalData: HistoricalInventoryData[],
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<AIForecastResult> {
    // This would integrate with OpenAI API for time series forecasting
    // For now, return mock data with deterministic defaults
    return {
      predicted_demand: this.calculateDeterministicForecast(
        historicalData,
        period
      ),
      confidence_interval_lower: this.calculateConfidenceInterval(
        historicalData,
        period,
        'lower'
      ),
      confidence_interval_upper: this.calculateConfidenceInterval(
        historicalData,
        period,
        'upper'
      ),
      seasonal_factors: this.analyzeSeasonality(historicalData),
      trend_analysis: this.detectTrendDirection(historicalData),
      influencing_factors: this.identifyInfluencingFactors(historicalData),
      confidence_score: this.calculateConfidenceScore(historicalData),
      accuracy_metrics: this.calculateAccuracyMetrics(historicalData),
      recommendations: this.generateRecommendations(historicalData, period),
    };
  }

  private async getHistoricalInventoryData(): Promise<
    HistoricalInventoryData[]
  > {
    // This would query the actual inventory transactions table
    // For now, return mock data
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      quantity: Math.floor(Math.random() * 20) + 10,
      transaction_type: 'usage',
    }));
  }

  // Deterministic forecasting calculations
  private calculateDeterministicForecast(
    historicalData: HistoricalInventoryData[],
    period: 'week' | 'month' | 'quarter' | 'year'
  ): number {
    if (historicalData.length === 0) return 0;

    const totalUsage = historicalData.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const averageDailyUsage = totalUsage / historicalData.length;

    // Convert to target period
    switch (period) {
      case 'week':
        return Math.ceil(averageDailyUsage * 7);
      case 'month':
        return Math.ceil(averageDailyUsage * 30);
      case 'quarter':
        return Math.ceil(averageDailyUsage * 90);
      case 'year':
        return Math.ceil(averageDailyUsage * 365);
      default:
        return Math.ceil(averageDailyUsage * 30);
    }
  }

  private calculateConfidenceInterval(
    historicalData: HistoricalInventoryData[],
    period: 'week' | 'month' | 'quarter' | 'year',
    bound: 'lower' | 'upper'
  ): number {
    if (historicalData.length === 0) return 0;

    const forecast = this.calculateDeterministicForecast(
      historicalData,
      period
    );
    const variance = this.calculateVariance(historicalData);
    const standardError = Math.sqrt(variance / historicalData.length);
    const confidenceMultiplier = 1.96; // 95% confidence interval

    if (bound === 'lower') {
      return Math.max(
        0,
        Math.ceil(forecast - confidenceMultiplier * standardError)
      );
    } else {
      return Math.ceil(forecast + confidenceMultiplier * standardError);
    }
  }

  private calculateVariance(historicalData: HistoricalInventoryData[]): number {
    if (historicalData.length <= 1) return 0;

    const values = historicalData.map((item) => item.quantity);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDifferences = values.map((val) => Math.pow(val - mean, 2));
    return (
      squaredDifferences.reduce((sum, val) => sum + val, 0) /
      (values.length - 1)
    );
  }

  private analyzeSeasonality(
    historicalData: HistoricalInventoryData[]
  ): Record<string, unknown> {
    if (historicalData.length < 7) {
      return { seasonality: 'insufficient_data', trend: 'unknown' };
    }

    // Simple seasonality detection based on weekly patterns
    const weeklyPatterns = this.groupByWeek(historicalData);
    const hasWeeklyPattern = this.detectWeeklyPattern(weeklyPatterns);

    return {
      seasonality: hasWeeklyPattern ? 'weekly' : 'none',
      trend: this.detectTrendDirection(historicalData),
      weekly_variance: this.calculateWeeklyVariance(weeklyPatterns),
    };
  }

  private groupByWeek(
    historicalData: HistoricalInventoryData[]
  ): Record<string, number[]> {
    const weeklyGroups: Record<string, number[]> = {};

    historicalData.forEach((item) => {
      const date = new Date(item.date);
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;

      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = [];
      }
      weeklyGroups[weekKey].push(item.quantity);
    });

    return weeklyGroups;
  }

  private detectWeeklyPattern(weeklyGroups: Record<string, number[]>): boolean {
    const weeks = Object.keys(weeklyGroups);
    if (weeks.length < 2) return false;

    // Check if there's consistent variation between weeks
    const weeklyAverages = weeks.map((week) => {
      const values = weeklyGroups[week];
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    const variance = this.calculateVariance(
      weeklyAverages.map((_, i) => ({
        quantity: weeklyAverages[i],
        date: new Date().toISOString(),
        transaction_type: 'usage' as const,
      }))
    );
    return variance > 5; // Threshold for detecting pattern
  }

  private detectTrendDirection(
    historicalData: HistoricalInventoryData[]
  ): string {
    if (historicalData.length < 2) return 'insufficient_data';

    const sortedData = [...historicalData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, item) => sum + item.quantity, 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, item) => sum + item.quantity, 0) /
      secondHalf.length;

    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  private calculateWeeklyVariance(
    weeklyGroups: Record<string, number[]>
  ): number {
    const weeklyAverages = Object.values(weeklyGroups).map(
      (values) => values.reduce((sum, val) => sum + val, 0) / values.length
    );

    if (weeklyAverages.length <= 1) return 0;

    const mean =
      weeklyAverages.reduce((sum, val) => sum + val, 0) / weeklyAverages.length;
    const squaredDifferences = weeklyAverages.map((val) =>
      Math.pow(val - mean, 2)
    );
    return (
      squaredDifferences.reduce((sum, val) => sum + val, 0) /
      (weeklyAverages.length - 1)
    );
  }

  private identifyInfluencingFactors(
    historicalData: HistoricalInventoryData[]
  ): string[] {
    const factors: string[] = [];

    if (historicalData.length > 0) {
      const trend = this.detectTrendDirection(historicalData);
      if (trend === 'increasing') factors.push('increased_procedures');
      if (trend === 'decreasing') factors.push('reduced_activity');

      const seasonality = this.analyzeSeasonality(historicalData);
      if (seasonality.seasonality === 'weekly')
        factors.push('weekly_usage_patterns');
    }

    return factors.length > 0 ? factors : ['stable_usage_patterns'];
  }

  private calculateConfidenceScore(
    historicalData: HistoricalInventoryData[]
  ): number {
    if (historicalData.length === 0) return 0;
    if (historicalData.length < 7) return 0.5;
    if (historicalData.length < 14) return 0.7;
    if (historicalData.length < 30) return 0.8;
    return 0.85;
  }

  private calculateAccuracyMetrics(
    historicalData: HistoricalInventoryData[]
  ): Record<string, unknown> {
    if (historicalData.length < 2) return { mae: 0, rmse: 0 };

    // Simple accuracy metrics based on historical variance
    const variance = this.calculateVariance(historicalData);
    const mae = Math.sqrt(variance) * 0.8; // Mean Absolute Error approximation
    const rmse = Math.sqrt(variance); // Root Mean Square Error

    return {
      mae: Math.round(mae * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
    };
  }

  private generateRecommendations(
    historicalData: HistoricalInventoryData[],
    period: 'week' | 'month' | 'quarter' | 'year'
  ): string[] {
    const recommendations: string[] = [];

    if (historicalData.length < 7) {
      recommendations.push(
        'Collect more historical data for accurate forecasting'
      );
      return recommendations;
    }

    const trend = this.detectTrendDirection(historicalData);
    const forecast = this.calculateDeterministicForecast(
      historicalData,
      period
    );

    if (trend === 'increasing') {
      recommendations.push(
        `Consider increasing stock levels by 15% for ${period} period`
      );
    } else if (trend === 'decreasing') {
      recommendations.push(
        `Consider reducing stock levels by 10% for ${period} period`
      );
    }

    recommendations.push(`Monitor usage patterns ${period}ly`);
    recommendations.push(
      `Set reorder point at ${Math.ceil(forecast * 0.8)} units`
    );

    return recommendations;
  }
}
