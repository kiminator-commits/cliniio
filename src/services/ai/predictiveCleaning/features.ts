import type { CleaningPattern, RoomUsagePattern } from './types';

/**
 * Calculate cleaning intervals between cleanings
 */
export function calculateCleaningIntervals(
  patterns: CleaningPattern[]
): number[] {
  const intervals: number[] = [];

  for (let i = 1; i < patterns.length; i++) {
    const current = new Date(patterns[i - 1].cleaningDate);
    const previous = new Date(patterns[i].cleaningDate);
    const interval = Math.ceil(
      (current.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000)
    );
    intervals.push(interval);
  }

  return intervals;
}

/**
 * Assess contamination risk based on usage patterns
 */
export function assessContaminationRisk(
  usage: RoomUsagePattern[]
): 'low' | 'medium' | 'high' | 'critical' {
  if (usage.length === 0) return 'low';

  const riskScores = usage.map((u) => {
    switch (u.contaminationRisk) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      case 'critical':
        return 4;
      default:
        return 1;
    }
  });

  const avgRiskScore =
    riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;

  if (avgRiskScore >= 3.5) return 'critical';
  if (avgRiskScore >= 2.5) return 'high';
  if (avgRiskScore >= 1.5) return 'medium';
  return 'low';
}

/**
 * Calculate urgency level for cleaning
 */
export function calculateUrgencyLevel(
  patterns: CleaningPattern[],
  contaminationRisk: 'low' | 'medium' | 'high' | 'critical'
): 'low' | 'medium' | 'high' | 'critical' {
  if (contaminationRisk === 'critical') return 'critical';

  const lastCleaning = patterns[0]?.cleaningDate;
  if (!lastCleaning) return 'medium';

  const daysSinceCleaning = Math.ceil(
    (Date.now() - new Date(lastCleaning).getTime()) / (24 * 60 * 60 * 1000)
  );

  if (daysSinceCleaning > 14) return 'high';
  if (daysSinceCleaning > 7) return 'medium';
  return 'low';
}

/**
 * Calculate confidence score for prediction
 */
export function calculateConfidenceScore(
  patterns: CleaningPattern[],
  usage: RoomUsagePattern[]
): number {
  let score = 0.5; // Base score

  // More patterns = higher confidence
  if (patterns.length >= 10) score += 0.3;
  else if (patterns.length >= 5) score += 0.2;
  else if (patterns.length >= 2) score += 0.1;

  // More usage data = higher confidence
  if (usage.length >= 20) score += 0.2;
  else if (usage.length >= 10) score += 0.1;

  // Consistent patterns = higher confidence
  const intervals = calculateCleaningIntervals(patterns);
  if (intervals.length > 0) {
    const variance = calculateVariance(intervals);
    if (variance < 2) score += 0.1; // Low variance = consistent
  }

  return Math.min(score, 1.0);
}

/**
 * Predict cleaning duration based on patterns and contamination
 */
export function predictCleaningDuration(
  patterns: CleaningPattern[],
  contaminationRisk: 'low' | 'medium' | 'high' | 'critical'
): number {
  if (patterns.length === 0) {
    // Default durations based on contamination risk
    switch (contaminationRisk) {
      case 'low':
        return 30;
      case 'medium':
        return 45;
      case 'high':
        return 60;
      case 'critical':
        return 90;
    }
  }

  const avgDuration =
    patterns.reduce((sum, p) => sum + p.cleaningDurationMinutes, 0) /
    patterns.length;

  // Adjust based on contamination risk
  const riskMultiplier = {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
    critical: 1.6,
  };

  return Math.round(avgDuration * riskMultiplier[contaminationRisk]);
}

/**
 * Predict supplies needed based on patterns and contamination
 */
export function predictSuppliesNeeded(
  patterns: CleaningPattern[],
  contaminationRisk: 'low' | 'medium' | 'high' | 'critical'
): string[] {
  const baseSupplies = ['disinfectant', 'paper towels', 'trash bags'];

  if (contaminationRisk === 'critical') {
    return [
      ...baseSupplies,
      'biohazard bags',
      'heavy-duty gloves',
      'specialized cleaner',
    ];
  } else if (contaminationRisk === 'high') {
    return [...baseSupplies, 'heavy-duty gloves', 'specialized cleaner'];
  } else if (contaminationRisk === 'medium') {
    return [...baseSupplies, 'gloves'];
  }

  return baseSupplies;
}

/**
 * Calculate recommended staff count
 */
export function calculateRecommendedStaff(
  duration: number,
  contaminationRisk: 'low' | 'medium' | 'high' | 'critical'
): number {
  if (duration <= 30) return 1;
  if (duration <= 60) return 1;
  if (duration <= 90) return 2;

  // For critical contamination, always recommend at least 2 staff
  if (contaminationRisk === 'critical')
    return Math.max(2, Math.ceil(duration / 60));

  return Math.ceil(duration / 60);
}

/**
 * Identify risk factors for a room
 */
