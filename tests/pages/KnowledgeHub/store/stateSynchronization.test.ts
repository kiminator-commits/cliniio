import { act, waitFor } from '@testing-library/react';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  mockUser,
} from '../__mocks__/knowledgeHubMocks';

describe('State Synchronization', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
  });

  it('should maintain state consistency across multiple operations', async () => {
    const { result } = renderKnowledgeHubStore();

    // Set up initial state
    act(() => {
      result.current.setCurrentUser(mockUser);
      result.current.setContent([
        {
          id: '1',
          title: 'Advanced Sterilization Techniques',
          category: 'Courses',
          status: 'In Progress',
          progress: 75,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          description:
            'Learn advanced sterilization procedures and best practices',
        },
        {
          id: '2',
          title: 'Infection Control Protocols',
          category: 'Procedures',
          status: 'Not Started',
          progress: 0,
          dueDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          description:
            'Essential infection control procedures for healthcare settings',
        },
        {
          id: '3',
          title: 'Safety Guidelines 2024',
          category: 'Policies',
          status: 'Completed',
          progress: 100,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Updated safety guidelines and compliance requirements',
        },
      ]);
      result.current.setSelectedCategory('Courses');
    });

    // Perform multiple operations
    await act(async () => {
      await result.current.updateContentStatus('1', 'Completed');
      await result.current.deleteContent('2'); // Delete the Procedures item
    });

    // Wait for state to be updated
    await waitFor(() => {
      expect(result.current.content).toHaveLength(2);
    });

    // Verify state consistency
    expect(result.current.selectedContent).toHaveLength(1);
    expect(result.current.categoryCounts.Courses).toBe(1);
    expect(result.current.categoryCounts.Procedures).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle concurrent operations gracefully', async () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setCurrentUser(mockUser);
      result.current.setContent([
        {
          id: '1',
          title: 'Advanced Sterilization Techniques',
          category: 'Courses',
          status: 'In Progress',
          progress: 75,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          description:
            'Learn advanced sterilization procedures and best practices',
        },
        {
          id: '2',
          title: 'Infection Control Protocols',
          category: 'Procedures',
          status: 'Not Started',
          progress: 0,
          dueDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          description:
            'Essential infection control procedures for healthcare settings',
        },
        {
          id: '3',
          title: 'Safety Guidelines 2024',
          category: 'Policies',
          status: 'Completed',
          progress: 100,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Updated safety guidelines and compliance requirements',
        },
      ]);
    });

    // Simulate concurrent operations
    await act(async () => {
      const promises = [
        result.current.updateContentStatus('1', 'Completed'),
        result.current.updateContentStatus('2', 'In Progress'),
        result.current.deleteContent('3'),
      ];
      await Promise.all(promises);
    });

    expect(result.current.content).toHaveLength(2);
    expect(result.current.isLoading).toBe(false);
  });
});
