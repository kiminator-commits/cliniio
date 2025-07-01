import React from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface TasksListProps {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
  className?: string;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, onTaskToggle, className = '' }) => {
  return (
    <div className={`tasks-list ${className}`} data-testid="tasks-list">
      {tasks.map(task => (
        <div key={task.id} className="task-item">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onTaskToggle?.(task.id)}
            data-testid={`task-checkbox-${task.id}`}
          />
          <span className={`task-title ${task.completed ? 'completed' : ''}`}>{task.title}</span>
          <p className="task-description">{task.description}</p>
        </div>
      ))}
    </div>
  );
};

export default TasksList;
