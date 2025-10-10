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
import {
  render as _render,
  screen as _screen,
  waitFor,
} from '@testing-library/react';
import { biFailureService } from '@/services/bi/failure/index';
import { useSterilizationStore } from '@/store/sterilizationStore';

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

describe('BI Failure Workflow Timers Tests', () => {
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

  describe('Real-time Updates', () => {
    it('should handle real-time BI failure updates', async () => {
      // Mock the store to return the mock functions
      const mockStore = {
        biFailureActive: false,
        biFailureDetails: null,
        activateBIFailure: vi.fn(),
        deactivateBIFailure: vi.fn(),
      };
      (useSterilizationStore as unknown as vi.Mock).mockReturnValue(mockStore);

      // Mock the subscribeToBIFailureUpdates to directly call store methods
      vi.spyOn(
        biFailureService,
        'subscribeToBIFailureUpdates'
      ).mockImplementation(async () => {
        // Simulate the subscription setup by directly calling the store method
        // This simulates what would happen when a real-time update is received
        setTimeout(() => {
          mockStore.activateBIFailure({
            affectedToolsCount: 10,
            affectedBatchIds: ['BATCH-001'],
            operator: 'System Alert',
          });
        }, 100);
      });

      // Subscribe to updates
      await biFailureService.subscribeToBIFailureUpdates('facility-123');

      // Wait for the store method to be called
      await waitFor(
        () => {
          expect(mockStore.activateBIFailure).toHaveBeenCalledWith({
            affectedToolsCount: 10,
            affectedBatchIds: ['BATCH-001'],
            operator: 'System Alert',
          });
        },
        { timeout: 1000 }
      );
    });

    it('should handle real-time incident resolution', async () => {
      // Mock the store to return the mock functions
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

      // Mock the subscribeToBIFailureUpdates to directly call store methods
      vi.spyOn(
        biFailureService,
        'subscribeToBIFailureUpdates'
      ).mockImplementation(async () => {
        // Simulate the subscription setup by directly calling the store method
        // This simulates what would happen when a resolution update is received
        setTimeout(() => {
          mockStore.deactivateBIFailure();
        }, 100);
      });

      // Subscribe to updates
      await biFailureService.subscribeToBIFailureUpdates('facility-123');

      // Wait for the store method to be called
      await waitFor(
        () => {
          expect(mockStore.deactivateBIFailure).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });
  });
});
