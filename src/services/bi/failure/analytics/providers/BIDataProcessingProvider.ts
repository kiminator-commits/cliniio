// import { logger } from '../../../../../utils/_core/logger';

export interface BIIncident {
  created_at: string;
  severity?: string;
  category?: string;
  status?: string;
  resolved_at?: string;
  incident_type?: string;
  [key: string]: unknown;
}

export interface RiskFactor {
  currentValue?: number;
  [key: string]: unknown;
}

export interface TrendAnalysis {
  confidence: number;
  [key: string]: unknown;
}

export class BIDataProcessingProvider {
  /**
   * Calculate overall confidence based on data quality and model performance
   */
  static calculateConfidence(
    facilityId: string,
    riskFactors: RiskFactor[],
    trendAnalysis: TrendAnalysis
  ): number {
    // Calculate confidence based on data quality and model performance
    let confidence = 0.5; // Base confidence

    // Factor 1: Data availability (30% weight)
    if (riskFactors.length > 0) confidence += 0.3;

    // Factor 2: Trend analysis confidence (40% weight)
    confidence += trendAnalysis.confidence * 0.4;

    // Factor 3: Risk factor completeness (30% weight)
    const completeFactors = riskFactors.filter(
      (f) => f.currentValue !== undefined
    ).length;
    confidence += (completeFactors / Math.max(1, riskFactors.length)) * 0.3;

    return Math.min(0.95, Math.max(0.3, confidence));
  }

