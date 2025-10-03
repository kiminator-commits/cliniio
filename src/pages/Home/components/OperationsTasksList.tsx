import React from 'react';
import TaskList from '@/components/TaskList';
import { Task } from '../../../store/homeStore';

interface Props {
  tasks: Task[];
}

export const OperationsTasksList = ({ tasks }: Props) => {
  return (
    <div className="grid gap-3">
      <TaskList tasks={tasks} onComplete={() => {}} />
    </div>
  );
};