export function identifyRiskFactors(
  patterns: CleaningPattern[],
  usage: RoomUsagePattern[]
): string[] {
  const riskFactors: string[] = [];

  // Check for frequent contamination
  const highContaminationCount = patterns.filter(
    (p) =>
      p.contaminationLevel === 'high' || p.contaminationLevel === 'critical'
  ).length;
  if (highContaminationCount > patterns.length * 0.3) {
    riskFactors.push('Frequent high contamination');
  }

  // Check for long cleaning durations
  const avgDuration =
    patterns.reduce((sum, p) => sum + p.cleaningDurationMinutes, 0) /
    patterns.length;
  if (avgDuration > 60) {
    riskFactors.push('Extended cleaning time required');
  }

  // Check for high usage
  const totalUsageHours = usage.reduce((sum, u) => sum + u.usageHours, 0);
  if (totalUsageHours > 40) {
    riskFactors.push('High room utilization');
  }

  // Check for special requirements
  const specialRequirements = usage.flatMap((u) => u.specialRequirements);
  if (specialRequirements.length > 0) {
    riskFactors.push('Special cleaning requirements');
  }

  return riskFactors;
}

/**
 * Analyze cleaning patterns to determine trends
 */
export function analyzeCleaningTrends(
  patterns: CleaningPattern[]
): 'increasing' | 'decreasing' | 'stable' {
  if (patterns.length < 3) return 'stable';

  const recentPatterns = patterns.slice(0, 3);
  const olderPatterns = patterns.slice(3, 6);

  if (olderPatterns.length === 0) return 'stable';

  // Calculate average contamination scores
  const recentScore =
    recentPatterns.reduce((sum, p) => {
      const score =
        p.contaminationLevel === 'low'
          ? 1
          : p.contaminationLevel === 'medium'
            ? 2
            : p.contaminationLevel === 'high'
              ? 3
              : 4;
      return sum + score;
    }, 0) / recentPatterns.length;

  const olderScore =
    olderPatterns.reduce((sum, p) => {
      const score =
        p.contaminationLevel === 'low'
          ? 1
          : p.contaminationLevel === 'medium'
            ? 2
            : p.contaminationLevel === 'high'
              ? 3
              : 4;
      return sum + score;
    }, 0) / olderPatterns.length;

  const difference = recentScore - olderScore;

  if (difference > 0.5) return 'increasing';
  if (difference < -0.5) return 'decreasing';
  return 'stable';
}

/**
 * Calculate optimal cleaning frequency for a room
 */
export function calculateRecommendedFrequency(
  roomPatterns: CleaningPattern[],
  usage: RoomUsagePattern[]
): number {
  if (roomPatterns.length === 0) return 7; // Default 7 days

  // Calculate average time between cleanings
  const intervals: number[] = [];
  for (let i = 1; i < roomPatterns.length; i++) {
    const current = new Date(roomPatterns[i - 1].cleaningDate);
    const previous = new Date(roomPatterns[i].cleaningDate);
    const interval = Math.floor(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );
    intervals.push(interval);
  }

  const avgInterval =
    intervals.length > 0
      ? intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length
      : 7;

  // Adjust based on usage patterns
  if (usage.length > 0) {
    const avgUsageHours =
      usage.reduce((sum, u) => sum + u.usageHours, 0) / usage.length;
    if (avgUsageHours > 12) {
      return Math.max(1, avgInterval - 2); // High usage = more frequent cleaning
    }
  }

  return Math.round(avgInterval);
}

/**
 * Calculate room risk score
 */
export function calculateRoomRiskScore(
  patterns: CleaningPattern[],
  usage: RoomUsagePattern[]
): number {
  let score = 0;

  // Contamination level impact
  patterns.forEach((pattern) => {
    switch (pattern.contaminationLevel) {
      case 'low':
        score += 1;
        break;
      case 'medium':
        score += 2;
        break;
      case 'high':
        score += 3;
        break;
      case 'critical':
        score += 4;
        break;
    }
  });

  // Usage intensity impact
  const totalUsageHours = usage.reduce((sum, u) => sum + u.usageHours, 0);
  if (totalUsageHours > 60) score += 3;
  else if (totalUsageHours > 30) score += 2;
  else if (totalUsageHours > 10) score += 1;

  // Normalize to 0-100 scale
  const maxPossibleScore = patterns.length * 4 + 3;
  return Math.round((score / maxPossibleScore) * 100);
}

/**
 * Identify maintenance alerts
 */
export function identifyMaintenanceAlerts(
  patterns: CleaningPattern[]
): string[] {
  const alerts: string[] = [];

  // Check for increasing cleaning duration (equipment degradation)
  if (patterns.length >= 5) {
    const recentDuration =
      patterns
        .slice(0, 3)
        .reduce((sum, p) => sum + p.cleaningDurationMinutes, 0) / 3;
    const olderDuration =
      patterns
        .slice(3, 5)
        .reduce((sum, p) => sum + p.cleaningDurationMinutes, 0) / 2;

    if (recentDuration > olderDuration * 1.3) {
      alerts.push(
        'Cleaning duration increasing - equipment maintenance may be needed'
      );
    }
  }

  // Check for quality score degradation
  if (patterns.length >= 5) {
    const recentQuality =
      patterns.slice(0, 3).reduce((sum, p) => sum + p.qualityScore, 0) / 3;
    const olderQuality =
      patterns.slice(3, 5).reduce((sum, p) => sum + p.qualityScore, 0) / 2;

    if (recentQuality < olderQuality * 0.8) {
      alerts.push(
        'Quality scores declining - staff training or process review needed'
      );
    }
  }

  return alerts;
}

/**
 * Calculate variance
 */
export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;

  return Math.sqrt(avgSquaredDiff);
}

/**
 * Get unique rooms from patterns
 */
export function getUniqueRooms(patterns: CleaningPattern[]): string[] {
  return [...new Set(patterns.map((p) => p.roomId))];
}
