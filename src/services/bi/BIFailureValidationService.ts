/**
 * Input parameters for BI failure incident validation
 */
export interface IncidentInputParams {
  facility_id: string;
  affected_tools_count: number;
  affected_batch_ids: string[];
  failure_reason?: string;
  severity_level?: 'low' | 'medium' | 'high' | 'critical';
  detected_by_operator_id?: string;
  lastSuccessfulBIDate?: Date;
}

/**
 * Resolution path validation parameters
 */
export interface ResolutionPathParams {
  incidentId: string;
  resolutionType: 'standard' | 'emergency' | 'investigation';
  affectedToolsCount: number;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  hasPatientExposure: boolean;
  regulatoryComplianceRequired: boolean;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiresRegulatoryNotification: boolean;
  recommendedActions: string[];
}

/**
 * Service for BI failure input validation and business rules
 * Handles validation logic and regulatory compliance checks
 */
export class BIFailureValidationService {
  /**
   * Validate incident input parameters
   */
  static validateIncidentInput(params: IncidentInputParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresRegulatoryNotification = false;
    const recommendedActions: string[] = [];

    // Required field validation
    if (!params.facility_id) {
      errors.push('Facility ID is required');
    }

    if (params.affected_tools_count <= 0) {
      errors.push('Affected tools count must be greater than 0');
    }

    if (!params.affected_batch_ids || params.affected_batch_ids.length === 0) {
      errors.push('At least one affected batch ID is required');
    }

    // Format validation
    if (params.facility_id && !this.isValidUUID(params.facility_id)) {
      errors.push('Invalid facility ID format');
    }

    if (
      params.detected_by_operator_id &&
      !this.isValidUUID(params.detected_by_operator_id)
    ) {
      errors.push('Invalid operator ID format');
    }

    // Batch ID validation
    if (params.affected_batch_ids) {
      for (const batchId of params.affected_batch_ids) {
        if (
          !batchId ||
          typeof batchId !== 'string' ||
          batchId.trim().length === 0
        ) {
          errors.push('Invalid batch ID format');
          break;
        }
      }
    }

    // Severity level validation
    if (
      params.severity_level &&
      !['low', 'medium', 'high', 'critical'].includes(params.severity_level)
    ) {
      errors.push(
        'Invalid severity level. Must be one of: low, medium, high, critical'
      );
    }

    // Business rule validation
    if (params.affected_tools_count > 100) {
      warnings.push(
        'Large number of affected tools detected. Consider emergency protocols.'
      );
      recommendedActions.push('Implement emergency quarantine procedures');
    }

    if (params.severity_level === 'critical') {
      requiresRegulatoryNotification = true;
      recommendedActions.push('Immediate regulatory notification required');
      recommendedActions.push('Activate emergency response protocols');
    }

    if (params.severity_level === 'high') {
      requiresRegulatoryNotification = true;
      recommendedActions.push(
        'Regulatory notification required within 24 hours'
      );
    }

    // Date validation
    if (params.lastSuccessfulBIDate) {
      const lastBI = new Date(params.lastSuccessfulBIDate);
      const now = new Date();
      const daysSinceLastBI = Math.floor(
        (now.getTime() - lastBI.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastBI > 30) {
        warnings.push('Last successful BI test was more than 30 days ago');
        recommendedActions.push('Review BI testing schedule');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiresRegulatoryNotification,
      recommendedActions,
    };
  }

  /**
   * Determine if a failure requires regulatory notification
   */
  static isFailureRegulatory(
    severityLevel: 'low' | 'medium' | 'high' | 'critical',
    affectedToolsCount: number,
    hasPatientExposure: boolean,
    failureReason?: string
  ): boolean {
    // Critical severity always requires regulatory notification
    if (severityLevel === 'critical') {
      return true;
    }

    // High severity with patient exposure requires notification
    if (severityLevel === 'high' && hasPatientExposure) {
      return true;
    }

    // High severity with large number of affected tools requires notification
    if (severityLevel === 'high' && affectedToolsCount > 50) {
      return true;
    }

    // Any severity with specific failure reasons that require notification
    const regulatoryFailureReasons = [
      'autoclave malfunction',
      'temperature deviation',
      'pressure failure',
      'cycle interruption',
      'sterilization failure',
      'equipment failure',
    ];

    if (
      failureReason &&
      regulatoryFailureReasons.some((reason) =>
        failureReason.toLowerCase().includes(reason)
      )
    ) {
      return true;
    }

    // Medium severity with patient exposure and high tool count
    if (
      severityLevel === 'medium' &&
      hasPatientExposure &&
      affectedToolsCount > 20
    ) {
      return true;
    }

    return false;
  }

  /**
   * Validate resolution path for a BI failure incident
   */
  static validateResolutionPath(
    params: ResolutionPathParams
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresRegulatoryNotification = false;
    const recommendedActions: string[] = [];

    // Basic parameter validation
    if (!params.incidentId) {
      errors.push('Incident ID is required');
    }

    if (
      !['standard', 'emergency', 'investigation'].includes(
        params.resolutionType
      )
    ) {
      errors.push(
        'Invalid resolution type. Must be one of: standard, emergency, investigation'
      );
    }

    if (params.affectedToolsCount <= 0) {
      errors.push('Affected tools count must be greater than 0');
    }

    if (!['low', 'medium', 'high', 'critical'].includes(params.severityLevel)) {
      errors.push('Invalid severity level');
    }

    // Resolution path validation based on type
    switch (params.resolutionType) {
      case 'emergency':
        if (
          params.severityLevel !== 'critical' &&
          params.severityLevel !== 'high'
        ) {
          errors.push(
            'Emergency resolution path requires critical or high severity'
          );
        }
        if (!params.hasPatientExposure) {
          warnings.push(
            'Emergency path selected but no patient exposure detected'
          );
        }
        requiresRegulatoryNotification = true;
        recommendedActions.push('Immediate regulatory notification required');
        recommendedActions.push('Activate emergency response team');
        recommendedActions.push('Implement immediate quarantine procedures');
        break;

      case 'investigation':
        if (params.severityLevel === 'low') {
          warnings.push(
            'Investigation path may be unnecessary for low severity incidents'
          );
        }
        if (params.hasPatientExposure) {
          requiresRegulatoryNotification = true;
          recommendedActions.push(
            'Regulatory notification required due to patient exposure'
          );
        }
        recommendedActions.push('Conduct thorough root cause analysis');
        recommendedActions.push('Document all findings for regulatory review');
        break;

      case 'standard':
        if (params.severityLevel === 'critical') {
          errors.push(
            'Standard resolution path not allowed for critical severity'
          );
        }
        if (params.hasPatientExposure && params.affectedToolsCount > 10) {
          requiresRegulatoryNotification = true;
          recommendedActions.push(
            'Regulatory notification required due to patient exposure and tool count'
          );
        }
        recommendedActions.push('Follow standard quarantine procedures');
        recommendedActions.push('Complete re-sterilization protocols');
        break;
    }

    // Additional business rule validations
    if (
      params.regulatoryComplianceRequired &&
      !requiresRegulatoryNotification
    ) {
      warnings.push(
        'Regulatory compliance required but notification not triggered'
      );
      recommendedActions.push('Review regulatory compliance requirements');
    }

    if (params.affectedToolsCount > 100) {
      warnings.push(
        'Large number of affected tools may require extended resolution timeline'
      );
      recommendedActions.push('Plan for extended resolution timeline');
      recommendedActions.push('Consider additional resources for resolution');
    }

    if (params.hasPatientExposure) {
      recommendedActions.push('Generate patient exposure report');
      recommendedActions.push('Notify affected patients if required');
      recommendedActions.push('Implement patient monitoring protocols');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiresRegulatoryNotification,
      recommendedActions,
    };
  }

  /**
   * Validate UUID format
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
