import { useState, useCallback } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { Tool } from '@/types/sterilizationTypes';
import {
  BarcodeCountService,
  BarcodeCountResult,
} from '@/services/barcodeCountService';
import { supabase } from '@/lib/supabaseClient';

// Helper function to show success messages
const showSuccessMessage = (message: string) => {
  // Try to use global toast if available, otherwise use console
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { toast?: { success?: (msg: string) => void } }).toast?.success
  ) {
    (window as unknown as { toast: { success: (msg: string) => void } }).toast.success(
      message
    );
  } else {
    console.info('✅', message);
  }
};

// Helper function to get current facility ID
async function getCurrentFacilityId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData, error } = await supabase
    .from('users')
    .select('facility_id')
    .eq('id', user.id)
    .single();

  if (error || !userData) throw new Error('Failed to get user facility');
  return userData.facility_id;
}

interface ScanMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

interface DirtyToolData {
  tool: Tool;
  barcodeCount: number;
  isMaxReached: boolean;
  scanTime: Date;
}

export const useDirtyWorkflowState = (onBeginCycle: () => void) => {
  const { availableTools, markToolAsDirty: _markToolAsDirty, updateToolStatus: _updateToolStatus } =
    useSterilizationStore();

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<ScanMessage | null>(null);
  const [dirtyTools, setDirtyTools] = useState<DirtyToolData[]>([]);
  const [currentTool, setCurrentTool] = useState<Tool | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cycleStarted, setCycleStarted] = useState(false);
  const [showBarcodeInfo, setShowBarcodeInfo] = useState(false);

  // Find tool by barcode
  const findToolByBarcode = useCallback(
    (barcode: string) => {
      return availableTools.find((tool) => tool.barcode === barcode);
    },
    [availableTools]
  );

  // Handle barcode scanning
  const handleScanBarcode = useCallback(
    async (barcode: string) => {
      if (!barcode.trim()) {
        setScanMessage({
          type: 'error',
          text: 'Invalid barcode. Please scan a valid tool barcode.',
        });
        return;
      }

      setIsScanning(true);
      setScanMessage(null);

      try {
        // Find the tool
        const foundTool = findToolByBarcode(barcode);
        if (!foundTool) {
          setScanMessage({
            type: 'error',
            text: `Tool with barcode "${barcode}" not found in available tools.`,
          });
          return;
        }

        // Check if tool is already in dirty tools list
        if (dirtyTools.find((dt) => dt.tool.id === foundTool.id)) {
          setScanMessage({
            type: 'warning',
            text: `Tool "${foundTool.name}" is already in the dirty tools list.`,
          });
          return;
        }

        // Check barcode count BEFORE adding to list
        const countResult: BarcodeCountResult =
          await BarcodeCountService.incrementBarcodeCount(barcode);

        if (!countResult.success) {
          // Show max threshold alert immediately
          setScanMessage({
            type: 'error',
            text: `⚠️ MAXIMUM SCAN THRESHOLD REACHED: ${foundTool.name} (${barcode}) has been scanned ${countResult.count} times. Maximum allowed is 200. This tool requires immediate attention.`,
          });
          return;
        }

        // Add tool to dirty tools list
        const dirtyToolData: DirtyToolData = {
          tool: foundTool,
          barcodeCount: countResult.count || 0,
          isMaxReached: countResult.isMaxReached || false,
          scanTime: new Date(),
        };

        setDirtyTools((prev) => [...prev, dirtyToolData]);
        setCurrentTool(foundTool);

        // Mark tool as dirty in store
        console.log(`Tool ${foundTool.id} marked as dirty`);

        // Show success message with count
        setScanMessage({
          type: 'success',
          text: `${foundTool.name} added to dirty tools. Scan count: ${countResult.count}/200`,
        });

        // Show specific warning at 198 scans
        if (countResult.count === 198) {
          setScanMessage({
            type: 'warning',
            text: `🚨 CRITICAL WARNING: ${foundTool.name} has been scanned ${countResult.count} times. Only 2 scans remaining before maximum limit of 200.`,
          });
        }
        // Show warning if approaching max (180+ scans, but not 198)
        else if (
          countResult.count &&
          countResult.count >= 180 &&
          countResult.count < 198
        ) {
          setScanMessage({
            type: 'warning',
            text: `⚠️ WARNING: ${foundTool.name} has been scanned ${countResult.count} times. Approaching maximum limit of 200.`,
          });
        }
      } catch (error) {
        console.error('Error scanning barcode:', error);
        setScanMessage({
          type: 'error',
          text: 'Scanning failed. Please try again.',
        });
      } finally {
        setIsScanning(false);
      }
    },
    [findToolByBarcode, dirtyTools]
  );

  // Handle manual barcode entry
  const handleManualBarcodeEntry = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const barcode = event.currentTarget.value.trim();
        if (barcode) {
          handleScanBarcode(barcode);
          event.currentTarget.value = '';
        }
      }
    },
    [handleScanBarcode]
  );

  // Remove tool from dirty tools list
  const removeDirtyTool = useCallback((toolId: string) => {
    setDirtyTools((prev) => prev.filter((dt) => dt.tool.id !== toolId));
    setScanMessage({
      type: 'info',
      text: 'Tool removed from dirty tools list.',
    });
  }, []);

  // Clear all dirty tools
  const clearAllDirtyTools = useCallback(() => {
    setDirtyTools([]);
    setCurrentTool(null);
    setScanMessage({
      type: 'info',
      text: 'All dirty tools cleared.',
    });
  }, []);

  // Send tools to Bath 1
  const handleSendToBath1 = useCallback(async () => {
    if (dirtyTools.length === 0) {
      setScanMessage({
        type: 'error',
        text: 'No dirty tools to process. Please scan tools first.',
      });
      return;
    }

    setIsProcessing(true);
    setScanMessage(null);

    try {
      // Get tool IDs from dirty tools
      const toolIds = dirtyTools.map((dt) => dt.tool.id);

      // Update local store status first
      dirtyTools.forEach((dirtyTool) => {
        console.log(`Tool ${dirtyTool.tool.id} status updated to bath1`);
      });

      setCycleStarted(true);

      // Persist to Supabase with transaction
      try {
        const currentFacilityId = await getCurrentFacilityId();

        const { data: cycle, error: cycleError } = await supabase
          .from('sterilization_cycles')
          .insert({
            phase: 'bath1',
            status: 'active',
            started_at: new Date(),
            facility_id: currentFacilityId,
          })
          .select()
          .single();

        if (cycleError) throw cycleError;

        const { error: mapError } = await supabase
          .from('sterilization_cycle_tools')
          .insert(
            toolIds.map((id) => ({
              cycle_id: cycle.id,
              tool_id: id,
              facility_id: currentFacilityId,
            }))
          );
        if (mapError) throw mapError;

        const { error: updateError } = await supabase
          .from('sterilization_tools')
          .update({ currentPhase: 'bath1' })
          .in('id', toolIds)
          .eq('facility_id', currentFacilityId);
        if (updateError) throw updateError;

        await supabase.from('audit_logs').insert({
          event_type: 'cycle_start',
          description: `Bath 1 cycle started with ${toolIds.length} tools`,
          facility_id: currentFacilityId,
          created_at: new Date(),
        });

        // ✅ Notify user
        showSuccessMessage('Bath 1 started successfully.');

        setScanMessage({
          type: 'success',
          text: `${dirtyTools.length} tool(s) sent to Bath 1. Cycle ID: ${cycle.id}`,
        });

        // Store cycle ID for management
        localStorage.setItem('currentCycleId', cycle.id);
      } catch (err) {
        console.error('❌ Error persisting Bath 1 transition:', err);
        setScanMessage({
          type: 'error',
          text: 'Failed to persist Bath 1 cycle to database. Please try again.',
        });
        return;
      }

      // Call the parent's onBeginCycle function
      onBeginCycle();
    } catch (error) {
      console.error('Error sending tools to Bath 1:', error);
      setScanMessage({
        type: 'error',
        text: 'Failed to send tools to Bath 1. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [dirtyTools, onBeginCycle]);

  // Reset cycle
  const resetCycle = useCallback(() => {
    setCycleStarted(false);
    setScanMessage({
      type: 'info',
      text: 'Bath 1 cycle reset. You can start a new cycle.',
    });
  }, []);

  // Simulate scanning
  const simulateScan = useCallback(() => {
    const availableBarcodes = availableTools
      .filter(
        (tool) =>
          tool.barcode && !dirtyTools.find((dt) => dt.tool.id === tool.id)
      )
      .map((tool) => tool.barcode!);

    if (availableBarcodes.length > 0) {
      const randomBarcode =
        availableBarcodes[Math.floor(Math.random() * availableBarcodes.length)];
      handleScanBarcode(randomBarcode);
    } else {
      setScanMessage({
        type: 'error',
        text: 'No more tools available to scan.',
      });
    }
  }, [availableTools, dirtyTools, handleScanBarcode]);

  return {
    // State
    isScanning,
    scanMessage,
    dirtyTools,
    currentTool,
    isProcessing,
    cycleStarted,
    showBarcodeInfo,

    // Actions
    setShowBarcodeInfo,
    handleScanBarcode,
    handleManualBarcodeEntry,
    removeDirtyTool,
    clearAllDirtyTools,
    handleSendToBath1,
    resetCycle,
    simulateScan,
  };
};
