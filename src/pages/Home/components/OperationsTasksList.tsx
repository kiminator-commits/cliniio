import React from 'react';

type OperationsTask = {
  id: string;
  title: string;
  status: string;
  assignedTo?: string;
};

type Props = {
  tasks: OperationsTask[];
};

export const OperationsTasksList = ({ tasks }: Props) => {
  return (
    <div className="grid gap-3">
      {tasks.map(task => (
        <div
          key={task.id}
          className="flex items-center justify-between rounded-lg border px-4 py-3 shadow-sm"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{task.title}</span>
            <span className="text-xs text-gray-500">{task.assignedTo}</span>
          </div>
          <span className="text-xs text-gray-400">{task.status}</span>
        </div>
      ))}
    </div>
  );
};
