import React from 'react';
import Icon from '@mdi/react';
import { mdiCalendarAlert } from '@mdi/js';

interface OperatorConfirmationProps {
  operatorName: string;
  totalToolsAffected: number;
  totalCyclesAffected: number;
}

export const OperatorConfirmation: React.FC<OperatorConfirmationProps> = ({
  operatorName,
  totalToolsAffected,
  totalCyclesAffected,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon path={mdiCalendarAlert} size={1} className="text-gray-600" />
        <span className="font-medium text-gray-700">Operator Confirmation</span>
      </div>
      <p className="text-sm text-gray-600">
        <strong>{operatorName}</strong>, by confirming this BI test failure, you
        acknowledge that:
      </p>
      <ul className="mt-2 text-sm text-gray-600 space-y-1">
        <li>• All {totalToolsAffected} affected tools will be quarantined</li>
        <li>• {totalCyclesAffected} sterilization cycles are affected</li>
        <li>• A compliance incident report will be generated</li>
        <li>• Re-sterilization procedures must be followed</li>
      </ul>
    </div>
  );
};
