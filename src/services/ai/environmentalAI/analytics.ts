import { supabase } from '../../../lib/supabaseClient';
import type {
  EnvironmentalAIInsight,
  HistoricalCleaningData,
  EnvironmentalCleaningCostData,
  ResourceUsage,
} from './types';

// Database row interfaces
interface _PredictiveCleaningRow {
  id: string;
  facility_id: string;
  room_id: string;
  cleaning_type: string;
  predicted_cleaning_date: string;
  confidence_score: number;
  optimization_suggestions: string[];
  urgency_level: string;
  created_at: string;
}

interface _ContaminationPredictionRow {
  id: string;
  facility_id: string;
  room_id: string;
  contamination_probability: number;
  predicted_contamination_type: string;
  confidence_score: number;
  prevention_measures: string[];
  created_at: string;
}

interface _ResourceOptimizationRow {
  id: string;
  facility_id: string;
  savings_percentage: number;
  optimization_type: string;
  confidence_score: number;
  recommended_actions: string[];
  created_at: string;
}

interface _AnomalyDetectionRow {
  id: string;
  facility_id: string;
  room_id?: string;
  anomaly_type: string;
  description: string;
  confidence_score: number;
  recommended_actions: string[];
  severity: string;
  created_at: string;
}

interface CleaningSessionRow {
  id: string;
  facility_id: string;
  room_id: string;
  session_type: string;
  duration_minutes: number;
  cleaning_quality_score: number;
  resources_used: ResourceUsage;
  created_at: string;
}

interface _CostAnalysisRow {
  id: string;
  facility_id: string;
  staff_costs: number;
  supply_costs: number;
  equipment_costs: number;
  utility_costs: number;
  total_cost: number;
  created_at: string;
}

export class EnvironmentalAIAnalyticsService {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Get AI insights for environmental cleaning
  async getEnvironmentalInsights(): Promise<EnvironmentalAIInsight[]> {
    try {
      // TODO: Implement when environmental AI tables are created
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting environmental insights:', error);
      return [];
    }
  }

  // Get historical cleaning data for analytics
  async getHistoricalCleaningData(): Promise<HistoricalCleaningData[]> {
    try {
      // Use existing environmental_cleans_enhanced table
      const { data } = await supabase
        .from('environmental_cleans_enhanced')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (data) {
        return data.map((item: CleaningSessionRow) => ({
          date: item.created_at,
          room_id: item.room_id,
          cleaning_type: item.cleaning_type || 'routine',
          duration: this.calculateDuration(
            item.started_time,
            item.completed_time
          ),
          quality_score: item.quality_score || 0.8,
          resources_used: {
            cleaning_supplies: 5,
            staff_hours: 1,
            equipment_usage: 1,
            water_usage: 20,
            energy_consumption: 10,
          },
        }));
      }

      return [];
    } catch (error) {
      console.error('Error getting historical cleaning data:', error);
      return [];
    }
  }

  private calculateDuration(
    startTime: string | null,
    endTime: string | null
  ): number {
    if (!startTime || !endTime) return 30; // Default 30 minutes

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(Math.floor(diffMs / (1000 * 60)), 1); // Convert to minutes, minimum 1
  }

  // Get environmental cleaning cost data for analytics
  async getEnvironmentalCleaningCostData(): Promise<EnvironmentalCleaningCostData> {
    try {
      // TODO: Implement when environmental_cleaning_costs table is created
      // For now, return mock data
      return {
        staff_costs: 12000,
        supply_costs: 3000,
        equipment_costs: 2000,
        utility_costs: 1500,
        total_cost: 18500,
      };
    } catch (error) {
      console.error('Error getting environmental cleaning cost data:', error);
      return {
        staff_costs: 12000,
        supply_costs: 3000,
        equipment_costs: 2000,
        utility_costs: 1500,
        total_cost: 18500,
      };
    }
  }

