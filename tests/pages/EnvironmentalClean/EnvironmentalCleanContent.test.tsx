import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnvironmentalCleanContent from '@/pages/EnvironmentalClean/components/EnvironmentalCleanContent';
import { EnvironmentalCleanProvider } from '@/pages/EnvironmentalClean/providers/EnvironmentalCleanProvider';
import { useEnvironmentalCleanStore } from '@/pages/EnvironmentalClean/store/environmentalCleanStore';

import {
  testRooms,
  testChecklists,
  testAnalytics,
} from './__mocks__/environmentalCleanTestData';

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  }),
  useQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    removeQueries: vi.fn(),
  }),
}));

// Mock the stores
vi.mock('@/pages/EnvironmentalClean/store/environmentalCleanStore');

// Mock the hooks
vi.mock('@/pages/EnvironmentalClean/hooks/useEnvironmentalCleanBatch', () => ({
  useEnvironmentalCleanBatch: () => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/pages/EnvironmentalClean/hooks/useEnvironmentalCleanAudit', () => ({
  useEnvironmentalCleanAudit: () => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

vi.mock(
  '@/pages/EnvironmentalClean/hooks/useEnvironmentalCleanRealtime',
  () => ({
    useEnvironmentalCleanRealtime: () => ({}),
  })
);

vi.mock(
  '@/pages/EnvironmentalClean/hooks/useEnvironmentalCleanOffline',
  () => ({
    useEnvironmentalCleanOffline: () => ({}),
  })
);

vi.mock('@/hooks/useErrorRecovery', () => ({
  useErrorRecovery: () => ({
    handleError: vi.fn(),
  }),
}));

describe('EnvironmentalCleanContent', () => {
  beforeEach(() => {
    // Mock the consolidated store implementation with proper type casting
    (useEnvironmentalCleanStore as unknown as vi.Mock).mockImplementation(
      (selector) => {
        const mockState = {
          rooms: testRooms,
          checklists: testChecklists,
          analytics: testAnalytics,
          searchTerm: '',
          filterStatus: 'all',
          selectedIds: [],
          isScanModalOpen: false,
          selectedRoom: null,
          selectedStatus: null,
          setSearchTerm: vi.fn(),
          setFilterStatus: vi.fn(),
          toggleSelectedId: vi.fn(),
          clearSelectedIds: vi.fn(),
          openScanModal: vi.fn(),
          closeScanModal: vi.fn(),
          setSelectedRoom: vi.fn(),
          setSelectedStatus: vi.fn(),
          fetchRooms: vi.fn(),
          fetchChecklists: vi.fn(),
          fetchAnalytics: vi.fn(),
          scanRoomBarcode: vi.fn(),
          updateRoomStatus: vi.fn(),
          completeRoomCleaning: vi.fn(),
        };
        if (typeof selector === 'function') {
          return selector(mockState);
        }
        return mockState;
      }
    );
  });

  it('renders header and dashboard sections', () => {
    render(
      <MemoryRouter>
        <EnvironmentalCleanProvider>
          <EnvironmentalCleanContent />
        </EnvironmentalCleanProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Environmental Clean')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Track and manage room cleaning workflows and maintain compliance standards.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Room Scanner')).toBeInTheDocument();
    expect(screen.getByText('Scan Room')).toBeInTheDocument();
  });
});
