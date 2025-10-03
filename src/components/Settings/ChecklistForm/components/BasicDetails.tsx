import React from 'react';
import Icon from '@mdi/react';
import { mdiRobot, mdiLightbulb, mdiClose } from '@mdi/js';
import { categories } from '../data/categories';
import { ChecklistFormData } from '../../../../types/checklistTypes';

interface BasicDetailsProps {
  checklistFormData: ChecklistFormData;
  setChecklistFormData: (data: ChecklistFormData) => void;
  showAIChecklistSuggestions: boolean;
  isGeneratingSuggestions: boolean;
  aiChecklistSuggestions: string[];
  onGenerateAISuggestions: () => void;
  onApplyAISuggestion: (suggestion: string) => void;
  onCloseAISuggestions: () => void;
}

export const BasicDetails: React.FC<BasicDetailsProps> = ({
  checklistFormData,
  setChecklistFormData,
  showAIChecklistSuggestions,
  isGeneratingSuggestions,
  aiChecklistSuggestions,
  onGenerateAISuggestions,
  onApplyAISuggestion,
  onCloseAISuggestions,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="checklist-title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Checklist Title
        </label>
        <div className="flex space-x-2">
          <input
            id="checklist-title"
            type="text"
            value={checklistFormData.title}
            onChange={(e) =>
              setChecklistFormData({
                ...checklistFormData,
                title: e.target.value,
              })
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            placeholder="e.g., Treatment Room Setup"
          />
          <button
            onClick={onGenerateAISuggestions}
            disabled={isGeneratingSuggestions}
            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            title="Get AI suggestions for checklist titles"
          >
            <Icon path={mdiRobot} size={0.8} className="mr-1" />
            {isGeneratingSuggestions ? '...' : 'AI'}
          </button>
        </div>

        {/* AI Checklist Suggestions */}
        {showAIChecklistSuggestions && (
          <div className="mt-3 p-3 border border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-purple-800 flex items-center">
                <Icon path={mdiLightbulb} size={0.8} className="mr-1" />
                AI Suggestions
              </h5>
              <button
                onClick={onCloseAISuggestions}
                className="text-purple-600 hover:text-purple-800"
              >
                <Icon path={mdiClose} size={0.8} />
              </button>
            </div>
            <div className="space-y-2">
              {aiChecklistSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onApplyAISuggestion(suggestion)}
                  className="w-full text-left p-2 text-sm text-purple-700 hover:bg-purple-100 rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="checklist-category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <select
          id="checklist-category"
          value={checklistFormData.category}
          onChange={(e) =>
            setChecklistFormData({
              ...checklistFormData,
              category: e.target.value as
                | 'setup'
                | 'patient'
                | 'weekly'
                | 'public'
                | 'deep',
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
