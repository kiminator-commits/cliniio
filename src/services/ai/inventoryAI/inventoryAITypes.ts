export interface InventoryReportData {
  totalItems: number;
  categories: Record<string, number>;
  lowStockItems: Array<{
    id: string;
    name: string;
    current_stock: number;
    reorder_point: number;
  }>;
  highValueItems: Array<{
    id: string;
    name: string;
    value: number;
    category: string;
  }>;
}

export interface CostReportData {
  totalCosts: number;
  costByCategory: Record<string, number>;
  costTrends: Array<{
    month: string;
    cost: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
}

export interface MaintenanceReportData {
  totalMaintenance: number;
  maintenanceByType: Record<string, number>;
  upcomingMaintenance: Array<{
    id: string;
    equipment_name: string;
    due_date: string;
    type: string;
  }>;
}

export interface ComprehensiveReportData {
  inventory: InventoryReportData;
  predictive: Record<string, unknown>; // Will be defined when predictive analytics is implemented
  cost: CostReportData;
  maintenance: MaintenanceReportData;
  summary: {
    totalValue: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

export type ReportData =
  | InventoryReportData
  | CostReportData
  | MaintenanceReportData
  | ComprehensiveReportData;
