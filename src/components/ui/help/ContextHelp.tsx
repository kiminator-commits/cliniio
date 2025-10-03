import React from 'react';

interface ContextHelpProps {
  currentContext: string;
}

export const ContextHelp: React.FC<ContextHelpProps> = ({ currentContext }) => {
  if (currentContext === 'sterilization') {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 text-lg">
          Sterilization Standards & Protocols
        </h4>

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-2">CSA Standards</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • CSA Z314.2 - Effective sterilization in health care facilities
              </li>
              <li>
                • CSA Z314.3 - Steam sterilization of reusable medical devices
              </li>
              <li>
                • CSA Z314.4 - Steam sterilization of reusable medical devices
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-800 mb-2">
              Key Requirements
            </h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Biological indicator testing frequency</li>
              <li>• Temperature and pressure monitoring</li>
              <li>• Load documentation and traceability</li>
              <li>• Equipment maintenance schedules</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2">Best Practices</h5>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Pre-cleaning and inspection protocols</li>
              <li>• Proper packaging and loading techniques</li>
              <li>• Post-sterilization handling procedures</li>
              <li>• Quality assurance documentation</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500 py-8">
      <p>
        General information and standards will be displayed here based on your
        current page.
      </p>
    </div>
  );
};
