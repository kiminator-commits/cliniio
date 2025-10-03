import React from 'react';
import { Task } from '../../store/homeStore';

interface TasksListProps {
  tasks: Task[];
  onTaskComplete?: (taskId: string, points?: number) => void;
  className?: string;
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  onTaskComplete,
  className = '',
}) => {
  return (
    <div className={`tasks-list ${className}`} data-testid="tasks-list">
      {tasks.map((task) => (
        <div key={task.id} className="task-item">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onTaskComplete?.(task.id, task.points)}
            data-testid={`task-checkbox-${task.id}`}
          />
          <span className={`task-title ${task.completed ? 'completed' : ''}`}>
            {task.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </span>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default TasksList;
