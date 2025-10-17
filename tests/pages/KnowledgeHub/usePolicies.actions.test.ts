import { renderHook, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, it } from 'vitest';
import { usePolicies } from '@/pages/KnowledgeHub/hooks/usePolicies';
import { Policy } from '@/pages/KnowledgeHub/models';

const mockPolicies: Policy[] = [
  {
    id: '1',
    title: 'Safety Policy',
    description: 'Safety guidelines',
    domain: 'Safety',
    tags: ['Required', 'New'],
    status: 'Pending Review',
    lastUpdated: '2024-01-01',
    dueDate: '2024-02-01',
  },
  {
    id: '2',
    title: 'Hygiene Policy',
    description: 'Hygiene standards',
    domain: 'Hygiene',
    tags: ['Required'],
    status: 'Active',
    lastUpdated: '2024-01-15',
  },
  {
    id: '3',
    title: 'Old Policy',
    description: 'Archived policy',
    domain: 'General',
    tags: ['Optional'],
    status: 'Archived',
    lastUpdated: '2023-12-01',
    archivedDate: '2024-01-01',
  },
];

describe('usePolicies - Actions', () => {
  const defaultProps = {
    forReview: [mockPolicies[0]],
    library: [mockPolicies[1]],
    archived: [mockPolicies[2]],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter policies by tab', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    // Test forReview tab
    act(() => {
      result.current.setActivePolicyTab('forReview');
    });
    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe('Safety Policy');

    // Test library tab
    act(() => {
      result.current.setActivePolicyTab('library');
    });
    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe(
      'Hygiene Policy'
    );

    // Test archived tab
    act(() => {
      result.current.setActivePolicyTab('archived');
    });
    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe('Old Policy');

    // Test unknown tab (should default to forReview)
    act(() => {
      result.current.setActivePolicyTab('unknown');
    });
    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe('Safety Policy');
  });

  it('should filter policies by search query', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    act(() => {
      result.current.setPolicySearchQuery('Safety');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe('Safety Policy');

    act(() => {
      result.current.setActivePolicyTab('library');
      result.current.setPolicySearchQuery('Hygiene');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe(
      'Hygiene Policy'
    );

    act(() => {
      result.current.setPolicySearchQuery('nonexistent');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(0);
  });

  it('should filter policies by domain', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    act(() => {
      result.current.setSelectedPolicyDomain('Safety');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].domain).toBe('Safety');

    act(() => {
      result.current.setSelectedPolicyDomain('All');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1);
  });

  it('should filter policies by type', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    act(() => {
      result.current.setSelectedPolicyType('Required');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1); // Only Safety policy in forReview tab

    act(() => {
      result.current.setActivePolicyTab('library');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1); // Hygiene policy in library tab

    act(() => {
      result.current.setActivePolicyTab('forReview');
      result.current.setSelectedPolicyType('New');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe('Safety Policy');
  });

  it('should paginate policies correctly', () => {
    const manyPolicies: Policy[] = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Policy ${i + 1}`,
      description: `Description ${i + 1}`,
      domain: 'General',
      status: 'Active',
      lastUpdated: '2024-01-01',
    }));

    const { result } = renderHook(() =>
      usePolicies({
        forReview: manyPolicies,
        library: [],
        archived: [],
      })
    );

    // First page should have 10 items
    expect(result.current.getPaginatedPolicies()).toHaveLength(10);
    expect(result.current.totalPolicyPages).toBe(3);

    // Second page
    act(() => {
      result.current.setPolicyCurrentPage(2);
    });
    expect(result.current.getPaginatedPolicies()).toHaveLength(10);

    // Third page should have 5 items
    act(() => {
      result.current.setPolicyCurrentPage(3);
    });
    expect(result.current.getPaginatedPolicies()).toHaveLength(5);
  });

  it('should handle policy click', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    act(() => {
      result.current.handlePolicyClick(mockPolicies[0]);
    });

    expect(result.current.selectedPolicy).toBe(mockPolicies[0]);
    expect(result.current.showPolicyDetail).toBe(true);
  });

  it('should handle close policy detail', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    // First set a selected policy
    act(() => {
      result.current.handlePolicyClick(mockPolicies[0]);
    });

    expect(result.current.selectedPolicy).toBe(mockPolicies[0]);
    expect(result.current.showPolicyDetail).toBe(true);

    // Then close it
    act(() => {
      result.current.handleClosePolicyDetail();
    });

    expect(result.current.selectedPolicy).toBeNull();
    expect(result.current.showPolicyDetail).toBe(false);
  });

  it('should handle case-insensitive search', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    act(() => {
      result.current.setPolicySearchQuery('safety');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe('Safety Policy');
  });

  it('should handle empty search query', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    act(() => {
      result.current.setPolicySearchQuery('');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1);
  });

  it('should handle combined filters', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    act(() => {
      result.current.setPolicySearchQuery('Safety');
      result.current.setSelectedPolicyDomain('Safety');
      result.current.setSelectedPolicyType('Required');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(1);
    expect(result.current.getFilteredPolicies()[0].title).toBe('Safety Policy');
  });

  it('should handle no matches with combined filters', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    act(() => {
      result.current.setPolicySearchQuery('Safety');
      result.current.setSelectedPolicyDomain('Hygiene');
    });

    expect(result.current.getFilteredPolicies()).toHaveLength(0);
  });
});
