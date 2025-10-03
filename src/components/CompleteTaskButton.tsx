import React from 'react';

interface CompleteTaskButtonProps {
  task: {
    id: string;
    title: string;
  };
  handleTaskComplete: (taskId: string) => void;
}

const CompleteTaskButton: React.FC<CompleteTaskButtonProps> = ({
  task,
  handleTaskComplete,
}) => {
  return (
    <button
      aria-label={`Complete task: ${task.title}`}
      aria-describedby={`task-description-${task.id}`}
      onClick={() => handleTaskComplete(task.id)}
      onKeyDown={(e) => e.key === 'Enter' && handleTaskComplete(task.id)}
    >
      Complete
    </button>
  );
};

export default CompleteTaskButton;
