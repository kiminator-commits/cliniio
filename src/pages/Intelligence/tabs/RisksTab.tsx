import React from 'react';
import Icon from '@mdi/react';
import {
  mdiShieldAlert,
  mdiAlertCircle,
  mdiExclamation,
  mdiInformation,
} from '@mdi/js';
import { IntelligenceSummary } from '../utils/intelligenceTypes';

interface RisksTabProps {
  summary?: IntelligenceSummary | null;
}

export default function RisksTab({ summary }: RisksTabProps) {
  // Helper function for risk level colors
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!summary) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Icon
            path={mdiInformation}
            size={2}
            className="text-gray-400 mx-auto mb-2"
          />
          <p className="text-gray-600">No risk analysis data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audit Risk Score */}
      {summary.auditRisk ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Icon
              path={mdiShieldAlert}
              size={1.5}
              className="text-red-600 mr-2"
            />
            Audit Risk Assessment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getRiskLevelColor(summary.auditRisk?.riskLevel || 'medium')} mb-3`}
              >
                <span className="text-2xl font-bold">
                  {summary.auditRisk?.overallRiskScore || 85}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                Overall Risk Score
              </p>
              <p
                className={`text-sm font-medium capitalize ${getRiskLevelColor(summary.auditRisk?.riskLevel || 'medium')}`}
              >
                {summary.auditRisk?.riskLevel || 'medium'} Risk
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 text-orange-600 mb-3">
                <span className="text-2xl font-bold">
                  {summary.auditRisk?.incompleteCycles || 2}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                Incomplete Cycles
              </p>
              <p className="text-sm text-orange-600">This Week</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 text-yellow-600 mb-3">
                <span className="text-2xl font-bold">
                  {summary.auditRisk?.riskFactors?.length || 2}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">Risk Factors</p>
              <p className="text-sm text-yellow-600">Identified</p>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Risk Factors
            </h4>
            <div className="space-y-3">
              {summary.auditRisk?.riskFactors &&
              summary.auditRisk.riskFactors.length > 0 ? (
                summary.auditRisk.riskFactors.map(
                  (
                    riskFactor: {
                      factor: string;
                      severity: string;
                      description?: string;
                    },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {riskFactor.factor}
                        </p>
                        <p className="text-sm text-gray-600">
                          {riskFactor.description}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        Severity: {riskFactor.severity}
                      </span>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No risk factors identified
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Icon
              path={mdiInformation}
              size={2}
              className="text-gray-400 mx-auto mb-2"
            />
            <p className="text-gray-600">No audit risk data available</p>
            <p className="text-sm text-gray-500">
              Data will appear here once sterilization cycles are completed
            </p>
          </div>
        </div>
      )}

      {/* Theft/Loss Analysis */}
      {summary.theftLoss ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Icon
              path={mdiAlertCircle}
              size={1.5}
              className="text-orange-600 mr-2"
            />
            Theft & Loss Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-2">
                  <span className="text-xl font-bold">
                    {summary.theftLoss.estimatedLossPercentage || 0}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Estimated Loss
                </p>
                <p className="text-lg font-bold text-orange-600">
                  $
                  {summary.theftLoss.estimatedLossValue?.toLocaleString() ||
                    '0'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Flagged Items:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {summary.theftLoss?.flaggedItems &&
                  summary.theftLoss.flaggedItems.length > 0 ? (
                    summary.theftLoss.flaggedItems.map(
                      (item: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <Icon
                            path={mdiExclamation}
                            size={0.8}
                            className="text-orange-500 mr-2"
                          />
                          {item}
                        </li>
                      )
                    )
                  ) : (
                    <li className="text-gray-500">No flagged items</li>
                  )}
                </ul>
              </div>
            </div>

            <div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Risk Factors:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {summary.theftLoss?.riskFactors &&
                    summary.theftLoss.riskFactors.length > 0 ? (
                      summary.theftLoss.riskFactors.map(
                        (factor: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <Icon
                              path={mdiInformation}
                              size={0.8}
                              className="text-blue-500 mr-2"
                            />
                            {factor}
                          </li>
                        )
                      )
                    ) : (
                      <li className="text-gray-500">
                        No risk factors identified
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Incident Summary:
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Flagged Items:{' '}
                      {summary.theftLoss?.flaggedItems?.length || 0}
                    </p>
                    <p>
                      Risk Factors:{' '}
                      {summary.theftLoss?.riskFactors?.length || 0}
                    </p>
                    <p>
                      Recommended Actions:{' '}
                      {summary.theftLoss?.recommendedActions?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Icon
              path={mdiInformation}
              size={2}
              className="text-gray-400 mx-auto mb-2"
            />
            <p className="text-gray-600">No theft/loss data available</p>
            <p className="text-sm text-gray-500">
              Data will appear here once inventory tracking is implemented
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
