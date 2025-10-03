import React from 'react';
import { ScheduleSummary } from '../../pages/EnvironmentalClean/models';

type ScheduleSummaryCardProps = {
  schedule: ScheduleSummary;
};

const ScheduleSummaryCard: React.FC<ScheduleSummaryCardProps> = ({
  schedule,
}) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Schedule Summary</h3>
      <div className="space-y-2">
        <div>Total Tasks: {schedule.totalTasks}</div>
        <div>Completed: {schedule.completedTasks}</div>
        <div>Pending: {schedule.pendingTasks}</div>
        <div>Overdue: {schedule.overdueTasks}</div>
      </div>
    </div>
  );
};

export default ScheduleSummaryCard;
