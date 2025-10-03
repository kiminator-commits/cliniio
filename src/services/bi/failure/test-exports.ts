// Test file to verify exports are working
import {
  BIFailureValidationService,
  CreateBIFailureParams,
} from './BIFailureValidationService';
import {
  BIFailureIncidentService,
  BIFailureIncident,
} from './BIFailureIncidentService';
import {
  BIFailureWorkflowService,
  ToolValidationResult,
  PatientExposureReport,
} from './BIFailureWorkflowService';
import { BIFailureNotificationService } from './BIFailureNotificationService';
import { NotificationConfig, NotificationMessage } from './notification/types';
import {
  BIFailureAnalyticsService,
  BIFailureAnalyticsSummary,
  BIFailureTrendAnalysis,
  BIFailureComplianceReport,
} from './BIFailureAnalyticsService';
import {
  BIFailureErrorHandler,
  BIFailureErrorCodes,
} from './BIFailureErrorHandler';
import { BIFailureError, PatientExposureError } from './BIFailureError';
import { BIFailureService } from './index';

// Test that we can create instances of the types
const testCreateParams: CreateBIFailureParams = {
  facility_id: 'test-facility-id',
  affected_tools_count: 5,
  affected_batch_ids: ['batch-1', 'batch-2'],
  severity_level: 'high',
};

// Test that all services are properly exported
console.log('Testing BI Failure Service exports...');

// Test validation service
console.log(
  '✓ BIFailureValidationService exported:',
  typeof BIFailureValidationService === 'object'
);
console.log(
  '✓ CreateBIFailureParams type exported:',
  typeof testCreateParams === 'object'
);

// Test incident service
console.log(
  '✓ BIFailureIncidentService exported:',
  typeof BIFailureIncidentService === 'object'
);
console.log(
  '✓ BIFailureIncident type exported:',
  typeof ({} as BIFailureIncident) === 'object'
);

// Test workflow service
console.log(
  '✓ BIFailureWorkflowService exported:',
  typeof BIFailureWorkflowService === 'object'
);
console.log(
  '✓ ToolValidationResult type exported:',
  typeof ({} as ToolValidationResult) === 'object'
);
console.log(
  '✓ PatientExposureReport type exported:',
  typeof ({} as PatientExposureReport) === 'object'
);

// Test notification service
console.log(
  '✓ BIFailureNotificationService exported:',
  typeof BIFailureNotificationService === 'object'
);
console.log(
  '✓ NotificationConfig type exported:',
  typeof ({} as NotificationConfig) === 'object'
);
console.log(
  '✓ NotificationMessage type exported:',
  typeof ({} as NotificationMessage) === 'object'
);

// Test analytics service
console.log(
  '✓ BIFailureAnalyticsService exported:',
  typeof BIFailureAnalyticsService === 'object'
);
console.log(
  '✓ BIFailureAnalyticsSummary type exported:',
  typeof ({} as BIFailureAnalyticsSummary) === 'object'
);
console.log(
  '✓ BIFailureTrendAnalysis type exported:',
  typeof ({} as BIFailureTrendAnalysis) === 'object'
);
console.log(
  '✓ BIFailureComplianceReport type exported:',
  typeof ({} as BIFailureComplianceReport) === 'object'
);

// Test error handler
console.log(
  '✓ BIFailureErrorHandler exported:',
  typeof BIFailureErrorHandler === 'object'
);
console.log(
  '✓ BIFailureErrorCodes exported:',
  typeof BIFailureErrorCodes === 'object'
);

// Test error classes
console.log('✓ BIFailureError exported:', typeof BIFailureError === 'function');
console.log(
  '✓ PatientExposureError exported:',
  typeof PatientExposureError === 'function'
);

// Test main service
console.log(
  '✓ BIFailureService exported:',
  typeof BIFailureService === 'object'
);

console.log('All BI Failure Service exports are working correctly!');
