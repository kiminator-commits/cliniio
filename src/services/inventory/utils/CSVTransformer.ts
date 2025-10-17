import { InventoryItem } from '../../../types/inventory';

/**
 * Handles CSV import/export transformations for inventory items
 */
export class CSVTransformer {
  /**
   * Converts inventory item to CSV format
   */
  static transformToCSV(items: InventoryItem[]): string {
    if (items.length === 0) return '';

    const headers = ['Name', 'Quantity', 'Category', 'Status', 'Expiry Date'];
    const rows = items.map((item) => [
      item.name,
      (item.quantity || 1).toString(),
      item.category,
      item.status,
      ((item.data as Record<string, unknown>)?.expiration as string) || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Converts CSV string to inventory items
   */
  static transformFromCSV(csvString: string): any[] {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());
    const dataLines = lines.slice(1);

    return dataLines.map((line: any) => {
      const values = line.split(',').map((v) => v.replace(/"/g, '').trim());
      const item: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        item[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
      });

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: (item.name as string) || '',
        category: (item.category as string) || '',
        status: (item.status as string) || 'active',
        quantity: parseInt(item.quantity as string) || 1,
        unit_cost: 0,
        reorder_point: 0,
        expiration_date: (item.expirydate as string) || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        facility_id: '',
        location: '',
        data: {
          description: '',
          barcode: '',
          warranty: '',
          serialNumber: '',
          manufacturer: '',
          lastServiced: '',
          unit: '',
          supplier: '',
          notes: '',
          tags: [],
          imageUrl: '',
          isActive: true,
          tracked: false,
          favorite: false,
          purchaseDate: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentPhase: 'Active',
          sku: '',
          p2Status: '',
          toolId: '',
          supplyId: '',
          equipmentId: '',
          hardwareId: '',
          serviceProvider: '',
          assignedTo: '',
        },
      };
    });
  }
}
