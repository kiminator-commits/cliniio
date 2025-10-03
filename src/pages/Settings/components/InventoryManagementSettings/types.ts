export interface InventorySettings {
  // General Inventory Settings
  autoCalculateTotals: boolean;
  requireApprovalForAdjustments: boolean;
  allowNegativeQuantities: boolean;
  requireReasonForAdjustments: boolean;
  defaultTransactionType: string;
  enableRealTimeUpdates: boolean;
  enableAuditTrails: boolean;

  // Stock Management
  lowStockThreshold: number;
  criticalStockThreshold: number;
  autoReorderEnabled: boolean;
  reorderBufferDays: number;

  // Categories & Organization
  enableSubcategories: boolean;
  enableCustomTags: boolean;
  requireCategoryAssignment: boolean;

  // Reporting & Analytics
  autoGenerateReports: boolean;
  reportRetentionDays: number;
  includeSensitiveData: boolean;
  reportFormat: string;

  // AI Settings
  aiEnabled: boolean;
  computerVisionEnabled: boolean;
  smartCategorizationEnabled: boolean;
  predictiveAnalyticsEnabled: boolean;

  // AI Configuration
  aiConfidenceThreshold: number;
  autoCategorizationEnabled: boolean;
  smartFormFillingEnabled: boolean;
  maintenancePredictionsEnabled: boolean;
  demandForecastingEnabled: boolean;

  // AI Service Keys
  openaiApiKey: string;
  googleVisionApiKey: string;

  // AI Privacy
  dataSharingEnabled: boolean;
  localAIProcessingEnabled: boolean;
  aiDataRetentionDays: number;
}

export interface TabProps {
  id: string;
  children: React.ReactNode;
}
