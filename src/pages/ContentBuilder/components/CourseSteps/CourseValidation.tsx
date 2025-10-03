import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiCheck,
  mdiClose,
  mdiAlertCircle,
  mdiBookOpen,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { useContentBuilder } from '../../context';

interface ValidationResult {
  field: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
}

interface CourseValidationProps {
  collapsedSections: {
    review: boolean;
  };
  toggleSection: (section: 'review') => void;
}

export const CourseValidation: React.FC<CourseValidationProps> = ({
  collapsedSections,
  toggleSection,
}) => {
  const { state } = useContentBuilder();
  const { courseData } = state;
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);

  // Validation logic
  useEffect(() => {
    const validateCourse = () => {
      const results: ValidationResult[] = [];

      // Course title validation
      if (!courseData.title || courseData.title.trim().length < 5) {
        results.push({
          field: 'title',
          status: 'error',
          message: 'Course title must be at least 5 characters long',
        });
      } else if (courseData.title.length > 100) {
        results.push({
          field: 'title',
          status: 'warning',
          message: 'Course title is quite long, consider shortening it',
        });
      } else {
        results.push({
          field: 'title',
          status: 'valid',
          message: 'Course title is appropriate length',
        });
      }

      // Course description validation
      if (
        !courseData.description ||
        courseData.description.trim().length < 20
      ) {
        results.push({
          field: 'description',
          status: 'error',
          message: 'Course description must be at least 20 characters long',
        });
      } else if (courseData.description.length > 500) {
        results.push({
          field: 'description',
          status: 'warning',
          message: 'Course description is quite long, consider shortening it',
        });
      } else {
        results.push({
          field: 'description',
          status: 'valid',
          message: 'Course description is appropriate length',
        });
      }

      // Modules validation
      if (courseData.modules.length === 0) {
        results.push({
          field: 'modules',
          status: 'error',
          message: 'Course must have at least one module',
        });
      } else {
        const totalLessons = courseData.modules.reduce(
          (acc, module) => acc + module.lessons.length,
          0
        );
        if (totalLessons === 0) {
          results.push({
            field: 'lessons',
            status: 'error',
            message: 'Course must have at least one lesson',
          });
        } else if (totalLessons < 3) {
          results.push({
            field: 'lessons',
            status: 'warning',
            message: 'Consider adding more lessons for a comprehensive course',
          });
        } else {
          results.push({
            field: 'lessons',
            status: 'valid',
            message: `Course has ${totalLessons} lessons across ${courseData.modules.length} modules`,
          });
        }
      }

      // Settings validation
      if (!courseData.settings?.difficulty) {
        results.push({
          field: 'difficulty',
          status: 'error',
          message: 'Difficulty level must be set',
        });
      } else {
        results.push({
          field: 'difficulty',
          status: 'valid',
          message: `Difficulty level: ${courseData.settings.difficulty}`,
        });
      }

      // Assessment validation
      if (courseData.assessments && courseData.assessments.length > 0) {
        results.push({
          field: 'assessments',
          status: 'valid',
          message: `Course has ${courseData.assessments.length} assessment(s)`,
        });
      } else {
        results.push({
          field: 'assessments',
          status: 'warning',
          message: 'Consider adding assessments to evaluate learning',
        });
      }

      setValidationResults(results);
    };

    validateCourse();
  }, [courseData]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50"
        onClick={() => toggleSection('review')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection('review');
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsedSections.review}
      >
        <div className="flex items-center gap-3">
          <Icon path={mdiBookOpen} size={1.2} className="text-blue-600" />
          <h5 className="text-lg font-medium text-gray-900">
            Course Review & Validation
          </h5>
        </div>
        <Icon
          path={collapsedSections.review ? mdiChevronDown : mdiChevronUp}
          size={1}
          className="text-gray-400"
        />
      </div>

      {!collapsedSections.review && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validationResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'valid'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    path={
                      result.status === 'valid'
                        ? mdiCheck
                        : result.status === 'warning'
                          ? mdiAlertCircle
                          : mdiClose
                    }
                    size={0.8}
                    className={
                      result.status === 'valid'
                        ? 'text-green-600'
                        : result.status === 'warning'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }
                  />
                  <span
                    className={`text-sm font-medium capitalize ${
                      result.status === 'valid'
                        ? 'text-green-800'
                        : result.status === 'warning'
                          ? 'text-yellow-800'
                          : 'text-red-800'
                    }`}
                  >
                    {result.field}
                  </span>
                </div>
                <p
                  className={`text-xs ${
                    result.status === 'valid'
                      ? 'text-green-700'
                      : result.status === 'warning'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                  }`}
                >
                  {result.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseValidation;
