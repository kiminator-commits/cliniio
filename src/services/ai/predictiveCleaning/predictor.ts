import type {
  CleaningPattern,
  RoomUsagePattern,
  CleaningPrediction,
  PredictiveCleaningInsights,
} from './types';
import * as repository from './repository';
import * as features from './features';

/**
 * Generate comprehensive cleaning predictions for a facility
 */
export async function generateCleaningPredictions(
  facilityId: string
): Promise<PredictiveCleaningInsights> {
  try {
    // Get historical cleaning patterns
    const cleaningPatterns = await repository.getCleaningPatterns(facilityId);

    // Get room usage patterns
    const usagePatterns = await repository.getRoomUsagePatterns(facilityId);

    // Generate AI predictions
    const predictions = await generateAIPredictions(
      facilityId,
      cleaningPatterns,
      usagePatterns
    );

    // Calculate room efficiency metrics
    const roomEfficiency = calculateRoomEfficiency(
      cleaningPatterns,
      usagePatterns
    );

    // Optimize supply usage
    const supplyOptimization = optimizeSupplyUsage(cleaningPatterns);

    // Generate staffing recommendations
    const staffingRecommendations =
      generateStaffingRecommendations(predictions);

    // Assess overall risk
    const riskAssessment = assessOverallRisk(predictions, cleaningPatterns);

    // Calculate overall efficiency
    const overallEfficiency = calculateOverallEfficiency(cleaningPatterns);

    const insights: PredictiveCleaningInsights = {
      predictions,
      roomEfficiency,
      supplyOptimization,
      staffingRecommendations,
      overallEfficiency,
      riskAssessment,
    };

    return insights;
  } catch (error) {
    console.error('❌ Error generating cleaning predictions:', error);
    throw new Error('Failed to generate cleaning predictions');
  }
}

/**
 * Generate AI-powered cleaning predictions
 */
async function generateAIPredictions(
  facilityId: string,
  cleaningPatterns: CleaningPattern[],
  usagePatterns: RoomUsagePattern[]
): Promise<CleaningPrediction[]> {
  try {
    const predictions: CleaningPrediction[] = [];
    const rooms = features.getUniqueRooms(cleaningPatterns);

    for (const roomId of rooms) {
      const roomPatterns = cleaningPatterns.filter((p) => p.roomId === roomId);
      const roomUsage = usagePatterns.filter((u) => u.roomId === roomId);

      if (roomPatterns.length === 0) continue;

      const prediction = await predictRoomCleaning(
        roomId,
        facilityId,
        roomPatterns,
        roomUsage
      );

      if (prediction) {
        predictions.push(prediction);

        // Store prediction in database
        await repository.storePrediction(prediction);
      }
    }

    return predictions;
  } catch (error) {
    console.error('❌ Error generating AI predictions:', error);
    return [];
  }
}

/**
 * Predict when a specific room will need cleaning
 */
