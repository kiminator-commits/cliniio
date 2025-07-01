import { LocalInventoryItem } from '@/types/inventoryTypes';

/**
 * Modal configuration types
 */
export interface ModalConfig {
  id: string;
  title: string;
  size: 'sm' | 'lg' | 'xl';
  centered: boolean;
  backdrop: boolean | 'static';
  keyboard: boolean;
  scrollable: boolean;
  className?: string;
}

/**
 * Form field configuration for modals
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'textarea' | 'date' | 'location';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/**
 * Section configuration for collapsible sections
 */
export interface SectionConfig {
  id: string;
  title: string;
  icon?: string;
  defaultExpanded: boolean;
  fields: FormFieldConfig[];
}

/**
 * Modal configurations for inventory modals
 */
export const INVENTORY_MODAL_CONFIGS = {
  ADD_ITEM: {
    id: 'add-item-modal',
    title: 'Add New Item',
    size: 'lg' as const,
    centered: true,
    backdrop: 'static' as const,
    keyboard: true,
    scrollable: true,
    className: 'inventory-modal',
  } as ModalConfig,

  EDIT_ITEM: {
    id: 'edit-item-modal',
    title: 'Edit Item',
    size: 'lg' as const,
    centered: true,
    backdrop: 'static' as const,
    keyboard: true,
    scrollable: true,
    className: 'inventory-modal',
  } as ModalConfig,

  TRACK_ITEM: {
    id: 'track-item-modal',
    title: 'Track Items',
    size: 'xl' as const,
    centered: true,
    backdrop: true,
    keyboard: true,
    scrollable: true,
    className: 'track-modal',
  } as ModalConfig,

  UPLOAD_BARCODE: {
    id: 'upload-barcode-modal',
    title: 'Upload Barcode',
    size: 'lg' as const,
    centered: true,
    backdrop: 'static' as const,
    keyboard: true,
    scrollable: false,
    className: 'upload-modal',
  } as ModalConfig,

  SCAN_ITEM: {
    id: 'scan-item-modal',
    title: 'Scan Items',
    size: 'lg' as const,
    centered: true,
    backdrop: 'static' as const,
    keyboard: true,
    scrollable: false,
    className: 'scan-modal',
  } as ModalConfig,
};

/**
 * Form section configurations for add/edit item modal
 */
export const ADD_EDIT_ITEM_SECTIONS: SectionConfig[] = [
  {
    id: 'general',
    title: 'General Information',
    defaultExpanded: true,
    fields: [
      {
        name: 'itemName',
        label: 'Item Name',
        type: 'text',
        required: true,
        placeholder: 'Enter item name',
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'tools', label: 'Tools' },
          { value: 'supplies', label: 'Supplies' },
          { value: 'equipment', label: 'Equipment' },
          { value: 'officeHardware', label: 'Office Hardware' },
        ],
      },
      {
        name: 'id',
        label: 'ID / Serial #',
        type: 'text',
        required: true,
        placeholder: 'Enter ID or serial number',
      },
      {
        name: 'location',
        label: 'Location',
        type: 'location',
        required: true,
      },
    ],
  },
  {
    id: 'purchase',
    title: 'Purchase Information',
    defaultExpanded: false,
    fields: [
      {
        name: 'purchaseDate',
        label: 'Purchase Date',
        type: 'date',
        required: false,
      },
      {
        name: 'vendor',
        label: 'Vendor',
        type: 'text',
        required: false,
        placeholder: 'Enter vendor name',
      },
      {
        name: 'cost',
        label: 'Cost',
        type: 'number',
        required: false,
        placeholder: 'Enter cost',
        validation: {
          min: 0,
        },
      },
      {
        name: 'warranty',
        label: 'Warranty',
        type: 'text',
        required: false,
        placeholder: 'Enter warranty information',
      },
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance Information',
    defaultExpanded: false,
    fields: [
      {
        name: 'maintenanceSchedule',
        label: 'Maintenance Schedule',
        type: 'text',
        required: false,
        placeholder: 'Enter maintenance schedule',
      },
      {
        name: 'lastServiced',
        label: 'Last Serviced',
        type: 'date',
        required: false,
      },
      {
        name: 'nextDue',
        label: 'Next Due',
        type: 'date',
        required: false,
      },
      {
        name: 'serviceProvider',
        label: 'Service Provider',
        type: 'text',
        required: false,
        placeholder: 'Enter service provider',
      },
    ],
  },
  {
    id: 'usage',
    title: 'Usage Information',
    defaultExpanded: false,
    fields: [
      {
        name: 'assignedTo',
        label: 'Assigned To',
        type: 'text',
        required: false,
        placeholder: 'Enter assigned person',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: false,
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'maintenance', label: 'Maintenance' },
        ],
      },
      {
        name: 'quantity',
        label: 'Quantity',
        type: 'number',
        required: false,
        placeholder: 'Enter quantity',
        validation: {
          min: 0,
        },
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        required: false,
        placeholder: 'Additional notes',
      },
    ],
  },
];

/**
 * Helper function to get modal configuration by type
 */
export const getModalConfig = (modalType: keyof typeof INVENTORY_MODAL_CONFIGS): ModalConfig => {
  return INVENTORY_MODAL_CONFIGS[modalType];
};

/**
 * Helper function to get section configuration by ID
 */
export const getSectionConfig = (sectionId: string): SectionConfig | undefined => {
  return ADD_EDIT_ITEM_SECTIONS.find(section => section.id === sectionId);
};

/**
 * Helper function to get field configuration by name
 */
export const getFieldConfig = (fieldName: string): FormFieldConfig | undefined => {
  for (const section of ADD_EDIT_ITEM_SECTIONS) {
    const field = section.fields.find(f => f.name === fieldName);
    if (field) return field;
  }
  return undefined;
};

/**
 * Helper function to validate form data against field configurations
 */
export const validateFormData = (formData: Partial<LocalInventoryItem>): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const section of ADD_EDIT_ITEM_SECTIONS) {
    for (const field of section.fields) {
      if (field.required && !formData[field.name as keyof LocalInventoryItem]) {
        errors[field.name] = `${field.label} is required`;
      }

      if (field.validation && formData[field.name as keyof LocalInventoryItem]) {
        const value = formData[field.name as keyof LocalInventoryItem];

        if (field.validation.min !== undefined && Number(value) < field.validation.min) {
          errors[field.name] = `${field.label} must be at least ${field.validation.min}`;
        }

        if (field.validation.max !== undefined && Number(value) > field.validation.max) {
          errors[field.name] = `${field.label} must be at most ${field.validation.max}`;
        }

        if (field.validation.pattern && typeof value === 'string') {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors[field.name] = field.validation.message || `${field.label} format is invalid`;
          }
        }
      }
    }
  }

  return errors;
};
