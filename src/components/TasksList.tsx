import React, { useState, useMemo, useCallback } from 'react';
import { Task } from '../store/homeStore';
import { TaskEditModal } from './TaskEditModal';

interface TasksListProps {
  tasks: Task[];
  onTaskComplete?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updatedTask: Task) => void;
}

export const TasksList: React.FC<TasksListProps> = ({
  tasks,
  onTaskComplete,
  onTaskUpdate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Memoize expensive calculations
  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks]);
  const incompleteTasks = useMemo(
    () => safeTasks.filter((task) => task.status !== 'completed'),
    [safeTasks]
  );

  // Memoize pagination calculations
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(incompleteTasks.length / itemsPerPage)),
    [incompleteTasks.length, itemsPerPage]
  );
  const startIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage,
    [currentPage, itemsPerPage]
  );
  const endIndex = useMemo(
    () => startIndex + itemsPerPage,
    [startIndex, itemsPerPage]
  );
  const currentTasks = useMemo(
    () => incompleteTasks.slice(startIndex, endIndex),
    [incompleteTasks, startIndex, endIndex]
  );

  // Memoize event handlers
  const toggleTask = useCallback((taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  }, []);

  const handleTaskSave = useCallback(
    async (taskId: string, updatedTask: Task) => {
      if (onTaskUpdate) {
        try {
          await onTaskUpdate(taskId, updatedTask);
          // Close modal on success
          setIsEditModalOpen(false);
          setEditingTask(null);
        } catch (error) {
          // Error handling is done in the modal component
          console.error('Failed to update task:', error);
        }
      }
    },
    [onTaskUpdate]
  );

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Memoize the task rendering to prevent unnecessary re-renders
  const renderedTasks = useMemo(
    () =>
      currentTasks.map((task) => (
        <div key={task.id} className="task-item border rounded-lg p-4 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleTask(task.id)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={
                  expandedTaskId === task.id
                    ? 'Collapse task details'
                    : 'Expand task details'
                }
              >
                <span
                  className={`transform transition-transform ${expandedTaskId === task.id ? 'rotate-90' : ''}`}
                >
                  ▶
                </span>
              </button>
              <span className="font-medium">{task.title}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(task)}
                className="px-3 py-1 text-xs bg-[#4ECDC4] text-white rounded hover:bg-[#38b2ac] transition-colors"
              >
                Edit
              </button>
              {onTaskComplete && (
                <button
                  onClick={() => onTaskComplete(task.id)}
                  className="px-3 py-1 text-xs bg-[#4ECDC4] text-white rounded hover:bg-[#38b2ac] transition-colors"
                >
                  Complete
                </button>
              )}
            </div>
          </div>

          {expandedTaskId === task.id && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Priority: {task.priority}</div>
                <div>Status: {task.status}</div>
                {task.dueDate && (
                  <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )),
    [currentTasks, expandedTaskId, toggleTask, handleEdit, onTaskComplete]
  );

  if (incompleteTasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No tasks available</div>
    );
  }

  return (
    <div className="space-y-4">
      {renderedTasks}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSave={handleTaskSave}
      />
    </div>
  );
};