  // Pure helper functions for analytics calculations
  calculateCleaningEfficiency(
    qualityScore: number,
    duration: number,
    resourcesUsed: Record<string, unknown>
  ): number {
    // Efficiency = Quality Score / (Duration * Resource Usage Factor)
    const resourceFactor = this.calculateResourceUsageFactor(resourcesUsed);
    const efficiency = qualityScore / (duration * resourceFactor);
    return Math.min(efficiency, 1.0); // Cap at 1.0
  }

  calculateResourceUsageFactor(resourcesUsed: Record<string, unknown>): number {
    const staffHours = (resourcesUsed.staff_hours as number) || 1;
    const supplyUsage = (resourcesUsed.cleaning_supplies as number) || 1;
    const equipmentUsage = (resourcesUsed.equipment_usage as number) || 1;

    // Normalize and combine resource usage
    return (staffHours * 0.4 + supplyUsage * 0.3 + equipmentUsage * 0.3) / 10;
  }

  calculateContaminationRisk(
    roomType: string,
    usageLevel: number,
    lastCleaned: string,
    environmentalFactors: Record<string, unknown>
  ): number {
    const daysSinceCleaning =
      (Date.now() - new Date(lastCleaned).getTime()) / (1000 * 60 * 60 * 24);

    let baseRisk = 0.1; // Base risk level

    // Room type risk factors
    const roomTypeRisk: Record<string, number> = {
      operating_room: 0.3,
      icu: 0.25,
      patient_room: 0.15,
      common_area: 0.1,
      storage: 0.05,
    };
    baseRisk += roomTypeRisk[roomType] || 0.1;

    // Usage level factor
    baseRisk += usageLevel * 0.2;

    // Time since cleaning factor
    if (daysSinceCleaning > 7) baseRisk += 0.3;
    else if (daysSinceCleaning > 3) baseRisk += 0.15;

    // Environmental factors
    const humidity = (environmentalFactors.humidity as number) || 50;
    const temperature = (environmentalFactors.temperature as number) || 20;

    if (humidity > 70) baseRisk += 0.1;
    if (temperature > 25) baseRisk += 0.05;

    return Math.min(baseRisk, 1.0);
  }

  calculateCostSavings(
    currentCost: number,
    optimizedCost: number
  ): { savings: number; percentage: number } {
    const savings = currentCost - optimizedCost;
    const percentage = (savings / currentCost) * 100;
    return { savings, percentage };
  }

  calculateQualityTrend(
    qualityScores: number[]
  ): 'improving' | 'stable' | 'declining' {
    if (qualityScores.length < 2) return 'stable';

    const recent = qualityScores.slice(0, Math.ceil(qualityScores.length / 2));
    const older = qualityScores.slice(Math.ceil(qualityScores.length / 2));

    const recentAvg =
      recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, score) => sum + score, 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'declining';
    return 'stable';
  }

  calculateResourceEfficiency(
    currentUsage: Record<string, number>,
    optimizedUsage: Record<string, number>
  ): number {
    const currentTotal = Object.values(currentUsage).reduce(
      (sum, value) => sum + value,
      0
    );
    const optimizedTotal = Object.values(optimizedUsage).reduce(
      (sum, value) => sum + value,
      0
    );

    if (currentTotal === 0) return 0;
    return ((currentTotal - optimizedTotal) / currentTotal) * 100;
  }

  detectAnomalies(
    data: number[],
    threshold: number = 2.0
  ): Array<{ index: number; value: number; deviation: number }> {
    if (data.length < 3) return [];

    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const variance =
      data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      data.length;
    const stdDev = Math.sqrt(variance);

    return data
      .map((value, index) => ({
        index,
        value,
        deviation: Math.abs(value - mean) / stdDev,
      }))
      .filter((item) => item.deviation > threshold);
  }

  // Helper methods for priority determination
  private getPriorityFromUrgency(
    urgency: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (urgency) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }

  private getPriorityFromProbability(
    probability: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (probability >= 0.8) return 'critical';
    if (probability >= 0.6) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  private getPriorityFromSavings(
    savingsPercentage: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (savingsPercentage >= 30) return 'critical';
    if (savingsPercentage >= 20) return 'high';
    if (savingsPercentage >= 10) return 'medium';
    return 'low';
  }

  private getPriorityFromSeverity(
    severity: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }
}
