import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiRobot, mdiCheck, mdiClock, mdiTarget, mdiHammer } from '@mdi/js';
import { useContentBuilder } from '../../context';
import { useContentBuilderActions } from '../../hooks';

interface AICourseSuggestion {
  modules: number;
  lessonsPerModule: number;
  assessments: number;
  reasoning: string;
  confidence: number;
}

const CoursePlanningStep: React.FC = () => {
  const { state } = useContentBuilder();
  const { updateCourseField, bulkCreateCourseStructure, setCourseStep } =
    useContentBuilderActions();
  const { courseData } = state;

  const [aiSuggestion, setAiSuggestion] = useState<AICourseSuggestion | null>(
    null
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customStructure, setCustomStructure] = useState({
    modules: 3,
    lessonsPerModule: 2,
    assessments: 1,
  });

  // Generate AI suggestion based on course details
  const generateAISuggestion = async () => {
    if (!courseData.title.trim() && !courseData.description.trim()) {
      alert(
        'Please add a course title and description first to get AI suggestions.'
      );
      return;
    }

    setIsGeneratingAI(true);
    try {
      // Simulate AI analysis - in production, this would call an AI service
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const suggestion: AICourseSuggestion = {
        modules: courseData.title.toLowerCase().includes('comprehensive')
          ? 5
          : 3,
        lessonsPerModule: courseData.difficulty === 'beginner' ? 2 : 3,
        assessments: courseData.difficulty === 'beginner' ? 1 : 2,
        reasoning: `Based on your "${courseData.title}" course and ${courseData.difficulty} difficulty level, we recommend this structure for optimal learning outcomes.`,
        confidence: 0.85,
      };

      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      alert('Failed to generate AI suggestion. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Apply AI suggestion
  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setCustomStructure({
        modules: aiSuggestion.modules,
        lessonsPerModule: aiSuggestion.lessonsPerModule,
        assessments: aiSuggestion.assessments,
      });

      // Create the entire course structure at once
      bulkCreateCourseStructure(
        aiSuggestion.modules,
        aiSuggestion.lessonsPerModule,
        aiSuggestion.assessments
      );

      // Update course duration
      updateCourseField({
        estimatedDuration:
          aiSuggestion.modules * aiSuggestion.lessonsPerModule * 30 +
          aiSuggestion.assessments * 15,
      });

      // Advance to next step (Content Builder)
      setCourseStep(3);
    }
  };

  // Apply custom structure
  const applyCustomStructure = () => {
    // Create the entire course structure at once
    bulkCreateCourseStructure(
      customStructure.modules,
      customStructure.lessonsPerModule,
      customStructure.assessments
    );

    // Update course duration
    updateCourseField({
      estimatedDuration:
        customStructure.modules * customStructure.lessonsPerModule * 30 +
        customStructure.assessments * 15,
    });

    // Advance to next step (Content Builder)
    setCourseStep(3);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">
          Plan Your Course Structure
        </h4>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get AI help to plan your course structure, or design it yourself if
          you know what you want.
        </p>
      </div>

      {/* AI Suggestion Section */}
      <div className="bg-gradient-to-r from-purple-25 to-blue-25 border border-purple-100 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon path={mdiRobot} size={1.2} className="text-purple-500" />
          <h5 className="text-base font-semibold text-gray-800">
            Option 1: Get Help
          </h5>
        </div>

        {!aiSuggestion ? (
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              Get intelligent suggestions for your course structure based on
              your title, description, and objectives.
            </p>
            <button
              onClick={generateAISuggestion}
              disabled={isGeneratingAI}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isGeneratingAI ? (
                <>
                  <Icon path={mdiClock} size={0.8} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Icon path={mdiRobot} size={0.8} />
                  Get AI Suggestion
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h6 className="font-medium text-gray-800 mb-2 text-sm">
                  AI Recommendation
                </h6>
                <p className="text-xs text-gray-500 mb-3">
                  {aiSuggestion.reasoning}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 bg-purple-25 rounded-md border border-purple-100">
                    <div className="text-lg font-bold text-purple-500">
                      {aiSuggestion.modules}
                    </div>
                    <div className="text-xs text-purple-500">Modules</div>
                  </div>
                  <div className="text-center p-2 bg-blue-25 rounded-md border border-blue-100">
                    <div className="text-lg font-bold text-blue-500">
                      {aiSuggestion.lessonsPerModule}
                    </div>
                    <div className="text-xs text-blue-500">Lessons/Module</div>
                  </div>
                  <div className="text-center p-2 bg-green-25 rounded-md border border-green-100">
                    <div className="text-lg font-bold text-green-500">
                      {aiSuggestion.assessments}
                    </div>
                    <div className="text-xs text-green-500">Assessments</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Icon path={mdiTarget} size={0.6} />
                  Confidence: {Math.round(aiSuggestion.confidence * 100)}%
                </div>
              </div>

              <button
                onClick={applyAISuggestion}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
              >
                <Icon path={mdiCheck} size={0.7} />
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Structure Section */}
      <div className="bg-gradient-to-r from-blue-25 to-green-25 border border-blue-100 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon path={mdiHammer} size={1.2} className="text-blue-500" />
          <h5 className="text-base font-semibold text-gray-800">
            Option 2: Self-Guided
          </h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              htmlFor="modules-input"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Number of Modules
            </label>
            <input
              id="modules-input"
              type="number"
              min="1"
              max="10"
              value={customStructure.modules}
              onChange={(e) =>
                setCustomStructure((prev) => ({
                  ...prev,
                  modules: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="lessons-input"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Lessons per Module
            </label>
            <input
              id="lessons-input"
              type="number"
              min="1"
              max="10"
              value={customStructure.lessonsPerModule}
              onChange={(e) =>
                setCustomStructure((prev) => ({
                  ...prev,
                  lessonsPerModule: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="assessments-input"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Number of Assessments
            </label>
            <input
              id="assessments-input"
              type="number"
              min="0"
              max="10"
              value={customStructure.assessments}
              onChange={(e) =>
                setCustomStructure((prev) => ({
                  ...prev,
                  assessments: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white border border-gray-200 rounded-md p-2">
            <span className="block text-xs font-medium text-gray-600 mb-1">
              Estimated Course Duration
            </span>
            <div className="text-sm font-semibold text-gray-800">
              ~
              {customStructure.modules * customStructure.lessonsPerModule * 30 +
                customStructure.assessments * 15}{' '}
              minutes
            </div>
          </div>

          <div></div>

          <div className="flex items-end justify-end">
            <button
              onClick={applyCustomStructure}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
            >
              <Icon path={mdiCheck} size={0.7} />
              Apply Custom Structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlanningStep;
