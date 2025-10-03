import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose } from '@mdi/js';
import { QuizQuestion } from '../../../types';

interface FillBlankProps {
  question: QuizQuestion;
  userAnswer?: string | string[];
  onAnswerChange?: (answer: string | string[]) => void;
  onUpdate?: (updates: Partial<QuizQuestion>) => void;
  isPreview?: boolean;
}

const FillBlank: React.FC<FillBlankProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  onUpdate,
  isPreview = false,
}) => {
  const isEditing = !isPreview && onUpdate;

  const handleAnswerChange = (value: string | string[]) => {
    if (onAnswerChange) {
      onAnswerChange(value);
    }
  };

  const addBlank = () => {
    if (onUpdate) {
      const currentAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      onUpdate({ correctAnswer: [...currentAnswers, ''] });
    }
  };

  const removeBlank = (index: number) => {
    if (onUpdate) {
      const currentAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const newAnswers = currentAnswers.filter((_, i) => i !== index);
      onUpdate({
        correctAnswer: newAnswers.length === 1 ? newAnswers[0] : newAnswers,
      });
    }
  };

  const updateBlank = (index: number, value: string) => {
    if (onUpdate) {
      const currentAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const newAnswers = [...currentAnswers];
      newAnswers[index] = value;
      onUpdate({
        correctAnswer: newAnswers.length === 1 ? newAnswers[0] : newAnswers,
      });
    }
  };

  const renderEditingMode = () => {
    const answers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium text-gray-700">
            Correct Answer{answers.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={addBlank}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Icon path={mdiPlus} size={0.8} />
            Add Blank
          </button>
        </div>

        {answers.map((answer, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-8">
              Blank {index + 1}:
            </span>
            <input
              type="text"
              value={answer}
              onChange={(e) => updateBlank(index, e.target.value)}
              placeholder="Enter correct answer..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {answers.length > 1 && (
              <button
                onClick={() => removeBlank(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            )}
          </div>
        ))}

        <div className="text-sm text-gray-500">
          {answers.length === 1
            ? 'Single blank answer'
            : `${answers.length} blank answers - all must be filled correctly`}
        </div>
      </div>
    );
  };

  const renderPreviewMode = () => {
    const answers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];

    if (answers.length === 1) {
      return (
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer
          </span>
          <input
            type="text"
            value={(userAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-700 mb-2">
          Your Answers
        </span>
        {answers.map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-16">
              Blank {index + 1}:
            </span>
            <input
              type="text"
              value={Array.isArray(userAnswer) ? userAnswer[index] || '' : ''}
              onChange={(e) => {
                const newAnswers = Array.isArray(userAnswer)
                  ? [...userAnswer]
                  : [];
                newAnswers[index] = e.target.value;
                handleAnswerChange(newAnswers);
              }}
              placeholder={`Answer ${index + 1}...`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>
    );
  };

  return <div>{isEditing ? renderEditingMode() : renderPreviewMode()}</div>;
};

export default FillBlank;
