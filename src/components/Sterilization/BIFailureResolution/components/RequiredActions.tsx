import React from 'react';

interface RequiredActionsProps {
  totalToolsAffected: number;
}

export const RequiredActions: React.FC<RequiredActionsProps> = ({
  totalToolsAffected,
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-medium text-blue-800 mb-3">Required Actions</h3>
      <div className="space-y-2 text-sm text-blue-700">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <span>
            Quarantine all {totalToolsAffected} affected tools immediately
          </span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <span>Re-sterilize all quarantined tools</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <span>Perform a new BI test after re-sterilization</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <span>Contact supervisor for incident documentation</span>
        </div>
      </div>
    </div>
  );
};
