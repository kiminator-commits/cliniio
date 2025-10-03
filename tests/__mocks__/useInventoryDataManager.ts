import { vi } from 'vitest';

export const useInventoryDataManager = () => {
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
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateItem: vi.fn(),
  };
};
