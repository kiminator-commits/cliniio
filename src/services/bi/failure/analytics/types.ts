/**
 * Shared types for BI Failure Analytics services
 */

/**
 * Analytics summary interface
 */
export interface BIFailureAnalyticsSummary {
  facilityId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  averageResolutionTimeHours: number;
  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  affectedToolsTotal: number;
  patientExposureRisk: {
    totalPatientsExposed: number;
    highRiskPatients: number;
    mediumRiskPatients: number;
    lowRiskPatients: number;
  };
}

/**
 * Trend analysis interface
 */
export interface BIFailureTrendAnalysis {
  facilityId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  monthlyTrends: Array<{
    month: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }>;
  weeklyTrends: Array<{
    week: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }>;
  dailyTrends: Array<{
    date: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }>;
}

/**
 * Compliance report interface
 */
export interface BIFailureComplianceReport {
  facilityId: string;
  reportDate: string;
  complianceScore: number;
  regulatoryRequirements: Array<{
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'pending_review';
    details: string;
    lastUpdated: string;
  }>;
  auditFindings: Array<{
    finding: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved';
    dueDate?: string;
  }>;
  recommendations: Array<{
    recommendation: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedEffort: string;
    impact: string;
  }>;
}

/**
 * Performance metrics interface
 */
export interface BIFailurePerformanceMetrics {
  averageResolutionTimeHours: number;
  medianResolutionTimeHours: number;
  fastestResolutionHours: number;
  slowestResolutionHours: number;
  resolutionTimeDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  operatorPerformance: Array<{
    operatorId: string;
    operatorName: string;
    incidentsHandled: number;
    averageResolutionTimeHours: number;
    successRate: number;
  }>;
}

/**
 * Patient exposure analytics interface
 */
export interface BIFailurePatientExposureAnalytics {
  totalPatientsExposed: number;
  exposureTrends: Array<{
    date: string;
    patientsExposed: number;
    highRiskPatients: number;
    mediumRiskPatients: number;
    lowRiskPatients: number;
  }>;
  riskFactors: Array<{
    factor: string;
    occurrenceCount: number;
    averageRiskLevel: number;
  }>;
  affectedProcedures: Array<{
    procedureType: string;
    patientCount: number;
    averageRiskLevel: number;
  }>;
}

/**
 * Real-time dashboard interface
 */
export interface BIFailureRealTimeDashboard {
  activeIncidents: number;
  incidentsToday: number;
  incidentsThisWeek: number;
  incidentsThisMonth: number;
  averageResolutionTimeHours: number;
  toolsInQuarantine: number;
  patientsAtRisk: number;
  recentActivity: Array<{
    timestamp: string;
    activity: string;
    incidentId?: string;
    operatorId?: string;
  }>;
}

/**
 * Predictive insights interface
 */
export interface BIFailurePredictiveInsights {
  riskPredictions: Array<{
    riskFactor: string;
    probability: number;
    confidence: number;
    timeframe: string;
  }>;
  trendPredictions: Array<{
    metric: string;
    predictedValue: number;
    confidence: number;
    timeframe: string;
  }>;
  recommendations: Array<{
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
}

/**
 * Custom report interface
 */
export interface BIFailureCustomReport {
  reportId: string;
  reportType: string;
  generatedAt: string;
  data: unknown;
  metadata: {
    facilityId: string;
    parameters: Record<string, unknown>;
    recordCount: number;
  };
}

/**
 * Export analytics interface
 */
export interface BIFailureExportAnalytics {
  exportId: string;
  downloadUrl: string;
  expiresAt: string;
  recordCount: number;
  format: string;
}

// Database result types
export interface BIFailureAnalyticsSummaryDBResult {
  facilityId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  averageResolutionTimeHours: number;
  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  affectedToolsTotal: number;
  patientExposureRisk: {
    totalPatientsExposed: number;
    highRiskPatients: number;
    mediumRiskPatients: number;
    lowRiskPatients: number;
  };
}

export interface BIFailureTrendAnalysisDBResult {
  facility_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  monthly_trends: Array<{
    month: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }>;
  weekly_trends: Array<{
    week: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }>;
  daily_trends: Array<{
    date: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }>;
}

export interface BIFailureComplianceReportDBResult {
  facility_id: string;
  report_date: string;
  compliance_score: number;
  regulatory_requirements: Array<{
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'pending_review';
    details: string;
    lastUpdated: string;
  }>;
  audit_findings: Array<{
    finding: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved';
    dueDate?: string;
  }>;
  recommendations: Array<{
    recommendation: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedEffort: string;
    impact: string;
  }>;
}

export interface BIFailurePerformanceMetricsDBResult {
  average_resolution_time_hours: number;
  median_resolution_time_hours: number;
  fastest_resolution_hours: number;
  slowest_resolution_hours: number;
  resolution_time_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  operator_performance: Array<{
    operatorId: string;
    operatorName: string;
    incidentsHandled: number;
    averageResolutionTimeHours: number;
    successRate: number;
  }>;
}

export interface BIFailurePatientExposureAnalyticsDBResult {
  total_patients_exposed: number;
  exposure_trends: Array<{
    date: string;
    patientsExposed: number;
    highRiskPatients: number;
    mediumRiskPatients: number;
    lowRiskPatients: number;
  }>;
  risk_factors: Array<{
    factor: string;
    occurrenceCount: number;
    averageRiskLevel: number;
  }>;
  affected_procedures: Array<{
    procedureType: string;
    patientCount: number;
    averageRiskLevel: number;
  }>;
}

export interface BIFailureCustomReportDBResult {
  report_id: string;
  report_type: string;
  generated_at: string;
  data: unknown;
  metadata: {
    facility_id: string;
    parameters: Record<string, unknown>;
    record_count: number;
  };
}

export interface BIFailureExportAnalyticsDBResult {
  export_id: string;
  download_url: string;
  expires_at: string;
  record_count: number;
  format: string;
}

export interface BIFailureRealTimeDashboardDBResult {
  active_incidents: number;
  incidents_today: number;
  incidents_this_week: number;
  incidents_this_month: number;
  average_resolution_time_hours: number;
  tools_in_quarantine: number;
  patients_at_risk: number;
  recent_activity: Array<{
    timestamp: string;
    activity: string;
    incidentId?: string;
    operatorId?: string;
  }>;
}

export interface BIFailurePredictiveInsightsDBResult {
  risk_predictions: Array<{
    riskFactor: string;
    probability: number;
    confidence: number;
    timeframe: string;
  }>;
  trend_predictions: Array<{
    metric: string;
    predictedValue: number;
    confidence: number;
    timeframe: string;
  }>;
  recommendations: Array<{
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
}
