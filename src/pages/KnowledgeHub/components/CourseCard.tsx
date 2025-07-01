import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  isCourseDueForRepeat: boolean;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isCourseDueForRepeat, onClick }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <h3 className="text-lg font-semibold">{course.title}</h3>
      <p className="text-gray-600">{course.description}</p>
      {isCourseDueForRepeat && (
        <span className="inline-block px-2 py-1 mt-2 text-sm text-red-600 bg-red-100 rounded">
          Due for Review
        </span>
      )}
    </div>
  );
};

export default CourseCard;
