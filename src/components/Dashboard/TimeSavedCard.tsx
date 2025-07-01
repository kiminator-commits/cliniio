import React from 'react';
import { FaClock } from 'react-icons/fa';

interface TimeSavedData {
  daily: number;
  monthly: number;
}

interface TimeSavedCardProps {
  data: TimeSavedData;
  timeframe: string;
}

export const TimeSavedCard: React.FC<TimeSavedCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <span className="bg-blue-100 rounded-md p-2 mr-3">
          <FaClock size={20} className="text-[#2563eb]" />
        </span>
        <h3 className="text-base font-medium text-gray-700">Time Savings</h3>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">Time Saved (Day)</span>
          <span className="text-base text-blue-900 text-right">{data.daily} hrs</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs text-left">Time Saved (Month)</span>
          <span className="text-base text-blue-900 text-right">{data.monthly} hrs</span>
        </div>
      </div>
    </div>
  );
};
