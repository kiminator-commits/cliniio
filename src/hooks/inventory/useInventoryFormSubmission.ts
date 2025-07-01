import { useCallback, useState } from 'react';
import { LocalInventoryItem } from '@/types/inventoryTypes';
import { inventoryService } from '@/services/inventoryService';
import { useInventoryFormValidation } from './useInventoryFormValidation';

interface UseInventoryFormSubmissionParams {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onValidationError?: (errors: Record<string, string>) => void;
}

interface UseInventoryFormSubmissionReturn {
  isSubmitting: boolean;
  submitForm: (formData: Partial<LocalInventoryItem>) => Promise<boolean>;
  resetSubmission: () => void;
}

export const useInventoryFormSubmission = ({
  onSuccess,
  onError,
  onValidationError,
}: UseInventoryFormSubmissionParams = {}): UseInventoryFormSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateForm, clearErrors } = useInventoryFormValidation();

  const submitForm = useCallback(
    async (formData: Partial<LocalInventoryItem>): Promise<boolean> => {
      setIsSubmitting(true);
      clearErrors();

      try {
        // Validate form data
        const isValid = await validateForm(formData);
        if (!isValid) {
          onValidationError?.({});
          return false;
        }

        // Prepare item data for submission
        const itemToSave = {
          id: getItemId(formData),
          name: formData.item || '',
          category: formData.category || '',
          location: formData.location || '',
          status: 'Available',
          lastUpdated: new Date().toISOString(),
          toolId: 'toolId' in formData ? formData.toolId : undefined,
          supplyId: 'supplyId' in formData ? formData.supplyId : undefined,
          equipmentId: 'equipmentId' in formData ? formData.equipmentId : undefined,
          hardwareId: 'hardwareId' in formData ? formData.hardwareId : undefined,
        };

        // Submit to service
        await inventoryService.addInventoryItem(itemToSave);

        onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit form';
        onError?.(errorMessage);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, clearErrors, onSuccess, onError, onValidationError]
  );

  const resetSubmission = useCallback(() => {
    setIsSubmitting(false);
    clearErrors();
  }, [clearErrors]);

  return {
    isSubmitting,
    submitForm,
    resetSubmission,
  };
};

// Helper function to get item ID from form data
const getItemId = (formData: Partial<LocalInventoryItem>): string => {
  if ('toolId' in formData && formData.toolId) return formData.toolId;
  if ('supplyId' in formData && formData.supplyId) return formData.supplyId;
  if ('equipmentId' in formData && formData.equipmentId) return formData.equipmentId;
  if ('hardwareId' in formData && formData.hardwareId) return formData.hardwareId;
  return '';
};
