import { TabType } from '../types';

// Define proper types for modal data
export interface ModalFormData {
  id?: string;
  item?: string;
  category?: string;
  location?: string;
  description?: string;
  barcode?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ModalConfig {
  title: string;
  submitText: string;
  fields: string[];
  isDestructive?: boolean;
}

/**
 * Service for handling inventory modal operations
 * Extracted from main Inventory page component
 */
export class InventoryModalsService {
  /**
   * Handle modal state management
   */
  static handleModalState(
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    action: 'open' | 'close' | 'toggle'
  ) {
    switch (action) {
      case 'open':
        setIsOpen(true);
        break;
      case 'close':
        setIsOpen(false);
        break;
      case 'toggle':
        setIsOpen(!isOpen);
        break;
    }
  }

  /**
   * Handle modal form data
   */
  static handleModalFormData(
    formData: ModalFormData,
    setFormData: (data: ModalFormData) => void,
    field: string,
    value: unknown
  ) {
    setFormData({
      ...formData,
      [field]: value,
    });
  }

  /**
   * Validate modal form data
   */
  static validateModalForm(
    formData: ModalFormData,
    modalType: string
  ): ValidationResult {
    const errors: Record<string, string> = {};

    switch (modalType) {
      case 'add':
      case 'edit':
        if (!formData.item?.trim()) {
          errors.item = 'Item name is required';
        }
        if (!formData.category?.trim()) {
          errors.category = 'Category is required';
        }
        if (!formData.location?.trim()) {
          errors.location = 'Location is required';
        }
        break;
      case 'delete':
        if (!formData.id) {
          errors.id = 'Item ID is required';
        }
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Handle modal submission
   */
  static handleModalSubmission(
    formData: ModalFormData,
    modalType: string,
    onSubmit: (data: ModalFormData) => void,
    onClose: () => void
  ): ValidationResult {
    const validation = this.validateModalForm(formData, modalType);

    if (validation.isValid) {
      onSubmit(formData);
      onClose();
    }

    return validation;
  }

  /**
   * Get modal configuration
   */
  static getModalConfig(modalType: string, activeTab: TabType): ModalConfig {
    const configs: Record<string, ModalConfig> = {
      add: {
        title: `Add ${activeTab.slice(0, -1)}`,
        submitText: 'Add Item',
        fields: ['item', 'category', 'location', 'description'],
      },
      edit: {
        title: `Edit ${activeTab.slice(0, -1)}`,
        submitText: 'Update Item',
        fields: ['item', 'category', 'location', 'description'],
      },
      delete: {
        title: 'Delete Item',
        submitText: 'Delete',
        fields: [],
        isDestructive: true,
      },
      scan: {
        title: 'Scan Barcode',
        submitText: 'Scan',
        fields: ['barcode'],
      },
    };

    return configs[modalType] || configs.add;
  }

  /**
   * Handle modal keyboard shortcuts
   */
  static handleModalKeyboard(
    event: KeyboardEvent,
    onClose: () => void,
    onSubmit?: () => void
  ) {
    if (event.key === 'Escape') {
      onClose();
    }

    if (event.key === 'Enter' && event.ctrlKey && onSubmit) {
      onSubmit();
    }
  }
}

// Export the missing functions that are imported by InventoryModalsWrapper
export const handleSave = (formData: Record<string, unknown>, onSave?: (data: Record<string, unknown>) => void) => {
  try {
    if (onSave) onSave(formData);
    console.info('Inventory modal data saved:', formData);
  } catch (error) {
    console.error('Error saving inventory modal data:', error);
  }
};

export const handleToggleSection = (
  sectionId: string,
  expandedSections: Set<string>,
  setExpandedSections: (s: Set<string>) => void
) => {
  const updated = new Set(expandedSections);
  if (updated.has(sectionId)) updated.delete(sectionId);
  else updated.add(sectionId);
  setExpandedSections(updated);
};

export const handleFormChangeWrapper = (
  field: string,
  value: unknown,
  formState: Record<string, unknown>,
  setFormState: (state: Record<string, unknown>) => void
) => {
  setFormState({ ...formState, [field]: value });
};
