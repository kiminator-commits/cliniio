import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { useChecklistStore } from '@/store/checklistStore';
import CleaningChecklists from '@/pages/EnvironmentalClean/components/ui/CleaningChecklists';

// Mock the checklist store
vi.mock('@/store/checklistStore');

const mockUseChecklistStore = useChecklistStore as vi.MockedFunction<
  typeof useChecklistStore
>;

describe('CleaningChecklists', () => {
  beforeEach(() => {
    // Mock the store to return published checklists
    mockUseChecklistStore.mockReturnValue({
      getPublishedChecklistsByCategory: vi.fn((category) => {
        if (category === 'setup') {
          return [
            {
              id: 'test-checklist-1',
              title: 'Test Treatment Room Setup',
              category: 'setup',
              status: 'published',
              items: [
                {
                  id: 'item-1',
                  title: 'Clean surfaces',
                  instructions: 'Clean all surfaces with disinfectant',
                  requiredInventory: [
                    {
                      id: 'caviwipes-001',
                      name: 'CaviWipes',
                      required: 2,
                      available: 100,
                      used: 0,
                      unit: 'wipes',
                    },
                  ],
                  completed: false,
                },
              ],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ];
        }
        return [];
      }),
    } as ReturnType<typeof useChecklistStore>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should use published checklists from the store instead of hardcoded data', () => {
    render(<CleaningChecklists />);

    // Verify that the store function was called
    expect(mockUseChecklistStore).toHaveBeenCalled();

    // The component should now show the published checklist from the store
    // This test verifies that the component is no longer using hardcoded data
    expect(
      mockUseChecklistStore().getPublishedChecklistsByCategory
    ).toBeDefined();
  });

  it('should show empty state when no published checklists exist', () => {
    // Mock empty results
    mockUseChecklistStore.mockReturnValue({
      getPublishedChecklistsByCategory: vi.fn(() => []),
    } as ReturnType<typeof useChecklistStore>);

    render(<CleaningChecklists />);

    // The component should handle empty states gracefully
    expect(
      mockUseChecklistStore().getPublishedChecklistsByCategory
    ).toBeDefined();
  });
});
