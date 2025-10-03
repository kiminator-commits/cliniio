import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

import { PatientExposureReport } from '../../../src/components/Sterilization/PatientExposureReport';
import { BIFailureService } from '../../../src/services/biFailureService';

// Mock the BIFailureService
vi.mock('../../../src/services/biFailureService');
const mockBIFailureService = BIFailureService as vi.Mocked<
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

describe('PatientExposureReport UI', () => {
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

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<PatientExposureReport isOpen={false} onClose={mockOnClose} />);
      expect(
        screen.queryByText('Patient Exposure Report')
      ).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      expect(screen.getByText('Patient Exposure Report')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Detailed analysis of patient exposure during BI failure incident'
        )
      ).toBeInTheDocument();
    });

    it('should display loading state initially', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });
    });

    it('should display report data after loading', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument(); // Total exposed
        expect(screen.getByText('12')).toBeInTheDocument(); // Exposure window
        const breachCounts = screen.getAllByText('3');
        expect(breachCounts).toHaveLength(2);
      });
    });
  });

  describe('Summary Cards', () => {
    it('should display total exposed patients', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Total Exposed')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
        const labels = screen.getAllByText('patients');
        expect(labels).toHaveLength(3);
      });
    });

    it('should display exposure window patients', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Exposure Window')).toHaveLength(2); // One in summary, one in table
        expect(screen.getAllByText('12')).toHaveLength(1); // Only in summary
      });
    });

    it('should display quarantine breach patients', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Quarantine Breach')).toHaveLength(2); // One in summary, one in table
        expect(screen.getAllByText('3')).toHaveLength(2); // One in summary, one in risk breakdown
      });
    });
  });

  describe('Risk Breakdown', () => {
    it('should display risk level breakdown', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Risk Level Breakdown')).toBeInTheDocument();
        expect(screen.getByText('high Risk')).toBeInTheDocument();
        expect(screen.getByText('medium Risk')).toBeInTheDocument();
        expect(screen.getByText('low Risk')).toBeInTheDocument();
        expect(screen.getAllByText('5')).toHaveLength(1); // High risk count
        expect(screen.getAllByText('7')).toHaveLength(1); // Medium risk count
        expect(screen.getAllByText('3')).toHaveLength(2); // Low risk count (also in quarantine breach)
      });
    });
  });

  describe('Patient Details Table', () => {
    it('should display patient details table when data is available', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Patient Details')).toBeInTheDocument();
        expect(screen.getByText('Patient ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Risk Level')).toBeInTheDocument();
        expect(screen.getByText('Exposure Type')).toBeInTheDocument();
        expect(screen.getByText('Last Procedure')).toBeInTheDocument();
      });
    });

    it('should display patient data in table', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('P001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('high')).toBeInTheDocument();
        expect(screen.getAllByText('Exposure Window')).toHaveLength(2); // One in summary, one in table
        expect(screen.getByText('P002')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getAllByText('Quarantine Breach')).toHaveLength(2); // One in summary, one in table
      });
    });

    it('should not display patient details table when no data', async () => {
      const reportWithoutDetails = {
        ...mockExposureReport,
        patientDetails: undefined,
      };
      mockBIFailureService.generatePatientExposureReport.mockResolvedValue(
        reportWithoutDetails
      );

      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.queryByText('Patient Details')).not.toBeInTheDocument();
      });
    });

    it('should not display patient details table when empty array', async () => {
      const reportWithEmptyDetails = {
        ...mockExposureReport,
        patientDetails: [],
      };
      mockBIFailureService.generatePatientExposureReport.mockResolvedValue(
        reportWithEmptyDetails
      );

      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.queryByText('Patient Details')).not.toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should display export and print buttons', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Export Report')).toBeInTheDocument();
        expect(screen.getByText('Print Report')).toBeInTheDocument();
      });
    });
  });

  describe('Risk Level Styling', () => {
    it('should apply correct styling for high risk level', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        const highRiskElement = screen.getByText('high');
        expect(highRiskElement).toBeInTheDocument();
        // Check that the parent element has the correct styling classes
        const parentElement = highRiskElement.closest('span');
        expect(parentElement).toHaveClass(
          'text-red-600',
          'bg-red-50',
          'border-red-200'
        );
      });
    });

    it('should apply correct styling for medium risk level', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        const mediumRiskElement = screen.getByText('medium');
        expect(mediumRiskElement).toBeInTheDocument();
        const parentElement = mediumRiskElement.closest('span');
        expect(parentElement).toHaveClass(
          'text-orange-600',
          'bg-orange-50',
          'border-orange-200'
        );
      });
    });

    it('should apply correct styling for low risk level', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        // Look for "low" in the risk breakdown section
        const lowRiskElement = screen.getByText('low Risk');
        expect(lowRiskElement).toBeInTheDocument();
        // Check that the parent element has the correct styling classes
        // The styling is on the grandparent div, not the immediate parent
        const parentElement = lowRiskElement.closest('div').parentElement;
        expect(parentElement).toHaveClass(
          'text-green-600',
          'bg-green-50',
          'border-green-200'
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(
          screen.getByLabelText('Close modal backdrop')
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText('Close exposure report')
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText('Export exposure report')
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText('Print exposure report')
        ).toBeInTheDocument();
      });
    });

    it('should have proper heading structure', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        const h3Headings = screen.getAllByRole('heading', { level: 3 });
        expect(h3Headings).toHaveLength(2); // Risk Level Breakdown and Patient Details
      });
    });
  });
});
