import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiTrashCan, mdiPencil, mdiClipboardText } from '@mdi/js';
import { useContentBuilder } from '../../context';
import { useContentBuilderActions } from '../../hooks';

const CourseStep3: React.FC = () => {
  const { state } = useContentBuilder();
  const { addAssessment, updateAssessment, removeAssessment } =
    useContentBuilderActions();
  const { courseData } = state;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">
          Assessments & Quizzes
        </h4>
        <button
          onClick={addAssessment}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0]"
        >
          <Icon path={mdiPlus} size={1} className="mr-2" />
          Add Assessment
        </button>
      </div>

      {courseData.assessments.length === 0 ? (
        <div className="text-center py-12">
          <Icon
            path={mdiClipboardText}
            size={3}
            className="mx-auto text-gray-400 mb-4"
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assessments yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add quizzes and assessments to test learner knowledge
          </p>
          <button
            onClick={addAssessment}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0]"
          >
            <Icon path={mdiPlus} size={1} className="mr-2" />
            Create First Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courseData.assessments.map((assessment, assessmentIndex) => (
            <div
              key={assessment.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={assessment.title}
                  onChange={(e) =>
                    updateAssessment(assessment.id, { title: e.target.value })
                  }
                  className="text-lg font-medium border-none focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] rounded px-2"
                />
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                    <Icon path={mdiPencil} size={1} />
                  </button>
                  <button
                    onClick={() => removeAssessment(assessment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Icon path={mdiTrashCan} size={1} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor={`passing-score-${assessmentIndex}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Passing Score (%)
                  </label>
                  <input
                    id={`passing-score-${assessmentIndex}`}
                    type="number"
                    value={assessment.passingScore}
                    onChange={(e) =>
                      updateAssessment(assessment.id, {
                        passingScore: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`time-limit-${assessmentIndex}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Time Limit (minutes)
                  </label>
                  <input
                    id={`time-limit-${assessmentIndex}`}
                    type="number"
                    value={assessment.timeLimit || ''}
                    onChange={(e) =>
                      updateAssessment(assessment.id, {
                        timeLimit: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                    placeholder="No limit"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {assessment.questions.length} questions
                </span>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Icon path={mdiPlus} size={1} className="mr-2" />
                  Add Question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseStep3;
