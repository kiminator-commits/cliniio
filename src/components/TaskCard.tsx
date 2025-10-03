import React from 'react';
import { Task } from '../store/homeStore';

interface TaskCardProps {
  task: Task;
  style: React.CSSProperties;
  onComplete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, style, onComplete }) => {
  const handleComplete = () => {
    onComplete?.(task.id);
  };

  return (
    <div style={style} className="p-2">
      <div className="bg-white rounded-lg shadow p-3 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
          <button
            onClick={handleComplete}
            className="ml-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
