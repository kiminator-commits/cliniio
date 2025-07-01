import { toggleSection, handleFormChange } from '@/utils/inventoryHelpers';
import { LocalInventoryItem } from '@/types/inventoryTypes';

interface UseInventoryFormHandlersParams {
  expandedSections: Record<string, boolean>;
  setExpandedSections: (value: Record<string, boolean>) => void;
  formData: Partial<LocalInventoryItem>;
  setFormData: (value: Partial<LocalInventoryItem>) => void;
}

export function useInventoryFormHandlers({
  expandedSections,
  setExpandedSections,
  formData,
  setFormData,
}: UseInventoryFormHandlersParams) {
  return {
    handleToggleSection: (section: keyof typeof expandedSections) =>
      setExpandedSections(toggleSection(expandedSections, section)),

    handleFormChangeWrapper: (field: string, value: string) =>
      setFormData(handleFormChange(formData, field as keyof typeof formData, value)),
  };
}
