import { vi, describe, test, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AutoclaveCIPopup } from '@/components/Sterilization/workflows/AutoclaveCIPopup';
import { batchCiConfirmation } from '@/services/sterilization/ciConfirmationService';
import { useComplianceSettingsStore } from '@/store/slices/complianceSettingsSlice';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('@/services/sterilization/ciConfirmationService', () => ({
  batchCiConfirmation: vi.fn(),
}));

vi.mock('@/store/slices/complianceSettingsSlice', () => ({
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

describe('AutoclaveCIPopup', () => {
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
    });

    // Mock user context
    (useUser as any).mockReturnValue({
      currentUser: { id: 'user-789' },
    });

    // Mock batch confirmation service
    (batchCiConfirmation as any).mockResolvedValue(true);
  });

  test('renders CI verification modal when open', () => {
    render(<AutoclaveCIPopup {...mockProps} />);
    
    expect(screen.getByText('CI Verification')).toBeInTheDocument();
    expect(screen.getByText('Did all CI strips pass, and were packages free of moisture?')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<AutoclaveCIPopup {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('CI Verification')).not.toBeInTheDocument();
  });

  test('calls batchCiConfirmation with correct parameters when Yes is clicked', async () => {
    render(<AutoclaveCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(batchCiConfirmation).toHaveBeenCalledWith({
        toolIds: ['tool-1', 'tool-2', 'tool-3'],
        cycleId: 'cycle-123',
        facilityId: 'facility-456',
        userId: 'user-789',
        ciPassed: true,
        notes: 'CI strips passed and packages free of moisture.',
      });
    });
  });

  test('calls batchCiConfirmation with ciPassed=false when No is clicked', async () => {
    render(<AutoclaveCIPopup {...mockProps} />);
    
    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    await waitFor(() => {
      expect(batchCiConfirmation).toHaveBeenCalledWith({
        toolIds: ['tool-1', 'tool-2', 'tool-3'],
        cycleId: 'cycle-123',
        facilityId: 'facility-456',
        userId: 'user-789',
        ciPassed: false,
        notes: 'CI strips failed or packages contain moisture.',
      });
    });
  });

  test('shows success toast when CI passes', async () => {
    render(<AutoclaveCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('✅ CI verification recorded.');
    });
  });

  test('shows warning toast when CI fails', async () => {
    render(<AutoclaveCIPopup {...mockProps} />);
    
    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('⚠️ CI failed — check sterilizer and packaging integrity.');
    });
  });

  test('calls onClose and onComplete after successful verification', async () => {
    render(<AutoclaveCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
      expect(mockProps.onComplete).toHaveBeenCalled();
    });
  });

  test('handles service errors gracefully', async () => {
    (batchCiConfirmation as any).mockRejectedValue(new Error('Service error'));
    
    render(<AutoclaveCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error saving CI verification.');
    });
  });

  test('disables buttons while submitting', async () => {
    // Mock a delayed response
    (batchCiConfirmation as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(true), 100))
    );
    
    render(<AutoclaveCIPopup {...mockProps} />);
    
    const yesButton = screen.getByText('Yes');
    const noButton = screen.getByText('No');
    
    fireEvent.click(yesButton);

    // Check that buttons are disabled during submission
    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();
  });
});
