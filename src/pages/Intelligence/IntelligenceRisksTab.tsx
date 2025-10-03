import React from 'react';
import { Icon } from '@mdi/react';
import {
  mdiShieldAlert,
  mdiAlert,
  mdiTrendingUp,
  mdiCheckCircle,
} from '@mdi/js';
import {
  IntelligenceSummary,
  AuditRisk,
  TheftLoss,
  RiskFactor,
} from './utils/intelligenceTypes';

interface IntelligenceRisksTabProps {
  summary: IntelligenceSummary;
}

export const IntelligenceRisksTab: React.FC<IntelligenceRisksTabProps> = ({
  summary,
}) => {
  const auditRisk: AuditRisk | undefined = summary.auditRisk;
  const theftLoss: TheftLoss | undefined = summary.theftLoss;

  const getRiskLevelColor = (level: string): string => {
    switch (level?.toLowerCase()) {
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

  return (
    <div className="space-y-6">
      {/* Audit Risk Score */}
      {auditRisk ? (
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
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getRiskLevelColor(auditRisk.riskLevel)} mb-3`}
              >
                <span className="text-2xl font-bold">
                  {auditRisk.overallRiskScore}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                Overall Risk Score
              </p>
              <p
                className={`text-sm font-medium capitalize ${getRiskLevelColor(auditRisk.riskLevel)}`}
              >
                {auditRisk.riskLevel} Risk
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 text-orange-600 mb-3">
                <span className="text-2xl font-bold">
                  {auditRisk.skippedIndicators}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                Skipped Indicators
              </p>
              <p className="text-sm text-orange-600">This Week</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 text-yellow-600 mb-3">
                <span className="text-2xl font-bold">
                  {auditRisk.incompleteCycles}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                Incomplete Cycles
              </p>
              <p className="text-sm text-yellow-600">This Week</p>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Risk Factors
            </h4>
            <div className="space-y-3">
              {auditRisk.riskFactors && auditRisk.riskFactors.length > 0 ? (
                auditRisk.riskFactors.map(
                  (factor: RiskFactor, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {factor.factor || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {factor.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (Number(factor.severity) || 0) >= 8
                            ? 'bg-red-100 text-red-800'
                            : (Number(factor.severity) || 0) >= 6
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        Severity {factor.severity}/10
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
              path={mdiAlert}
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

      {/* Theft/Loss Estimation */}
      {theftLoss ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Icon path={mdiAlert} size={1.5} className="text-orange-600 mr-2" />
            Theft & Loss Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-2">
                  <span className="text-xl font-bold">
                    {theftLoss.estimatedLossPercentage}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Estimated Loss
                </p>
                <p className="text-lg font-bold text-orange-600">
                  ${(theftLoss.estimatedLossValue || 0).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Flagged Items:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {theftLoss.flaggedItems &&
                  theftLoss.flaggedItems.length > 0 ? (
                    theftLoss.flaggedItems.map(
                      (item: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <Icon
                            path={mdiAlert}
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
                    {theftLoss.riskFactors &&
                    theftLoss.riskFactors.length > 0 ? (
                      theftLoss.riskFactors.map(
                        (factor: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <Icon
                              path={mdiTrendingUp}
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
                    Recommended Actions:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {theftLoss.recommendedActions &&
                    theftLoss.recommendedActions.length > 0 ? (
                      theftLoss.recommendedActions.map(
                        (action: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <Icon
                              path={mdiCheckCircle}
                              size={0.8}
                              className="text-green-500 mr-2"
                            />
                            {action}
                          </li>
                        )
                      )
                    ) : (
                      <li className="text-gray-500">No recommended actions</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Icon
              path={mdiAlert}
              size={2}
              className="text-gray-400 mx-auto mb-2"
            />
            <p className="text-gray-600">No theft/loss data available</p>
            <p className="text-sm text-gray-500">
              Data will appear here once sterilization cycles are completed
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
