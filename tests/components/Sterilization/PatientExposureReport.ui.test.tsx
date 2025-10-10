import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor, act } from '../../utils/testUtils';

import { PatientExposureReport } from '../../../src/components/Sterilization/PatientExposureReport';
import { BIFailureService } from '../../../src/services/bi/failure/index';

// Mock the BIFailureService
vi.mock('../../../src/services/bi/failure/index');
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
  totalRoomsAffected: 3,
  roomDetails: [
    {
      roomId: 'ROOM-001',
      roomName: 'Operating Room 1',
      contaminationDate: '2024-01-15T10:00:00Z',
      roomUsedDate: '2024-01-15T09:00:00Z',
      usersInvolved: ['Dr. Smith', 'Nurse Johnson'],
      contaminatedTools: ['Tool-001', 'Tool-002'],
    },
    {
      roomId: 'ROOM-002',
      roomName: 'Operating Room 2',
      contaminationDate: '2024-01-15T14:00:00Z',
      roomUsedDate: '2024-01-15T13:00:00Z',
      usersInvolved: ['Dr. Brown'],
      contaminatedTools: ['Tool-003'],
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
        screen.queryByText('Exposure Report')
      ).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      expect(screen.getByText('Exposure Report')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Tools scanned dirty in "IN USE" rooms during BI failure risk window'
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
        expect(screen.getByText('"IN USE" Rooms with Tool Contamination')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument(); // totalRoomsAffected
        expect(screen.getByText('Room Exposure Analysis')).toBeInTheDocument();
      });
    });
  });

  describe('Summary Cards', () => {
    it('should display total rooms affected', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('"IN USE" Rooms with Tool Contamination')).toBeInTheDocument();
          expect(screen.getByText('3')).toBeInTheDocument(); // totalRoomsAffected
        expect(screen.getByText('Risk Window Analysis:')).toBeInTheDocument();
      });
    });

    it('should display room exposure data when available', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Room Exposure Analysis')).toBeInTheDocument();
        expect(screen.getByText('Operating Room 1')).toBeInTheDocument();
        expect(screen.getByText('Operating Room 2')).toBeInTheDocument();
        expect(screen.getByText('Tool-001')).toBeInTheDocument();
        expect(screen.getByText('Tool-002')).toBeInTheDocument();
        expect(screen.getByText('Tool-003')).toBeInTheDocument();
      });
    });
  });

  describe('Room Data Display', () => {
    it('should display room exposure data table', async () => {
      await act(async () => {
        render(<PatientExposureReport isOpen={true} onClose={mockOnClose} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Room Exposure Analysis')).toBeInTheDocument();
        expect(screen.getByText('Operating Room 1')).toBeInTheDocument();
        expect(screen.getByText('Operating Room 2')).toBeInTheDocument();
        // Check for tools in the room details (what's actually displayed)
        expect(screen.getByText('Tool-001')).toBeInTheDocument();
        expect(screen.getByText('Tool-002')).toBeInTheDocument();
        expect(screen.getByText('Tool-003')).toBeInTheDocument();
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
        expect(h3Headings).toHaveLength(1); // Only "Room Exposure Analysis" heading
      });
    });
  });
});

