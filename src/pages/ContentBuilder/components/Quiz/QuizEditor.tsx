import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiTrashCan, mdiChevronUp, mdiChevronDown } from '@mdi/js';
import { QuizQuestion } from '../../types';
import MultipleChoice from './QuestionTypes/MultipleChoice';
import TrueFalse from './QuestionTypes/TrueFalse';
import FillBlank from './QuestionTypes/FillBlank';
import Matching from './QuestionTypes/Matching';
import DragDrop from './QuestionTypes/DragDrop';
import Hotspot from './QuestionTypes/Hotspot';

interface QuizEditorProps {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const QuizEditor: React.FC<QuizEditorProps> = ({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateQuestionField = (
    field: keyof QuizQuestion,
    value: QuizQuestion[keyof QuizQuestion]
  ) => {
    onUpdate({ [field]: value });
  };

  const addOption = () => {
    if (question.options && question.options.length < 8) {
      onUpdate({
        options: [...question.options, ''],
      });
    }
  };

  const removeOption = (index: number) => {
    if (question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== index);
      onUpdate({ options: newOptions });

      // Update correct answer if it was the removed option
      if (question.correctAnswer === question.options[index]) {
        onUpdate({ correctAnswer: newOptions[0] || '' });
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    if (question.options) {
      const newOptions = [...question.options];
      newOptions[index] = value;
      onUpdate({ options: newOptions });

      // Update correct answer if it was the changed option
      if (question.correctAnswer === question.options[index]) {
        onUpdate({ correctAnswer: value });
      }
    }
  };

  const renderQuestionTypeEditor = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <MultipleChoice
            question={question}
            onUpdate={onUpdate}
            onAddOption={addOption}
            onRemoveOption={removeOption}
            onUpdateOption={updateOption}
          />
        );

      case 'true-false':
        return <TrueFalse question={question} onUpdate={onUpdate} />;

      case 'fill-blank':
        return <FillBlank question={question} onUpdate={onUpdate} />;

      case 'matching':
        return <Matching question={question} onUpdate={onUpdate} />;

      case 'drag-drop':
        return <DragDrop question={question} onUpdate={onUpdate} />;

      case 'hotspot':
        return <Hotspot question={question} onUpdate={onUpdate} />;

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-center gap-3">
        <select
          value={question.type}
          onChange={(e) => updateQuestionField('type', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="true-false">True/False</option>
          <option value="fill-blank">Fill in the Blank</option>
          <option value="matching">Matching</option>
          <option value="drag-drop">Drag & Drop</option>
          <option value="hotspot">Hotspot</option>
        </select>

        <select
          value={question.difficulty}
          onChange={(e) => updateQuestionField('difficulty', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <input
          type="number"
          value={question.points}
          onChange={(e) =>
            updateQuestionField('points', parseInt(e.target.value) || 1)
          }
          className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          max="10"
        />
        <span className="text-sm text-gray-600">points</span>
      </div>

      {/* Question Text */}
      <div>
        <label
          htmlFor="question-text"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Question Text *
        </label>
        <textarea
          id="question-text"
          value={question.question}
          onChange={(e) => updateQuestionField('question', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Enter your question..."
        />
      </div>

      {/* Question Type Specific Editor */}
      {renderQuestionTypeEditor()}

      {/* Explanation */}
      <div>
        <label
          htmlFor="question-explanation"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Explanation (optional)
        </label>
        <textarea
          id="question-explanation"
          value={question.explanation || ''}
          onChange={(e) => updateQuestionField('explanation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Explain why this answer is correct..."
        />
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="question-tags"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tags (optional)
        </label>
        <input
          id="question-tags"
          type="text"
          value={question.tags?.join(', ') || ''}
          onChange={(e) => {
            const tags = e.target.value
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag);
            updateQuestionField('tags', tags);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter tags separated by commas..."
        />
      </div>

      {/* Advanced Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`randomize-${question.id}`}
                checked={
                  (question as { randomizeQuestions?: boolean })
                    .randomizeQuestions || false
                }
                onChange={(e) =>
                  updateQuestionField(
                    'randomizeQuestions' as keyof QuizQuestion,
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`randomize-${question.id}`}
                className="text-sm text-gray-700"
              >
                Randomize answer options
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`p-2 rounded-md transition-colors ${
              canMoveUp
                ? 'text-gray-600 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <Icon path={mdiChevronUp} size={1} />
          </button>

          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`p-2 rounded-md transition-colors ${
              canMoveDown
                ? 'text-gray-600 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <Icon path={mdiChevronDown} size={1} />
          </button>
        </div>

        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Icon path={mdiTrashCan} size={1} />
        </button>
      </div>
    </div>
  );
};

export default QuizEditor;
