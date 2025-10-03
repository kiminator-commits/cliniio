import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiCheckCircle } from '@mdi/js';
import { QuizQuestion } from '../../../types';

interface MultipleChoiceProps {
  question: QuizQuestion;
  userAnswer?: string;
  onAnswerChange?: (answer: string) => void;
  onUpdate?: (updates: Partial<QuizQuestion>) => void;
  onAddOption?: () => void;
  onRemoveOption?: (index: number) => void;
  onUpdateOption?: (index: number, value: string) => void;
  isPreview?: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  onUpdate,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  isPreview = false,
}) => {
  const isEditing = !isPreview && onUpdate;

  const handleOptionSelect = (option: string) => {
    if (onAnswerChange) {
      onAnswerChange(option);
    }
  };

  const handleCorrectAnswerChange = (option: string) => {
    if (onUpdate) {
      onUpdate({ correctAnswer: option });
    }
  };

  const renderEditingMode = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-gray-700">
          Answer Options
        </span>
        {onAddOption && (
          <button
            onClick={onAddOption}
            disabled={!question.options || question.options.length >= 8}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Icon path={mdiPlus} size={0.8} />
            Add Option
          </button>
        )}
      </div>

      {question.options?.map((option, index) => (
        <div key={index} className="flex items-center gap-3">
          <input
            type="radio"
            name={`correct-${question.id}`}
            id={`option-${question.id}-${index}`}
            value={option}
            checked={question.correctAnswer === option}
            onChange={(e) => handleCorrectAnswerChange(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />

          <input
            type="text"
            value={option}
            onChange={(e) => onUpdateOption?.(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {onRemoveOption &&
            question.options &&
            question.options.length > 2 && (
              <button
                onClick={() => onRemoveOption(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            )}
        </div>
      ))}

      {(!question.options || question.options.length === 0) && (
        <div className="text-sm text-gray-500 italic">
          No options added yet. Add at least 2 options.
        </div>
      )}
    </div>
  );

  const renderPreviewMode = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label
          key={index}
          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
            userAnswer === option
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option}
            checked={userAnswer === option}
            onChange={(e) => handleOptionSelect(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />

          <span className="text-gray-900">{option}</span>

          {userAnswer === option && (
            <Icon
              path={mdiCheckCircle}
              size={1}
              className="text-blue-600 ml-auto"
            />
          )}
        </label>
      ))}
    </div>
  );

  return <div>{isEditing ? renderEditingMode() : renderPreviewMode()}</div>;
};

export default MultipleChoice;
