import { useCallback } from 'react';
import { SterilizationPhase } from '../../../store/sterilizationStore';
import { SterilizationCycle } from '../../../store/slices/types/sterilizationCycleTypes';
import {
  PhaseTimerService,
  PhaseStatusInfo,
  PhaseProgressInfo,
} from '../services/phaseTimerService';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabaseClient';
import { useComplianceSettingsStore } from '../../../store/slices/complianceSettingsSlice';

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

/**
 * Props for the usePhaseTimerLogic hook.
 * @interface UsePhaseTimerLogicProps
 * @property {SterilizationPhase} phase - The sterilization phase being managed
 * @property {number} elapsed - Elapsed time in seconds
 * @property {number} remaining - Remaining time in seconds
 * @property {number} duration - Total phase duration in seconds
 * @property {(phaseId: string) => void} onPhaseComplete - Callback for phase completion
 * @property {(phaseId: string) => void} onPhaseStart - Callback for phase start
 * @property {(phaseId: string) => void} onPhasePause - Callback for phase pause
 * @property {(toolId: string) => void} moveToolToNextPhase - Function to move tools to next phase
 * @property {(phaseId: string) => void} resetPhase - Function to reset phase state
 * @property {() => void} resetTimer - Function to reset timer
 * @property {SterilizationCycle | null} currentCycle - Current sterilization cycle
 * @property {(isOpen: boolean, cycleId: string, facilityId: string, toolIds: string[]) => void} onShowCIConfirmation - Callback to show CI confirmation modal
 */
interface UsePhaseTimerLogicProps {
  phase: SterilizationPhase;
  elapsed: number;
  remaining: number;
  duration: number;
  onPhaseComplete: (phaseId: string) => void;
  onPhaseStart: (phaseId: string) => void;
  onPhasePause: (phaseId: string) => void;
  moveToolToNextPhase: (toolId: string) => void;
  resetPhase: (phaseId: string) => void;
  resetTimer: () => void;
  currentCycle: SterilizationCycle | null;
  onShowCIConfirmation: (
    isOpen: boolean,
    cycleId: string,
    facilityId: string,
    toolIds: string[]
  ) => void;
}

/**
 * Custom hook that provides comprehensive logic for managing sterilization phase timers.
 * Handles phase status, progress calculations, timer controls, and tool movement.
 * Provides utility functions for UI state management and validation.
 *
 * @param {UsePhaseTimerLogicProps} props - Configuration object containing phase data and callbacks
 * @returns {object} Object containing all timer logic functions and utilities
 */
