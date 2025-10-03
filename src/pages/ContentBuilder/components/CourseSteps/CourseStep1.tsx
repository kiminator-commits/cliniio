import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiTrashCan, mdiRobot } from '@mdi/js';
import { useContentBuilder } from '../../context';
import { useContentBuilderActions } from '../../hooks';
import LinkedPrerequisiteInput from './LinkedPrerequisiteInput';
import SmartObjectivesPanel from './SmartObjectivesPanel';

const CourseStep1: React.FC = () => {
  const { state } = useContentBuilder();
  const { updateCourseField } = useContentBuilderActions();
  const { courseData } = state;
  const [prerequisiteType, setPrerequisiteType] = useState<'text' | 'linked'>(
    'text'
  );
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);

  const updateObjectives = (index: number, value: string) => {
    const newObjectives = [...(courseData.objectives || [])];
    newObjectives[index] = value;
    updateCourseField({ objectives: newObjectives });
  };

  const removeObjective = (index: number) => {
    const newObjectives = (courseData.objectives || []).filter(
      (_, i) => i !== index
    );
    updateCourseField({ objectives: newObjectives });
  };

  const addObjective = () => {
    updateCourseField({ objectives: [...(courseData.objectives || []), ''] });
  };

  const updatePrerequisites = (index: number, value: string) => {
    const newPrereqs = [...(courseData.prerequisites || [])];
    newPrereqs[index] = value;
    updateCourseField({ prerequisites: newPrereqs });
  };

  const removePrerequisite = (index: number) => {
    const newPrereqs = (courseData.prerequisites || []).filter(
      (_, i) => i !== index
    );
    updateCourseField({ prerequisites: newPrereqs });
  };

  const addPrerequisite = () => {
    updateCourseField({
      prerequisites: [...(courseData.prerequisites || []), ''],
    });
  };

  const updateLinkedPrerequisites = (index: number, value: string) => {
    const newLinkedPrereqs = [...(courseData.linkedPrerequisites || [])];
    newLinkedPrereqs[index] = value;
    updateCourseField({ linkedPrerequisites: newLinkedPrereqs });
  };

  const removeLinkedPrerequisite = (index: number) => {
    const newLinkedPrereqs = (courseData.linkedPrerequisites || []).filter(
      (_, i) => i !== index
    );
    updateCourseField({ linkedPrerequisites: newLinkedPrereqs });
  };

  const addLinkedPrerequisite = () => {
    updateCourseField({
      linkedPrerequisites: [...(courseData.linkedPrerequisites || []), ''],
    });
  };

  const handleSmartObjectiveAdd = (objective: string) => {
    // Add to existing objectives, replacing empty ones first
    const currentObjectives = courseData.objectives || [''];
    const emptyIndex = currentObjectives.findIndex((obj) => !obj.trim());

    if (emptyIndex >= 0) {
      // Replace empty objective
      const newObjectives = [...currentObjectives];
      newObjectives[emptyIndex] = objective;
      updateCourseField({ objectives: newObjectives });
    } else {
      // Add new objective
      updateCourseField({ objectives: [...currentObjectives, objective] });
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Course Overview</h4>

      <div>
        <label
          htmlFor="course-title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Course Title *
        </label>
        <input
          id="course-title"
          type="text"
          value={courseData.title}
          onChange={(e) => updateCourseField({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
          placeholder="Enter course title..."
        />
      </div>

      <div>
        <label
          htmlFor="course-description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Course Description *
        </label>
        <textarea
          id="course-description"
          rows={4}
          value={courseData.description}
          onChange={(e) => updateCourseField({ description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
          placeholder="Describe what learners will gain from this course..."
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-3">
          Prerequisites
        </span>

        {/* Prerequisites Toggle */}
        <div className="flex space-x-1 mb-4 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setPrerequisiteType('text')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              prerequisiteType === 'text'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Text Prerequisites
          </button>
          <button
            onClick={() => setPrerequisiteType('linked')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              prerequisiteType === 'linked'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Library Courses
          </button>
        </div>

        {/* Text Prerequisites */}
        {prerequisiteType === 'text' && (
          <div className="space-y-3">
            {(courseData.prerequisites || []).map((prereq, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  id={`course-prereq-${index}`}
                  type="text"
                  value={prereq}
                  onChange={(e) => updatePrerequisites(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  placeholder={`Prerequisite ${index + 1}...`}
                />
                {(courseData.prerequisites || []).length > 1 && (
                  <button
                    onClick={() => removePrerequisite(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Icon path={mdiTrashCan} size={1} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addPrerequisite}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Icon path={mdiPlus} size={1} className="mr-2" />
              Add Text Prerequisite
            </button>
          </div>
        )}

        {/* Linked Prerequisites */}
        {prerequisiteType === 'linked' && (
          <div className="space-y-3">
            {(courseData.linkedPrerequisites || []).map((prereqId, index) => (
              <div key={index}>
                <LinkedPrerequisiteInput
                  value={prereqId}
                  onChange={(value) => updateLinkedPrerequisites(index, value)}
                  onRemove={() => removeLinkedPrerequisite(index)}
                  placeholder="Search for a course in the library..."
                />
              </div>
            ))}
            <button
              onClick={addLinkedPrerequisite}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Icon path={mdiPlus} size={1} className="mr-2" />
              Add Library Course
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="course-objectives"
            className="block text-sm font-medium text-gray-700"
          >
            Learning Objectives
          </label>
          <button
            onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
            className="inline-flex items-center gap-2 px-3 py-1 text-sm text-[#4ECDC4] hover:text-[#45b8b3] font-medium transition-colors"
          >
            <Icon path={mdiRobot} size={0.7} className="text-purple-600" />
            {showSmartSuggestions ? 'Hide' : 'Get'} AI Suggestions
          </button>
        </div>

        {/* Smart Suggestions Panel */}
        <SmartObjectivesPanel
          courseTitle={courseData.title}
          courseDescription={courseData.description}
          prerequisites={courseData.prerequisites || []}
          linkedPrerequisites={courseData.linkedPrerequisites || []}
          difficulty={courseData.difficulty}
          onObjectiveSelect={handleSmartObjectiveAdd}
          isVisible={showSmartSuggestions}
          onClose={() => setShowSmartSuggestions(false)}
        />
        {(courseData.objectives || []).map((objective, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              id={`course-objective-${index}`}
              type="text"
              value={objective}
              onChange={(e) => updateObjectives(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              placeholder={`Learning objective ${index + 1}...`}
            />
            {(courseData.objectives || []).length > 1 && (
              <button
                onClick={() => removeObjective(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <Icon path={mdiTrashCan} size={1} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addObjective}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Icon path={mdiPlus} size={1} className="mr-2" />
          Add Objective
        </button>
      </div>
    </div>
  );
};

export default CourseStep1;
