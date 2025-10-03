import React from 'react';
import Icon from '@mdi/react';
import {
  mdiDelete,
  mdiChevronDown,
  mdiChevronRight,
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiCalendar,
} from '@mdi/js';
import { ContentItem } from '../../types';
import { ProgressDisplay, DateDisplay, ActionButton } from './types';

interface TableRowProps {
  item: ContentItem;
  isExpanded: boolean;
  onToggleExpansion: (id: string) => void;
  onDelete: (id: string) => void;
  onStartContent?: (id: string) => void;
  progressDisplay: ProgressDisplay;
  startDateDisplay: DateDisplay;
  dueDateDisplay: DateDisplay;
  actionButton: ActionButton;
  columnWidths: {
    content: number;
    progress: number;
    startDate: number;
    assigned: number;
    actions: number;
  };
}

/**
 * Table Row Component
 *
 * Handles individual row rendering and interactions including:
 * - Row expansion/collapse
 * - Progress display
 * - Date formatting
 * - Action buttons
 */
export const TableRow: React.FC<TableRowProps> = ({
  item,
  isExpanded,
  onToggleExpansion,
  onDelete,
  onStartContent,
  progressDisplay,
  dueDateDisplay,
  actionButton,
  columnWidths,
}) => {
  // Safety check for required props
  if (!item) {
    console.warn('TableRow: item prop is undefined or null');
    return null;
  }

  const handleToggleExpansion = () => {
    if (item?.id) {
      onToggleExpansion(item.id);
    }
  };

  const handleDelete = () => {
    if (item?.id) {
      onDelete(item.id);
    }
  };

  const handleStartContent = () => {
    if (onStartContent && item?.id) {
      onStartContent(item.id);
    }
  };

  try {
    return (
      <>
        {/* Main row */}
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          {/* Content column */}
          <td
            className="px-4 py-3"
            style={{ width: columnWidths?.content || 'auto' }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleExpansion}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Icon
                  path={isExpanded ? mdiChevronDown : mdiChevronRight}
                  size={0.8}
                  className="text-gray-500"
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 leading-tight">
                  {item?.title && item.title.length > 40 ? (
                    <>
                      <div>{item.title.substring(0, 40)}</div>
                      <div className="text-sm text-gray-600">
                        {item.title.substring(40)}
                      </div>
                    </>
                  ) : (
                    item?.title || 'Untitled'
                  )}
                </div>
              </div>
            </div>
          </td>

          {/* Progress column */}
          <td
            className="px-4 py-3"
            style={{ width: columnWidths?.progress || 'auto' }}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (progressDisplay?.percentage || 0) === 0
                        ? 'bg-gray-400'
                        : (progressDisplay?.percentage || 0) === 100
                          ? 'bg-[#10B981]'
                          : 'bg-[#4ECDC4]'
                    }`}
                    style={{ width: `${progressDisplay?.percentage || 0}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 min-w-[3rem]">
                {progressDisplay?.text || '0%'}
              </span>
            </div>
          </td>

          {/* Start Date column */}
          <td
            className="px-4 py-3"
            style={{ width: columnWidths?.startDate || 'auto' }}
          >
            {(progressDisplay?.percentage || 0) > 0 && item?.lastUpdated ? (
              <span className="text-sm text-gray-700">
                {(() => {
                  try {
                    return new Date(item.lastUpdated).toLocaleDateString();
                  } catch (err) {
                    console.error(err);
                    return 'Invalid date';
                  }
                })()}
              </span>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>

          {/* Assigned column */}
          <td
            className="px-4 py-3"
            style={{ width: columnWidths?.assigned || 'auto' }}
          >
            <div className="flex items-center justify-center">
              <span
                className={`text-lg font-medium ${
                  (progressDisplay?.percentage || 0) > 0
                    ? 'text-[#10B981]'
                    : 'text-gray-400'
                }`}
              >
                {(progressDisplay?.percentage || 0) > 0 ? '✓' : '✗'}
              </span>
            </div>
          </td>

          {/* Actions column */}
          <td
            className="px-4 py-3"
            style={{ width: columnWidths?.actions || 'auto' }}
          >
            <div className="flex items-center gap-1">
              {/* Start/Resume/Stop button */}
              <button
                onClick={handleStartContent}
                disabled={actionButton?.disabled || false}
                className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                  actionButton?.variant === 'primary'
                    ? 'bg-[#4ECDC4] text-white hover:bg-[#3DB8B0] disabled:bg-gray-300'
                    : actionButton?.variant === 'secondary'
                      ? 'bg-[#5B5B5B] text-white hover:bg-[#4A4A4A] disabled:bg-gray-300'
                      : 'bg-[#EF4444] text-white hover:bg-[#DC2626] disabled:bg-gray-300'
                } disabled:cursor-not-allowed`}
                title={
                  (progressDisplay?.percentage || 0) === 100
                    ? 'View'
                    : (progressDisplay?.percentage || 0) > 0
                      ? 'Resume'
                      : 'Start'
                }
              >
                <Icon
                  path={
                    (progressDisplay?.percentage || 0) === 100
                      ? mdiStop
                      : (progressDisplay?.percentage || 0) > 0
                        ? mdiPause
                        : mdiPlay
                  }
                  size={0.8}
                />
              </button>

              {/* Delete button */}
              <button
                onClick={handleDelete}
                className="w-8 h-8 text-[#EF4444] hover:bg-red-50 rounded flex items-center justify-center transition-colors"
                title="Delete"
              >
                <Icon path={mdiDelete} size={0.8} />
              </button>
            </div>
          </td>
        </tr>

        {/* Expanded content */}
        {isExpanded && (
          <tr className="bg-gray-50">
            <td colSpan={5} className="px-4 py-3">
              <div className="space-y-3">
                {/* Description */}
                {item?.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.data?.description}
                    </p>
                  </div>
                )}

                {/* Additional details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                    <p className="text-sm text-gray-600">
                      {item?.category || 'No category'}
                    </p>
                  </div>

                  {/* Due Date */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Due Date</h4>
                    <div className="flex items-center gap-1">
                      <Icon
                        path={mdiCalendar}
                        size={0.6}
                        className="text-gray-400"
                      />
                      <span
                        className={`text-sm ${dueDateDisplay?.color || 'text-gray-600'}`}
                      >
                        {dueDateDisplay?.text || 'No due date'}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {item?.data?.tags && item.data.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {item.data.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  } catch (error) {
    console.error('Error rendering TableRow:', error);
    // Return a fallback row that won't crash
    return (
      <tr className="border-b border-gray-200">
        <td colSpan={5} className="px-4 py-3 text-center text-red-600">
          Error loading row data. Please refresh the page.{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </td>
      </tr>
    );
  }
};
