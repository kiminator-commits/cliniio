import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BIFailureResolution as BIFailureResolutionModal } from '../../../src/components/Sterilization/BIFailureResolution';

// Mock dependencies before imports
vi.mock('../../../src/services/bi/failure/BIFailureIncidentService', () => ({
  BIFailureIncidentService: {
    resolveIncident: vi.fn(),
    createIncident: vi.fn(),
  },
}));

// Mock the auth service
vi.mock('../../../src/services/supabase/authService', () => ({
  SupabaseAuthService: {
    getCurrentUser: vi.fn().mockResolvedValue({
      user: { id: 'current-operator-id' },
      error: null,
    }),
  },
}));

// Mock the store before any imports that use it
vi.mock('../../../src/store/sterilizationStore', () => ({
  useSterilizationStore: vi.fn(),
}));

vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

// Import the mocked function after the mock is set up
import { useSterilizationStore } from '../../../src/store/sterilizationStore';

const mockBIFailureDetails = {
  id: 'current-incident-id',
  date: new Date('2024-01-15'),
  affectedToolsCount: 25,
  affectedBatchIds: ['BATCH-001', 'BATCH-002', 'BATCH-003'],
  operator: 'Dr. Smith',
};

const mockStore = {
  biFailureDetails: mockBIFailureDetails,
  deactivateBIFailure: vi.fn(),
};

describe('BIFailureResolutionModal - UI', () => {
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

    (useSterilizationStore as vi.Mock).mockReturnValue(mockStore);
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<BIFailureResolutionModal isOpen={false} onClose={vi.fn()} />);

      expect(
        screen.queryByText('BI Failure Resolution Workflow')
      ).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(
        screen.getByText('BI Failure Resolution Workflow')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Complete these steps to resolve the BI failure')
      ).toBeInTheDocument();
    });

    it('should display current status information', () => {
      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(
        screen.getByText('Current Status: BI Failure Active')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/25 tools are currently quarantined/)
      ).toBeInTheDocument();
      const formattedDate = new Date('2024-01-15').toLocaleDateString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument(); // Added check for operator
    });

    it('should display affected batch numbers', () => {
      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText(/BATCH-001/)).toBeInTheDocument();
      expect(screen.getByText(/BATCH-002/)).toBeInTheDocument();
      expect(screen.getByText(/BATCH-003/)).toBeInTheDocument();
    });

    it('should display all resolution steps', () => {
      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText('Resolution Workflow Steps')).toBeInTheDocument();
      expect(
        screen.getByText('Quarantine All Affected Tools')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Re-sterilize All Quarantined Tools')
      ).toBeInTheDocument();
      expect(screen.getByText('Perform New BI Test')).toBeInTheDocument();
      expect(screen.getByText('Complete Documentation')).toBeInTheDocument();
    });

    it('should display patient exposure tracking section', () => {
      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText('Patient Exposure Tracking')).toBeInTheDocument();
      expect(
        screen.getByText('View Patient Exposure Report')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^close modal$/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /close modal by clicking outside/i })
      ).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      // Tab through interactive elements
      await user.tab();
      expect(
        screen.getByRole('button', { name: /close modal by clicking outside/i })
      ).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole('button', { name: /^close modal$/i })
      ).toHaveFocus();

      await user.tab();
      expect(screen.getByText('View Patient Exposure Report')).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing biFailureDetails gracefully', () => {
      (useSterilizationStore as vi.Mock).mockReturnValue({
        ...mockStore,
        biFailureDetails: null,
      });

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(
        screen.getByText(/0 tools are currently quarantined/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Unknown date/)).toBeInTheDocument();
    });

    it('should handle empty affected batch IDs', () => {
      (useSterilizationStore as vi.Mock).mockReturnValue({
        ...mockStore,
        biFailureDetails: {
          ...mockBIFailureDetails,
          affectedBatchIds: [],
        },
      });

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText('No batch IDs available')).toBeInTheDocument();
    });

    it('should handle missing date in biFailureDetails', () => {
      (useSterilizationStore as vi.Mock).mockReturnValue({
        ...mockStore,
        biFailureDetails: {
          ...mockBIFailureDetails,
          date: null,
        },
      });

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText(/Unknown date/)).toBeInTheDocument();
    });
  });
});
