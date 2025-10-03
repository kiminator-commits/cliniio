import { InventoryItem } from '@/types/inventoryTypes';

export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  format: 'csv' | 'json' | 'excel';
  fields: ExportField[];
  filters?: ExportFilter[];
  includeHeaders: boolean;
  dateFormat: string;
  fileNamePattern: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportField {
  key: keyof InventoryItem;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  order: number;
  transform?: (value: unknown) => unknown;
}

export interface ExportFilter {
  field: keyof InventoryItem;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'lessThan'
    | 'between'
    | 'in'
    | 'notIn';
  value: unknown;
  value2?: unknown; // For 'between' operator
}

export interface ExportSchedule {
  id: string;
  name: string;
  templateId: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  cronExpression?: string; // For custom schedules
  recipients: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing export templates and schedules
 */
export class InventoryExportTemplateService {
  private static readonly DEFAULT_TEMPLATES: ExportTemplate[] = [
    {
      id: 'basic-csv',
      name: 'Basic CSV Export',
      description: 'Standard CSV export with essential fields',
      format: 'csv',
      fields: [
        { key: 'id', label: 'ID', type: 'string', required: true, order: 1 },
        {
          key: 'name',
          label: 'Item Name',
          type: 'string',
          required: true,
          order: 2,
        },
        {
          key: 'category',
          label: 'Category',
          type: 'string',
          required: true,
          order: 3,
        },
        {
          key: 'location',
          label: 'Location',
          type: 'string',
          required: true,
          order: 4,
        },
        {
          key: 'status',
          label: 'Status',
          type: 'string',
          required: true,
          order: 5,
        },
        {
          key: 'quantity',
          label: 'Quantity',
          type: 'number',
          required: true,
          order: 6,
        },
        {
          key: 'cost',
          label: 'Cost',
          type: 'number',
          required: true,
          order: 7,
        },
        {
          key: 'vendor',
          label: 'Vendor',
          type: 'string',
          required: false,
          order: 8,
        },
        {
          key: 'purchaseDate',
          label: 'Purchase Date',
          type: 'date',
          required: false,
          order: 9,
        },
        {
          key: 'lastUpdated',
          label: 'Last Updated',
          type: 'date',
          required: false,
          order: 10,
        },
      ],
      includeHeaders: true,
      dateFormat: 'YYYY-MM-DD',
      fileNamePattern: 'inventory_export_{date}.csv',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'detailed-json',
      name: 'Detailed JSON Export',
      description: 'Complete inventory data in JSON format',
      format: 'json',
      fields: [
        { key: 'id', label: 'ID', type: 'string', required: true, order: 1 },
        {
          key: 'name',
          label: 'Item Name',
          type: 'string',
          required: true,
          order: 2,
        },
        {
          key: 'category',
          label: 'Category',
          type: 'string',
          required: true,
          order: 3,
        },
        {
          key: 'location',
          label: 'Location',
          type: 'string',
          required: true,
          order: 4,
        },
        {
          key: 'status',
          label: 'Status',
          type: 'string',
          required: true,
          order: 5,
        },
        {
          key: 'quantity',
          label: 'Quantity',
          type: 'number',
          required: true,
          order: 6,
        },
        {
          key: 'cost',
          label: 'Cost',
          type: 'number',
          required: true,
          order: 7,
        },
        {
          key: 'vendor',
          label: 'Vendor',
          type: 'string',
          required: false,
          order: 8,
        },
        {
          key: 'purchaseDate',
          label: 'Purchase Date',
          type: 'date',
          required: false,
          order: 9,
        },
        {
          key: 'warranty',
          label: 'Warranty',
          type: 'string',
          required: false,
          order: 10,
        },
        {
          key: 'maintenanceSchedule',
          label: 'Maintenance Schedule',
          type: 'string',
          required: false,
          order: 11,
        },
        {
          key: 'lastServiced',
          label: 'Last Serviced',
          type: 'date',
          required: false,
          order: 12,
        },
        {
          key: 'nextDue',
          label: 'Next Due',
          type: 'date',
          required: false,
          order: 13,
        },
        {
          key: 'serviceProvider',
          label: 'Service Provider',
          type: 'string',
          required: false,
          order: 14,
        },
        {
          key: 'assignedTo',
          label: 'Assigned To',
          type: 'string',
          required: false,
          order: 15,
        },
        {
          key: 'notes',
          label: 'Notes',
          type: 'string',
          required: false,
          order: 16,
        },
        {
          key: 'lastUpdated',
          label: 'Last Updated',
          type: 'date',
          required: false,
          order: 17,
        },
      ],
      includeHeaders: false, // JSON doesn't need headers
      dateFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
      fileNamePattern: 'inventory_detailed_{date}.json',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'low-stock-alert',
      name: 'Low Stock Alert',
      description: 'Export items with low quantity for reordering',
      format: 'csv',
      fields: [
        { key: 'id', label: 'ID', type: 'string', required: true, order: 1 },
        {
          key: 'name',
          label: 'Item Name',
          type: 'string',
          required: true,
          order: 2,
        },
        {
          key: 'category',
          label: 'Category',
          type: 'string',
          required: true,
          order: 3,
        },
        {
          key: 'location',
          label: 'Location',
          type: 'string',
          required: true,
          order: 4,
        },
        {
          key: 'quantity',
          label: 'Current Quantity',
          type: 'number',
          required: true,
          order: 5,
        },
        {
          key: 'vendor',
          label: 'Vendor',
          type: 'string',
          required: false,
          order: 6,
        },
        {
          key: 'cost',
          label: 'Unit Cost',
          type: 'number',
          required: true,
          order: 7,
        },
      ],
      filters: [
        { field: 'quantity', operator: 'lessThan', value: 10 },
        { field: 'status', operator: 'equals', value: 'active' },
      ],
      includeHeaders: true,
      dateFormat: 'YYYY-MM-DD',
      fileNamePattern: 'low_stock_alert_{date}.csv',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  /**
   * Get all export templates
   */
  static async getTemplates(): Promise<ExportTemplate[]> {
    // In a real implementation, this would fetch from database
    // For now, return default templates
    return [...this.DEFAULT_TEMPLATES];
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id: string): Promise<ExportTemplate | null> {
    const templates = await this.getTemplates();
    return templates.find((template) => template.id === id) || null;
  }

  /**
   * Create new template
   */
  static async createTemplate(
    template: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ExportTemplate> {
    const newTemplate: ExportTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, save to database
    this.DEFAULT_TEMPLATES.push(newTemplate);
    return newTemplate;
  }

  /**
   * Update template
   */
  static async updateTemplate(
    id: string,
    updates: Partial<ExportTemplate>
  ): Promise<ExportTemplate | null> {
    const template = await this.getTemplateById(id);
    if (!template) return null;

    const updatedTemplate: ExportTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };

    // In a real implementation, update in database
    const index = this.DEFAULT_TEMPLATES.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.DEFAULT_TEMPLATES[index] = updatedTemplate;
    }

    return updatedTemplate;
  }

  /**
   * Delete template
   */
  static async deleteTemplate(id: string): Promise<boolean> {
    const index = this.DEFAULT_TEMPLATES.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.DEFAULT_TEMPLATES.splice(index, 1);
    return true;
  }

  /**
   * Apply template to items
   */
  static applyTemplate(
    items: InventoryItem[],
    template: ExportTemplate
  ): Record<string, unknown>[] {
    // Sort fields by order
    const sortedFields = template.fields.sort((a, b) => a.order - b.order);

    // Apply filters if any
    let filteredItems = items;
    if (template.filters && template.filters.length > 0) {
      filteredItems = this.applyFilters(items, template.filters);
    }

    // Transform items according to template
    return filteredItems.map((item) => {
      const transformedItem: Record<string, unknown> = {};

      for (const field of sortedFields) {
        const value = item[field.key];

        if (field.transform) {
          transformedItem[field.label] = field.transform(value);
        } else {
          transformedItem[field.label] = this.formatValue(
            value,
            field.type,
            template.dateFormat
          );
        }
      }

      return transformedItem;
    });
  }

  /**
   * Apply filters to items
   */
  private static applyFilters(
    items: InventoryItem[],
    filters: ExportFilter[]
  ): InventoryItem[] {
    return items.filter((item) => {
      return filters.every((filter) => {
        const value = item[filter.field];

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value)
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          case 'startsWith':
            return String(value)
              .toLowerCase()
              .startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(value)
              .toLowerCase()
              .endsWith(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          case 'between':
            return (
              Number(value) >= Number(filter.value) &&
              Number(value) <= Number(filter.value2)
            );
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          case 'notIn':
            return Array.isArray(filter.value) && !filter.value.includes(value);
          default:
            return true;
        }
      });
    });
  }

