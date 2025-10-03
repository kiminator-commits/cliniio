import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiRobot,
  mdiLoading,
  mdiCheck,
  mdiPlus,
  mdiInformationOutline,
} from '@mdi/js';
import {
  LearningObjectivesService,
  LearningObjectiveSuggestion,
} from '@/services/ai/learningObjectivesService';

interface SmartObjectivesPanelProps {
  courseTitle: string;
  courseDescription: string;
  prerequisites: string[];
  linkedPrerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onObjectiveSelect: (objective: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const SmartObjectivesPanel: React.FC<SmartObjectivesPanelProps> = ({
  courseTitle,
  courseDescription,
  prerequisites,
  linkedPrerequisites,
  difficulty,
  onObjectiveSelect,
  isVisible,
  onClose,
}) => {
  const [suggestions, setSuggestions] = useState<LearningObjectiveSuggestion[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [addedObjectives, setAddedObjectives] = useState<Set<string>>(
    new Set()
  );

  const generateSuggestions = async () => {
    if (!courseTitle.trim() && !courseDescription.trim()) {
      alert(
        'Please add a course title and description first to generate smart suggestions.'
      );
      return;
    }

    setIsGenerating(true);
    try {
      const newSuggestions =
        await LearningObjectivesService.generateLearningObjectives({
          title: courseTitle,
          description: courseDescription,
          prerequisites: prerequisites.filter((p) => p.trim()),
          linkedPrerequisites,
          difficulty,
        });

      setSuggestions(newSuggestions);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate AI suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleObjectiveAdd = (suggestion: LearningObjectiveSuggestion) => {
    onObjectiveSelect(suggestion.objective);
    setAddedObjectives((prev) => new Set([...prev, suggestion.objective]));
  };

  const getBloomsLevelColor = (level: string) => {
    const colors = {
      remember: 'text-blue-600 bg-blue-50',
      understand: 'text-green-600 bg-green-50',
      apply: 'text-yellow-600 bg-yellow-50',
      analyze: 'text-orange-600 bg-orange-50',
      evaluate: 'text-red-600 bg-red-50',
      create: 'text-purple-600 bg-purple-50',
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getBloomsLevelDescription = (level: string) => {
    const descriptions = {
      remember: 'Recall facts and basic concepts',
      understand: 'Explain ideas or concepts',
      apply: 'Use information in new situations',
      analyze: 'Draw connections among ideas',
      evaluate: 'Justify a stand or decision',
      create: 'Produce new or original work',
    };
    return (
      descriptions[level as keyof typeof descriptions] || 'Learning objective'
    );
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon path={mdiRobot} size={1} className="text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Smart Learning Objectives
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {!hasGenerated && (
        <div className="text-center py-6">
          <Icon
            path={mdiRobot}
            size={2}
            className="text-gray-300 mx-auto mb-3"
          />
          <p className="text-gray-600 mb-4">
            Get AI-powered suggestions for learning objectives based on your
            course details
          </p>
          <button
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#45b8b3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Icon path={mdiRobot} size={0.8} className="text-purple-600" />
                Generate Smart Suggestions
              </>
            )}
          </button>
        </div>
      )}

      {hasGenerated && suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Icon
              path={mdiInformationOutline}
              size={0.8}
              className="text-blue-500"
            />
            <p className="text-sm text-gray-600">
              AI-generated suggestions based on your course details. Click to
              add to your objectives.
            </p>
          </div>

          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 hover:border-[#4ECDC4] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-2">
                    {suggestion.objective}
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getBloomsLevelColor(suggestion.bloomsLevel)}`}
                    >
                      {suggestion.bloomsLevel.charAt(0).toUpperCase() +
                        suggestion.bloomsLevel.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Confidence: {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    <strong>Why this fits:</strong> {suggestion.reasoning}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Bloom's Level:</strong>{' '}
                    {getBloomsLevelDescription(suggestion.bloomsLevel)}
                  </p>
                </div>

                <button
                  onClick={() => handleObjectiveAdd(suggestion)}
                  disabled={addedObjectives.has(suggestion.objective)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    addedObjectives.has(suggestion.objective)
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-[#4ECDC4] text-white hover:bg-[#45b8b3]'
                  }`}
                >
                  {addedObjectives.has(suggestion.objective) ? (
                    <>
                      <Icon path={mdiCheck} size={0.6} />
                      Added
                    </>
                  ) : (
                    <>
                      <Icon path={mdiPlus} size={0.6} />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={generateSuggestions}
              disabled={isGenerating}
              className="text-sm text-[#4ECDC4] hover:text-[#45b8b3] font-medium transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate New Suggestions'}
            </button>
          </div>
        </div>
      )}

      {hasGenerated && suggestions.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-3">
            No suggestions generated. Try updating your course details and
            generate again.
          </p>
          <button
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="text-[#4ECDC4] hover:text-[#45b8b3] font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartObjectivesPanel;
