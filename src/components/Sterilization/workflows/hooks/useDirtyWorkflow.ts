import { useState, useCallback, useEffect } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { useTimerStore } from '@/store/timerStore';
import { Tool } from '@/types/sterilizationTypes';
import { PHASE_CONFIG } from '@/config/workflowConfig';

// Helper function to show error messages
const showErrorMessage = (message: string) => {
  // Try to use global toast if available, otherwise use console
  if (
    typeof window !== 'undefined' &&
    (window as { toast?: { error?: (msg: string) => void } }).toast?.error
  ) {
    (window as { toast: { error: (msg: string) => void } }).toast.error(
      message
    );
  } else {
    console.warn('⚠️', message);
  }
};

interface UseDirtyWorkflowProps {
  scannedData: string;
  toolId?: string;
  onClose?: () => void;
  batchMode?: boolean;
}

interface ScanMessage {
  type: 'success' | 'error';
  text: string;
}

export const useDirtyWorkflow = ({
  scannedData,
  toolId,
  onClose,
  batchMode = false,
}: UseDirtyWorkflowProps) => {
  const {
    availableTools,
    currentCycle,
    addPhaseToCycle,
    startPhase,
    addToolToCycle,
  } = useSterilizationStore();

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<ScanMessage | null>(null);
  const [scannedTools, setScannedTools] = useState<Tool[]>([]);
  const [replacementAlert, setReplacementAlert] = useState<{
    show: boolean;
    tool: Tool | null;
  }>({ show: false, tool: null });

  // Find the tool by barcode if toolId is not provided
  const findToolByBarcode = useCallback(
    (barcode: string) => {
      return availableTools.find((tool) => tool.barcode === barcode);
    },
    [availableTools]
  );

  // Get the current tool
  const getCurrentTool = useCallback(() => {
    return toolId
      ? availableTools.find((t) => t.id === toolId)
      : findToolByBarcode(scannedData);
  }, [toolId, availableTools, findToolByBarcode, scannedData]);

  const tool = getCurrentTool();

  // Check if tool is already in the current cycle
  const isToolInCycle = useCallback(() => {
    if (!currentCycle || !tool) return false;
    return currentCycle.tools.includes(tool.id);
  }, [currentCycle, tool]);

  // Handle tool scanning
  const handleScanTool = useCallback(
    async (scannedData?: string) => {
      // 🚫 Stop using hardcoded fallback
      if (
        !scannedData ||
        typeof scannedData !== 'string' ||
        scannedData.trim() === ''
      ) {
        // Use helper function to show error message
        showErrorMessage('No barcode detected — please rescan.');
        return;
      }

      const barcode = scannedData.trim();
      console.info('✅ Scanned barcode received:', barcode);

      setIsScanning(true);
      setScanMessage(null);

      try {
        // Simulate scanning delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const foundTool = findToolByBarcode(barcode);

        if (!foundTool) {
          setScanMessage({
            type: 'error',
            text: `Tool with barcode "${barcode}" not found in inventory.`,
          });
          return;
        }

        // Check if tool is already scanned
        if (scannedTools.find((t) => t.id === foundTool.id)) {
          setScanMessage({
            type: 'error',
            text: `Tool "${foundTool.name}" already scanned.`,
          });
          return;
        }

        // Check if tool needs replacement (200 cycles reached)
        const sterilizationStore = useSterilizationStore.getState();
        if (
          sterilizationStore.checkToolReplacementNeeded &&
          sterilizationStore.checkToolReplacementNeeded(foundTool.id)
        ) {
          setReplacementAlert({ show: true, tool: foundTool });
          return;
        }

        // Add to scanned tools list (both single and batch modes)
        setScannedTools((prev) => {
          const newScannedTools = [...prev, foundTool];

          // Set success message with the correct count
          if (batchMode) {
            setScanMessage({
              type: 'success',
              text: `Tool "${foundTool.name}" added to batch. Total: ${newScannedTools.length} tools.`,
            });
          } else {
            setScanMessage({
              type: 'success',
              text: `Tool "${foundTool.name}" scanned successfully. Ready for sterilization.`,
            });
          }

          return newScannedTools;
        });
      } catch (error) {
        setScanMessage({
          type: 'error',
          text: 'Failed to scan tool. Please try again.',
        });
        console.error('Scan error:', error);
      } finally {
        setIsScanning(false);
      }
    },
    [findToolByBarcode, batchMode, scannedTools]
  );

  // Get cycle status for display
  const cycleStatus = useCallback(() => {
    if (!currentCycle) return null;

    const activePhase = currentCycle.phases.find((phase) => phase.isActive);
    const totalTools = currentCycle.tools.length;

    return {
      cycleId: currentCycle.id,
      operator: currentCycle.operator,
      totalTools,
      activePhase: activePhase?.name || 'No active phase',
      startTime: currentCycle.startTime,
    };
  }, [currentCycle]);

  // Check if Bath 1 is already active
  const isBath1Active = useCallback(() => {
    // Check if Bath 1 phase is active in the cycle
    const cycleBath1Active =
      currentCycle?.phases.some(
        (phase) => phase.id === 'bath1' && phase.isActive
      ) || false;

    // Also check if Bath 1 timer is running
    const { getTimer } = useTimerStore.getState();
    const bath1Timer = getTimer('bath1');
    const timerBath1Active = bath1Timer?.isRunning || false;

    return cycleBath1Active || timerBath1Active;
  }, [currentCycle]);

  // Clear scanned tools
  const clearScannedTools = useCallback(() => {
    setScannedTools([]);
    setScanMessage(null);
  }, []);

  // Handle replacement alert actions
  const handleReplaceTool = useCallback(() => {
    setReplacementAlert({ show: false, tool: null });
    setScanMessage({
      type: 'error',
      text: 'Tool marked for replacement. Please replace with a new tool before continuing.',
    });
  }, []);

  const handleContinueAnyway = useCallback(() => {
    if (replacementAlert.tool) {
      // Add the tool to scanned tools even though it needs replacement
      setScannedTools((prev) => [...prev, replacementAlert.tool!]);
      setScanMessage({
        type: 'success',
        text: `Tool "${replacementAlert.tool.name}" added despite needing replacement.`,
      });
    }
    setReplacementAlert({ show: false, tool: null });
  }, [replacementAlert.tool]);

  const handleDismissReplacementAlert = useCallback(() => {
    setReplacementAlert({ show: false, tool: null });
  }, []);

  // Send all scanned tools to Bath 1
  const handleSendToBath1 = useCallback(
    (tools: Tool[]) => {
      if (!tools || tools.length === 0) {
        console.warn('⚠️ handleSendToBath1 called with no tools.');
        return;
      }

      // Check if Bath 1 is already active
      if (isBath1Active()) {
        setScanMessage({
          type: 'error',
          text: '⚠️ Bath 1 timer is already in process. Please wait for the current phase to complete before starting a new one.',
        });
        return;
      }

      try {
        // Add all tools to cycle first
        tools.forEach((tool) => {
          addToolToCycle(tool.id);

          // Update tool status to bath1 phase
          const sterilizationStore = useSterilizationStore.getState();
          if (sterilizationStore.updateToolStatus) {
            sterilizationStore.updateToolStatus(tool.id, 'bath1');
          }
        });

        // Create and start Bath 1 phase
        addPhaseToCycle(
          'bath1',
          PHASE_CONFIG.bath1.name,
          PHASE_CONFIG.bath1.duration * 60
        ); // Convert minutes to seconds

        startPhase('bath1');

        // Start the timer for Bath 1 phase
        const { startTimer } = useTimerStore.getState();
        startTimer('bath1', PHASE_CONFIG.bath1.duration * 60); // Start timer with duration in seconds

        setScanMessage({
          type: 'success',
          text: `🚀 ${tools.length} tools sent to Bath 1! Phase timer started.`,
        });

        // Clear scanned tools
        setScannedTools([]); // Reset scanned tools after sending

        // Close the workflow and return to main sterilization page
        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error('❌ Error in handleSendToBath1:', error);
        setScanMessage({
          type: 'error',
          text: 'Failed to start Bath 1 phase. Please try again.',
        });
      }
    },
    [
      addToolToCycle,
      addPhaseToCycle,
      startPhase,
      setScanMessage,
      onClose,
      isBath1Active,
    ]
  );

  // Auto-clear scan messages after 5 seconds
  useEffect(() => {
    if (scanMessage) {
      const timer = setTimeout(() => {
        setScanMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [scanMessage]);

  return {
    tool,
    currentCycle,
    isScanning,
    scanMessage,
    scannedTools,
    batchMode,
    handleScanTool,
    handleSendToBath1,
    clearScannedTools,
    isToolInCycle: isToolInCycle(),
    isBath1Active: isBath1Active(),
    cycleStatus: cycleStatus(),
    replacementAlert,
    handleReplaceTool,
    handleContinueAnyway,
    handleDismissReplacementAlert,
  };
};
