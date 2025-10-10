import React, { useState, useEffect } from 'react';
import { useSterilizationStore } from '../../../../store/sterilizationStore';
import { useFacility } from '../../../../contexts/FacilityContext';
import { trackEnforcementToggle } from './settings';

export const EnforcementSettings: React.FC = () => {
  const {
    enforceCi,
    enforceBi,
    _allowOverrides,
    updateComplianceSettings,
    fetchComplianceSettings,
  } = useSterilizationStore();

  const [showBIHistory, setShowBIHistory] = useState(false);
  const [_showCIHistory, _setShowCIHistory] = useState(false);

  const { getCurrentFacilityId } = useFacility();

  // ensure we load facility compliance settings on mount
  useEffect(() => {
    const facilityId = getCurrentFacilityId();
    if (facilityId) {
      fetchComplianceSettings(facilityId);
    }
  }, [getCurrentFacilityId, fetchComplianceSettings]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sterilization Enforcement</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="enforceBI" className="text-sm font-medium">
              Biological Indicator Management
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enable daily BI test requirements and compliance tracking
            </p>
          </div>
          <button
            onClick={() => {
              const facilityId = getCurrentFacilityId();
              if (facilityId) {
                trackEnforcementToggle('BI', !enforceBi, facilityId);
                updateComplianceSettings(facilityId, { enforceBi: !enforceBi });
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 ${
              enforceBi ? 'bg-[#4ECDC4]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enforceBi ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* BI Status and History */}
        {enforceBi && (
          <div className="ml-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                BI tests are being enforced
              </span>
            </div>
            <button
              onClick={() => setShowBIHistory(!showBIHistory)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showBIHistory ? 'Hide' : 'Show'} BI test history
            </button>
            {showBIHistory && (
              <div className="p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                <p>• Last BI test: 2024-01-15 (PASS)</p>
                <p>• Next required: 2024-01-16</p>
                <p>• Tests passed this month: 15</p>
              </div>
            )}
          </div>
        )}
      </div>

      <section>
        <h3 className="text-lg font-semibold">
          Chemical Indicator (CI) Management
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure how CI indicators are handled during autoclave cycles.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>ON:</strong> Users must confirm CI strip usage (Y/N
            selection in workflow)
            <br />
            <strong>OFF:</strong> Users get a warning but can proceed without CI
            confirmation
          </p>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="enforceCI" className="font-medium">
            Require CI Confirmation
          </label>
          <button
            id="enforceCI"
            onClick={() => {
              const facilityId = getCurrentFacilityId();
              if (facilityId) {
                trackEnforcementToggle('CI', !enforceCi, facilityId);
                updateComplianceSettings(facilityId, { enforceCi: !enforceCi });
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 ${
              enforceCi ? 'bg-[#4ECDC4]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enforceCi ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
};

export default EnforcementSettings;
