import {
  BIFailureErrorHandler,
  BIFailureErrorCodes,
} from './BIFailureErrorHandler';

/**
 * Input parameters for creating BI failure incidents
 */
export interface CreateBIFailureParams {
  facility_id: string;
  bi_test_result_id?: string;
  detected_by_operator_id?: string;
  affected_tools_count: number;
  affected_batch_ids: string[];
  failure_reason?: string;
  severity_level?: 'low' | 'medium' | 'high' | 'critical';
  lastSuccessfulBIDate?: Date;
  incident_type?: string;
  severity?: string;
  description?: string;
  notes?: string;
}

/**
 * Input parameters for resolving BI failure incidents
 */
export interface ResolveBIFailureParams {
  incidentId: string;
  resolvedByOperatorId: string;
  resolutionNotes?: string;
}

/**
 * Input parameters for quarantining tools
 */
export interface QuarantineToolsParams {
  incidentId: string;
  tools: Array<{
    tool_id: string;
    tool_name?: string;
    batch_id?: string;
    sterilization_cycle_id?: string;
  }>;
  quarantinedByOperatorId: string;
  quarantineLocation?: string;
  quarantineNotes?: string;
}

/**
 * Input parameters for tool usage recording
 */
export interface RecordToolUsageParams {
  facilityId: string;
  toolId: string;
  toolName?: string;
  batchId?: string;
  sterilizationCycleId?: string;
  patientId: string;
  patientName?: string;
  operatorId?: string;
  roomLocation?: string;
  procedureType?: string;
  procedureNotes?: string;
}

/**
 * Validation service for BI failure operations
 * Handles input validation and business rules
 */
