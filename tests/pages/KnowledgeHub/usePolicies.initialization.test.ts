import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
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

describe('usePolicies - Initialization', () => {
  const defaultProps = {
    forReview: [mockPolicies[0]],
    library: [mockPolicies[1]],
    archived: [mockPolicies[2]],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.activePolicyTab).toBe('forReview');
    expect(result.current.policyCurrentPage).toBe(1);
    expect(result.current.policySearchQuery).toBe('');
    expect(result.current.selectedPolicyDomain).toBe('All');
    expect(result.current.selectedPolicyType).toBe('All');
    expect(result.current.selectedPolicy).toBeNull();
    expect(result.current.showPolicyDetail).toBe(false);
  });

  it('should extract unique policy domains', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.uniquePolicyDomains).toEqual([
      'Safety',
      'Hygiene',
      'General',
    ]);
  });

  it('should extract unique policy types', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.uniquePolicyTypes).toEqual([
      'Required',
      'New',
      'Optional',
    ]);
  });

  it('should handle empty policy arrays', () => {
    const { result } = renderHook(() =>
      usePolicies({
        forReview: [],
        library: [],
        archived: [],
      })
    );

    expect(result.current.uniquePolicyDomains).toEqual([]);
    expect(result.current.uniquePolicyTypes).toEqual([]);
  });

  it('should get tag colors correctly', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.getTagColor('Required')).toBe(
      'bg-red-100 text-red-800'
    );
    expect(result.current.getTagColor('Optional')).toBe(
      'bg-blue-100 text-blue-800'
    );
    expect(result.current.getTagColor('New')).toBe(
      'bg-green-100 text-green-800'
    );
    expect(result.current.getTagColor('Updated')).toBe(
      'bg-yellow-100 text-yellow-800'
    );
    expect(result.current.getTagColor('Unknown')).toBe(
      'bg-gray-100 text-gray-800'
    );
  });

  it('should check if policy is overdue', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    const overduePolicy: Policy = {
      ...mockPolicies[0],
      dueDate: '2023-01-01', // Past date
    };

    const notOverduePolicy: Policy = {
      ...mockPolicies[0],
      dueDate: '2030-01-01', // Future date
    };

    const noDueDatePolicy: Policy = {
      ...mockPolicies[0],
      dueDate: undefined,
    };

    expect(result.current.isPolicyOverdue(overduePolicy)).toBe(true);
    expect(result.current.isPolicyOverdue(notOverduePolicy)).toBe(false);
    expect(result.current.isPolicyOverdue(noDueDatePolicy)).toBe(false);
  });

  it('should get status background colors', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.getStatusBackground('Pending Review')).toBe(
      'bg-yellow-100'
    );
    expect(result.current.getStatusBackground('Active')).toBe('bg-green-100');
    expect(result.current.getStatusBackground('Archived')).toBe('bg-gray-100');
    expect(result.current.getStatusBackground('Unknown')).toBe('bg-gray-100');
  });

  it('should get status icon colors', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.getStatusIconColor('Pending Review')).toBe(
      'text-yellow-800'
    );
    expect(result.current.getStatusIconColor('Active')).toBe('text-green-800');
    expect(result.current.getStatusIconColor('Archived')).toBe('text-gray-800');
    expect(result.current.getStatusIconColor('Unknown')).toBe('text-gray-800');
  });

  it('should initialize with correct default tab', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.activePolicyTab).toBe('forReview');
  });

  it('should initialize with correct default pagination', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.policyCurrentPage).toBe(1);
  });

  it('should initialize with empty search query', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.policySearchQuery).toBe('');
  });

  it('should initialize with default filter values', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.selectedPolicyDomain).toBe('All');
    expect(result.current.selectedPolicyType).toBe('All');
  });

  it('should initialize with no selected policy', () => {
    const { result } = renderHook(() => usePolicies(defaultProps));

    expect(result.current.selectedPolicy).toBeNull();
    expect(result.current.showPolicyDetail).toBe(false);
  });
});
