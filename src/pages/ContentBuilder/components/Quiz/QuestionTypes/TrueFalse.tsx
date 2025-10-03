import React from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircle } from '@mdi/js';
import { QuizQuestion } from '../../../types';

interface TrueFalseProps {
  question: QuizQuestion;
  userAnswer?: string;
  onAnswerChange?: (answer: string) => void;
  onUpdate?: (updates: Partial<QuizQuestion>) => void;
  isPreview?: boolean;
}

const TrueFalse: React.FC<TrueFalseProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  onUpdate,
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
      <span className="block text-sm font-medium text-gray-700 mb-2">
        Correct Answer
      </span>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${question.id}`}
            value="true"
            checked={question.correctAnswer === 'true'}
            onChange={(e) => handleCorrectAnswerChange(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-gray-900">True</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${question.id}`}
            value="false"
            checked={question.correctAnswer === 'false'}
            onChange={(e) => handleCorrectAnswerChange(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-gray-900">False</span>
        </label>
      </div>
    </div>
  );

  const renderPreviewMode = () => (
    <div className="space-y-3">
      <div className="flex gap-4">
        <label
          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors flex-1 ${
            userAnswer === 'true'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value="true"
            checked={userAnswer === 'true'}
            onChange={(e) => handleOptionSelect(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />

          <span className="text-lg font-medium text-gray-900">True</span>

          {userAnswer === 'true' && (
            <Icon
              path={mdiCheckCircle}
              size={1.2}
              className="text-blue-600 ml-auto"
            />
          )}
        </label>

        <label
          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors flex-1 ${
            userAnswer === 'false'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value="false"
            checked={userAnswer === 'false'}
            onChange={(e) => handleOptionSelect(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />

          <span className="text-lg font-medium text-gray-900">False</span>

          {userAnswer === 'false' && (
            <Icon
              path={mdiCheckCircle}
              size={1.2}
              className="text-blue-600 ml-auto"
            />
          )}
        </label>
      </div>
    </div>
  );

  return <div>{isEditing ? renderEditingMode() : renderPreviewMode()}</div>;
};

export default TrueFalse;