export class BIFailureValidationService {
  /**
   * Validate input parameters for creating BI failure incidents
   */
  static validateCreateIncidentParams(params: CreateBIFailureParams): void {
    if (!params.facility_id) {
      BIFailureErrorHandler.handleValidationError(
        'Facility ID is required',
        BIFailureErrorCodes.MISSING_FACILITY_ID,
        'critical'
      );
    }

    if (params.affected_tools_count < 0) {
      BIFailureErrorHandler.handleValidationError(
        'Affected tools count cannot be negative',
        BIFailureErrorCodes.INVALID_TOOLS_COUNT,
        'high'
      );
    }

    if (
      !Array.isArray(params.affected_batch_ids) ||
      params.affected_batch_ids.length === 0
    ) {
      BIFailureErrorHandler.handleValidationError(
        'At least one affected batch ID is required',
        BIFailureErrorCodes.MISSING_BATCH_IDS,
        'critical'
      );
    }

    // Validate batch IDs format
    for (const batchId of params.affected_batch_ids) {
      if (
        !batchId ||
        typeof batchId !== 'string' ||
        batchId.trim().length === 0
      ) {
        BIFailureErrorHandler.handleValidationError(
          'Invalid batch ID format',
          BIFailureErrorCodes.VALIDATION_ERROR,
          'high'
        );
      }
    }

    // Validate severity level if provided
    if (
      params.severity_level &&
      !['low', 'medium', 'high', 'critical'].includes(params.severity_level)
    ) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid severity level. Must be one of: low, medium, high, critical',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }

    // Validate facility ID format (assuming UUID)
    if (!this.isValidUUID(params.facility_id)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid facility ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }

    // Validate operator ID format if provided
    if (
      params.detected_by_operator_id &&
      !this.isValidUUID(params.detected_by_operator_id)
    ) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid operator ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }
  }

  /**
   * Validate input parameters for resolving BI failure incidents
   */
  static validateResolveIncidentParams(params: ResolveBIFailureParams): void {
    if (!params.incidentId) {
      BIFailureErrorHandler.handleValidationError(
        'Incident ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'critical'
      );
    }

    if (!params.resolvedByOperatorId) {
      BIFailureErrorHandler.handleValidationError(
        'Resolving operator ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'critical'
      );
    }

    if (!this.isValidUUID(params.incidentId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid incident ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }

    if (!this.isValidUUID(params.resolvedByOperatorId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid operator ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }

    // Validate resolution notes length if provided
    if (params.resolutionNotes && params.resolutionNotes.length > 10000) {
      BIFailureErrorHandler.handleValidationError(
        'Resolution notes cannot exceed 10,000 characters',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }
  }

  /**
   * Validate input parameters for quarantining tools
   */
  static validateQuarantineToolsParams(params: QuarantineToolsParams): void {
    if (!params.incidentId) {
      BIFailureErrorHandler.handleValidationError(
        'Incident ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'critical'
      );
    }

    if (!params.quarantinedByOperatorId) {
      BIFailureErrorHandler.handleValidationError(
        'Quarantining operator ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'critical'
      );
    }

    if (!Array.isArray(params.tools) || params.tools.length === 0) {
      BIFailureErrorHandler.handleValidationError(
        'At least one tool must be specified for quarantine',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }

    // Validate each tool
    for (const tool of params.tools) {
      if (!tool.tool_id) {
        BIFailureErrorHandler.handleValidationError(
          'Tool ID is required for each tool',
          BIFailureErrorCodes.VALIDATION_ERROR,
          'high'
        );
      }

      if (!this.isValidUUID(tool.tool_id)) {
        BIFailureErrorHandler.handleValidationError(
          'Invalid tool ID format',
          BIFailureErrorCodes.VALIDATION_ERROR,
          'high'
        );
      }
    }

    if (!this.isValidUUID(params.incidentId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid incident ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }

    if (!this.isValidUUID(params.quarantinedByOperatorId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid operator ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }
  }

  /**
   * Validate input parameters for recording tool usage
   */
  static validateRecordToolUsageParams(params: RecordToolUsageParams): void {
    if (!params.facilityId) {
      BIFailureErrorHandler.handleValidationError(
        'Facility ID is required',
        BIFailureErrorCodes.MISSING_FACILITY_ID,
        'critical'
      );
    }

    if (!params.toolId) {
      BIFailureErrorHandler.handleValidationError(
        'Tool ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'critical'
      );
    }

    if (!params.patientId) {
      BIFailureErrorHandler.handleValidationError(
        'Patient ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'critical'
      );
    }

    if (!this.isValidUUID(params.facilityId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid facility ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }

    if (!this.isValidUUID(params.toolId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid tool ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }

    if (!this.isValidUUID(params.patientId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid patient ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }

    // Validate optional operator ID if provided
    if (params.operatorId && !this.isValidUUID(params.operatorId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid operator ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }

    // Validate procedure notes length if provided
    if (params.procedureNotes && params.procedureNotes.length > 5000) {
      BIFailureErrorHandler.handleValidationError(
        'Procedure notes cannot exceed 5,000 characters',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }
  }

  /**
   * Validate facility ID
   */
  static validateFacilityId(facilityId: string): void {
    if (!facilityId) {
      BIFailureErrorHandler.handleValidationError(
        'Facility ID is required',
        BIFailureErrorCodes.MISSING_FACILITY_ID,
        'high'
      );
    }

    if (!this.isValidUUID(facilityId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid facility ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }
  }

  /**
   * Validate incident ID
   */
  static validateIncidentId(incidentId: string): void {
    if (!incidentId) {
      BIFailureErrorHandler.handleValidationError(
        'Incident ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'critical'
      );
    }

    if (!this.isValidUUID(incidentId)) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid incident ID format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high'
      );
    }
  }

  /**
   * Validate date range for analytics queries
   */
  static validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid start date format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }

    if (isNaN(end.getTime())) {
      BIFailureErrorHandler.handleValidationError(
        'Invalid end date format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }

    if (start > end) {
      BIFailureErrorHandler.handleValidationError(
        'Start date cannot be after end date',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }

    // Check if date range is reasonable (not more than 5 years)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    if (start < fiveYearsAgo) {
      BIFailureErrorHandler.handleValidationError(
        'Start date cannot be more than 5 years ago',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }
  }

  /**
   * Check if a string is a valid UUID
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate business rules for BI failure incidents
   */
  static validateBusinessRules(params: CreateBIFailureParams): void {
    // Check if affected tools count is reasonable
    if (params.affected_tools_count > 10000) {
      BIFailureErrorHandler.handleValidationError(
        'Affected tools count seems unreasonably high. Please verify the data.',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }

    // Check if batch IDs are unique
    const uniqueBatchIds = new Set(params.affected_batch_ids);
    if (uniqueBatchIds.size !== params.affected_batch_ids.length) {
      BIFailureErrorHandler.handleValidationError(
        'Duplicate batch IDs are not allowed',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }

    // Validate failure reason length if provided
    if (params.failure_reason && params.failure_reason.length > 2000) {
      BIFailureErrorHandler.handleValidationError(
        'Failure reason cannot exceed 2,000 characters',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium'
      );
    }
  }
}