  /**
   * Format value according to field type
   */
  private static formatValue(
    value: unknown,
    type: string,
    dateFormat: string
  ): unknown {
    if (value === null || value === undefined) {
      return '';
    }

    switch (type) {
      case 'date':
        if (value instanceof Date) {
          return this.formatDate(value, dateFormat);
        }
        return value;
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'object':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  /**
   * Format date according to pattern
   */
  private static formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
      .replace('SSS', milliseconds);
  }

  /**
   * Generate filename from pattern
   */
  static generateFileName(template: ExportTemplate): string {
    const now = new Date();
    const date = this.formatDate(now, 'YYYY-MM-DD');
    const time = this.formatDate(now, 'HH-mm-ss');

    return template.fileNamePattern
      .replace('{date}', date)
      .replace('{time}', time)
      .replace('{timestamp}', `${date}_${time}`);
  }

  /**
   * Validate template
   */
  static validateTemplate(template: ExportTemplate): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!template.name?.trim()) {
      errors.push('Template name is required');
    }

    if (
      !template.format ||
      !['csv', 'json', 'excel'].includes(template.format)
    ) {
      errors.push('Invalid format. Must be csv, json, or excel.');
    }

    if (!template.fields || template.fields.length === 0) {
      errors.push('At least one field is required');
    }

    if (!template.fileNamePattern?.trim()) {
      errors.push('File name pattern is required');
    }

    // Validate field configuration
    if (template.fields) {
      const fieldKeys = template.fields.map((f) => f.key);
      const duplicateKeys = fieldKeys.filter(
        (key, index) => fieldKeys.indexOf(key) !== index
      );

      if (duplicateKeys.length > 0) {
        errors.push(`Duplicate field keys: ${duplicateKeys.join(', ')}`);
      }

      template.fields.forEach((field, index) => {
        if (!field.key) {
          errors.push(`Field ${index + 1}: Key is required`);
        }
        if (!field.label?.trim()) {
          errors.push(`Field ${index + 1}: Label is required`);
        }
        if (field.order === undefined || field.order < 0) {
          errors.push(
            `Field ${index + 1}: Order must be a non-negative number`
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
