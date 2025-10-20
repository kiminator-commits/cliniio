import React, { useState, useMemo, useCallback, useRef } from 'react';
import { FaEdit, FaChevronRight } from 'react-icons/fa';
import { TASK_STATUSES } from '../constants/homeTaskConstants';
import { Task } from '../store/homeStore';
import clsx from 'clsx';

// Helper function to map homeStore Task to taskService Task
const mapToServiceTask = (task: Task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: (task.priority === 'urgent' ? 'urgent' : 
            task.priority === 'high' ? 'high' : 
            task.priority === 'low' ? 'low' : 'normal') as 'high' | 'low' | 'normal' | 'urgent',
  due_date: task.dueDate,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: '', // Will be set by the service
  facility_id: '', // Will be set by the service
  completed: task.completed,
});

type VirtualizedTasksListProps = {
  onTaskComplete?: (taskId: string, points?: number) => void;
  onTaskUpdate?: (taskId: string, updatedTask: Task) => void;
  tasks: Task[];
  itemHeight?: number;
  containerHeight?: number;
};

const VirtualizedTasksList: React.FC<VirtualizedTasksListProps> = React.memo(
  ({
    onTaskComplete,
    onTaskUpdate,
    tasks,
    itemHeight = 120,
    containerHeight = 600,
  }) => {
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editedTask, setEditedTask] = useState<Partial<Task>>({});
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Helper function to determine if a task is newly assigned (within last 24 hours)
    const isNewlyAssigned = useCallback((task: Task): boolean => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      const now = new Date();
      const hoursDiff = (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60);

      return hoursDiff <= 24;
    }, []);

    // Helper function to get enhanced shadow class for new tasks
    const getTaskCardClass = useCallback(
      (task: Task): string => {
        const baseClass = 'rounded-xl border border-gray-200 p-4 bg-white mx-2';
        const isNew = isNewlyAssigned(task);

        return clsx(baseClass, {
          // Enhanced shadow effect for newly assigned tasks (same as performance metrics)
          'shadow-lg border-l-4 border-[#4ECDC4] border-opacity-50 bg-gradient-to-r from-white to-teal-50':
            isNew,
          // Standard styling for older tasks
          'shadow-sm': !isNew,
        });
      },
      [isNewlyAssigned]
    );

    // Memoize expensive calculations
    const safeTasks = useMemo(
      () => (Array.isArray(tasks) ? tasks : []),
      [tasks]
    );
    const incompleteTasks = useMemo(
      () => safeTasks.filter((task) => task.status !== 'completed'),
      [safeTasks]
    );

    // Calculate visible range based on scroll position
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + visibleItemCount + 2,
      incompleteTasks.length
    ); // +2 for buffer

    // Get only visible tasks
    const visibleTasks = useMemo(
      () => incompleteTasks.slice(startIndex, endIndex),
      [incompleteTasks, startIndex, endIndex]
    );

    // Calculate total height for proper scrolling
    const totalHeight = incompleteTasks.length * itemHeight;

    // Handle scroll events
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []);

    // Memoize event handlers
    const toggleTask = useCallback((taskId: string) => {
      setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
    }, []);

    const handleEdit = useCallback((task: Task) => {
      setEditingTask(task.id);
      setEditedTask(task);
    }, []);

    const handleCancel = useCallback(() => {
      setEditingTask(null);
      setEditedTask({});
    }, []);

    const handleSave = useCallback(async () => {
      if (!editingTask) return;

      try {
        // Find the task being edited
        const taskToUpdate = incompleteTasks.find(
          (task) => task.id === editingTask
        );
        if (!taskToUpdate) {
          console.error('Task not found for editing');
          return;
        }

        // Create updated task object
        const updatedTask = {
          ...taskToUpdate,
          ...editedTask,
        };

        // Map to service task format and implement actual task update service call
        const serviceTask = mapToServiceTask(updatedTask);
        const { TaskService } = await import('@/services/taskService');
        await TaskService.updateTask(serviceTask.id, serviceTask);

        // Update parent component if callback provided
        if (onTaskUpdate) {
          onTaskUpdate(editingTask, updatedTask);
        }

        // Reset editing state
        setEditingTask(null);
        setEditedTask({});
      } catch (error) {
        console.error('Failed to save task:', error);
      }
    }, [editingTask, incompleteTasks, editedTask, onTaskUpdate]);

    // Memoize the task rendering to prevent unnecessary re-renders
    const renderedTasks = useMemo(
      () =>
        visibleTasks.map((task, index) => {
          const actualIndex = startIndex + index;
          const top = actualIndex * itemHeight;

          return (
            <div
              key={task.id}
              className="absolute w-full"
              style={{ top, height: itemHeight }}
            >
              <div className={getTaskCardClass(task)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-1 text-gray-400 hover:text-gray-600"
                      aria-label={
                        expandedTaskId === task.id
                          ? 'Collapse task details'
                          : 'Expand task details'
                      }
                    >
                      <FaChevronRight
                        className={`transform transition-transform ${expandedTaskId === task.id ? 'rotate-90' : ''}`}
                      />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-800">
                          {task.title}
                        </div>
                        {isNewlyAssigned(task) && (
                          <span className="px-2 py-1 text-xs font-semibold bg-[#4ECDC4] text-white rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {`${task.category || 'General'} - ${task.type || 'Training'} - Due: ${task.dueDate || 'N/A'}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-violet-600 font-semibold">
                      +{task.points} pts
                    </span>
                    <button
                      onClick={() =>
                        onTaskComplete?.(task.id, task.points || 0)
                      }
                      className="rounded-full border border-green-500 text-green-500 text-sm px-3 py-1 hover:bg-green-50"
                      aria-label={`Complete task: ${task.title}`}
                      data-testid={`task-checkbox-${task.id}`}
                    >
                      {TASK_STATUSES.COMPLETE}
                    </button>
                  </div>
                </div>
                {expandedTaskId === task.id && (
                  <>
                    <hr className="my-3" />
                    <div className="text-sm space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={`category-${task.id}`}
                            className="block text-gray-600 font-medium mb-1"
                          >
                            Category
                          </label>
                          {editingTask === task.id ? (
                            <input
                              id={`category-${task.id}`}
                              type="text"
                              value={editedTask.category || ''}
                              onChange={(e) =>
                                setEditedTask({
                                  ...editedTask,
                                  category: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          ) : (
                            <div className="text-gray-700">
                              {task.category || 'General'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor={`type-${task.id}`}
                            className="block text-gray-600 font-medium mb-1"
                          >
                            Type
                          </label>
                          {editingTask === task.id ? (
                            <input
                              id={`type-${task.id}`}
                              type="text"
                              value={editedTask.type || ''}
                              onChange={(e) =>
                                setEditedTask({
                                  ...editedTask,
                                  type: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          ) : (
                            <div className="text-gray-700">
                              {task.type || 'Training'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={`dueDate-${task.id}`}
                            className="block text-gray-600 font-medium mb-1"
                          >
                            Due Date
                          </label>
                          {editingTask === task.id ? (
                            <input
                              id={`dueDate-${task.id}`}
                              type="date"
                              value={editedTask.dueDate || ''}
                              onChange={(e) =>
                                setEditedTask({
                                  ...editedTask,
                                  dueDate: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          ) : (
                            <div className="text-gray-700">
                              {task.dueDate || 'N/A'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor={`points-${task.id}`}
                            className="block text-gray-600 font-medium mb-1"
                          >
                            Points
                          </label>
                          {editingTask === task.id ? (
                            <input
                              id={`points-${task.id}`}
                              type="number"
                              value={editedTask.points || 0}
                              onChange={(e) =>
                                setEditedTask({
                                  ...editedTask,
                                  points: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          ) : (
                            <div className="text-gray-700">
                              {task.points || 0} points
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(task)}
                              className="rounded-full border border-violet-500 text-violet-500 text-sm px-3 py-1 hover:bg-violet-50"
                              aria-label={`Edit task: ${task.title}`}
                            >
                              <FaEdit className="inline-block mr-1" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                      {editingTask === task.id && (
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        }),
      [
        visibleTasks,
        startIndex,
        itemHeight,
        expandedTaskId,
        editingTask,
        editedTask,
        toggleTask,
        onTaskComplete,
        handleEdit,
        handleCancel,
        handleSave,
        getTaskCardClass,
        isNewlyAssigned,
      ]
    );

    return (
      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {renderedTasks}
        </div>
      </div>
    );
  }
);

VirtualizedTasksList.displayName = 'VirtualizedTasksList';

export default VirtualizedTasksList;
