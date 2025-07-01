import React from 'react';
import { TaskSummary } from '../../types/EnvironmentalCleaningTypes';

type TaskSummaryCardProps = {
  tasks: TaskSummary;
};

const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({ tasks }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Task Summary</h3>
      <div className="space-y-2">
        <div>Total Tasks: {tasks.totalTasks}</div>
        <div>Completed Tasks: {tasks.completedTasks}</div>
        <div>Pending Tasks: {tasks.pendingTasks}</div>
      </div>
    </div>
  );
};

export default TaskSummaryCard;
