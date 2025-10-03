import React, { forwardRef } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { Bath1PhaseDisplay } from './workflows/components/Bath1PhaseDisplay';

interface PhaseTimerTabProps {
  onPhaseComplete?: () => void;
  onPhasePause?: () => void;
}

export const PhaseTimerTab = forwardRef<HTMLDivElement, PhaseTimerTabProps>(
  ({ onPhaseComplete, onPhasePause }, ref) => {
    const { overexposed } = useTimerStore();

    return (
      <div ref={ref} className="space-y-4">
        <Bath1PhaseDisplay
          onPhaseComplete={onPhaseComplete}
          onPhasePause={onPhasePause}
        />

        {overexposed && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Warning:</strong> Tools have been overexposed to the
            sterilization process.
          </div>
        )}
      </div>
    );
  }
);

PhaseTimerTab.displayName = 'PhaseTimerTab';