  /**
   * Validate incident data quality
   */
  static validateIncidentData(incidents: BIIncident[]): {
    isValid: boolean;
    qualityScore: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let qualityScore = 1.0;

    if (incidents.length === 0) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['No incident data available'],
      };
    }

    // Check for missing required fields
    const missingCreatedAt = incidents.filter((i) => !i.created_at).length;
    if (missingCreatedAt > 0) {
      issues.push(`${missingCreatedAt} incidents missing created_at`);
      qualityScore -= 0.2;
    }

    const missingSeverity = incidents.filter((i) => !i.severity).length;
    if (missingSeverity > 0) {
      issues.push(`${missingSeverity} incidents missing severity`);
      qualityScore -= 0.1;
    }

    const missingStatus = incidents.filter((i) => !i.status).length;
    if (missingStatus > 0) {
      issues.push(`${missingStatus} incidents missing status`);
      qualityScore -= 0.1;
    }

    // Check for invalid dates
    const invalidDates = incidents.filter((i) => {
      try {
        new Date(i.created_at as string);
        return false;
      } catch {
        return true;
      }
    }).length;

    if (invalidDates > 0) {
      issues.push(`${invalidDates} incidents have invalid dates`);
      qualityScore -= 0.3;
    }

    // Check for future dates
    const futureDates = incidents.filter((i) => {
      try {
        return new Date(i.created_at as string) > new Date();
      } catch {
        return false;
      }
    }).length;

    if (futureDates > 0) {
      issues.push(`${futureDates} incidents have future dates`);
      qualityScore -= 0.1;
    }

    return {
      isValid: qualityScore > 0.5,
      qualityScore: Math.max(0, qualityScore),
      issues,
    };
  }

  /**
   * Clean and normalize incident data
   */
  static cleanIncidentData(incidents: BIIncident[]): BIIncident[] {
    return incidents
      .filter((incident) => {
        // Remove incidents with invalid dates
        try {
          new Date(incident.created_at as string);
          return true;
        } catch {
          return false;
        }
      })
      .filter((incident) => {
        // Remove incidents with future dates
        try {
          return new Date(incident.created_at as string) <= new Date();
        } catch {
          return false;
        }
      })
      .map((incident) => ({
        ...incident,
        // Normalize severity values
        severity: this.normalizeSeverity(incident.severity),
        // Normalize status values
        status: this.normalizeStatus(incident.status),
        // Ensure created_at is properly formatted
        created_at: new Date(incident.created_at as string).toISOString(),
      }));
  }

  /**
   * Normalize severity values
   */
  private static normalizeSeverity(severity?: string): string {
    if (!severity) return 'unknown';
    
    const normalized = severity.toLowerCase().trim();
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    
    if (validSeverities.includes(normalized)) {
      return normalized;
    }
    
    // Map common variations
    const severityMap: { [key: string]: string } = {
      'minor': 'low',
      'major': 'high',
      'severe': 'critical',
      'urgent': 'high',
    };
    
    return severityMap[normalized] || 'unknown';
  }

  /**
   * Normalize status values
   */
  private static normalizeStatus(status?: string): string {
    if (!status) return 'unknown';
    
    const normalized = status.toLowerCase().trim();
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];
    
    if (validStatuses.includes(normalized)) {
      return normalized;
    }
    
    // Map common variations
    const statusMap: { [key: string]: string } = {
      'pending': 'open',
      'active': 'in_progress',
      'completed': 'resolved',
      'finished': 'resolved',
      'cancelled': 'closed',
    };
    
    return statusMap[normalized] || 'unknown';
  }

  /**
   * Calculate data completeness score
   */
  static calculateDataCompleteness(incidents: BIIncident[]): number {
    if (incidents.length === 0) return 0;

    const requiredFields = ['created_at', 'severity', 'status'];
    const optionalFields = ['category', 'resolved_at', 'incident_type'];
    
    let completenessScore = 0;
    const totalFields = requiredFields.length + optionalFields.length;
    
    // Check required fields (weighted more heavily)
    requiredFields.forEach((field) => {
      const filledCount = incidents.filter((i) => i[field] !== undefined && i[field] !== null && i[field] !== '').length;
      completenessScore += (filledCount / incidents.length) * 2; // Double weight for required fields
    });
    
    // Check optional fields
    optionalFields.forEach((field) => {
      const filledCount = incidents.filter((i) => i[field] !== undefined && i[field] !== null && i[field] !== '').length;
      completenessScore += (filledCount / incidents.length) * 1; // Single weight for optional fields
    });
    
    return Math.min(1, completenessScore / totalFields);
  }

  /**
   * Detect data anomalies
   */
  static detectDataAnomalies(incidents: BIIncident[]): {
    anomalies: Array<{
      type: string;
      description: string;
      count: number;
      severity: 'low' | 'medium' | 'high';
    }>;
    anomalyScore: number;
  } {
    const anomalies: Array<{
      type: string;
      description: string;
      count: number;
      severity: 'low' | 'medium' | 'high';
    }> = [];
    
    let anomalyScore = 0;

    if (incidents.length === 0) {
      return { anomalies: [], anomalyScore: 0 };
    }

    // Check for duplicate incidents (same timestamp and similar data)
    const duplicates = this.findDuplicateIncidents(incidents);
    if (duplicates.length > 0) {
      anomalies.push({
        type: 'duplicates',
        description: `Found ${duplicates.length} potential duplicate incidents`,
        count: duplicates.length,
        severity: duplicates.length > incidents.length * 0.1 ? 'high' : 'medium',
      });
      anomalyScore += duplicates.length / incidents.length;
    }

    // Check for unusual incident patterns
    const unusualPatterns = this.detectUnusualPatterns(incidents);
    unusualPatterns.forEach((pattern) => {
      anomalies.push(pattern);
      anomalyScore += pattern.count / incidents.length * 0.5;
    });

    // Check for data inconsistencies
    const inconsistencies = this.detectInconsistencies(incidents);
    inconsistencies.forEach((inconsistency) => {
      anomalies.push(inconsistency);
      anomalyScore += inconsistency.count / incidents.length * 0.3;
    });

    return {
      anomalies,
      anomalyScore: Math.min(1, anomalyScore),
    };
  }

  /**
   * Find potential duplicate incidents
   */
  private static findDuplicateIncidents(incidents: BIIncident[]): BIIncident[] {
    const duplicates: BIIncident[] = [];
    const seen = new Set<string>();

    incidents.forEach((incident) => {
      const key = `${incident.created_at}_${incident.severity}_${incident.category}`;
      if (seen.has(key)) {
        duplicates.push(incident);
      } else {
        seen.add(key);
      }
    });

    return duplicates;
  }

  /**
   * Detect unusual patterns in incident data
   */
  private static detectUnusualPatterns(incidents: BIIncident[]): Array<{
    type: string;
    description: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }> {
    const patterns: Array<{
      type: string;
      description: string;
      count: number;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // Check for unusually high incident rates
    const hourlyData: { [key: number]: number } = {};
    incidents.forEach((incident) => {
      const hour = new Date(incident.created_at as string).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    const avgHourlyRate = incidents.length / 24;
    const highRateHours = Object.entries(hourlyData).filter(([, count]) => count > avgHourlyRate * 3);
    
    if (highRateHours.length > 0) {
      patterns.push({
        type: 'high_frequency_hours',
        description: `Unusually high incident rates during ${highRateHours.length} hours`,
        count: highRateHours.length,
        severity: 'medium',
      });
    }

    // Check for resolution time anomalies
    const resolvedIncidents = incidents.filter((i) => i.resolved_at);
    if (resolvedIncidents.length > 0) {
      const resolutionTimes = resolvedIncidents.map((i) => {
        const created = new Date(i.created_at as string).getTime();
        const resolved = new Date(i.resolved_at as string).getTime();
        return resolved - created;
      });

      const avgResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
      const longResolutionIncidents = resolutionTimes.filter((time) => time > avgResolutionTime * 5).length;

      if (longResolutionIncidents > 0) {
        patterns.push({
          type: 'long_resolution_times',
          description: `${longResolutionIncidents} incidents with unusually long resolution times`,
          count: longResolutionIncidents,
          severity: 'medium',
        });
      }
    }

    return patterns;
  }

  /**
   * Detect data inconsistencies
   */
  private static detectInconsistencies(incidents: BIIncident[]): Array<{
    type: string;
    description: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }> {
    const inconsistencies: Array<{
      type: string;
      description: string;
      count: number;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // Check for resolved incidents without resolved_at
    const resolvedWithoutDate = incidents.filter((i) => i.status === 'resolved' && !i.resolved_at).length;
    if (resolvedWithoutDate > 0) {
      inconsistencies.push({
        type: 'missing_resolution_date',
        description: `${resolvedWithoutDate} resolved incidents missing resolution date`,
        count: resolvedWithoutDate,
        severity: 'medium',
      });
    }

    // Check for open incidents with resolved_at
    const openWithDate = incidents.filter((i) => i.status === 'open' && i.resolved_at).length;
    if (openWithDate > 0) {
      inconsistencies.push({
        type: 'open_with_resolution_date',
        description: `${openWithDate} open incidents with resolution date`,
        count: openWithDate,
        severity: 'medium',
      });
    }

    return inconsistencies;
  }
}
