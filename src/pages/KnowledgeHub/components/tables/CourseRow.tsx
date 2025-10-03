import React from 'react';
import { Course } from '../../models';

interface CourseRowProps {
  course: Course;
}

const CourseRow: React.FC<CourseRowProps> = ({ course }) => (
  <tr>
    <td>{course.title}</td>
    <td>{course.domain}</td>
    <td>
      {course.dueDate ? new Date(course.dueDate).toLocaleDateString() : '-'}
    </td>
    <td>{course.status}</td>
  </tr>
);

export default CourseRow;
