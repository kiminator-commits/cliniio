import { useCallback, useState } from 'react';
import { InventoryFormData } from '../../types/inventory';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { useInventoryFormValidation } from './useInventoryFormValidation';

interface UseInventoryFormSubmissionParams {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onValidationError?: (errors: Record<string, string>) => void;
}

interface UseInventoryFormSubmissionReturn {
  isSubmitting: boolean;
  submitForm: (formData: Partial<InventoryFormData>) => Promise<boolean>;
  resetSubmission: () => void;
}

interface InventoryItemData {
  id?: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string;
  barcode?: string;
  [key: string]: unknown;
}

export const useInventoryFormSubmission = ({
  onSuccess,
  onError,
  onValidationError,
}: UseInventoryFormSubmissionParams = {}): UseInventoryFormSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateForm, clearErrors } = useInventoryFormValidation();

  const submitForm = useCallback(
    async (formData: Partial<InventoryFormData>): Promise<boolean> => {
      setIsSubmitting(true);
      clearErrors();

      try {
        // Validate form data
        const isValid = await validateForm(formData);
        if (!isValid) {
          onValidationError?.({});
          return false;
        }

        // Helper function to parse cost from text input
        const parseCost = (costText?: string): number => {
          if (!costText) return 0;
          // Remove currency symbols and commas, then parse
          const cleanCost = costText.replace(/[$,\s]/g, '');
          const parsed = parseFloat(cleanCost);
          return isNaN(parsed) ? 0 : parsed;
        };

        // Prepare item data for submission
        const itemToSave = {
          id: formData.id,
          name: formData.itemName || '',
          category: formData.category || '',
          location: formData.location || '',
          status: formData.status || 'Active',
          quantity: parseInt(formData.quantity?.toString() || '1') || 1,
          unit_cost: parseCost(formData.unitCost?.toString()),
          facility_id: 'unknown',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reorder_point: 0,
          expiration_date: '',
          supplier: '',
          warranty: '',
          serial_number: '',
          manufacturer: '',
          image_url: '',
          tags: [],
          favorite: false,
          barcode: '',
          sku: '',
          description: formData.notes || '',
          current_phase: 'Active',
          is_active: true,
          unit: '',
          expiration: '',
          purchase_date: formData.createdAt
            ? new Date(formData.createdAt).toISOString()
            : '',
          last_serviced: formData.lastUpdated
            ? new Date(String(formData.lastUpdated)).toISOString()
            : '',
          last_updated: new Date().toISOString(),
          data: {
            warranty: formData.notes,
            notes: formData.notes,
            // Convert form date strings back to ISO format for storage
            purchaseDate: formData.createdAt
              ? new Date(formData.createdAt).toISOString()
              : undefined,
            lastServiced: formData.lastUpdated
              ? new Date(String(formData.lastUpdated)).toISOString()
              : undefined,
          },
        };

        // Submit to service
        await inventoryServiceFacade.createItem(itemToSave as any);

        onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to submit form';
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
