import React from 'react';
import Icon from '@mdi/react';
import { mdiSchool, mdiChevronRight, mdiChevronLeft } from '@mdi/js';
import { useContentBuilder } from '../context';
import { useContentBuilderActions } from '../hooks';
import CourseStep1 from './CourseSteps/CourseStep1';
import CoursePlanningStep from './CourseSteps/CoursePlanningStep';
import ContentBuilderStep from './CourseSteps/ContentBuilderStep';
import CourseStep4 from './CourseSteps/CourseStep4';

interface CourseBuilderProps {
  draftId?: string;
}

const CourseBuilder: React.FC<CourseBuilderProps> = ({ draftId: _draftId }) => {
  const { state } = useContentBuilder();
  const { setCourseStep } = useContentBuilderActions();
  const { courseStep } = state;

  return (
    <div className="space-y-6">
      {/* Course Builder Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Icon path={mdiSchool} size={1.5} className="text-[#4ECDC4]" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Course Builder
          </h2>
          <p className="text-sm text-gray-600">
            Create an engaging, interactive learning experience
          </p>
        </div>
      </div>

      {/* Course Creation Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Course Structure
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Step {courseStep || 1} of 4
            </span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step <= (courseStep || 1) ? 'bg-[#4ECDC4]' : 'bg-gray-300'
                  }`}
                  title={
                    step === 1
                      ? 'Course Overview'
                      : step === 2
                        ? 'Course Planning'
                        : step === 3
                          ? 'Content Builder'
                          : 'Publish & Settings'
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCourseStep(Math.max(1, (courseStep || 1) - 1))}
            disabled={(courseStep || 1) === 1}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon path={mdiChevronLeft} size={1} className="mr-1" />
            Previous
          </button>
          <button
            onClick={() => setCourseStep(Math.min(4, (courseStep || 1) + 1))}
            disabled={(courseStep || 1) === 4}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <Icon path={mdiChevronRight} size={1} className="ml-1" />
          </button>
        </div>

        {/* Step Content */}
        {(courseStep || 1) === 1 && <CourseStep1 />}
        {(courseStep || 1) === 2 && <CoursePlanningStep />}
        {(courseStep || 1) === 3 && <ContentBuilderStep />}
        {(courseStep || 1) === 4 && <CourseStep4 />}
      </div>
    </div>
  );
};

export default CourseBuilder;
