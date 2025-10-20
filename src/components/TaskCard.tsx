import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiChevronRight, mdiClock, mdiAccount, mdiFileDocument } from '@mdi/js';
import { Task } from '../services/taskService';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();

  const handleTaskClick = () => {
    if (task.type === 'content_approval') {
      const { contentId } = task.metadata;
      navigate(`/settings?tab=content&subtab=publishing&review=${contentId}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'content_approval':
        return mdiFileDocument;
      default:
        return mdiFileDocument;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getContentTypeDisplay = (contentType: string) => {
    switch (contentType) {
      case 'course':
        return 'Course';
      case 'policy':
        return 'Policy';
      case 'procedure':
        return 'Procedure';
      case 'learning_pathway':
        return 'Learning Pathway';
      default:
        return contentType;
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
      onClick={handleTaskClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Task Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon 
                path={getTaskIcon(task.type)} 
                size={1} 
                className="text-blue-600" 
              />
            </div>
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {task.description}
            </p>

            {/* Task Metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {task.type === 'content_approval' && task.metadata && (
                <>
                  <div className="flex items-center space-x-1">
                    <Icon path={mdiAccount} size={0.8} />
                    <span>by {task.metadata.authorName}</span>
                  </div>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                    {getContentTypeDisplay(task.metadata.contentType)}
                  </span>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center space-x-1">
                <Icon path={mdiClock} size={0.8} />
                <span>{formatTimeAgo(task.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0 ml-2">
          <Icon 
            path={mdiChevronRight} 
            size={1} 
            className="text-gray-400" 
          />
        </div>
      </div>

      {/* Due Date Warning */}
      {task.due_date && new Date(task.due_date) < new Date() && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <div className="flex items-center space-x-2 text-xs text-red-600">
            <Icon path={mdiClock} size={0.8} />
            <span>Overdue since {formatTimeAgo(task.due_date)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;