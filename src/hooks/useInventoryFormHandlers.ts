import { InventoryFormData } from '@/types/inventory';

interface UseInventoryFormHandlersProps {
  formData: InventoryFormData;
  setFormData: (data: InventoryFormData) => void;
  mergeFormData: (data: Partial<InventoryFormData>) => void;
  expandedSections: string[];
  setExpandedSections: (sections: string[]) => void;
}

export const useInventoryFormHandlers = ({
  expandedSections,
  setExpandedSections,
  mergeFormData,
}: UseInventoryFormHandlersProps) => {
  // Debug logging removed for performance

  const handleFormChangeWrapper = (
    field: keyof InventoryFormData,
    value: unknown
  ) => {
    console.log(
      '🛠 handleFormChangeWrapper invoked. Field:',
      field,
      'Value:',
      value,
      'mergeFormData type:',
      typeof mergeFormData
    );

    if (typeof mergeFormData !== 'function') {
      console.error(
        '❌ mergeFormData is not a function inside useInventoryFormHandlers!'
      );
      return;
    }

    if (field === 'category') {
      mergeFormData({ category: value as string });
    } else {
      mergeFormData({ [field]: value });
    }
  };

  return {
    handleFormChangeWrapper,
    handleToggleSection: (section: string) => {
      setExpandedSections(
        expandedSections.includes(section)
          ? expandedSections.filter((s) => s !== section)
          : [...expandedSections, section]
      );
    },
  };
};
