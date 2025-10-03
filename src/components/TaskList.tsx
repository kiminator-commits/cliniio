import React from 'react';
import { FixedSizeList as List } from 'react-window';
import TaskCard from './TaskCard';
import { Task } from '../store/homeStore';

interface TaskListProps {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
}

const TaskList = React.memo(({ tasks, onComplete }: TaskListProps) => {
  return (
    <List height={500} itemCount={tasks.length} itemSize={50} width={500}>
      {({ index, style }) => (
        <TaskCard task={tasks[index]} style={style} onComplete={onComplete} />
      )}
    </List>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
