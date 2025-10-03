import React, { memo, useState } from 'react';
import { useTimerStore } from '../../store/timerStore';
import { sterilizationPhases } from '../../config/workflowConfig';
import { getDefaultAutoclaveCycle } from '../../config/autoclaveCycles';
import { useTimerControls } from '../../hooks/useTimerControls';
import { usePhaseTransition } from '../../hooks/usePhaseTransition';
import { PhaseHeader } from './TimerDisplay/PhaseHeader';
import { PhaseControls } from './TimerDisplay/PhaseControls';
import { AutoclaveCycleSelector } from './TimerDisplay/AutoclaveCycleSelector';
import { PhaseInfo } from './TimerDisplay/PhaseInfo';
import { ToolsSection } from './TimerDisplay/ToolsSection';

interface TimerDisplayProps {
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = memo(
  ({ className = '' }) => {
    const { timers } = useTimerStore();
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [selectedAutoclaveCycle, setSelectedAutoclaveCycle] = useState(
      getDefaultAutoclaveCycle()
    );

    // Custom hooks for timer logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { handleStartTimer, handlePauseTimer, handleStopTimer } =
      useTimerControls();
    const { handleMoveToNextPhase } = usePhaseTransition();

    // Debug logging removed for production

    const toggleExpanded = (phaseId: string) => {
      setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
    };

    const handleStopTimerAndCollapse = (phaseId: string) => {
      handleStopTimer(phaseId);
      // Collapse the phase after cancelling
      setExpandedPhase(null);
    };

    const handleMoveToNextPhaseAndCollapse = (phaseId: string) => {
      handleMoveToNextPhase(phaseId);
      // Collapse the phase after moving to next phase
      setExpandedPhase(null);
    };

    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#5b5b5b]">
              Sterilization Timers
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Individual phase timers for concurrent cycles
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-[#4ECDC4] text-white rounded-full">
            Phase Timers
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(sterilizationPhases).map(([phaseId, phaseConfig]) => {
            const timer = timers[phaseId];
            const duration = phaseConfig.duration;
            const isExpanded = expandedPhase === phaseId;
            const elapsedTime = timer?.elapsedTime ?? 0;

            return (
              <div
                key={phaseId}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
                  timer?.isRunning || phaseId === 'bath1'
                    ? 'shadow-[0_0_25px_rgba(78,205,196,0.5)] border-[#4ECDC4] ring-2 ring-[#4ECDC4] ring-opacity-30'
                    : ''
                }`}
              >
                {/* Phase Header */}
                <PhaseHeader
                  phaseId={phaseId}
                  phaseConfig={phaseConfig}
                  timer={timer}
                  duration={duration}
                  elapsedTime={elapsedTime}
                  isExpanded={isExpanded}
                  onToggleExpanded={() => toggleExpanded(phaseId)}
                />

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    {/* Tools Section */}
                    <ToolsSection />

                    {/* Autoclave Cycle Selection */}
                    {phaseId === 'autoclave' && (
                      <AutoclaveCycleSelector
                        selectedCycle={selectedAutoclaveCycle}
                        onCycleSelect={setSelectedAutoclaveCycle}
                      />
                    )}

                    {/* Phase Controls */}
                    <PhaseControls
                      phaseId={phaseId}
                      timer={timer}
                      onPauseTimer={handlePauseTimer}
                      onStopTimer={handleStopTimerAndCollapse}
                      onMoveToNextPhase={handleMoveToNextPhaseAndCollapse}
                    />

                    {/* Phase Info */}
                    <PhaseInfo
                      duration={duration || 0}
                      isRunning={timer?.isRunning || false}
                      timer={timer}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

TimerDisplay.displayName = 'TimerDisplay';

export default TimerDisplay;
