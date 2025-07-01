import React from 'react';
import { FaUsers } from 'react-icons/fa';

interface TeamPerformanceData {
  skills: number;
  inventory: number;
  sterilization: number;
}

interface TeamPerformanceCardProps {
  data: TeamPerformanceData;
  timeframe: string;
}

export const TeamPerformanceCard: React.FC<TeamPerformanceCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <span className="bg-yellow-200 rounded-md p-2 mr-3">
          <FaUsers size={20} className="text-yellow-900" />
        </span>
        <h3 className="text-base font-medium text-gray-700">Team Performance</h3>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">Skills</span>
          <span className="text-base text-yellow-900 text-right">{data.skills}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">Inventory Efficiency</span>
          <span className="text-base text-yellow-900 text-right">{data.inventory}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">Sterilization Efficiency</span>
          <span className="text-base text-yellow-900 text-right">{data.sterilization}%</span>
        </div>
      </div>
    </div>
  );
};
