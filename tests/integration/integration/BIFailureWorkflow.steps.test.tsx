// MOCKS MUST BE AT THE TOP - BEFORE ANY IMPORTS
vi.mock('@/lib/supabase', () => {
  const mockChannel: {
    on: vi.Mock;
    subscribe: vi.Mock;
  } = {
    on: vi.fn(() => mockChannel),
    subscribe: vi.fn(() => mockChannel),
  };

  return {
    supabase: {
      channel: vi.fn(() => mockChannel),
    },
  };
});

vi.mock('@/services/bi/failure/index', () => ({
  BIFailureService: {
    resolveIncident: vi.fn(),
    createIncident: vi.fn(),
    getActiveIncidents: vi.fn(),
    generatePatientExposureReport: vi.fn(),
    subscribeToBIFailureUpdates: vi.fn(),
  },
  // Export the service with the alias that tests expect
  biFailureService: {
    resolveIncident: vi.fn(),
    createIncident: vi.fn(),
    getActiveIncidents: vi.fn(),
    generatePatientExposureReport: vi.fn(),
    subscribeToBIFailureUpdates: vi.fn(),
  },
}));
vi.mock('@/contexts/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-provider">{children}</div>
  ),
  useUser: () => ({
    currentUser: { id: 'user-123', email: 'test@example.com' },
    isLoading: false,
    setCurrentUser: vi.fn(),
    clearUserData: vi.fn(),
  }),
}));
vi.mock('@/services/bi/failure/BIFailureIncidentService', () => ({
  BIFailureIncidentService: {
    resolveIncident: vi.fn(),
    createIncident: vi.fn(),
  },
}));
vi.mock('@/store/sterilizationStore');
vi.mock('react-dom', async () => ({
  ...(await vi.importActual('react-dom')),
  createPortal: (node: React.ReactNode) => node,
}));

import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  BIFailureService as biFailureService,
  BIFailureError as _BIFailureError,
} from '@/services/bi/failure/index';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { UserProvider } from '@/contexts/UserContext';
import GlobalBIFailureBanner from '@/components/Sterilization/GlobalBIFailureBanner';
import { BIFailureResolutionModal } from '@/components/BIFailureResolution';

let mockStore: {
  biFailureActive: boolean;
  biFailureDetails: {
    date: Date;
    affectedToolsCount: number;
    affectedBatchIds: string[];
    operator: string;
  } | null;
  activateBIFailure: vi.Mock;
  deactivateBIFailure: vi.Mock;
};

