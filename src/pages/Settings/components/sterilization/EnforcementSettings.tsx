import React, { useState } from 'react';
import { useSterilizationStore } from '../../../../store/sterilizationStore';
import { useFacility } from '../../../../contexts/FacilityContext';
import { trackEnforcementToggle } from './settings';

export const EnforcementSettings: React.FC = () => {
  const { enforceBI, enforceCI, toggleEnforceBI, toggleEnforceCI } =
    useSterilizationStore();

  const [showBIHistory, setShowBIHistory] = useState(false);
  const [showCIHistory, setShowCIHistory] = useState(false);

  const { getCurrentFacilityId } = useFacility();

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
                trackEnforcementToggle('BI', !enforceBI, facilityId);
              }
              toggleEnforceBI();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 ${
              enforceBI ? 'bg-[#4ECDC4]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enforceBI ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* BI Status and History */}
        {enforceBI && (
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="enforceCI" className="text-sm font-medium">
              Chemical Indicator Management
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Require CI strip verification for each sterilization cycle
            </p>
          </div>
          <button
            onClick={() => {
              const facilityId = getCurrentFacilityId();
              if (facilityId) {
                trackEnforcementToggle('CI', !enforceCI, facilityId);
              }
              toggleEnforceCI();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 ${
              enforceCI ? 'bg-[#4ECDC4]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enforceCI ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* CI Status and History */}
        {enforceCI && (
          <div className="ml-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                CI strips are being enforced
              </span>
            </div>
            <button
              onClick={() => setShowCIHistory(!showCIHistory)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showCIHistory ? 'Hide' : 'Show'} CI strip history
            </button>
            {showCIHistory && (
              <div className="p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                <p>• CI strips used today: 8</p>
                <p>• All strips passed verification</p>
                <p>• Last failure: None in current month</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnforcementSettings;
