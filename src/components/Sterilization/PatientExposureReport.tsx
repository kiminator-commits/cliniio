import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiAccountMultiple,
  mdiAlertCircle,
  mdiAlert,
  mdiInformation,
  mdiDownload,
  mdiPrinter,
} from '@mdi/js';
import { biFailureService } from '../../services/bi/failure/index';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { exportService } from '@/services/bi/failure/exportService';

/**
 * Get current incident ID from sterilization store or fallback
 */
const getCurrentIncidentId = async (): Promise<string | null> => {
  try {
    // Try to get from sterilization store
    const { biFailureDetails } = useSterilizationStore.getState();

    // Since the sterilization store doesn't maintain incident IDs,
    // we'll use session storage as the primary source
    const storedIncidentId = sessionStorage.getItem(
      'currentBIFailureIncidentId'
    );
    if (storedIncidentId) {
      return storedIncidentId;
    }

    // If we have BI failure details but no stored ID, create a proper UUID
    if (biFailureDetails) {
      // Generate a proper UUID v4 format
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
      sessionStorage.setItem('currentBIFailureIncidentId', uuid);
      return uuid;
    }

    return null;
  } catch (error) {
    console.error('Failed to get current incident ID:', error);
    return null;
  }
};

/**
 * Handle printing the exposure report
 */
const handlePrintReport = () => {
  exportService.exportExposureReport('pdf');
};

// Export function for exposure report
const exportExposureReport = () => {
  exportService.exportExposureReport('csv');
};

interface ExposureReportProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId?: string; // Optional incident ID prop
}

interface ExposureReport {
  incidentNumber: string;
  totalRoomsAffected: number;
  roomDetails: Array<{
    roomId: string;
    roomName: string;
    contaminationDate: string; // When tools were marked dirty
    roomUsedDate: string; // When room went "In Use"
    usersInvolved: string[]; // Users who worked in room
    contaminatedTools: string[]; // Tools contaminated during risk window
  }>;
}

export const ExposureReport: React.FC<ExposureReportProps> = ({
  isOpen,
  onClose,
  incidentId,
}) => {
  const [report, setReport] = useState<ExposureReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExposureReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get incident ID from props or fallback to current incident
      const currentIncidentId = incidentId || (await getCurrentIncidentId());

      if (!currentIncidentId) {
        throw new Error('No incident ID available for exposure report');
      }

      const exposureReport =
        await biFailureService.generateExposureReport(currentIncidentId);
      setReport(exposureReport);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load exposure report'
      );
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    if (isOpen) {
      loadExposureReport();
    }
  }, [isOpen, loadExposureReport]);

  const handleClose = () => {
    setReport(null);
    setError(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Close modal backdrop"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
        role="dialog"
        aria-labelledby="exposure-report-title"
        aria-describedby="exposure-report-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Icon
              path={mdiAccountMultiple}
              size={1.5}
              className="text-blue-500"
            />
            <div>
              <h2
                id="exposure-report-title"
                className="text-xl font-semibold text-gray-900"
              >
                Exposure Report
              </h2>
              <p
                id="exposure-report-description"
                className="text-sm text-gray-600"
              >
                Tools scanned dirty in "IN USE" rooms during BI failure risk
                window
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            onKeyDown={(e) => e.key === 'Enter' && handleClose()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close exposure report"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading exposure report...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon
                  path={mdiAlertCircle}
                  size={1.2}
                  className="text-red-500"
                />
                <span className="text-red-800">Error: {error}</span>
              </div>
            </div>
          )}

          {report && (
            <>
              {/* Summary Card */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon path={mdiAlert} size={1.2} className="text-red-500" />
                    <span className="font-medium text-red-800">
                      "IN USE" Rooms with Tool Contamination
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mb-3">
                    {report.totalRoomsAffected}
                  </p>
                  <div className="text-sm text-red-700 space-y-2">
                    <p className="font-medium">Risk Window Analysis:</p>
                    <p>
                      This count shows tools that were used between the last
                      passed BI test and the failed BI test. The tools have been
                      traced to the rooms that were marked "IN USE" and scanned
                      for use, taking them from a clean to dirty status.
                    </p>
                    <p className="font-medium text-red-800">⚠️ Important:</p>
                    <p>
                      These tools could have been cycled through the autoclave
                      many times before a failed BI was identified. It is
                      important to validate this list against your patient
                      records software to initiate a patient trace and contact
                      plan (if in your policies and procedures).
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Details Table */}
              {report.roomDetails && report.roomDetails.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">
                      Room Exposure Analysis
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Tools scanned dirty in "IN USE" rooms during risk window
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time/Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Associated Tools Scanned
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.roomDetails.map((room, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {new Date(
                                    room.roomUsedDate
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(
                                    room.roomUsedDate
                                  ).toLocaleTimeString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {room.roomName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {room.roomId}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {room.contaminatedTools.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {room.contaminatedTools.length} tool
                                    {room.contaminatedTools.length !== 1
                                      ? 's'
                                      : ''}{' '}
                                    scanned dirty
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {room.contaminatedTools.map(
                                      (tool, toolIndex) => (
                                        <span
                                          key={toolIndex}
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                        >
                                          {tool}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">
                                  No tools scanned
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <Icon
                      path={mdiInformation}
                      size={1.2}
                      className="text-green-500"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-green-800">
                        No Room Exposure Found
                      </h3>
                      <div className="text-green-700 space-y-2">
                        <p>
                          Based on tool scans, it looks as though no tools that
                          were autoclaved after the passed BI and before the
                          failed BI have been initiated in the "dirty tool"
                          status.
                        </p>
                        <p className="font-medium text-green-800">
                          This would indicate that there is no patient tracing
                          needed.
                        </p>
                        <p className="text-sm">
                          However, if your team is not scanning consistently,
                          this data could be inaccurate.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={exportExposureReport}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && exportExposureReport()
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Export exposure report"
                  >
                    <Icon path={mdiDownload} size={1} />
                    <span>Export Report</span>
                  </button>
                  <button
                    onClick={handlePrintReport}
                    onKeyDown={(e) => e.key === 'Enter' && handlePrintReport()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="Print exposure report"
                  >
                    <Icon path={mdiPrinter} size={1} />
                    <span>Print Report</span>
                  </button>
                </div>
                <button
                  onClick={handleClose}
                  onKeyDown={(e) => e.key === 'Enter' && handleClose()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
