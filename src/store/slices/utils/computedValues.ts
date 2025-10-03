import {
  BIWorkflowState,
  BIComplianceStatus,
  ActivitySummary,
} from '../types/biWorkflowTypes';

/**
 * Get BI compliance status
 */
export const getBIComplianceStatus = (
  state: BIWorkflowState
): BIComplianceStatus => {
  const { biTestPassed, nextBITestDue, biTestOptedOut, enforceBI } = state;

  if (!enforceBI || biTestOptedOut) {
    return {
      isCompliant: true,
      nextTestDue: null,
      daysUntilDue: 0,
      status: 'compliant',
    };
  }

  const now = new Date();
  const daysUntilDue = nextBITestDue
    ? Math.ceil(
        (nextBITestDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  let status: 'compliant' | 'due-soon' | 'overdue' | 'failed';
  if (!biTestPassed) {
    status = 'failed';
  } else if (daysUntilDue < 0) {
    status = 'overdue';
  } else if (daysUntilDue <= 3) {
    status = 'due-soon';
  } else {
    status = 'compliant';
  }

  return {
    isCompliant: status === 'compliant',
    nextTestDue: nextBITestDue,
    daysUntilDue,
    status,
  };
};

/**
 * Get BI failure risk level
 */
export const getBIFailureRiskLevel = (
  state: BIWorkflowState
): 'low' | 'medium' | 'high' | 'critical' => {
  const { biFailureDetails } = state;
  if (!biFailureDetails) return 'low';

  return biFailureDetails.severity_level || 'low';
};

/**
 * Get activity summary
 */
export const getActivitySummary = (state: BIWorkflowState): ActivitySummary => {
  const { activityLog } = state;
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentActivities = activityLog.filter(
    (activity) => activity.time > oneDayAgo
  ).length;
  const biTestCount = activityLog.filter(
    (activity) => activity.type === 'bi-test'
  ).length;
  const failureCount = activityLog.filter(
    (activity) => activity.type === 'bi-failure'
  ).length;

  return {
    totalActivities: activityLog.length,
    recentActivities,
    biTestCount,
    failureCount,
  };
};