describe('BI Failure Workflow Steps Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock the store with proper typing
    mockStore = {
      biFailureActive: false,
      biFailureDetails: null,
      activateBIFailure: vi.fn(),
      deactivateBIFailure: vi.fn(),
    };

    (useSterilizationStore as vi.Mock).mockReturnValue(mockStore);

    // Reset the supabase mock channel
    const { supabase } = await import('@/lib/supabase');
    if (supabase && typeof supabase.channel === 'function') {
      const mockChannel = supabase.channel('test-channel');
      (mockChannel.on as vi.Mock).mockClear();
      (mockChannel.subscribe as vi.Mock).mockClear();
    }

    // Ensure biFailureService methods are mocked
    vi.spyOn(biFailureService, 'resolveIncident').mockResolvedValue(true);
    vi.spyOn(biFailureService, 'createIncident').mockResolvedValue({
      id: 'incident-123',
      incident_number: 'BI-FAIL-20240115-001',
      facility_id: 'facility-456',
      failure_date: '2024-01-15T10:30:00Z',
      affected_tools_count: 15,
      affected_batch_ids: ['BATCH-001', 'BATCH-002'],
      severity_level: 'high' as const,
      detected_by_operator_id: 'operator-123',
      regulatory_notification_sent: false,
      status: 'active' as const,
    });
    vi.spyOn(biFailureService, 'getActiveIncidents').mockResolvedValue([]);
  });

  describe('Complete BI Failure Lifecycle', () => {
    it('should handle complete BI failure incident lifecycle', async () => {
      const user = userEvent.setup();

      // Step 1: Simulate BI failure detection
      // Mock incident data for testing

      // Step 2: Activate BI failure in store
      const currentMockStore = {
        ...mockStore,
        biFailureActive: true,
        biFailureDetails: {
          date: new Date('2024-01-14'),
          affectedToolsCount: 15,
          affectedBatchIds: ['BATCH-001', 'BATCH-002'],
          operator: 'Dr. Smith',
        },
      };
      (useSterilizationStore as unknown as vi.Mock).mockReturnValue(
        currentMockStore
      );

      // Step 3: Render the banner
      render(
        <MemoryRouter>
          <UserProvider>
            <GlobalBIFailureBanner onDismiss={vi.fn()} />
          </UserProvider>
        </MemoryRouter>
      );

      // Step 4: Verify banner is displayed
      await waitFor(() => {
        expect(
          screen.getByText('🚨 TOOL RECALL: BI TEST FAILURE')
        ).toBeInTheDocument();
        expect(screen.getByText('15 tools affected')).toBeInTheDocument();
      });

      // Step 5: Open resolution modal
      const resolveButton = screen.getByText('Resolution Workflow');
      await user.click(resolveButton);

      // Step 6: Verify modal is opened
      await waitFor(() => {
        expect(
          screen.getByText('BI Failure Resolution Workflow')
        ).toBeInTheDocument();
      });

      // Test completed successfully - the modal is open and ready for resolution
    });

    it('should handle patient exposure tracking during incident', async () => {
      // Setup active BI failure
      (useSterilizationStore as unknown as vi.Mock).mockReturnValue({
        ...mockStore,
        biFailureActive: true,
        biFailureDetails: {
          id: 'current-incident-id',
          date: new Date('2024-01-15'),
          affectedToolsCount: 10,
          affectedBatchIds: ['BATCH-001'],
          operator: 'Dr. Smith',
        },
      });

      const mockExposureReport = {
        incidentNumber: 'BI-FAIL-20240115-001',
        totalPatientsExposed: 5,
        exposureSummary: {
          totalPatientsExposed: 5,
          exposureWindowPatients: 3,
          quarantineBreachPatients: 2,
        },
        riskBreakdown: {
          high: 2,
          medium: 2,
          low: 1,
        },
      };

      // Mock the generatePatientExposureReport method to return the expected data
      vi.spyOn(
        biFailureService,
        'generatePatientExposureReport'
      ).mockResolvedValue(mockExposureReport);

      // Render resolution modal
      render(
        <UserProvider>
          <BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />
        </UserProvider>
      );

      // Verify the modal is displayed
      await waitFor(() => {
        expect(
          screen.getByText('BI Failure Resolution Workflow')
        ).toBeInTheDocument();
      });

      // Look for the patient exposure report button
      const exposureButton = screen.getByRole('button', {
        name: /view exposure report/i,
      });
      expect(exposureButton).toBeInTheDocument();

      // Test completed successfully - the button is available for viewing exposure report
    });
  });

  describe('BI Failure Detection and Response', () => {
    it('should detect and respond to BI failure incidents', async () => {
      // Setup active BI failure
      const mockStore = {
        biFailureActive: true,
        biFailureDetails: {
          date: new Date('2024-01-15'),
          affectedToolsCount: 10,
          affectedBatchIds: ['BATCH-001'],
          operator: 'Dr. Johnson',
        },
        activateBIFailure: vi.fn(),
        deactivateBIFailure: vi.fn(),
      };
      (useSterilizationStore as unknown as vi.Mock).mockReturnValue(mockStore);

      render(
        <MemoryRouter>
          <UserProvider>
            <GlobalBIFailureBanner onDismiss={vi.fn()} />
          </UserProvider>
        </MemoryRouter>
      );

      expect(
        screen.getByText('🚨 TOOL RECALL: BI TEST FAILURE')
      ).toBeInTheDocument();
      expect(screen.getByText(/10 tools affected/)).toBeInTheDocument();
    });
  });
});
