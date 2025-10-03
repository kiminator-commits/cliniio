export class BIFailureError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    public retryable: boolean = false,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BIFailureError';
  }
}

export class PatientExposureError extends Error {
  constructor(
    message: string,
    public patientId?: string,
    public exposureType?: string
  ) {
    super(message);
    this.name = 'PatientExposureError';
  }
}

/**
 * Error codes for BI failure operations
 */
export const BIFailureErrorCodes = {
  MISSING_FACILITY_ID: 'MISSING_FACILITY_ID',
  INVALID_TOOLS_COUNT: 'INVALID_TOOLS_COUNT',
  MISSING_BATCH_IDS: 'MISSING_BATCH_IDS',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NO_DATA_RETURNED: 'NO_DATA_RETURNED',
  MAX_RETRIES_EXCEEDED: 'MAX_RETRIES_EXCEEDED',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
  INCIDENT_NOT_FOUND: 'INCIDENT_NOT_FOUND',
  INVALID_INCIDENT_STATUS: 'INVALID_INCIDENT_STATUS',
  OPERATION_NOT_PERMITTED: 'OPERATION_NOT_PERMITTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
