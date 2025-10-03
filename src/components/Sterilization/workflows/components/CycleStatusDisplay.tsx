import React from 'react';
import { motion } from 'framer-motion';
import { mdiTimer, mdiAccount, mdiTools } from '@mdi/js';
import Icon from '@/components/Icon/Icon';
import { SterilizationCycle } from '@/store/slices/types/sterilizationCycleTypes';
import { getToolCounts } from '@/utils/getToolCounts';

interface CycleStatusDisplayProps {
  cycle: SterilizationCycle;
  cycleStatus: {
    cycleId: string;
    operator: string;
    totalTools: number;
    activePhase: string;
    startTime: Date;
  } | null;
}

export const CycleStatusDisplay: React.FC<CycleStatusDisplayProps> = ({
  cycle,
  cycleStatus,
}) => {
  if (!cycleStatus) return null;

  // Convert tool IDs to Tool objects for getToolCounts
  const tools = cycle.tools.map((toolId) => ({ id: toolId }));
  const { total: toolCount } = getToolCounts(tools);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon path={mdiTimer} size={1.2} className="text-blue-600" />
        <h4 className="text-lg font-semibold text-blue-800">Active Cycle</h4>
      </div>

      {/* Cycle Information */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-blue-700 font-medium">Cycle ID:</span>
          <span className="text-blue-800 font-mono text-sm">
            {cycleStatus.cycleId}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-blue-700 font-medium">Operator:</span>
          <div className="flex items-center gap-1">
            <Icon path={mdiAccount} size={0.8} className="text-blue-600" />
            <span className="text-blue-800">{cycleStatus.operator}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-blue-700 font-medium">Tools in Cycle:</span>
          <div className="flex items-center gap-1">
            <Icon path={mdiTools} size={0.8} className="text-blue-600" />
            <span className="text-blue-800">{toolCount}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-blue-700 font-medium">Active Phase:</span>
          <span className="text-blue-800">{cycleStatus.activePhase}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-blue-700 font-medium">Started:</span>
          <span className="text-blue-800 text-sm">
            {formatDate(cycleStatus.startTime)} at{' '}
            {formatTime(cycleStatus.startTime)}
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-600">Cycle Progress</span>
          <span className="text-blue-600">
            {
              cycle.phases.filter((phase) => phase.status === 'completed')
                .length
            }{' '}
            / {cycle.phases.length} phases
          </span>
        </div>
        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                cycle.phases.length > 0
                  ? (cycle.phases.filter(
                      (phase) => phase.status === 'completed'
                    ).length /
                      cycle.phases.length) *
                    100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
