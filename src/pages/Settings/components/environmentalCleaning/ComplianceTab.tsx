import React from 'react';
import Icon from '@mdi/react';
import { mdiShield } from '@mdi/js';
import { CleaningProtocolSettings, FORM_LIMITS } from './constants';

interface ComplianceTabProps {
  protocolSettings: CleaningProtocolSettings;
  onProtocolSettingChange: (
    field: keyof CleaningProtocolSettings,
    value: boolean | number | string | string[]
  ) => void;
}

const ComplianceTab: React.FC<ComplianceTabProps> = ({
  protocolSettings,
  onProtocolSettingChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiShield} size={1.5} className="text-red-600" />
          <div>
            <h4 className="text-lg font-semibold text-red-800">
              Compliance & Audit
            </h4>
            <p className="text-sm text-red-700">
              Configure compliance tracking and reporting
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="complianceTrackingEnabled"
                className="text-sm font-medium text-gray-700"
              >
                Compliance Tracking
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Track regulatory compliance automatically
              </p>
            </div>
            <button
              id="complianceTrackingEnabled"
              onClick={() =>
                onProtocolSettingChange(
                  'complianceTrackingEnabled',
                  !protocolSettings.complianceTrackingEnabled
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                protocolSettings.complianceTrackingEnabled
                  ? 'bg-red-600'
                  : 'bg-gray-200'
              }`}
              aria-label="Compliance Tracking"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  protocolSettings.complianceTrackingEnabled
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label
              htmlFor="auditLogRetentionDays"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Audit Log Retention (days)
            </label>
            <input
              id="auditLogRetentionDays"
              type="number"
              value={protocolSettings.auditLogRetentionDays}
              onChange={(e) =>
                onProtocolSettingChange(
                  'auditLogRetentionDays',
                  Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              min={FORM_LIMITS.auditLogRetentionDays.min}
              max={FORM_LIMITS.auditLogRetentionDays.max}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceTab;
