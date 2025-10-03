import React from 'react';
import Icon from '@mdi/react';
import { mdiAlert } from '@mdi/js';
import { SterilizationPhase } from '../../../store/sterilizationStore';

interface PhaseTimerAlertsProps {
  phase: SterilizationPhase;
  isBathPhase: boolean;
  overexposed: boolean;
  timeDisplayText: string;
}

/**
 * PhaseTimerAlerts component for displaying phase-related alerts and warnings.
 * Shows over-exposure timer and phase failure notes.
 */
export const PhaseTimerAlerts: React.FC<PhaseTimerAlertsProps> = ({
  phase,
  isBathPhase,
  overexposed,
  timeDisplayText,
}) => {
  return (
    <>
      {/* Over-Exposure Timer - Only for bath phases */}
      {isBathPhase && overexposed && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon path={mdiAlert} size={1} className="text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Over-Exposure Timer
              </span>
            </div>
            <span className="text-lg font-mono font-bold text-red-700">
              {timeDisplayText}
            </span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            Tools have been in chemicals longer than recommended. Please remove
            immediately.
          </p>
        </div>
      )}

      {/* Phase Notes */}
      {phase.status === 'failed' && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs">
          <p className="text-red-700">
            Phase failed. Please check equipment and restart.
          </p>
        </div>
      )}
    </>
  );
};
