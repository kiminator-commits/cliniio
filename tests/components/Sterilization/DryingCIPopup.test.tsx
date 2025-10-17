import { vi, describe, test, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DryingCIPopup } from '@/components/Sterilization/workflows/DryingCIPopup';
import { batchCiConfirmation } from '@/services/sterilization/ciConfirmationService';
import { useComplianceSettingsStore } from '@/store/hooks/useComplianceSettingsStore';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('@/services/sterilization/ciConfirmationService', () => ({
  batchCiConfirmation: vi.fn(),
}));

vi.mock('@/store/hooks/useComplianceSettingsStore', () => ({
  useComplianceSettingsStore: vi.fn(),
}));

vi.mock('@/contexts/UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

vi.mock('react-dom', () => ({
  createPortal: (children: any) => children,
}));

describe('DryingCIPopup', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentCycleId: 'cycle-123',
    facilityId: 'facility-456',
    toolIds: ['tool-1', 'tool-2', 'tool-3'],
    onComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock compliance settings
    (useComplianceSettingsStore as any).mockReturnValue({
      requireCi: true,
      requireBi: false,
      warnOnly: false,
      loading: false,
      fetchComplianceSettings: vi.fn(),
      updateComplianceSettings: vi.fn(),
    });

    // Mock user context
    (useUser as any).mockReturnValue({
      currentUser: { id: 'user-789' },
    });

    // Mock batch confirmation service
    (batchCiConfirmation as any).mockResolvedValue(true);
  });

  test('renders CI confirmation modal when open', () => {
    render(<DryingCIPopup {...mockProps} />);
    
    expect(screen.getByText('Chemical Indicator Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Were CI strips added to all packages?')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<DryingCIPopup {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('Chemical Indicator Confirmation')).not.toBeInTheDocument();
  });

  test('calls batchCiConfirmation with correct parameters when Yes is clicked', async () => {
    render(<DryingCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(batchCiConfirmation).toHaveBeenCalledWith({
        toolIds: ['tool-1', 'tool-2', 'tool-3'],
        cycleId: 'cycle-123',
        facilityId: 'facility-456',
        userId: 'user-789',
        ciAdded: true,
        notes: 'CI strips confirmed added during drying phase.',
      });
    });
  });

  test('calls batchCiConfirmation with ciAdded=false when No is clicked', async () => {
    render(<DryingCIPopup {...mockProps} />);
    
    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    await waitFor(() => {
      expect(batchCiConfirmation).toHaveBeenCalledWith({
        toolIds: ['tool-1', 'tool-2', 'tool-3'],
        cycleId: 'cycle-123',
        facilityId: 'facility-456',
        userId: 'user-789',
        ciAdded: false,
        notes: 'CI strips not added during drying phase.',
      });
    });
  });

  test('shows success toast when CI is added', async () => {
    render(<DryingCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('✅ CI confirmation recorded.');
    });
  });

  test('shows warning toast when CI is not added', async () => {
    render(<DryingCIPopup {...mockProps} />);
    
    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('⚠️ CI not added — cycle may be non-compliant.');
    });
  });

  test('calls onClose and onComplete after successful confirmation', async () => {
    render(<DryingCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
      expect(mockProps.onComplete).toHaveBeenCalled();
    });
  });

  test('handles service errors gracefully', async () => {
    (batchCiConfirmation as any).mockRejectedValue(new Error('Service error'));
    
    render(<DryingCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error saving CI confirmation.');
    });
  });

  test('disables buttons while submitting', async () => {
    // Mock a delayed response
    (batchCiConfirmation as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(true), 100))
    );
    
    render(<DryingCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    const noButton = screen.getByText('No');
    
    fireEvent.click(yesButton);

    // Check that buttons are disabled during submission
    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();
  });
});
