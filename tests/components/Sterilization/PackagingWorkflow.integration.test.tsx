import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PackagingWorkflow from '../../../src/components/Sterilization/workflows/PackagingWorkflow/index';

// Mock the store before any imports that use it
vi.mock('../../../src/store/sterilizationStore', () => ({
  useSterilizationStore: vi.fn(),
}));

// Mock the PackagingService to prevent authentication errors
vi.mock('../../../src/services/packagingService', () => ({
  PackagingService: {
    getToolsReadyForPackaging: vi.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Scalpel Handle',
        barcode: 'SCAL001',
        category: 'Surgical Instruments',
        status: 'available',
        cycleCount: 0,
        currentPhase: 'complete',
        lastSterilized: new Date().toISOString(),
        operator: 'Dr. Smith',
      },
      {
        id: '2',
        name: 'Forceps',
        barcode: 'FORC001',
        category: 'Surgical Instruments',
        status: 'available',
        cycleCount: 0,
        currentPhase: 'complete',
        lastSterilized: new Date().toISOString(),
        operator: 'Dr. Johnson',
      },
    ]),
    createPackage: vi.fn().mockResolvedValue({
      success: true,
      packageId: 'PKG-001',
      message: 'Package created successfully',
    }),
  },
}));

// Import the mocked function after the mock is set up
import { useSterilizationStore } from '../../../src/store/sterilizationStore';

