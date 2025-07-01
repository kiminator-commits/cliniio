import React from 'react';
import { FaDollarSign } from 'react-icons/fa';

interface CostSavingsData {
  monthly: number;
  annual: number;
}

interface CostSavingsCardProps {
  data: CostSavingsData;
}

export const CostSavingsCard: React.FC<CostSavingsCardProps> = ({
  data = { monthly: 0, annual: 0 },
}) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <span className="bg-green-100 rounded-md p-2 mr-3">
          <FaDollarSign size={20} className="text-green-800" />
        </span>
        <h3 className="text-base font-medium text-gray-700">Cost Savings</h3>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">Monthly Savings</span>
          <span className="text-base text-blue-900 text-right">
            ${(data.monthly || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">Annual Savings</span>
          <span className="text-base text-blue-900 text-right">
            ${(data.annual || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