export const usePhaseTimerLogic = ({
  phase,
  elapsed,
  remaining,
  duration,
  onPhaseComplete,
  onPhaseStart,
  onPhasePause,
  moveToolToNextPhase,
  resetPhase,
  resetTimer,
  currentCycle,
  onShowCIConfirmation,
}: UsePhaseTimerLogicProps) => {
  const { requireCi } = useComplianceSettingsStore();
  const getStatusInfo = useCallback((): PhaseStatusInfo => {
    return PhaseTimerService.getStatusInfo(phase.status);
  }, [phase.status]);

  const getProgressInfo = useCallback((): PhaseProgressInfo => {
    return PhaseTimerService.getProgressInfo(phase, elapsed, duration);
  }, [phase, elapsed, duration]);

  const getBorderClasses = useCallback((): string => {
    return PhaseTimerService.getBorderClasses(phase);
  }, [phase]);

  const getProgressBarColor = useCallback((): string => {
    return PhaseTimerService.getProgressBarColor(phase);
  }, [phase]);

  const isBathPhase = useCallback((): boolean => {
    return PhaseTimerService.isBathPhase(phase.name);
  }, [phase.name]);

  const validatePhaseDuration = useCallback((): boolean => {
    return PhaseTimerService.validatePhaseDuration(duration);
  }, [duration]);

  const getTimeDisplayText = useCallback((): string => {
    return PhaseTimerService.getTimeDisplayText(
      phase.id,
      elapsed,
      remaining,
      duration
    );
  }, [phase.id, elapsed, remaining, duration]);

  const handleComplete = useCallback(() => {
    try {
      onPhaseComplete(phase.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete phase. Please try again.');
    }
  }, [phase.id, onPhaseComplete]);

  const handleStart = useCallback(() => {
    try {
      onPhaseStart(phase.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start phase. Please try again.');
    }
  }, [phase.id, onPhaseStart]);

  const handlePause = useCallback(() => {
    try {
      onPhasePause(phase.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to pause phase. Please try again.');
    }
  }, [phase.id, onPhasePause]);

  /**
   * Moves all tools from the current phase to the next phase and resets the current phase.
   * Executes tool movement and phase reset with error handling and user feedback.
   */
  /**
   * Moves all tools from the current phase to the next phase and resets the current phase.
   * Executes tool movement and phase reset with error handling and user feedback.
   */
  const handleMoveToolsToNext = useCallback(async () => {
    try {
      // BUSINESS LOGIC: Cycle existence validation
      // Only proceed if there's an active sterilization cycle
      if (currentCycle) {
        // BUSINESS LOGIC: Tool migration to next phase
        // Move each tool in the current phase to the next phase in the workflow
        // This ensures proper progression through the sterilization process
        phase.tools.forEach((toolId: string) => {
          moveToolToNextPhase(toolId);
        });

        // BUSINESS LOGIC: Persist Bath 1 → Bath 2 transition to Supabase
        // Only persist if transitioning from bath1 to bath2
        if (phase.name === 'bath1') {
          try {
            const currentFacilityId = await getCurrentFacilityId();
            const cycleId = localStorage.getItem('currentCycleId');

            if (cycleId) {
              const { error: cycleError } = await supabase
                .from('sterilization_cycles')
                .update({
                  phase: 'bath2',
                  updated_at: new Date(),
                })
                .eq('id', cycleId)
                .eq('facility_id', currentFacilityId);
              if (cycleError) throw cycleError;

              const { error: toolsError } = await supabase
                .from('sterilization_cycle_tools')
                .update({ status: 'bath2' })
                .in('tool_id', phase.tools)
                .eq('cycle_id', cycleId)
                .eq('facility_id', currentFacilityId);
              if (toolsError) throw toolsError;

              await supabase.from('audit_logs').insert({
                action: 'phase_transition',
                metadata: {
                  description: `Bath 2 started for cycle ${cycleId} with ${phase.tools.length} tools.`,
                },
                facility_id: currentFacilityId,
                created_at: new Date(),
              });

              if (typeof toast === 'function')
                toast.success('Bath 2 started successfully.');
              else console.info('✅ Bath 2 transition persisted successfully.');
            }
          } catch (err) {
            console.error('❌ Error persisting Bath 2 transition:', err);
          }
        }

        // BUSINESS LOGIC: Persist Bath 2 → Drying transition to Supabase
        // Only persist if transitioning from bath2 to drying
        if (phase.name === 'bath2') {
          try {
            const currentFacilityId = await getCurrentFacilityId();
            const cycleId = localStorage.getItem('currentCycleId');

            if (cycleId) {
              // Check for P2 tools that should complete after Bath 2
              const { data: toolsData, error: toolsQueryError } = await supabase
                .from('tools')
                .select('id, is_p2_tool')
                .in('id', phase.tools)
                .eq('facility_id', currentFacilityId);

              if (toolsQueryError) throw toolsQueryError;

              const p2Tools =
                toolsData?.filter((tool) => tool.is_p2_tool === true) || [];
              const nonP2Tools =
                toolsData?.filter((tool) => tool.is_p2_tool !== true) || [];

              // Complete P2 tools after Bath 2
              if (p2Tools.length > 0) {
                const p2ToolIds = p2Tools.map((tool) => tool.id);

                // Update P2 tools to complete status
                const { error: p2ToolsError } = await supabase
                  .from('tools')
                  .update({
                    status: 'clean',
                    current_cycle_id: null,
                    current_phase: 'complete',
                  })
                  .in('id', p2ToolIds)
                  .eq('facility_id', currentFacilityId);
                if (p2ToolsError) throw p2ToolsError;

                // Update sterilization cycle tools for P2 tools
                const { error: p2CycleToolsError } = await supabase
                  .from('sterilization_cycle_tools')
                  .update({ status: 'clean' })
                  .in('tool_id', p2ToolIds)
                  .eq('cycle_id', cycleId)
                  .eq('facility_id', currentFacilityId);
                if (p2CycleToolsError) throw p2CycleToolsError;

                // Create audit log for P2 tool completion
                await supabase.from('audit_logs').insert({
                  action: 'p2_tool_completion',
                  metadata: {
                    description: `P2 tool cycle completed after Bath 2 for ${p2ToolIds.length} tools in cycle ${cycleId}.`,
                  },
                  facility_id: currentFacilityId,
                  created_at: new Date(),
                });

                if (typeof toast === 'function')
                  toast.success(
                    `${p2Tools.length} P2 tools completed after Bath 2.`
                  );
                else
                  console.info(
                    `✅ P2 tool completion persisted successfully for ${p2Tools.length} tools.`
                  );
              }

              // Only proceed to Drying if there are non-P2 tools
              if (nonP2Tools.length > 0) {
                const nonP2ToolIds = nonP2Tools.map((tool) => tool.id);

                const { error: cycleError } = await supabase
                  .from('sterilization_cycles')
                  .update({
                    phase: 'airDry',
                    updated_at: new Date(),
                  })
                  .eq('id', cycleId)
                  .eq('facility_id', currentFacilityId);
                if (cycleError) throw cycleError;

                const { error: toolsError } = await supabase
                  .from('sterilization_cycle_tools')
                  .update({ status: 'airDry' })
                  .in('tool_id', nonP2ToolIds)
                  .eq('cycle_id', cycleId)
                  .eq('facility_id', currentFacilityId);
                if (toolsError) throw toolsError;

                await supabase.from('audit_logs').insert({
                  action: 'phase_transition',
                  metadata: {
                    description: `Drying started for cycle ${cycleId} with ${nonP2Tools.length} non-P2 tools.`,
                  },
                  facility_id: currentFacilityId,
                  created_at: new Date(),
                });

                if (typeof toast === 'function')
                  toast.success('Drying started successfully.');
                else
                  console.info('✅ Drying transition persisted successfully.');
              } else {
                // All tools are P2 tools, complete the cycle
                const { error: cycleCompleteError } = await supabase
                  .from('sterilization_cycles')
                  .update({
                    phase: 'complete',
                    status: 'completed',
                    completed_at: new Date(),
                    updated_at: new Date(),
                  })
                  .eq('id', cycleId)
                  .eq('facility_id', currentFacilityId);
                if (cycleCompleteError) throw cycleCompleteError;

                await supabase.from('audit_logs').insert({
                  action: 'cycle_completion',
                  metadata: {
                    description: `Cycle ${cycleId} completed — all tools were P2 tools completed after Bath 2.`,
                  },
                  facility_id: currentFacilityId,
                  created_at: new Date(),
                });

                if (typeof toast === 'function')
                  toast.success(
                    'Cycle completed — all P2 tools finished after Bath 2.'
                  );
                else
                  console.info(
                    '✅ Cycle completion persisted successfully for P2-only batch.'
                  );
              }
            }
          } catch (err) {
            console.error(
              '❌ Error persisting Bath 2 → Drying transition:',
              err
            );
          }
        }

        // BUSINESS LOGIC: Persist Drying → Autoclave transition to Supabase
        // Only persist if transitioning from airDry to autoclave
        if (phase.name === 'airDry') {
          try {
            const currentFacilityId = await getCurrentFacilityId();
            const cycleId = localStorage.getItem('currentCycleId');

            if (cycleId) {
              // Verify that only non-P2 tools are in the drying phase
              const { data: toolsData, error: toolsQueryError } = await supabase
                .from('tools')
                .select('id, is_p2_tool')
                .in('id', phase.tools)
                .eq('facility_id', currentFacilityId);

              if (toolsQueryError) throw toolsQueryError;

              const nonP2Tools =
                toolsData?.filter((tool) => tool.is_p2_tool !== true) || [];

              // Only proceed if there are non-P2 tools (P2 tools should have been completed after Bath 2)
              if (nonP2Tools.length > 0) {
                const nonP2ToolIds = nonP2Tools.map((tool) => tool.id);

                // Check if CI confirmation is required before proceeding to autoclave
                if (requireCi) {
                  // Show CI confirmation modal and wait for response
                  onShowCIConfirmation(
                    true,
                    cycleId,
                    currentFacilityId,
                    nonP2ToolIds
                  );
                  return; // Don't proceed with transition until CI is confirmed
                }

                const { error: cycleError } = await supabase
                  .from('sterilization_cycles')
                  .update({
                    phase: 'autoclave',
                    updated_at: new Date(),
                  })
                  .eq('id', cycleId)
                  .eq('facility_id', currentFacilityId);
                if (cycleError) throw cycleError;

                const { error: toolsError } = await supabase
                  .from('sterilization_cycle_tools')
                  .update({ status: 'autoclave' })
                  .in('tool_id', nonP2ToolIds)
                  .eq('cycle_id', cycleId)
                  .eq('facility_id', currentFacilityId);
                if (toolsError) throw toolsError;

                await supabase.from('audit_logs').insert({
                  action: 'phase_transition',
                  metadata: {
                    description: `Autoclave started for cycle ${cycleId} with ${nonP2Tools.length} non-P2 tools.`,
                  },
                  facility_id: currentFacilityId,
                  created_at: new Date(),
                });

                if (typeof toast === 'function')
                  toast.success('Autoclave started successfully.');
                else
                  console.info(
                    '✅ Autoclave transition persisted successfully.'
                  );
              } else {
                // This shouldn't happen if P2 tools were properly handled after Bath 2
                console.warn(
                  '⚠️ No non-P2 tools found in drying phase - this may indicate a workflow issue'
                );
              }
            }
          } catch (err) {
            console.error(
              '❌ Error persisting Drying → Autoclave transition:',
              err
            );
          }
        }

        // BUSINESS LOGIC: Persist Autoclave → Completion transition to Supabase
        // Only persist if transitioning from autoclave to completion
        if (phase.name === 'autoclave') {
          try {
            const currentFacilityId = await getCurrentFacilityId();
            const cycleId = localStorage.getItem('currentCycleId');

            if (cycleId) {
              // Verify that only non-P2 tools are in the autoclave phase
              const { data: toolsData, error: toolsQueryError } = await supabase
                .from('tools')
                .select('id, is_p2_tool')
                .in('id', phase.tools)
                .eq('facility_id', currentFacilityId);

              if (toolsQueryError) throw toolsQueryError;

              const nonP2Tools =
                toolsData?.filter((tool) => tool.is_p2_tool !== true) || [];

              // Only proceed if there are non-P2 tools (P2 tools should have been completed after Bath 2)
              if (nonP2Tools.length > 0) {
                const nonP2ToolIds = nonP2Tools.map((tool) => tool.id);

                // Check if CI verification is required before proceeding to completion
                if (requireCi) {
                  // Show CI verification modal and wait for response
                  onShowCIConfirmation(
                    true,
                    cycleId,
                    currentFacilityId,
                    nonP2ToolIds
                  );
                  return; // Don't proceed with transition until CI is verified
                }

                const { error: cycleError } = await supabase
                  .from('sterilization_cycles')
                  .update({
                    phase: 'complete',
                    status: 'completed',
                    completed_at: new Date(),
                    updated_at: new Date(),
                  })
                  .eq('id', cycleId)
                  .eq('facility_id', currentFacilityId);
                if (cycleError) throw cycleError;

                const { error: toolsError } = await supabase
                  .from('sterilization_cycle_tools')
                  .update({ status: 'clean' })
                  .in('tool_id', nonP2ToolIds)
                  .eq('cycle_id', cycleId)
                  .eq('facility_id', currentFacilityId);
                if (toolsError) throw toolsError;

                // Update individual tools to return them to inventory
                const { error: inventoryError } = await supabase
                  .from('tools')
                  .update({
                    status: 'clean',
                    current_cycle_id: null,
                  })
                  .in('id', nonP2ToolIds)
                  .eq('facility_id', currentFacilityId);
                if (inventoryError) throw inventoryError;

                await supabase.from('audit_logs').insert({
                  action: 'cycle_completion',
                  metadata: {
                    description: `Cycle ${cycleId} completed — ${nonP2Tools.length} non-P2 tools returned to inventory.`,
                  },
                  facility_id: currentFacilityId,
                  created_at: new Date(),
                });

                if (typeof toast === 'function')
                  toast.success(
                    'Cycle completed — tools returned to inventory.'
                  );
                else
                  console.info('✅ Cycle completion persisted successfully.');
              } else {
                // This shouldn't happen if P2 tools were properly handled after Bath 2
                console.warn(
                  '⚠️ No non-P2 tools found in autoclave phase - this may indicate a workflow issue'
                );
              }
            }
          } catch (err) {
            console.error(
              '❌ Error persisting Autoclave → Completion transition:',
              err
            );
          }
        }

        // BUSINESS LOGIC: Phase state reset with delay
        // Reset the current phase after tools have been moved
        // The delay ensures tool movement completes before phase reset
        // This prevents race conditions in the sterilization workflow
        setTimeout(() => {
          resetPhase(phase.id);
        }, 100);
      }
    } catch (err) {
      // BUSINESS LOGIC: Error handling and user feedback
      // Log error for debugging and show user-friendly error message
      console.error(err);
      toast.error('Failed to move tools to next phase. Please try again.');
    }
  }, [
    currentCycle,
    phase.tools,
    phase.id,
    phase.name,
    moveToolToNextPhase,
    resetPhase,
    requireCi,
    onShowCIConfirmation,
  ]);

  /**
   * Handles completion of CI confirmation and proceeds with autoclave transition
   */
  const handleCIConfirmationComplete = useCallback(async () => {
    try {
      const currentFacilityId = await getCurrentFacilityId();
      const cycleId = localStorage.getItem('currentCycleId');

      if (cycleId) {
        // Verify that only non-P2 tools are proceeding to autoclave
        const { data: toolsData, error: toolsQueryError } = await supabase
          .from('tools')
          .select('id, is_p2_tool')
          .in('id', phase.tools)
          .eq('facility_id', currentFacilityId);

        if (toolsQueryError) throw toolsQueryError;

        const nonP2Tools =
          toolsData?.filter((tool) => tool.is_p2_tool !== true) || [];
        const nonP2ToolIds = nonP2Tools.map((tool) => tool.id);

        if (nonP2ToolIds.length > 0) {
          const { error: cycleError } = await supabase
            .from('sterilization_cycles')
            .update({
              phase: 'autoclave',
              updated_at: new Date(),
            })
            .eq('id', cycleId)
            .eq('facility_id', currentFacilityId);
          if (cycleError) throw cycleError;

          const { error: toolsError } = await supabase
            .from('sterilization_cycle_tools')
            .update({ status: 'autoclave' })
            .in('tool_id', nonP2ToolIds)
            .eq('cycle_id', cycleId)
            .eq('facility_id', currentFacilityId);
          if (toolsError) throw toolsError;

          await supabase.from('audit_logs').insert({
            action: 'phase_transition',
            metadata: {
              description: `Autoclave started for cycle ${cycleId} with ${nonP2Tools.length} non-P2 tools after CI confirmation.`,
            },
            facility_id: currentFacilityId,
            created_at: new Date(),
          });

          if (typeof toast === 'function')
            toast.success('Autoclave started successfully.');
          else
            console.info(
              '✅ Autoclave transition persisted successfully after CI confirmation.'
            );
        }
      }
    } catch (err) {
      console.error(
        '❌ Error persisting Drying → Autoclave transition after CI confirmation:',
        err
      );
    }
  }, [phase.tools]);

  /**
   * Handles completion of CI verification and proceeds with cycle completion
   */
  const handleCIVerificationComplete = useCallback(async () => {
    try {
      const currentFacilityId = await getCurrentFacilityId();
      const cycleId = localStorage.getItem('currentCycleId');

      if (cycleId) {
        // Verify that only non-P2 tools are completing the cycle
        const { data: toolsData, error: toolsQueryError } = await supabase
          .from('tools')
          .select('id, is_p2_tool')
          .in('id', phase.tools)
          .eq('facility_id', currentFacilityId);

        if (toolsQueryError) throw toolsQueryError;

        const nonP2Tools =
          toolsData?.filter((tool) => tool.is_p2_tool !== true) || [];
        const nonP2ToolIds = nonP2Tools.map((tool) => tool.id);

        if (nonP2ToolIds.length > 0) {
          const { error: cycleError } = await supabase
            .from('sterilization_cycles')
            .update({
              phase: 'complete',
              status: 'completed',
              completed_at: new Date(),
              updated_at: new Date(),
            })
            .eq('id', cycleId)
            .eq('facility_id', currentFacilityId);
          if (cycleError) throw cycleError;

          const { error: toolsError } = await supabase
            .from('sterilization_cycle_tools')
            .update({ status: 'clean' })
            .in('tool_id', nonP2ToolIds)
            .eq('cycle_id', cycleId)
            .eq('facility_id', currentFacilityId);
          if (toolsError) throw toolsError;

          // Update individual tools to return them to inventory
          const { error: inventoryError } = await supabase
            .from('tools')
            .update({
              status: 'clean',
              current_cycle_id: null,
            })
            .in('id', nonP2ToolIds)
            .eq('facility_id', currentFacilityId);
          if (inventoryError) throw inventoryError;

          await supabase.from('audit_logs').insert({
            action: 'cycle_completion',
            metadata: {
              description: `Cycle ${cycleId} completed after CI verification — ${nonP2Tools.length} non-P2 tools returned to inventory.`,
            },
            facility_id: currentFacilityId,
            created_at: new Date(),
          });

          if (typeof toast === 'function')
            toast.success('Cycle completed — tools returned to inventory.');
          else
            console.info(
              '✅ Cycle completion persisted successfully after CI verification.'
            );
        }
      }
    } catch (err) {
      console.error(
        '❌ Error persisting Autoclave → Completion transition after CI verification:',
        err
      );
    }
  }, [phase.tools]);

  const handleReset = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return {
    getStatusInfo,
    getProgressInfo,
    getBorderClasses,
    getProgressBarColor,
    isBathPhase,
    validatePhaseDuration,
    getTimeDisplayText,
    handleComplete,
    handleStart,
    handlePause,
    handleMoveToolsToNext,
    handleReset,
    handleCIConfirmationComplete,
    handleCIVerificationComplete,
  };
};
