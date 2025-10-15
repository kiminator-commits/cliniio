import { supabase } from '@/lib/supabaseClient';
import type {
  InventoryReportData,
  CostReportData,
  MaintenanceReportData,
  ComprehensiveReportData,
  ReportData,
} from './inventoryAITypes';
import {
  groupByCategory,
  getLowStockItems,
  getHighValueItems,
  calculateTotalCosts,
  groupCostsByCategory,
  analyzeCostTrends,
  groupMaintenanceByType,
  getUpcomingMaintenance,
  generateSummary,
  convertToCSV,
  convertToExcel,
  convertToPDF,
  getMimeType,
} from './inventoryAIUtils';

export class CostAnalyticsService {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Export analytics report
  async exportAnalyticsReport(
    reportType:
      | 'inventory'
      | 'predictive'
      | 'cost'
      | 'maintenance'
      | 'comprehensive',
    format: 'pdf' | 'csv' | 'excel' | 'json',
    dateRange?: { start: string; end: string }
  ): Promise<{
    success: boolean;
    data?: ReportData;
    error?: string;
    downloadUrl?: string;
  }> {
    try {
      const startTime = Date.now();

      // Generate report data based on type
      let reportData: ReportData = {} as ReportData;

      switch (reportType) {
        case 'inventory':
          reportData = await this.generateInventoryReport();
          break;
        case 'predictive':
          // This would need to be passed from forecasting service
          reportData = {} as ComprehensiveReportData;
          break;
        case 'cost':
          reportData = await this.generateCostReport();
          break;
        case 'maintenance':
          reportData = await this.generateMaintenanceReport();
          break;
        case 'comprehensive':
          reportData = await this.generateComprehensiveReport();
          break;
      }

      // Format data based on export format
      const formattedData = await this.formatReportData(reportData, format);

      // Save export record
      const { error: saveError } = await supabase
        .from('inventory_ai_exports')
        .insert({
          facility_id: this.facilityId,
          report_type: reportType,
          export_format: format,
          date_range: dateRange,
          processing_time_ms: Date.now() - startTime,
          exported_at: new Date().toISOString(),
        });

      if (saveError) {
        console.error('Error saving export record:', saveError);
      }

      return {
        success: true,
        data: formattedData as ReportData,
        downloadUrl: await this.generateDownloadUrl(
          formattedData as ReportData,
          format
        ),
      };
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  // Private helper methods for report generation
  private async generateInventoryReport(): Promise<InventoryReportData> {
    // Implementation for inventory report generation using centralized service
    // Direct Supabase call instead of going through InventoryActionService
    const { data: inventory, error: _inventoryError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('facility_id', this.facilityId);
    const filteredInventory = inventory.filter(
      (item) => item.facility_id === this.facilityId
    );

    return {
      totalItems: filteredInventory?.length || 0,
      categories: groupByCategory(filteredInventory || []),
      lowStockItems: getLowStockItems(filteredInventory || []),
      highValueItems: getHighValueItems(filteredInventory || []),
    };
  }

  private async generateCostReport(): Promise<CostReportData> {
    // Implementation for cost report generation using centralized service
    // Direct Supabase call instead of going through InventoryActionService
    const { data: costs, error: costsError } = await supabase
      .from('inventory_costs')
      .select('*')
      .eq('facility_id', this.facilityId);

    if (costsError) {
      console.error(
        'Error getting inventory costs for cost report:',
        costsError
      );
      return {
        totalCosts: 0,
        costByCategory: {},
        costTrends: [],
      };
    }

    return {
      totalCosts: calculateTotalCosts(
        (costs || []) as Array<{ amount?: number; [key: string]: unknown }>
      ),
      costByCategory: groupCostsByCategory(
        (costs || []) as Array<{
          category?: string;
          amount?: number;
          [key: string]: unknown;
        }>
      ),
      costTrends: analyzeCostTrends(),
    };
  }

  private async generateMaintenanceReport(): Promise<MaintenanceReportData> {
    // Implementation for maintenance report generation using centralized service
    // Direct Supabase call instead of going through InventoryActionService
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('equipment_maintenance')
      .select('*')
      .eq('facility_id', this.facilityId);

    if (maintenanceError) {
      console.error(
        'Error getting equipment maintenance for maintenance report:',
        maintenanceError
      );
      return {
        totalMaintenance: 0,
        maintenanceByType: {},
        upcomingMaintenance: [],
      };
    }

    return {
      totalMaintenance: maintenance?.length || 0,
      maintenanceByType: groupMaintenanceByType(
        (maintenance || []) as Array<{ type?: string; [key: string]: unknown }>
      ),
      upcomingMaintenance: getUpcomingMaintenance(
        (maintenance || []) as Array<{
          due_date?: string;
          equipment_name?: string;
          type?: string;
          id?: string;
          [key: string]: unknown;
        }>
      ),
    };
  }

  private async generateComprehensiveReport(): Promise<ComprehensiveReportData> {
    // Implementation for comprehensive report generation
    const [inventory, cost, maintenance] = await Promise.all([
      this.generateInventoryReport(),
      this.generateCostReport(),
      this.generateMaintenanceReport(),
    ]);

    return {
      inventory,
      predictive: {}, // This would need to be passed from forecasting service
      cost,
      maintenance,
      summary: generateSummary(inventory),
    };
  }

  private async formatReportData(data: ReportData, format: string) {
    // Implementation for data formatting
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return convertToCSV(data);
      case 'excel':
        return convertToExcel(data);
      case 'pdf':
        return convertToPDF(data);
      default:
        return data;
    }
  }

  private async generateDownloadUrl(data: ReportData, format: string) {
    // Implementation for download URL generation
    const blob = new Blob([JSON.stringify(data)], {
      type: getMimeType(format),
    });
    return URL.createObjectURL(blob);
  }
}
