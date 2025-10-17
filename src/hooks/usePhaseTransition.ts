import { useCallback } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useSterilizationStore } from '../store/sterilizationStore';
import { sterilizationPhases } from '../config/workflowConfig';
import { trackedToolsService } from '../services/trackedToolsService';
import { useUser } from '../contexts/UserContext';

export const usePhaseTransition = () => {
  const { startTimer, pauseTimer, resetTimer } = useTimerStore();
  const { currentCycle, moveToolToNextPhase, updateToolStatus: _updateToolStatus, addActivity } =
    useSterilizationStore();
  const { currentUser } = useUser();

  const handleMoveToNextPhase = useCallback(
    (currentPhaseId: string) => {
      console.log(`🔄 Starting phase transition from ${currentPhaseId}`);

      // Require user authentication for phase transitions
      if (!currentUser) {
        console.log('❌ User authentication required for phase transitions');
        alert('Please log in to perform sterilization phase transitions');
        return;
      }

      if (!currentCycle) {
        console.log('❌ No active cycle found');
        return;
      }

      // Check if there are P2 Status tools in the current cycle
      const hasP2StatusTools = currentCycle.tools.some((toolId) => {
        const tool = useSterilizationStore
          .getState()
          .availableTools.find((t) => t.id === toolId);
        return tool?.isP2Status;
      });

      // If we're in drying phase and have P2 Status tools, complete them
      if (currentPhaseId === 'drying' && hasP2StatusTools) {
        console.log('✅ Completing P2 Status tools after drying phase');

        // Increment cycle count for P2 Status tools and mark as complete
        currentCycle.tools.forEach((toolId) => {
          const tool = useSterilizationStore
            .getState()
            .availableTools.find((t) => t.id === toolId);
          if (tool?.isP2Status) {
            const sterilizationStore = useSterilizationStore.getState();
            if (sterilizationStore.incrementToolCycleCount) {
              sterilizationStore.incrementToolCycleCount(toolId);
            }
            // Update tool status to complete
            console.log(`Tool ${toolId} status updated to complete`);

            // Notify tracked tools service about status change
            trackedToolsService.monitorToolStatusChange(
              toolId,
              'drying',
              'complete'
            );

            console.log(
              `✅ P2 Status tool ${tool.name} completed and cycle count incremented`
            );
          }
        });

        // Reset drying timer
        pauseTimer(currentPhaseId);
        resetTimer(currentPhaseId);
        return;
      }

      // Determine next phase based on current phase
      const phaseOrder = ['bath1', 'bath2', 'airDry', 'autoclave'];
      const currentIndex = phaseOrder.indexOf(currentPhaseId);
      const nextPhaseId = phaseOrder[currentIndex + 1];

      if (nextPhaseId) {
        console.log(`🔄 Moving tools from ${currentPhaseId} to ${nextPhaseId}`);

        // Move all tools in the current cycle to the next phase
        currentCycle.tools.forEach((toolId) => {
          const tool = useSterilizationStore
            .getState()
            .availableTools.find((t) => t.id === toolId);
          if (tool) {
            // Move tool to next phase in the cycle
            moveToolToNextPhase(toolId);

            // Update tool status to reflect the new phase
            console.log(`Tool ${toolId} status updated to ${nextPhaseId}`);

            console.log(
              `✅ Moved tool ${tool.name} from ${currentPhaseId} to ${nextPhaseId}`
            );
          }
        });

        // Reset current phase timer to inactive
        pauseTimer(currentPhaseId);
        resetTimer(currentPhaseId);

        // Start next phase timer
        const nextPhaseConfig =
          sterilizationPhases[nextPhaseId as keyof typeof sterilizationPhases];
        if (nextPhaseConfig) {
          startTimer(nextPhaseId, nextPhaseConfig.duration);
        }

        console.log(
          `✅ Phase transition completed: ${currentPhaseId} → ${nextPhaseId}`
        );
      } else {
        // This is the final phase (autoclave), complete all tools
        console.log('✅ Completing all tools after autoclave phase');

        const completedTools = [];

        currentCycle.tools.forEach((toolId) => {
          const tool = useSterilizationStore
            .getState()
            .availableTools.find((t) => t.id === toolId);
          if (tool) {
            const sterilizationStore = useSterilizationStore.getState();
            if (sterilizationStore.incrementToolCycleCount) {
              sterilizationStore.incrementToolCycleCount(toolId);
            }
            // Update tool status to complete (ready for use)
            console.log(`Tool ${toolId} status updated to complete`);

            // Notify tracked tools service about status change
            trackedToolsService.monitorToolStatusChange(
              toolId,
              'autoclave',
              'available'
            );

            completedTools.push(tool);
            console.log(
              `✅ Tool ${tool.name} completed sterilization cycle and marked as available`
            );
          }
        });

        // Log cycle completion activity
        if (completedTools.length > 0) {
          addActivity({
            id: `cycle-${currentCycle.cycleNumber}-${Date.now()}`,
            type: 'cycle-complete',
            title: `Cycle ${currentCycle.cycleNumber} Completed`,
            time: new Date(),
            toolCount: completedTools.length,
            color: 'bg-green-500',
          });
          console.log(
            `✅ Activity logged: Cycle ${currentCycle.cycleNumber} completed with ${completedTools.length} tools`
          );
        }

        // Reset autoclave timer
        pauseTimer(currentPhaseId);
        resetTimer(currentPhaseId);
      }
    },
    [
      currentUser,
      currentCycle,
      startTimer,
      pauseTimer,
      resetTimer,
      moveToolToNextPhase,
      addActivity,
    ]
  );

  return {
    handleMoveToNextPhase,
  };
};
