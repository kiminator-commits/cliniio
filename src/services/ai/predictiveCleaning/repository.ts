import { supabase } from '../../../lib/supabase';
import type {
  CleaningPattern,
  RoomUsagePattern,
  CleaningPrediction,
} from './types';

// Database row interfaces
interface CleaningPatternRow {
  id: string;
  room_id: string;
  facility_id: string;
  cleaning_date: string;
  cleaning_duration_minutes: number;
  contamination_level: 'low' | 'medium' | 'high' | 'critical';
  foot_traffic_level: 'low' | 'medium' | 'high';
  cleaning_type: 'routine' | 'deep' | 'emergency' | 'post_procedure';
  supplies_used: string[];
  staff_assigned: string;
  quality_score: number;
}

interface RoomUsagePatternRow {
  id: string;
  room_id: string;
  facility_id: string;
  usage_date: string;
  usage_hours: number;
  patient_count: number;
  procedure_type: string;
  contamination_risk: 'low' | 'medium' | 'high' | 'critical';
  special_requirements: string[];
}

interface CleaningPredictionRow {
  id: string;
  room_id: string;
  facility_id: string;
  prediction_date: string;
  predicted_cleaning_date: string;
  confidence_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  predicted_duration_minutes: number;
  predicted_contamination_level: 'low' | 'medium' | 'high' | 'critical';
  predicted_supplies_needed: string[];
  recommended_staff_count: number;
  risk_factors: string[];
  ai_model_version: string;
  expires_at: string;
}

interface ModelPerformanceRow {
  model_name: string;
  model_version: string;
  prediction_date: string;
  actual_cleaning_date: string;
  prediction_accuracy: number;
  model_confidence: number;
}

/**
 * Get historical cleaning patterns for AI analysis
 */
export async function getCleaningPatterns(
  facilityId: string
): Promise<CleaningPattern[]> {
  try {
    const { data, error } = await supabase
      .from('environmental_cleaning_patterns')
      .select('*')
      .eq('facility_id', facilityId)
      .gte(
        'cleaning_date',
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      )
      .order('cleaning_date', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((pattern: CleaningPatternRow) => ({
      id: pattern.id,
      roomId: pattern.room_id,
      facilityId: pattern.facility_id,
      cleaningDate: pattern.cleaning_date,
      cleaningDurationMinutes: pattern.cleaning_duration_minutes,
      contaminationLevel: pattern.contamination_level,
      footTrafficLevel: pattern.foot_traffic_level,
      cleaningType: pattern.cleaning_type,
      suppliesUsed: pattern.supplies_used || [],
      staffAssigned: pattern.staff_assigned,
      qualityScore: pattern.quality_score,
    }));
  } catch (error) {
    console.error('❌ Error fetching cleaning patterns:', error);
    return [];
  }
}

/**
 * Get room usage patterns for contamination risk assessment
 */
export async function getRoomUsagePatterns(
  facilityId: string
): Promise<RoomUsagePattern[]> {
  try {
    const { data, error } = await supabase
      .from('environmental_room_usage_patterns')
      .select('*')
      .eq('facility_id', facilityId)
      .gte(
        'usage_date',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      )
      .order('usage_date', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((usage: RoomUsagePatternRow) => ({
      id: usage.id,
      roomId: usage.room_id,
      facilityId: usage.facility_id,
      usageDate: usage.usage_date,
      usageHours: usage.usage_hours,
      patientCount: usage.patient_count,
      procedureType: usage.procedure_type,
      contaminationRisk: usage.contamination_risk,
      specialRequirements: usage.special_requirements || [],
    }));
  } catch (error) {
    console.error('❌ Error fetching room usage patterns:', error);
    return [];
  }
}

/**
 * Store AI prediction in database
 */
export async function storePrediction(
  prediction: CleaningPrediction
): Promise<void> {
  try {
    const predictionData: Omit<CleaningPredictionRow, 'id'> = {
      room_id: prediction.roomId,
      facility_id: prediction.facilityId,
      prediction_date: prediction.predictionDate,
      predicted_cleaning_date: prediction.predictedCleaningDate,
      confidence_score: prediction.confidenceScore,
      urgency_level: prediction.urgencyLevel,
      predicted_duration_minutes: prediction.predictedDurationMinutes,
      predicted_contamination_level: prediction.predictedContaminationLevel,
      predicted_supplies_needed: prediction.predictedSuppliesNeeded,
      recommended_staff_count: prediction.recommendedStaffCount,
      risk_factors: prediction.riskFactors,
      ai_model_version: prediction.aiModelVersion,
      expires_at: prediction.expiresAt,
    };

    const { error } = await supabase
      .from('environmental_cleaning_predictions')
      .insert(predictionData);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error storing prediction:', error);
  }
}

/**
 * Get active predictions for a facility
 */
export async function getActivePredictions(
  facilityId: string
): Promise<CleaningPrediction[]> {
  try {
    const { data, error } = await supabase
      .from('environmental_cleaning_predictions')
      .select('*')
      .eq('facility_id', facilityId)
      .gte('expires_at', new Date().toISOString())
      .order('predicted_cleaning_date', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((prediction: CleaningPredictionRow) => ({
      id: prediction.id,
      roomId: prediction.room_id,
      facilityId: prediction.facility_id,
      predictionDate: prediction.prediction_date,
      predictedCleaningDate: prediction.predicted_cleaning_date,
      confidenceScore: prediction.confidence_score,
      urgencyLevel: prediction.urgency_level,
      predictedDurationMinutes: prediction.predicted_duration_minutes,
      predictedContaminationLevel: prediction.predicted_contamination_level,
      predictedSuppliesNeeded: prediction.predicted_supplies_needed || [],
      recommendedStaffCount: prediction.recommended_staff_count,
      riskFactors: prediction.risk_factors || [],
      aiModelVersion: prediction.ai_model_version,
      expiresAt: prediction.expires_at,
    }));
  } catch (error) {
    console.error('❌ Error fetching active predictions:', error);
    return [];
  }
}

/**
 * Update prediction accuracy after cleaning completion
 */
export async function updatePredictionAccuracy(
  predictionId: string,
  actualCleaningDate: string,
  accuracy: number
): Promise<void> {
  try {
    const performanceData: ModelPerformanceRow = {
      model_name: 'predictive_cleaning',
      model_version: '1.0.0',
      prediction_date: new Date().toISOString().split('T')[0],
      actual_cleaning_date: actualCleaningDate,
      prediction_accuracy: accuracy,
      model_confidence: 0.8, // Default confidence
    };

    const { error } = await supabase
      .from('environmental_ai_model_performance')
      .insert(performanceData);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error updating prediction accuracy:', error);
  }
}
