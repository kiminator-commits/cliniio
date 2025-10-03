import {
  DEFAULT_CATEGORY,
  DEFAULT_UNKNOWN,
  DEFAULT_UNKNOWN_EQUIPMENT,
  MIME_TYPES,
  DEFAULT_RISK_LEVEL,
  DEFAULT_RECOMMENDATIONS,
  HIGH_VALUE_ITEMS_LIMIT,
  UPCOMING_MAINTENANCE_LIMIT,
  PLACEHOLDER_MAINTENANCE_ID,
  PLACEHOLDER_COST_TRENDS,
} from './inventoryAIConfig';
import type { InventoryReportData, ReportData } from './inventoryAITypes';

// Data grouping and categorization utilities
export function groupByCategory(
  items: Array<{ category?: string | null; [key: string]: unknown }>
) {
  return items.reduce(
    (acc, item) => {
      const category = item.category || DEFAULT_CATEGORY;
      if (!acc[category]) acc[category] = 0;
      acc[category] = (acc[category] as number) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

export function groupCostsByCategory(
  costs: Array<{ category?: string; amount?: number; [key: string]: unknown }>
) {
  return costs.reduce(
    (acc, cost) => {
      const category = cost.category || DEFAULT_CATEGORY;
      acc[category] = (acc[category] || 0) + (cost.amount || 0);
      return acc;
    },
    {} as Record<string, number>
  );
}

export function groupMaintenanceByType(
  maintenance: Array<{ type?: string; [key: string]: unknown }>
) {
  return maintenance.reduce(
    (acc, item) => {
      const type = item.type || DEFAULT_UNKNOWN;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

// Inventory analysis utilities
export function getLowStockItems(
  items: Array<{
    quantity?: number | null;
    data?: { min_quantity?: number };
    [key: string]: unknown;
  }>
) {
  return items
    .filter(
      (item) =>
        (item.quantity || 0) <
        (((item.data as { min_quantity?: number })?.min_quantity as number) ||
          0)
    )
    .map((item) => ({
      id: ((item as { id?: string }).id as string) || '',
      name: ((item as { name?: string }).name as string) || '',
      current_stock: item.quantity || 0,
      reorder_point:
        ((item.data as { min_quantity?: number })?.min_quantity as number) ||
        0,
    }));
}

export function getHighValueItems(
  items: Array<{ value?: number; [key: string]: unknown }>
) {
  return items
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, HIGH_VALUE_ITEMS_LIMIT)
    .map((item) => ({
      id: ((item as { id?: string }).id as string) || '',
      name: ((item as { name?: string }).name as string) || '',
      value: item.value || 0,
      category:
        ((item as { category?: string }).category as string) || DEFAULT_UNKNOWN,
    }));
}

export function getUpcomingMaintenance(
  maintenance: Array<{
    due_date?: string;
    equipment_name?: string;
    type?: string;
    [key: string]: unknown;
  }>
) {
  // Placeholder implementation
  return maintenance.slice(0, UPCOMING_MAINTENANCE_LIMIT).map((item) => ({
    id: PLACEHOLDER_MAINTENANCE_ID,
    equipment_name: item.equipment_name || DEFAULT_UNKNOWN_EQUIPMENT,
    due_date: item.due_date || new Date().toISOString(),
    type: item.type || DEFAULT_UNKNOWN,
  }));
}

// Cost calculation utilities
export function calculateTotalCosts(
  costs: Array<{ amount?: number; [key: string]: unknown }>
) {
  return costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);
}

export function analyzeCostTrends() {
  // Placeholder implementation
  return PLACEHOLDER_COST_TRENDS;
}

// Summary generation utilities
export function generateSummary(inventory: InventoryReportData) {
  return {
    totalValue: inventory.totalItems,
    riskLevel: DEFAULT_RISK_LEVEL, // Placeholder, will be updated with actual risk calculation
    recommendations: DEFAULT_RECOMMENDATIONS,
  };
}

// Data formatting utilities
export function convertToCSV(data: ReportData): string {
  // Simple CSV conversion
  if (Array.isArray(data)) {
    const headers = Object.keys(data[0] || {});
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) =>
        JSON.stringify(row[header] || '')
      );
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
  return JSON.stringify(data);
}

export function convertToExcel(data: ReportData): unknown {
  // Placeholder for Excel conversion
  // In a real implementation, you would use a library like xlsx
  return data;
}

export function convertToPDF(data: ReportData): unknown {
  // Placeholder for PDF conversion
  // In a real implementation, you would use a library like jsPDF
  return data;
}

// MIME type utility
export function getMimeType(format: string): string {
  switch (format) {
    case 'csv':
      return MIME_TYPES.csv;
    case 'excel':
      return MIME_TYPES.excel;
    case 'pdf':
      return MIME_TYPES.pdf;
    case 'json':
      return MIME_TYPES.json;
    default:
      return MIME_TYPES.default;
  }
}
