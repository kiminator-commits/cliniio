import React from 'react';
import { vi, describe, test, expect, type Mock } from 'vitest';
import { render, screen, waitFor, act } from '../../utils/testUtils';

import { PatientExposureReport } from '../../../src/components/Sterilization/PatientExposureReport';
import { BIFailureService } from '../../../src/services/bi/failure/index';

// Mock the BIFailureService
vi.mock('../../../src/services/bi/failure/index');
const mockBIFailureService = BIFailureService as Mock<
  typeof BIFailureService
>;

// Mock the sterilization store
vi.mock('../../../src/store/sterilizationStore', () => ({
  useSterilizationStore: {
    getState: vi.fn(() => ({
      biFailureDetails: {
        id: 'current-incident-id',
      },
    })),
  },
}));

// Using centralized mock from __mocks__ directory

// Mock createPortal
vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

const mockExposureReport = {
  incidentNumber: 'INC-2024-001',
  totalPatientsExposed: 15,
  exposureSummary: {
    totalPatientsExposed: 15,
    exposureWindowPatients: 12,
    quarantineBreachPatients: 3,
  },
  riskBreakdown: {
    high: 5,
    medium: 7,
    low: 3,
  },
  patientDetails: [
    {
      patientId: 'P001',
      patientName: 'John Doe',
      riskLevel: 'high' as const,
      exposureType: 'exposure_window' as const,
      lastProcedureDate: '2024-01-14',
      affectedTools: ['Tool-001', 'Tool-002'],
    },
    {
      patientId: 'P002',
      patientName: 'Jane Smith',
      riskLevel: 'medium' as const,
      exposureType: 'quarantine_breach' as const,
      lastProcedureDate: '2024-01-13',
      affectedTools: ['Tool-003'],
    },
  ],
};

describe('PatientExposureReport Integration', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => 'current-incident-id'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    mockBIFailureService.generatePatientExposureReport.mockResolvedValue(
      mockExposureReport
    );
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Failed to load exposure report';
      mockBIFailureService.generatePatientExposureReport.mockRejectedValue(
        new Error(errorMessage)
      );

      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      });
    });

    it('should display generic error message for non-Error objects', async () => {
      mockBIFailureService.generatePatientExposureReport.mockRejectedValue(
        'Unknown error'
      );

      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Error: Failed to load exposure report')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should call BIFailureService.generatePatientExposureReport with correct incident ID', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(
          mockBIFailureService.generatePatientExposureReport
        ).toHaveBeenCalledWith('current-incident-id');
      });
    });

    it('should reload data when isOpen changes from false to true', async () => {
      const { rerender } = render(
        <PatientExposureReport isOpen={false} onClose={mockOnClose} />
      );

      expect(
        mockBIFailureService.generatePatientExposureReport
      ).not.toHaveBeenCalled();

      await act(async () => {
        rerender(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(
          mockBIFailureService.generatePatientExposureReport
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
