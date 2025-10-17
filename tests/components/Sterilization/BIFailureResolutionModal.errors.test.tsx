import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '../../utils/testUtils';
import userEvent from '@testing-library/user-event';
import { BIFailureResolution as BIFailureResolutionModal } from '../../../src/components/Sterilization/BIFailureResolution';
import { BIFailureError } from '../../../src/services/bi/failure/BIFailureError';

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
import { BIFailureIncidentService } from '../../../src/services/bi/failure/BIFailureIncidentService';

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

describe('BIFailureResolutionModal - Error Handling', () => {
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

  describe('Error Handling', () => {
    it('should display BIFailureError with correct severity', async () => {
      const biFailureError = new BIFailureError(
        'Database connection failed',
        'DATABASE_ERROR',
        'critical',
        true
      );

      (BIFailureIncidentService.resolveIncident as vi.Mock).mockImplementation(
        () => {
          return Promise.reject(biFailureError);
        }
      );

      const user = userEvent.setup();

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      const resolveButton = screen.getByText('Confirm Resolution');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText('Critical Error')).toBeInTheDocument();
        expect(
          screen.getByText('Database connection failed')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Error Code: DATABASE_ERROR')
        ).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should display high priority error correctly', async () => {
      const biFailureError = new BIFailureError(
        'Invalid operator ID',
        'INVALID_OPERATOR',
        'high',
        false
      );

      (BIFailureIncidentService.resolveIncident as vi.Mock).mockImplementation(
        () => {
          return Promise.reject(biFailureError);
        }
      );

      const user = userEvent.setup();

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      const resolveButton = screen.getByText('Confirm Resolution');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText('High Priority Error')).toBeInTheDocument();
        expect(screen.getByText('Invalid operator ID')).toBeInTheDocument();
        expect(screen.queryByText('Retry')).not.toBeInTheDocument();
      });
    });

    it('should handle retry functionality', async () => {
      const biFailureError = new BIFailureError(
        'Temporary network issue',
        'NETWORK_ERROR',
        'medium',
        true
      );

      let callCount = 0;
      (BIFailureIncidentService.resolveIncident as vi.Mock).mockImplementation(
        () => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(biFailureError);
          } else {
            return Promise.resolve(true);
          }
        }
      );

      const user = userEvent.setup();

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      const resolveButton = screen.getByText('Confirm Resolution');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      await waitFor(() => {
        expect(BIFailureIncidentService.resolveIncident).toHaveBeenCalledTimes(
          2
        );
      });
    });

    it('should handle generic errors', async () => {
      const genericError = new Error('Something went wrong');

      (BIFailureIncidentService.resolveIncident as vi.Mock).mockImplementation(
        () => {
          return Promise.reject(genericError);
        }
      );

      const user = userEvent.setup();

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      const resolveButton = screen.getByText('Confirm Resolution');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText('High Priority Error')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });

    it('should clear error when retry is successful', async () => {
      const biFailureError = new BIFailureError(
        'Temporary error',
        'TEMP_ERROR',
        'medium',
        true
      );

      let callCount = 0;
      (BIFailureIncidentService.resolveIncident as vi.Mock).mockImplementation(
        () => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(biFailureError);
          } else {
            return Promise.resolve(true);
          }
        }
      );

      const user = userEvent.setup();

      render(<BIFailureResolutionModal isOpen={true} onClose={vi.fn()} />);

      const resolveButton = screen.getByText('Confirm Resolution');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText('Error')).not.toBeInTheDocument();
      });
    });
  });
});
