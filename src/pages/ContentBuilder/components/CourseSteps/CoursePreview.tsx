import React from 'react';
import Icon from '@mdi/react';
import {
  mdiEye,
  mdiPlay,
  mdiDownload,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { useContentBuilder } from '../../context';

interface CoursePreviewProps {
  collapsedSections: {
    preview: boolean;
  };
  toggleSection: (section: 'preview') => void;
  generatePreview: () => void;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  collapsedSections,
  toggleSection,
  generatePreview,
}) => {
  const { state } = useContentBuilder();
  const { courseData } = state;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50"
        onClick={() => toggleSection('preview')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection('preview');
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsedSections.preview}
      >
        <div className="flex items-center gap-3">
          <Icon path={mdiEye} size={1.2} className="text-green-600" />
          <h5 className="text-lg font-medium text-gray-900">
            Course Preview & Testing Tools
          </h5>
        </div>
        <Icon
          path={collapsedSections.preview ? mdiChevronDown : mdiChevronUp}
          size={1}
          className="text-gray-400"
        />
      </div>

      {!collapsedSections.preview && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={generatePreview}
              className="p-4 border border-blue-200 rounded-lg bg-blue-50 hover:border-blue-300 hover:bg-blue-100 transition-colors text-center"
            >
              <Icon
                path={mdiEye}
                size={1.5}
                className="mx-auto text-blue-600 mb-2"
              />
              <span className="text-sm font-medium text-blue-900">
                Preview Course
              </span>
            </button>

            <button
              onClick={() => alert('Student view simulation would open here')}
              className="p-4 border border-green-200 rounded-lg bg-green-50 hover:border-green-300 hover:bg-green-100 transition-colors text-center"
            >
              <Icon
                path={mdiPlay}
                size={1.5}
                className="mx-auto text-green-600 mb-2"
              />
              <span className="text-sm font-medium text-green-900">
                Student View
              </span>
            </button>

            <button
              onClick={() => alert('Course export options would appear here')}
              className="p-4 border border-purple-200 rounded-lg bg-purple-50 hover:border-purple-300 hover:bg-purple-100 transition-colors text-center"
            >
              <Icon
                path={mdiDownload}
                size={1.5}
                className="mx-auto text-purple-600 mb-2"
              />
              <span className="text-sm font-medium text-purple-900">
                Export Course
              </span>
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h6 className="text-sm font-medium text-gray-900 mb-3">
              Quick Stats
            </h6>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {courseData.modules.length}
                </div>
                <div className="text-xs text-gray-600">Modules</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {courseData.modules.reduce(
                    (acc, m) => acc + m.lessons.length,
                    0
                  )}
                </div>
                <div className="text-xs text-gray-600">Lessons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {courseData.settings?.estimatedDuration || 0}
                </div>
                <div className="text-xs text-gray-600">Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {courseData.assessments?.length || 0}
                </div>
                <div className="text-xs text-gray-600">Assessments</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePreview;
