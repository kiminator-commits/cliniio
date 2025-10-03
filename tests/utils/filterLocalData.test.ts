import { filterLocalData } from '../../src/utils/Inventory/filterLocalData';

describe('filterLocalData', () => {
  const mockData = [
    { item: 'Gauze Pads' },
    { item: 'Scissors' },
    { item: 'Alcohol Wipes' },
  ];

  it('filters by exact match', () => {
    const result = filterLocalData(mockData, 'Scissors');
    expect(result).toEqual([{ item: 'Scissors' }]);
  });

  it('filters by partial match', () => {
    const result = filterLocalData(mockData, 'Gauze');
    expect(result.length).toBe(1);
  });

  it('returns all items if query is empty', () => {
    const result = filterLocalData(mockData, '');
    expect(result.length).toBe(3);
  });
});