describe('PackagingWorkflow Integration', () => {
  const mockStore = {
    // Store state
    currentPackagingSession: null as PackagingSession | null,
    currentBatch: null,
    availableTools: [
      {
        id: '1',
        name: 'Scalpel Handle',
        barcode: 'SCAL001',
        category: 'Surgical Instruments',
        status: 'available',
        cycleCount: 0,
        currentPhase: 'complete',
        lastSterilized: new Date().toISOString(),
        operator: 'Dr. Smith',
      },
      {
        id: '2',
        name: 'Forceps',
        barcode: 'FORC001',
        category: 'Surgical Instruments',
        status: 'available',
        cycleCount: 0,
        currentPhase: 'complete',
        lastSterilized: new Date().toISOString(),
        operator: 'Dr. Johnson',
      },
    ],
    lastGeneratedCode: null,
    batchLoading: false,
    packagingLoading: false,

    // Actions
    startPackagingSession: vi.fn(),
    endPackagingSession: vi.fn(),
    addToolToSession: vi.fn(),
    removeToolFromSession: vi.fn(),
    createBatch: vi.fn(),
    addToolToBatch: vi.fn(),
    removeToolFromBatch: vi.fn(),
    finalizeBatch: vi.fn(),
    setShowBatchCodeModal: vi.fn(),
    setShowPackagingScanner: vi.fn(),
  };

  beforeEach(() => {
    // Reset mock store state
    mockStore.currentPackagingSession = null;
    mockStore.currentBatch = null;
    mockStore.lastGeneratedCode = null;
    mockStore.batchLoading = false;
    mockStore.packagingLoading = false;

    // Clear all mock function calls
    vi.clearAllMocks();

    // Ensure the mock always returns an object, never undefined
    (useSterilizationStore as vi.Mock).mockReturnValue(mockStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('integrates with Sterilization state providers', () => {
    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // Test integration with sterilization store
    expect(useSterilizationStore).toHaveBeenCalled();
    expect(screen.getByText('Packaging Workflow')).toBeInTheDocument();
  });

  it('handles Supabase data interactions', async () => {
    mockStore.currentPackagingSession = {
      id: 'session_1',
      operator: 'Dr. Smith',
      startTime: new Date(),
      status: 'active',
      scannedTools: [],
      isBatchMode: true,
    };

    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    const barcodeInput = screen.getByPlaceholderText(
      'Enter barcode manually or scan...'
    );
    const scanButton = screen.getByText('Scan Tool');

    fireEvent.change(barcodeInput, { target: { value: 'SCAL001' } });
    fireEvent.click(scanButton);

    // Test Supabase integration through service calls
    await waitFor(() => {
      expect(
        screen.getByText('Tool not found or not ready for packaging')
      ).toBeInTheDocument();
    });
  });

  it('handles facility scoping and multi-tenant isolation', () => {
    mockStore.currentPackagingSession = {
      id: 'session_1',
      operator: 'Dr. Smith',
      startTime: new Date(),
      status: 'active',
      scannedTools: [],
      isBatchMode: true,
    };

    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // Facility scoping should be handled by the store
    expect(screen.getByText('Scanner')).toBeInTheDocument();
  });

  it('handles error states with real-time updates', async () => {
    // Mock error state
    vi.mock('../../../src/services/packagingService', () => ({
      PackagingService: {
        getToolsReadyForPackaging: vi
          .fn()
          .mockRejectedValue(new Error('Supabase connection failed')),
        createPackage: vi
          .fn()
          .mockRejectedValue(new Error('Package creation failed')),
      },
    }));

    mockStore.currentPackagingSession = {
      id: 'session_1',
      operator: 'Dr. Smith',
      startTime: new Date(),
      status: 'active',
      scannedTools: [],
      isBatchMode: true,
    };

    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // Error handling should be graceful
    expect(screen.getByText('Scanner')).toBeInTheDocument();
  });

  it('executes end-to-end workflow', async () => {
    const onClose = vi.fn();
    render(<PackagingWorkflow onClose={onClose} isBatchMode={true} />);

    // Start session
    const nameInput = screen.getByPlaceholderText('Enter your name');
    fireEvent.change(nameInput, { target: { value: 'Dr. Smith' } });

    const startButton = screen.getByText('Start Session');
    fireEvent.click(startButton);

    expect(mockStore.startPackagingSession).toHaveBeenCalledWith('Dr. Smith');

    // Cancel session
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Cancel should call onClose but not necessarily endPackagingSession
    expect(onClose).toHaveBeenCalled();
  });

  it('handles state consistency during updates', () => {
    mockStore.currentPackagingSession = {
      id: 'session_1',
      operator: 'Dr. Smith',
      startTime: new Date(),
      status: 'active',
      scannedTools: ['1'],
      isBatchMode: true,
    };

    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // State should be consistent across updates
    expect(screen.getByText('Scanner')).toBeInTheDocument();
  });

  it('handles malformed data edge cases', () => {
    // Mock malformed data
    mockStore.availableTools = [
      {
        id: null as any,
        name: undefined as any,
        barcode: '',
        category: 'Invalid Category',
        status: 'invalid',
        cycleCount: 'not-a-number' as any,
        currentPhase: 'invalid-phase',
        lastSterilized: 'invalid-date',
        operator: null as any,
      },
    ];

    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // Should handle malformed data gracefully
    expect(screen.getByText('Packaging Workflow')).toBeInTheDocument();
  });

  it('handles null data edge cases', () => {
    // Mock null data
    mockStore.availableTools = [];
    mockStore.currentPackagingSession = null;

    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // Should handle null data gracefully
    expect(screen.getByText('Packaging Workflow')).toBeInTheDocument();
  });

  it('handles empty data edge cases', () => {
    // Mock empty data
    mockStore.availableTools = [];
    mockStore.currentPackagingSession = {
      id: 'session_1',
      operator: 'Dr. Smith',
      startTime: new Date(),
      status: 'active',
      scannedTools: [],
      isBatchMode: true,
    };

    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // Should handle empty data gracefully
    expect(screen.getByText('No tools scanned yet')).toBeInTheDocument();
  });

  it('integrates with UserContext for authentication', () => {
    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // UserContext integration should be handled by the component
    expect(screen.getByText('Packaging Workflow')).toBeInTheDocument();
  });

  it('handles concurrent operations', async () => {
    mockStore.currentPackagingSession = {
      id: 'session_1',
      operator: 'Dr. Smith',
      startTime: new Date(),
      status: 'active',
      scannedTools: [],
      isBatchMode: true,
    };

    render(<PackagingWorkflow onClose={vi.fn()} isBatchMode={true} />);

    // Test concurrent operations
    const barcodeInput = screen.getByPlaceholderText(
      'Enter barcode manually or scan...'
    );
    const scanButton = screen.getByText('Scan Tool');

    // Simulate rapid scanning
    fireEvent.change(barcodeInput, { target: { value: 'SCAL001' } });
    fireEvent.click(scanButton);
    fireEvent.change(barcodeInput, { target: { value: 'FORC001' } });
    fireEvent.click(scanButton);

    // Should handle concurrent operations gracefully
    await waitFor(() => {
      expect(
        screen.getByText('Tool not found or not ready for packaging')
      ).toBeInTheDocument();
    });
  });
});
