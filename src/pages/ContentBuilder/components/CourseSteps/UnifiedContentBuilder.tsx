import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiTrashCan,
  mdiBookOpen,
  mdiClipboardText,
  mdiChevronDown,
  mdiChevronUp,
  mdiDrag,
} from '@mdi/js';
import { useContentBuilder } from '../../context';
import { useContentBuilderActions } from '../../hooks';
import {
  ContentBuilderProgressProvider,
  CourseData,
} from './providers/ContentBuilderProgressProvider';
import { ContentBuilderUIProvider } from './providers/ContentBuilderUIProvider';
import { ContentBuilderModuleProvider } from './providers/ContentBuilderModuleProvider';
import { ContentBuilderAssessmentProvider } from './providers/ContentBuilderAssessmentProvider';

import RichTextEditor from './RichTextEditor';

// Provider instances
const progressProvider = new ContentBuilderProgressProvider();
const uiProvider = new ContentBuilderUIProvider();
const _moduleProvider = new ContentBuilderModuleProvider();
const _assessmentProvider = new ContentBuilderAssessmentProvider();

const UnifiedContentBuilder: React.FC = () => {
  const { state } = useContentBuilder();
  const {
    addModule,
    addLesson,
    addAssessment,
    updateModule,
    updateLesson,
    updateAssessment,
    removeModule,
    removeLesson,
    removeAssessment,
  } = useContentBuilderActions();

  const { courseData } = state;

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(
    new Set()
  );
  const [showCompleted, setShowCompleted] = useState(true);

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleAssessmentExpansion = (assessmentId: string) => {
    const newExpanded = new Set(expandedAssessments);
    if (newExpanded.has(assessmentId)) {
      newExpanded.delete(assessmentId);
    } else {
      newExpanded.add(assessmentId);
    }
    setExpandedAssessments(newExpanded);
  };

  // Get progress metrics using provider
  const progressMetrics = progressProvider.getProgressMetrics(
    courseData as CourseData
  );
  const completionStatus = progressMetrics.completionStatus;
  const overallProgress = progressMetrics.overallProgress;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-900">
              Build Your Course Content
            </h4>
            <p className="text-gray-600">
              Create modules, lessons, and assessments in one unified interface
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Icon
                path={showCompleted ? mdiChevronUp : mdiChevronDown}
                size={0.8}
              />
              {showCompleted ? 'Hide' : 'Show'} Completed
            </button>

            <div className="text-right">
              <div className="text-sm text-gray-600">Course Progress</div>
              <div className="text-2xl font-bold text-purple-600">
                {overallProgress}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Modules</span>
            <span className="text-sm text-gray-500">
              {completionStatus.modules.completed}/
              {completionStatus.modules.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${completionStatus.modules.total > 0 ? (completionStatus.modules.completed / completionStatus.modules.total) * 100 : 0}%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Lessons</span>
            <span className="text-sm text-gray-500">
              {completionStatus.lessons.completed}/
              {completionStatus.lessons.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${completionStatus.lessons.total > 0 ? (completionStatus.lessons.completed / completionStatus.lessons.total) * 100 : 0}%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Assessments
            </span>
            <span className="text-sm text-gray-500">
              {completionStatus.assessments.completed}/
              {completionStatus.assessments.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${completionStatus.assessments.total > 0 ? (completionStatus.assessments.completed / completionStatus.assessments.total) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-900">
            Course Modules
          </h5>
          <button
            onClick={() => addModule()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Icon path={mdiPlus} size={0.8} />
            Add Module
          </button>
        </div>

        {courseData.modules.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <Icon
              path={mdiBookOpen}
              size={3}
              className="mx-auto text-gray-400 mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No modules yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building your course by adding the first module
            </p>
            <button
              onClick={() => addModule()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Icon path={mdiPlus} size={0.8} />
              Create First Module
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courseData.modules.map((module) => {
              const isExpanded = expandedModules.has(module.id);
              const moduleProgress =
                progressMetrics.moduleProgress[module.id] || 0;

              return (
                <div
                  key={module.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Module Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Icon
                          path={mdiDrag}
                          size={1}
                          className="text-gray-400 cursor-move"
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) =>
                                updateModule(module.id, {
                                  title: e.target.value,
                                })
                              }
                              placeholder="Module title..."
                              className="text-lg font-medium border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            />

                            <span className="text-sm text-gray-500">
                              {module.lessons.length} lesson
                              {module.lessons.length !== 1 ? 's' : ''}
                            </span>

                            {moduleProgress > 0 && (
                              <span className="text-sm text-green-600 font-medium">
                                {moduleProgress}% complete
                              </span>
                            )}
                          </div>

                          <textarea
                            value={module.description}
                            onChange={(e) =>
                              updateModule(module.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Module description..."
                            className="w-full text-sm text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 resize-none"
                            rows={1}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleModuleExpansion(module.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 hover:border-gray-300"
                        >
                          <Icon
                            path={isExpanded ? mdiChevronUp : mdiChevronDown}
                            size={0.8}
                          />
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>

                        <button
                          onClick={() => removeModule(module.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Icon path={mdiTrashCan} size={1} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Module Content (when expanded) */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50">
                      {/* Lessons */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h6 className="font-medium text-gray-900">Lessons</h6>
                          <button
                            onClick={() => addLesson(module.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Icon path={mdiPlus} size={0.6} />
                            Add Lesson
                          </button>
                        </div>

                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                path={uiProvider.getLessonTypeIcon(lesson.type)}
                                size={1}
                                className="text-gray-400"
                              />

                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(module.id, lesson.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Lesson title..."
                                  className="w-full font-medium border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                />

                                <RichTextEditor
                                  value={lesson.content}
                                  onChange={(content) =>
                                    updateLesson(module.id, lesson.id, {
                                      content,
                                    })
                                  }
                                  onSave={async (content) => {
                                    // Autosave the lesson content
                                    updateLesson(module.id, lesson.id, {
                                      content,
                                    });
                                  }}
                                  placeholder="Lesson content..."
                                  className="w-full text-sm text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 resize-none mt-1"
                                  showSaveStatus={false}
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${uiProvider.getLessonTypeColor(lesson.type)}`}
                                >
                                  {lesson.type}
                                </span>

                                <button
                                  onClick={() =>
                                    removeLesson(module.id, lesson.id)
                                  }
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Icon path={mdiTrashCan} size={0.8} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-900">
            Assessments & Quizzes
          </h5>
          <button
            onClick={() => addAssessment()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Icon path={mdiPlus} size={0.8} />
            Add Assessment
          </button>
        </div>

        {courseData.assessments.length === 0 ? (
          <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
            <Icon
              path={mdiClipboardText}
              size={2}
              className="mx-auto text-gray-400 mb-3"
            />
            <p className="text-gray-600 mb-3">
              Add quizzes and assessments to test learner knowledge
            </p>
            <button
              onClick={() => addAssessment()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Icon path={mdiPlus} size={0.8} />
              Create First Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courseData.assessments.map((assessment) => {
              const isExpanded = expandedAssessments.has(assessment.id);
              const assessmentProgress =
                progressMetrics.assessmentProgress[assessment.id] || 0;

              return (
                <div
                  key={assessment.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Assessment Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="text"
                            value={assessment.title}
                            onChange={(e) =>
                              updateAssessment(assessment.id, {
                                title: e.target.value,
                              })
                            }
                            placeholder="Assessment title..."
                            className="text-lg font-medium border-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                          />

                          <span className="text-sm text-gray-500">
                            {assessment.questions.length} question
                            {assessment.questions.length !== 1 ? 's' : ''}
                          </span>

                          {assessmentProgress > 0 && (
                            <span className="text-sm text-green-600 font-medium">
                              {assessmentProgress}% complete
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label
                              htmlFor={`passing-score-${assessment.id}`}
                              className="block text-xs font-medium text-gray-700 mb-1"
                            >
                              Passing Score (%)
                            </label>
                            <input
                              id={`passing-score-${assessment.id}`}
                              type="number"
                              value={assessment.passingScore}
                              onChange={(e) =>
                                updateAssessment(assessment.id, {
                                  passingScore: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              min="0"
                              max="100"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`time-limit-${assessment.id}`}
                              className="block text-xs font-medium text-gray-700 mb-1"
                            >
                              Time Limit (min)
                            </label>
                            <input
                              id={`time-limit-${assessment.id}`}
                              type="number"
                              value={assessment.timeLimit || ''}
                              onChange={(e) =>
                                updateAssessment(assessment.id, {
                                  timeLimit: e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() =>
                            toggleAssessmentExpansion(assessment.id)
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 hover:border-gray-300"
                        >
                          <Icon
                            path={isExpanded ? mdiChevronUp : mdiChevronDown}
                            size={0.8}
                          />
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>

                        <button
                          onClick={() => removeAssessment(assessment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Icon path={mdiTrashCan} size={1} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Content (when expanded) */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h6 className="font-medium text-gray-900">
                            Questions
                          </h6>
                          <button
                            onClick={() => {
                              // Add question functionality would go here
                              alert(
                                'Question management coming in next iteration'
                              );
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          >
                            <Icon path={mdiPlus} size={0.6} />
                            Add Question
                          </button>
                        </div>

                        {assessment.questions.length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            No questions added yet. Add questions to make this
                            assessment functional.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {assessment.questions.map((question, qIndex) => (
                              <div
                                key={qIndex}
                                className="bg-white border border-gray-200 rounded p-3"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Q{qIndex + 1}:
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {(question as { text?: string }).text ||
                                      'Question text...'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">
          Course Summary
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {courseData.modules.length}
            </div>
            <div className="text-sm text-blue-600">Modules</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {courseData.modules.reduce(
                (sum, module) => sum + module.lessons.length,
                0
              )}
            </div>
            <div className="text-sm text-green-600">Total Lessons</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {courseData.assessments.length}
            </div>
            <div className="text-sm text-purple-600">Assessments</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              ~{courseData.estimatedDuration || 0} min
            </div>
            <div className="text-sm text-orange-600">Est. Duration</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedContentBuilder;
