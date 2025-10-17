import React from 'react';
import Icon from '@mdi/react';
import {
  mdiAlertCircle,
  mdiPackage,
  mdiTools,
  mdiCalendar,
  mdiAutorenew,
} from '@mdi/js';
import { useQuarantineData } from './hooks/useQuarantineData';

interface AffectedCycle {
  batchId?: string;
  [key: string]: unknown;
}

/**
 * Props for the BIFailureStatus component.
 * @interface BIFailureStatusProps
 * @property {object} biFailureDetails - Details of the current BI failure incident
 */
interface BIFailureStatusProps {
  biFailureDetails: {
    date: Date;
    affectedToolsCount: number;
    affectedBatchIds: string[];
    operator: string;
  } | null;
}

/**
 * Status component for BI Failure Resolution modal.
 * Displays the current incident status, affected tools count, failure date, and affected batches.
 * Provides clear visual indication of the current BI failure state.
 *
 * @param {BIFailureStatusProps} props - Component props containing BI failure details
 * @returns {JSX.Element} Status display component with incident information
 */
export const BIFailureStatus: React.FC<BIFailureStatusProps> = ({
  biFailureDetails,
}) => {
  const quarantineData = useQuarantineData();

  // Extract batch IDs from affected cycles
  const _affectedBatchIds = quarantineData.affectedCycles
    ? quarantineData.affectedCycles
        .map((cycle: any) => cycle.batchId)
        .filter((batchId): batchId is string => Boolean(batchId))
    : [];

  if (!biFailureDetails) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon path={mdiAlertCircle} size={1.2} className="text-red-500" />
          <span className="font-medium text-red-800">
            Current Status: BI Failure Active
          </span>
        </div>
        <div className="text-sm text-red-700 space-y-1">
          <p>
            <strong>Affected Tools:</strong> 0 tools are currently quarantined
          </p>
          <p>
            <strong>Failure Date:</strong> Unknown date
          </p>
          <p>
            <strong>Affected Batches:</strong> No batch IDs available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon path={mdiAlertCircle} size={1.2} className="text-red-500" />
        <span className="font-medium text-red-800">
          Current Status: BI Failure Active
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-white rounded-lg border border-red-100">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon path={mdiCalendar} size={1} className="text-red-500 mr-1" />
            <span className="text-xs font-medium text-red-700">Cycles</span>
          </div>
          <div className="text-lg font-bold text-red-800">
            {quarantineData.totalCyclesAffected}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon path={mdiPackage} size={1} className="text-red-500 mr-1" />
            <span className="text-xs font-medium text-red-700">Batches</span>
          </div>
          <div className="text-lg font-bold text-red-800">
            {biFailureDetails.affected_batch_ids?.length || 0}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon path={mdiTools} size={1} className="text-red-500 mr-1" />
            <span className="text-xs font-medium text-red-700">Tools</span>
          </div>
          <div className="text-lg font-bold text-red-800">
            {biFailureDetails.affected_tools_count || 0}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon path={mdiAutorenew} size={1} className="text-red-600 mr-1" />
            <span className="text-xs font-medium text-red-700">Multi-Use</span>
          </div>
          <div className="text-lg font-bold text-red-800">
            {quarantineData.toolsUsedMultipleTimes}
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="text-sm text-red-700 space-y-2">
        <div className="flex items-start space-x-2">
          <Icon path={mdiTools} size={0.8} className="text-red-500 mt-0.5" />
          <div>
            <strong>Affected Tools:</strong>{' '}
            {biFailureDetails.affected_tools_count || 0} tools are currently
            quarantined
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Icon path={mdiCalendar} size={0.8} className="text-red-500 mt-0.5" />
          <div>
            <strong>Failure Date:</strong>{' '}
            {biFailureDetails.date
              ? biFailureDetails.date.toLocaleDateString()
              : 'Unknown date'}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Icon path={mdiCalendar} size={0.8} className="text-red-500 mt-0.5" />
          <div>
            <strong>Risk Window:</strong>{' '}
            {quarantineData.dateRange ? (
              <span className="font-mono text-xs">
                {quarantineData.dateRange.start.toLocaleDateString()} →{' '}
                {quarantineData.dateRange.end.toLocaleDateString()}
              </span>
            ) : (
              'All cycles (no previous passed BI test)'
            )}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Icon path={mdiPackage} size={0.8} className="text-red-500 mt-0.5" />
          <div>
            <strong>Affected Batches:</strong>{' '}
            {(biFailureDetails.affected_batch_ids?.length || 0) > 0 ? (
              <span className="font-mono text-xs">
                {biFailureDetails.affected_batch_ids?.slice(0, 3).join(', ')}
                {(biFailureDetails.affected_batch_ids?.length || 0) > 3 &&
                  ` +${(biFailureDetails.affected_batch_ids?.length || 0) - 3} more`}
              </span>
            ) : (
              'No batch IDs available'
            )}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Icon path={mdiTools} size={0.8} className="text-red-500 mt-0.5" />
          <div>
            <strong>Operator:</strong> {biFailureDetails.operator}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Icon path={mdiTools} size={0.8} className="text-red-500 mt-0.5" />
          <div>
            <strong>Tools by Category:</strong>{' '}
            <span className="text-xs">
              {quarantineData.toolsByCategory
                ? Object.entries(quarantineData.toolsByCategory)
                    .map(([category, count]: [string, number]) => `${category}: ${count}`)
                    .join(', ')
                : 'No tools categorized'}
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Icon
            path={mdiAlertCircle}
            size={0.8}
            className="text-red-500 mt-0.5"
          />
          <div>
            <strong>Contamination Scope:</strong>{' '}
            {quarantineData.totalSterilizationEvents} total sterilization events
            in risk window.{' '}
            {quarantineData.toolsUsedMultipleTimes > 0 && (
              <span className="text-red-600 font-medium">
                {quarantineData.toolsUsedMultipleTimes} tools used multiple
                times (require extra attention)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Icon
            path={mdiAlertCircle}
            size={0.8}
            className="text-red-500 mt-0.5"
          />
          <div>
            <strong>Detected By:</strong> {biFailureDetails.operator} •{' '}
            <strong>Date:</strong>{' '}
            {(() => {
              try {
                if (!biFailureDetails.date) return 'Unknown date';
                const dateStr =
                  biFailureDetails.date instanceof Date
                    ? biFailureDetails.date.toLocaleDateString()
                    : new Date(biFailureDetails.date).toLocaleDateString();
                return dateStr;
              } catch (error) {
                console.error('Date formatting error:', error);
                return 'Invalid date';
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
