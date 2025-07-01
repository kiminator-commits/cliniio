import React from 'react';
import { ScheduleSummary } from '../../types/EnvironmentalCleaningTypes';

type ScheduleSummaryCardProps = {
  schedule: ScheduleSummary;
};

const ScheduleSummaryCard: React.FC<ScheduleSummaryCardProps> = ({ schedule }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Schedule Summary</h3>
      <div className="space-y-2">
        <div>Total Scheduled: {schedule.totalScheduled}</div>
        <div>Completed: {schedule.completed}</div>
        <div>Remaining: {schedule.remaining}</div>
      </div>
    </div>
  );
};

export default ScheduleSummaryCard;
