import React from 'react';
import { Course } from '../models';

interface CourseCardProps {
  course: Course;
  isCourseDueForRepeat: boolean;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isCourseDueForRepeat,
  onClick,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'Not Started':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div
      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {course.title}
        </h3>
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(course.status)}`}
        >
          {course.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {course.description || 'No description available'}
      </p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-700">
            {course.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Course Details */}
      <div className="space-y-1 mb-3">
        {course.domain && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium mr-1">Domain:</span>
            <span>{course.domain}</span>
          </div>
        )}

        {course.dueDate && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium mr-1">Due:</span>
            <span>{new Date(course.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {course.score && course.score > 0 && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium mr-1">Score:</span>
            <span>{course.score}%</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {course.tags && course.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {course.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
            >
              {tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              +{course.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Due for Review Badge */}
      {isCourseDueForRepeat && (
        <span className="inline-block px-2 py-1 text-xs text-red-600 bg-red-100 rounded font-medium">
          Due for Review
        </span>
      )}
    </div>
  );
};

export default CourseCard;