async function predictRoomCleaning(
  roomId: string,
  facilityId: string,
  patterns: CleaningPattern[],
  usage: RoomUsagePattern[]
): Promise<CleaningPrediction | null> {
  try {
    // Calculate average cleaning interval
    const cleaningIntervals = features.calculateCleaningIntervals(patterns);
    const avgInterval =
      cleaningIntervals.length > 0
        ? cleaningIntervals.reduce((sum, interval) => sum + interval, 0) /
          cleaningIntervals.length
        : 7; // Default to 7 days if no history

    // Assess contamination risk based on usage patterns
    const contaminationRisk = features.assessContaminationRisk(usage);

    // Calculate urgency level
    const urgencyLevel = features.calculateUrgencyLevel(
      patterns,
      contaminationRisk
    );

    // Predict next cleaning date
    const lastCleaning = patterns[0]?.cleaningDate;
    const nextCleaningDate = lastCleaning
      ? new Date(
          new Date(lastCleaning).getTime() + avgInterval * 24 * 60 * 60 * 1000
        )
      : new Date(Date.now() + avgInterval * 24 * 60 * 60 * 1000);

    // Calculate confidence score based on data quality
    const confidenceScore = features.calculateConfidenceScore(patterns, usage);

    // Predict cleaning duration
    const predictedDuration = features.predictCleaningDuration(
      patterns,
      contaminationRisk
    );

    // Predict supplies needed
    const predictedSupplies = features.predictSuppliesNeeded(
      patterns,
      contaminationRisk
    );

    // Calculate recommended staff count
    const recommendedStaff = features.calculateRecommendedStaff(
      predictedDuration,
      contaminationRisk
    );

    const prediction: CleaningPrediction = {
      id: crypto.randomUUID(),
      roomId,
      facilityId,
      predictionDate: new Date().toISOString().split('T')[0],
      predictedCleaningDate: nextCleaningDate.toISOString().split('T')[0],
      confidenceScore,
      urgencyLevel,
      predictedDurationMinutes: predictedDuration,
      predictedContaminationLevel: contaminationRisk,
      predictedSuppliesNeeded: predictedSupplies,
      recommendedStaffCount: recommendedStaff,
      riskFactors: features.identifyRiskFactors(patterns, usage),
      aiModelVersion: '1.0.0',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return prediction;
  } catch (error) {
    console.error('❌ Error predicting room cleaning:', error);
    return null;
  }
}

/**
 * Calculate room efficiency metrics
 */
function calculateRoomEfficiency(
  patterns: CleaningPattern[],
  usage: RoomUsagePattern[]
) {
  const rooms = features.getUniqueRooms(patterns);

  return rooms.map((roomId) => {
    const roomPatterns = patterns.filter((p) => p.roomId === roomId);
    const roomUsage = usage.filter((u) => u.roomId === roomId);

    const avgCleaningTime =
      roomPatterns.length > 0
        ? roomPatterns.reduce((sum, p) => sum + p.cleaningDurationMinutes, 0) /
          roomPatterns.length
        : 0;

    const contaminationTrend = features.analyzeCleaningTrends(roomPatterns);
    const recommendedFrequency = features.calculateRecommendedFrequency(
      roomPatterns,
      roomUsage
    );
    const riskScore = features.calculateRoomRiskScore(roomPatterns, roomUsage);

    return {
      roomId,
      averageCleaningTime: Math.round(avgCleaningTime),
      contaminationTrend,
      recommendedCleaningFrequency: recommendedFrequency,
      riskScore,
    };
  });
}

/**
 * Optimize supply usage based on patterns
 */
function optimizeSupplyUsage(patterns: CleaningPattern[]): Array<{
  supplyName: string;
  predictedUsage: number;
  recommendedStock: number;
  reorderPoint: number;
}> {
  const supplyUsage: Record<string, number[]> = {};

  patterns.forEach((pattern) => {
    pattern.suppliesUsed.forEach((supply) => {
      if (!supplyUsage[supply]) {
        supplyUsage[supply] = [];
      }
      supplyUsage[supply].push(1); // Count usage
    });
  });

  return Object.entries(supplyUsage).map(([supplyName, usage]) => {
    const totalUsage = usage.length;
    const predictedUsage = Math.ceil(totalUsage * 1.2); // 20% buffer
    const recommendedStock = Math.ceil(predictedUsage * 0.3); // 30% of monthly usage
    const reorderPoint = Math.ceil(recommendedStock * 0.2); // 20% of stock

    return {
      supplyName,
      predictedUsage,
      recommendedStock,
      reorderPoint,
    };
  });
}

/**
 * Generate staffing recommendations
 */
function generateStaffingRecommendations(predictions: CleaningPrediction[]) {
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const weekStart = new Date(
    nextWeek.getFullYear(),
    nextWeek.getMonth(),
    nextWeek.getDate() - nextWeek.getDay()
  );

  const dailyWorkload: Record<
    string,
    { staffCount: number; highPriorityRooms: string[]; workload: number }
  > = {};

  // Initialize daily workload
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    dailyWorkload[dateStr] = {
      staffCount: 0,
      highPriorityRooms: [],
      workload: 0,
    };
  }

  // Calculate daily workload based on predictions
  predictions.forEach((prediction) => {
    const predDate = new Date(prediction.predictedCleaningDate);
    const dateStr = predDate.toISOString().split('T')[0];

    if (dailyWorkload[dateStr]) {
      dailyWorkload[dateStr].staffCount += prediction.recommendedStaffCount;
      dailyWorkload[dateStr].workload += prediction.predictedDurationMinutes;

      if (
        prediction.urgencyLevel === 'high' ||
        prediction.urgencyLevel === 'critical'
      ) {
        dailyWorkload[dateStr].highPriorityRooms.push(prediction.roomId);
      }
    }
  });

  return Object.entries(dailyWorkload).map(([date, workload]) => ({
    date,
    recommendedStaffCount: Math.max(1, Math.ceil(workload.staffCount / 2)),
    highPriorityRooms: workload.highPriorityRooms,
    estimatedWorkload: workload.workload,
  }));
}

/**
 * Assess overall risk for the facility
 */
function assessOverallRisk(
  predictions: CleaningPrediction[],
  patterns: CleaningPattern[]
) {
  const highRiskRooms = predictions
    .filter((p) => p.urgencyLevel === 'high' || p.urgencyLevel === 'critical')
    .map((p) => p.roomId);

  const criticalContaminationAreas = predictions
    .filter((p) => p.predictedContaminationLevel === 'critical')
    .map((p) => p.roomId);

  const maintenanceAlerts = features.identifyMaintenanceAlerts(patterns);

  return {
    highRiskRooms: [...new Set(highRiskRooms)],
    criticalContaminationAreas: [...new Set(criticalContaminationAreas)],
    maintenanceAlerts,
  };
}

/**
 * Calculate overall efficiency score
 */
function calculateOverallEfficiency(patterns: CleaningPattern[]): number {
  if (patterns.length === 0) return 0;

  const avgQualityScore =
    patterns.reduce((sum, p) => sum + p.qualityScore, 0) / patterns.length;
  const avgDuration =
    patterns.reduce((sum, p) => sum + p.cleaningDurationMinutes, 0) /
    patterns.length;

  // Normalize duration (shorter = better, max 120 minutes)
  const durationScore = Math.max(0, (120 - avgDuration) / 120);

  // Quality score is already 0-10, normalize to 0-1
  const qualityScore = avgQualityScore / 10;

  // Weighted average: 60% quality, 40% efficiency
  return Math.round((qualityScore * 0.6 + durationScore * 0.4) * 100);
}
