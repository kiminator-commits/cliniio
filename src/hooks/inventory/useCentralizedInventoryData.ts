import { useState, useEffect } from 'react';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { InventoryFormData } from '@/pages/Inventory/types/inventoryDashboardTypes';
import { InventoryItem } from '@/types/inventoryTypes';

// Helper function to convert InventoryItem to InventoryFormData
const convertToFormData = (item: InventoryItem): InventoryFormData => ({
  id: item.id,
  name: item.name || '',
  category: item.category || '',
  quantity: item.quantity || 1,
  location: (item.data as { location?: string })?.location || '',
  description: (item.data as { description?: string })?.description || '',
  barcode: (item.data as { barcode?: string })?.barcode || '',
  expirationDate: (item.data as { expiration?: string })?.expiration || '',
});

export const useCentralizedInventoryData = () => {
  const [categorizedData, setCategorizedData] = useState<{
    tools: InventoryFormData[];
    supplies: InventoryFormData[];
    equipment: InventoryFormData[];
    officeHardware: InventoryFormData[];
    totalUniqueItems: number;
  }>({
    tools: [],
    supplies: [],
    equipment: [],
    officeHardware: [],
    totalUniqueItems: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Wait for the facade to be ready
        if (!inventoryServiceFacade.isReady()) {
          console.log(
            '[useCentralizedInventoryData] ⏳ Waiting for inventory service facade to initialize...'
          );
          // Wait a bit and try again
          setTimeout(() => {
            if (inventoryServiceFacade.isReady()) {
              loadData();
            }
          }, 100);
          return;
        }

        const response = await inventoryServiceFacade.fetchAllInventoryData();
        if (response) {
          console.log(
            '✅ useCentralizedInventoryData fetched items:',
            response
          );

          const categorized = {
            tools: (response.tools || []).map(convertToFormData),
            supplies: (response.supplies || []).map(convertToFormData),
            equipment: (response.equipment || []).map(convertToFormData),
            officeHardware: (response.officeHardware || []).map(
              convertToFormData
            ),
            totalUniqueItems:
              (response.tools?.length || 0) +
              (response.supplies?.length || 0) +
              (response.equipment?.length || 0) +
              (response.officeHardware?.length || 0),
          };
          console.log(
            '✅ useCentralizedInventoryData categorized data:',
            categorized
          );

          setCategorizedData(categorized);
        } else {
          setCategorizedData({
            tools: [],
            supplies: [],
            equipment: [],
            officeHardware: [],
            totalUniqueItems: 0,
          });
        }
      } catch (err) {
        console.error(
          '❌ useCentralizedInventoryData failed to load data',
          err
        );
      }
    };

    loadData();
  }, []);

  return {
    ...categorizedData,
    inventoryData: categorizedData.tools,
    suppliesData: categorizedData.supplies,
    equipmentData: categorizedData.equipment,
    officeHardwareData: categorizedData.officeHardware,
  };
};
