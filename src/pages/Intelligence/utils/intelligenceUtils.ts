import {
  IntelligenceSummary,
  SupplyDepletion,
  UrgentAction,
} from './intelligenceTypes';

// Color utility functions for risk levels and urgency
export const getRiskLevelColor = (level: string): string => {
  switch (level?.toLowerCase()) {
    case 'low':
      return 'border-green-500 bg-green-50';
    case 'medium':
      return 'border-yellow-500 bg-yellow-50';
    case 'high':
      return 'border-orange-500 bg-orange-50';
    case 'critical':
      return 'border-red-500 bg-red-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
};

export const getUrgencyColor = (urgency: string): string => {
  switch (urgency?.toLowerCase()) {
    case 'low':
      return 'border-green-500 bg-green-50';
    case 'medium':
      return 'border-yellow-500 bg-yellow-50';
    case 'high':
      return 'border-orange-500 bg-orange-50';
    case 'critical':
      return 'border-red-500 bg-red-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'critical':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Risk assessment utility functions
export const hasHighRiskItems = (summary: IntelligenceSummary): boolean => {
  if (!summary) return false;
  const { auditRisk, supplyDepletion } = summary;
  return Boolean(
    auditRisk?.riskLevel === 'high' ||
      auditRisk?.riskLevel === 'critical' ||
      (supplyDepletion &&
        supplyDepletion.some(
          (item: { reorderUrgency?: string }) =>
            item.reorderUrgency === 'critical'
        ))
  );
};

export const getUrgentActions = (
  summary: IntelligenceSummary
): UrgentAction[] => {
  if (!summary) return [];
  const actions: UrgentAction[] = [];

  // Check for critical supply depletion
  if (summary.supplyDepletion) {
    const criticalSupplies = summary.supplyDepletion.filter(
      (item: SupplyDepletion) => item.reorderUrgency === 'critical'
    );
    if (criticalSupplies.length > 0) {
      actions.push({
        type: 'critical_supply',
        message: `${criticalSupplies.length} critical supplies need immediate reorder`,
        items: criticalSupplies,
      });
    }
  }

  // Check for high audit risk
  if (
    summary.auditRisk?.riskLevel === 'high' ||
    summary.auditRisk?.riskLevel === 'critical'
  ) {
    actions.push({
      type: 'audit_risk',
      message: 'High audit risk detected - immediate action required',
      riskScore: summary.auditRisk,
    });
  }

  return actions;
};

// Date utility functions
export const getDaysUntilDepletion = (depletionDate: string): number => {
  return Math.ceil(
    (new Date(depletionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString();
};

// Performance scoring utility functions
export const getPerformanceScoreColor = (score: number): string => {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-yellow-100 text-yellow-800';
  if (score >= 70) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export const getPerformanceLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  return 'Needs Improvement';
};

// Data validation utility functions
export const hasData = (data: unknown): boolean => {
  return Boolean(data && Array.isArray(data) && data.length > 0);
};

export const getDataCount = (data: unknown): number => {
  return hasData(data) ? (data as unknown[]).length : 0;
};

// Currency formatting utility functions
export const formatCurrency = (amount: number): string => {
  return `$${(amount || 0).toLocaleString()}`;
};

export const formatPercentage = (value: number): string => {
  return `${(value || 0).toFixed(1)}%`;
};
