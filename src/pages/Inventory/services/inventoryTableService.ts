import { TabType } from '../types';
import { InventoryItem } from '@/types/inventoryTypes';

/**
 * Service for handling inventory table operations
 * Extracted from main Inventory page component
 */
export class InventoryTableService {
  /**
   * Handle table row selection
   */
  static handleRowSelection(
    selectedRows: string[],
    setSelectedRows: (rows: string[]) => void,
    rowId: string,
    isSelected: boolean
  ) {
    if (isSelected) {
      setSelectedRows([...selectedRows, rowId]);
    } else {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    }
  }

  /**
   * Handle table sorting
   */
  static handleTableSort(
    data: InventoryItem[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortBy];
      const bValue = (b as Record<string, unknown>)[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }

  /**
   * Handle table filtering
   */
  static handleTableFilter(
    data: InventoryItem[],
    filters: Record<string, unknown>
  ) {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        const itemValue = (item as Record<string, unknown>)[key];
        if (typeof value === 'string') {
          return itemValue
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        }

        return itemValue === value;
      });
    });
  }

  /**
   * Handle table pagination
   */
  static handleTablePagination(
    data: InventoryItem[],
    currentPage: number,
    itemsPerPage: number
  ) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      paginatedData: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / itemsPerPage),
      totalItems: data.length,
    };
  }

  /**
   * Handle table export
   */
  static handleTableExport(
    data: InventoryItem[],
    format: 'csv' | 'json' | 'excel'
  ) {
    switch (format) {
      case 'csv':
        return this.exportToCSV(data);
      case 'json':
        return this.exportToJSON(data);
      case 'excel':
        return this.exportToExcel(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private static exportToCSV(data: InventoryItem[]) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => (row as Record<string, unknown>)[header])
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  private static exportToJSON(data: InventoryItem[]) {
    return JSON.stringify(data, null, 2);
  }

  private static exportToExcel(data: InventoryItem[]) {
    // Simple Excel-like export using CSV with .xlsx extension
    // For a full Excel implementation, you would use a library like 'xlsx'
    const csvContent = this.exportToCSV(data);

    // Create a blob with Excel MIME type
    const blob = new Blob([csvContent], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return csvContent; // Return for compatibility
  }

  /**
   * Get table configuration for different tabs
   */
  static getTableConfig(activeTab: TabType) {
    const configs = {
      tools: {
        columns: ['item', 'category', 'location', 'status', 'actions'],
        sortable: ['item', 'category', 'location'],
        filterable: ['category', 'location', 'status'],
      },
      supplies: {
        columns: ['item', 'category', 'quantity', 'cost', 'actions'],
        sortable: ['item', 'category', 'quantity', 'cost'],
        filterable: ['category', 'quantity'],
      },
      equipment: {
        columns: ['item', 'category', 'location', 'status', 'actions'],
        sortable: ['item', 'category', 'location'],
        filterable: ['category', 'location', 'status'],
      },
      officeHardware: {
        columns: ['item', 'category', 'location', 'warranty', 'actions'],
        sortable: ['item', 'category', 'location'],
        filterable: ['category', 'location'],
      },
    };

    return configs[activeTab] || configs.tools;
  }
}
