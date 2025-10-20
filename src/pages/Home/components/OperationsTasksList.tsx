import React from 'react';
import TaskCard from '@/components/TaskCard';
import { Task } from '../../../services/taskService';

interface Props {
  tasks: Task[];
}

export const OperationsTasksList = ({ tasks }: Props) => {
  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};
