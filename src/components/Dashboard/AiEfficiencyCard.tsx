import React from 'react';
import { FaRobot } from 'react-icons/fa';

interface AiEfficiencyData {
  timeSavings: number;
  proactiveMgmt: number;
  errorRate?: number;
}

interface AiEfficiencyCardProps {
  data: AiEfficiencyData;
  timeframe: string;
}

export const AiEfficiencyCard: React.FC<AiEfficiencyCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <span className="bg-purple-200 rounded-md p-2 mr-3">
          <FaRobot size={20} className="text-purple-900" />
        </span>
        <h3 className="text-base font-medium text-gray-700">AI & Process Efficiency</h3>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">AI Time Savings</span>
          <span className="text-base text-purple-900 text-right">{data.timeSavings}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">Proactive Management</span>
          <span className="text-base text-purple-900 text-right">{data.proactiveMgmt}%</span>
        </div>
        {typeof data.errorRate === 'number' && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs text-left">Error Rate</span>
            <span className="text-base text-pink-600 text-right">{data.errorRate}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
