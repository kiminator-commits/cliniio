import React, { useState } from 'react';
import { FaEdit, FaChevronRight } from 'react-icons/fa';
import { HomeTask } from '@/types/home';
import { TASK_STATUSES } from '@/constants/homeTaskConstants';

type TasksListProps = {
  onTaskComplete?: (taskId: string) => void;
  tasks: HomeTask[];
};

const TasksList: React.FC<TasksListProps> = ({ onTaskComplete, tasks }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<HomeTask>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(tasks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = tasks.slice(startIndex, endIndex);

  const toggleTask = (taskId: string) => {
    setExpandedTaskId(prev => (prev === taskId ? null : taskId));
  };

  const handleEdit = (task: HomeTask) => {
    setEditingTask(task.id);
    setEditedTask(task);
  };

  const handleCancel = () => {
    setEditingTask(null);
    setEditedTask({});
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setEditingTask(null);
    setEditedTask({});
  };

  return (
    <div className="space-y-4">
      {currentTasks.map(task => (
        <div key={task.id} className="rounded-xl border border-gray-200 p-4 shadow-sm bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <button
                onClick={() => toggleTask(task.id)}
                className="mt-1 text-gray-400 hover:text-gray-600"
                aria-label={
                  expandedTaskId === task.id ? 'Collapse task details' : 'Expand task details'
                }
              >
                <FaChevronRight
                  className={`transform transition-transform ${expandedTaskId === task.id ? 'rotate-90' : ''}`}
                />
              </button>
              <div>
                <div className="font-semibold text-gray-800">{task.title}</div>
                <div className="text-sm text-gray-500">
                  {task.subtitle ||
                    `${task.category || 'General'} - ${task.type || 'Training'} - Due: ${task.dueDate || 'N/A'}`}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className="text-violet-600 font-semibold">+{task.points} pts</span>
              <button
                onClick={() => onTaskComplete?.(task.id)}
                className="rounded-full border border-green-500 text-green-500 text-sm px-3 py-1 hover:bg-green-50"
                aria-label={`Complete task: ${task.title}`}
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
                        onChange={e => setEditedTask({ ...editedTask, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <div className="text-gray-700">{task.category || 'General'}</div>
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
                        onChange={e => setEditedTask({ ...editedTask, type: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <div className="text-gray-700">{task.type || 'Training'}</div>
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
                        onChange={e => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <div className="text-gray-700">{task.dueDate || 'N/A'}</div>
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
                        onChange={e =>
                          setEditedTask({
                            ...editedTask,
                            points: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <div className="text-gray-700">{task.points || 0} points</div>
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
      ))}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-1 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <span className="text-xs text-gray-600">{currentPage}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default TasksList;
