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
import { BIFailureService } from '../../services/biFailureService';
import { useSterilizationStore } from '@/store/sterilizationStore';

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

    // If we have BI failure details but no stored ID, create a temporary one
    if (biFailureDetails) {
      const tempId = `temp-${Date.now()}`;
      sessionStorage.setItem('currentBIFailureIncidentId', tempId);
      return tempId;
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
const handlePrintReport = (report: ExposureReport) => {
  try {
    // Create a print-friendly version of the report
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the report.');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Exposure Report - ${report.incidentNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .summary { margin-bottom: 30px; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
            .summary-item { border: 1px solid #ddd; padding: 15px; text-align: center; }
            .summary-item h3 { margin: 0 0 10px 0; color: #333; }
            .summary-item .number { font-size: 24px; font-weight: bold; color: #2563eb; }
            .risk-breakdown { margin-bottom: 30px; }
            .risk-item { display: flex; justify-content: space-between; padding: 5px 0; }
            .high { color: #dc2626; }
            .medium { color: #ea580c; }
            .low { color: #16a34a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f9fafb; font-weight: bold; }
            .risk-badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .risk-badge.high { background-color: #fef2f2; color: #dc2626; }
            .risk-badge.medium { background-color: #fff7ed; color: #ea580c; }
            .risk-badge.low { background-color: #f0fdf4; color: #16a34a; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Patient Exposure Report</h1>
            <p><strong>Incident Number:</strong> ${report.incidentNumber}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>

          <div class="summary">
            <h2>Exposure Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <h3>Total Patients Exposed</h3>
                <div class="number">${report.exposureSummary.totalPatientsExposed}</div>
              </div>
              <div class="summary-item">
                <h3>Exposure Window</h3>
                <div class="number">${report.exposureSummary.exposureWindowPatients}</div>
              </div>
              <div class="summary-item">
                <h3>Quarantine Breach</h3>
                <div class="number">${report.exposureSummary.quarantineBreachPatients}</div>
              </div>
            </div>
          </div>

          <div class="risk-breakdown">
            <h2>Risk Level Breakdown</h2>
            <div class="risk-item">
              <span>High Risk Patients</span>
              <span class="high">${report.riskBreakdown.high}</span>
            </div>
            <div class="risk-item">
              <span>Medium Risk Patients</span>
              <span class="medium">${report.riskBreakdown.medium}</span>
            </div>
            <div class="risk-item">
              <span>Low Risk Patients</span>
              <span class="low">${report.riskBreakdown.low}</span>
            </div>
          </div>

          ${
            report.patientDetails && report.patientDetails.length > 0
              ? `
            <h2>Patient Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Risk Level</th>
                  <th>Exposure Type</th>
                  <th>Last Procedure</th>
                </tr>
              </thead>
              <tbody>
                ${report.patientDetails
                  .map(
                    (patient) => `
                  <tr>
                    <td>${patient.patientId}</td>
                    <td>${patient.patientName}</td>
                    <td><span class="risk-badge ${patient.riskLevel}">${patient.riskLevel.toUpperCase()}</span></td>
                    <td>${patient.exposureType === 'exposure_window' ? 'Exposure Window' : 'Quarantine Breach'}</td>
                    <td>${new Date(patient.lastProcedureDate).toLocaleDateString()}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
              : '<p><em>No patient details available</em></p>'
          }

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Report
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Auto-print when content is loaded
    printWindow.onload = () => {
      printWindow.print();
    };
  } catch (error) {
    console.error('Failed to print exposure report:', error);
    alert('Failed to print report. Please try again.');
  }
};

// Export function for exposure report
const exportExposureReport = (report: ExposureReport) => {
  try {
    // Create CSV content
    const headers = [
      'Incident Number',
      'Patient ID',
      'Patient Name',
      'Risk Level',
      'Exposure Type',
      'Last Procedure Date',
      'Affected Tools',
    ];

    const csvContent = [
      headers.join(','),
      ...(report.patientDetails?.map((patient) =>
        [
          report.incidentNumber,
          patient.patientId,
          patient.patientName,
          patient.riskLevel,
          patient.exposureType === 'exposure_window'
            ? 'Exposure Window'
            : 'Quarantine Breach',
          new Date(patient.lastProcedureDate).toLocaleDateString(),
          patient.affectedTools.join(';'),
        ].join(',')
      ) || []),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exposure_report_${report.incidentNumber}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export exposure report:', error);
    alert('Failed to export report. Please try again.');
  }
};

interface PatientExposureReportProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId?: string; // Optional incident ID prop
}

interface ExposureReport {
  incidentNumber: string;
  totalPatientsExposed: number;
  exposureSummary: {
    totalPatientsExposed: number;
    exposureWindowPatients: number;
    quarantineBreachPatients: number;
  };
  riskBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  patientDetails?: Array<{
    patientId: string;
    patientName: string;
    riskLevel: 'high' | 'medium' | 'low';
    exposureType: 'exposure_window' | 'quarantine_breach';
    lastProcedureDate: string;
    affectedTools: string[];
  }>;
}

export const PatientExposureReport: React.FC<PatientExposureReportProps> = ({
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
        await BIFailureService.generatePatientExposureReport(currentIncidentId);
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return mdiAlert;
      case 'medium':
        return mdiAlertCircle;
      case 'low':
        return mdiInformation;
      default:
        return mdiInformation;
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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
                Patient Exposure Report
              </h2>
              <p
                id="exposure-report-description"
                className="text-sm text-gray-600"
              >
                Detailed analysis of patient exposure during BI failure incident
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
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon
                      path={mdiAccountMultiple}
                      size={1.2}
                      className="text-blue-500"
                    />
                    <span className="font-medium text-blue-800">
                      Total Exposed
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {report.totalPatientsExposed}
                  </p>
                  <p className="text-sm text-blue-600">patients</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon
                      path={mdiAlertCircle}
                      size={1.2}
                      className="text-orange-500"
                    />
                    <span className="font-medium text-orange-800">
                      Exposure Window
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {report.exposureSummary.exposureWindowPatients}
                  </p>
                  <p className="text-sm text-orange-600">patients</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon path={mdiAlert} size={1.2} className="text-red-500" />
                    <span className="font-medium text-red-800">
                      Quarantine Breach
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {report.exposureSummary.quarantineBreachPatients}
                  </p>
                  <p className="text-sm text-red-600">patients</p>
                </div>
              </div>

              {/* Risk Breakdown */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Risk Level Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(report.riskBreakdown).map(
                    ([riskLevel, count]) => (
                      <div
                        key={riskLevel}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getRiskColor(
                          riskLevel
                        )}`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon path={getRiskIcon(riskLevel)} size={1} />
                          <span className="font-medium capitalize">
                            {riskLevel} Risk
                          </span>
                        </div>
                        <span className="text-lg font-bold">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Patient Details Table */}
              {report.patientDetails && report.patientDetails.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">
                      Patient Details
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Level
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Exposure Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Procedure
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.patientDetails.map((patient, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                              {patient.patientId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {patient.patientName}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                                  patient.riskLevel
                                )}`}
                              >
                                <Icon
                                  path={getRiskIcon(patient.riskLevel)}
                                  size={0.8}
                                  className="mr-1"
                                />
                                {patient.riskLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {patient.exposureType === 'exposure_window'
                                ? 'Exposure Window'
                                : 'Quarantine Breach'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(
                                patient.lastProcedureDate
                              ).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      exportExposureReport(report);
                    }}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && exportExposureReport(report)
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Export exposure report"
                  >
                    <Icon path={mdiDownload} size={1} />
                    <span>Export Report</span>
                  </button>
                  <button
                    onClick={() => {
                      handlePrintReport(report);
                    }}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handlePrintReport(report)
                    }
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
