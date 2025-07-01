import { act } from '@testing-library/react';
import { useSterilizationStore } from '../sterilizationStore';

describe('sterilizationStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useSterilizationStore.setState({
        currentCycle: null,
        cycles: [],
        availableTools: [],
        isScanning: false,
        scannedBarcode: null,
        showScannerModal: false,
        showAnalyticsModal: false,
        showCleaningLogModal: false,
        showBITestModal: false,
        biTestResults: [],
        lastBITestDate: null,
        nextBITestDue: null,
        error: null,
      });
    });
  });

  it('should start with default state', () => {
    const state = useSterilizationStore.getState();
    expect(state.currentCycle).toBe(null);
    expect(state.cycles).toEqual([]);
    expect(state.availableTools).toEqual([]);
    expect(state.isScanning).toBe(false);
  });

  it('should allow starting a new cycle', () => {
    act(() => {
      useSterilizationStore.getState().startNewCycle('Test Operator');
    });

    const state = useSterilizationStore.getState();
    expect(state.currentCycle).not.toBe(null);
    expect(state.currentCycle?.operator).toBe('Test Operator');
    expect(state.currentCycle?.tools).toHaveLength(0);
  });

  it('should add a tool to the cycle', () => {
    // First start a cycle
    act(() => {
      useSterilizationStore.getState().startNewCycle('Test Operator');
    });

    // Add a mock tool to available tools
    act(() => {
      useSterilizationStore.setState({
        availableTools: [
          {
            id: 'TOOL001',
            name: 'Test Tool',
            barcode: 'TEST001',
            currentPhase: 'complete',
            startTime: null,
            endTime: null,
            phaseStartTime: null,
            phaseEndTime: null,
            biStatus: 'pass',
            notes: '',
            operator: '',
            cycleId: '',
          },
        ],
      });
    });

    // Add tool to cycle
    act(() => {
      useSterilizationStore.getState().addToolToCycle('TOOL001');
    });

    const state = useSterilizationStore.getState();
    expect(state.currentCycle?.tools).toHaveLength(1);
    expect(state.currentCycle?.tools[0]).toBe('TOOL001');
  });

  it('should clear error when setError is called with null', () => {
    // First set an error
    act(() => {
      useSterilizationStore.getState().setError('Test error');
    });
    expect(useSterilizationStore.getState().error).toBe('Test error');

    // Then clear it
    act(() => {
      useSterilizationStore.getState().setError(null);
    });
    expect(useSterilizationStore.getState().error).toBe(null);
  });
});

describe('sterilizationStore - batching logic', () => {
  it('should assign tools to batch correctly', () => {
    // First start a cycle
    act(() => {
      useSterilizationStore.getState().startNewCycle('Test Operator');
    });

    // Add the tool to available tools first
    act(() => {
      useSterilizationStore.setState({
        availableTools: [
          {
            id: 'T001',
            name: 'Test Tool',
            barcode: 'TEST001',
            currentPhase: 'complete',
            startTime: null,
            endTime: null,
            phaseStartTime: null,
            phaseEndTime: null,
            biStatus: 'pass',
            notes: '',
            operator: '',
            cycleId: '',
          },
        ],
      });
    });

    act(() => {
      useSterilizationStore.getState().addToolToCycle('T001');
    });

    const cycle = useSterilizationStore.getState().currentCycle;
    expect(cycle?.tools).toHaveLength(1);
    expect(cycle?.tools[0]).toBe('T001');
  });
});
