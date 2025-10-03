import React from 'react';
import Icon from '@mdi/react';
import { mdiPlay, mdiPause } from '@mdi/js';

interface ActionButtonsProps {
  dirtyToolsCount: number;
  isProcessing: boolean;
  cycleStarted: boolean;
  onSendToBath1: () => void;
  onResetCycle: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  dirtyToolsCount,
  isProcessing,
  cycleStarted,
  onSendToBath1,
  onResetCycle,
}) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={onSendToBath1}
        disabled={dirtyToolsCount === 0 || isProcessing || cycleStarted}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon path={mdiPlay} size={1.2} />
        {isProcessing
          ? 'Sending to Bath 1...'
          : cycleStarted
            ? 'Sent to Bath 1'
            : 'Send to Bath 1'}
      </button>

      {cycleStarted && (
        <button
          onClick={onResetCycle}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Icon path={mdiPause} size={1.2} />
          Reset Cycle
        </button>
      )}
    </div>
  );
};
