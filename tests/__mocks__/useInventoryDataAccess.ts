import { vi } from 'vitest';

export const useInventoryDataAccess = () => {
  const mockData = {
    tools: [{ id: 't1', name: 'Tool A', category: 'tools' }],
    supplies: [{ id: 's1', name: 'Supply A', category: 'supplies' }],
    equipment: [{ id: 'e1', name: 'Equip A', category: 'equipment' }],
    officeHardware: [
      { id: 'o1', name: 'Office A', category: 'officeHardware' },
    ],
  };

  const allItems = [
    ...mockData.tools,
    ...mockData.supplies,
    ...mockData.equipment,
    ...mockData.officeHardware,
  ];

  return {
    ...mockData,
    allItems,
    itemsWithCategory: allItems,
    totalUniqueItems: allItems.length,
    fetchData: vi.fn(),
    saveData: vi.fn(),
    deleteData: vi.fn(),
  };
};
