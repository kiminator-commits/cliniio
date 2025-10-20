import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { TaskService, Task } from '../services/taskService';
import TaskCard from './TaskCard';

export const TaskList: React.FC = () => {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (currentUser?.id) {
        try {
          setLoading(true);
          setError(null);
          
          // Fetch pending tasks for the current user
          const userTasks = await TaskService.getUserTasks(currentUser.id, 'pending');
          setTasks(userTasks);
        } catch (err) {
          console.error('Error fetching tasks:', err);
          setError(err instanceof Error ? err.message : 'Failed to load tasks');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">Error loading tasks: {error}</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">No pending tasks</h4>
          <p className="text-sm text-gray-500">You're all caught up! New tasks will appear here when assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Tasks ({tasks.length})
        </h3>
        {tasks.length > 0 && (
          <span className="text-sm text-gray-500">
            Click any task to review
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskList;