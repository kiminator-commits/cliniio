import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiDrag } from '@mdi/js';
import { QuizQuestion } from '../../../types';

interface MatchingProps {
  question: QuizQuestion;
  userAnswer?: Record<string, string>;
  onAnswerChange?: (answer: Record<string, string>) => void;
  onUpdate?: (updates: Partial<QuizQuestion>) => void;
  isPreview?: boolean;
}

const Matching: React.FC<MatchingProps> = ({
  question,
  userAnswer = {},
  onAnswerChange,
  onUpdate,
  isPreview = false,
}) => {
  const isEditing = !isPreview && onUpdate;

  const handleMatchChange = (leftItem: string, rightItem: string) => {
    if (onAnswerChange) {
      const newAnswer = { ...userAnswer, [leftItem]: rightItem };
      onAnswerChange(newAnswer);
    }
  };

  const addMatchingPair = () => {
    if (onUpdate) {
      const currentOptions = question.options || [];
      const newOptions = [
        ...currentOptions,
        `Item ${currentOptions.length + 1}`,
        `Match ${currentOptions.length + 1}`,
      ];
      onUpdate({ options: newOptions });
    }
  };

  const removeMatchingPair = (index: number) => {
    if (onUpdate && question.options) {
      const newOptions = question.options.filter(
        (_, i) => i < index * 2 || i >= (index + 1) * 2
      );
      onUpdate({ options: newOptions });
    }
  };

  const updateMatchingItem = (
    index: number,
    isLeft: boolean,
    value: string
  ) => {
    if (onUpdate && question.options) {
      const newOptions = [...question.options];
      const actualIndex = index * 2 + (isLeft ? 0 : 1);
      newOptions[actualIndex] = value;
      onUpdate({ options: newOptions });
    }
  };

  const renderEditingMode = () => {
    const options = question.options || [];
    const pairs = [];

    for (let i = 0; i < options.length; i += 2) {
      if (i + 1 < options.length) {
        pairs.push([options[i], options[i + 1]]);
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium text-gray-700">
            Matching Pairs
          </span>
          <button
            onClick={addMatchingPair}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Icon path={mdiPlus} size={0.8} />
            Add Pair
          </button>
        </div>

        {pairs.map((pair, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
          >
            <Icon
              path={mdiDrag}
              size={1}
              className="text-gray-400 cursor-move"
            />

            <div className="flex-1 grid grid-cols-2 gap-4">
              <input
                type="text"
                value={pair[0]}
                onChange={(e) =>
                  updateMatchingItem(index, true, e.target.value)
                }
                placeholder="Left item..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                value={pair[1]}
                onChange={(e) =>
                  updateMatchingItem(index, false, e.target.value)
                }
                placeholder="Right item..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {pairs.length > 1 && (
              <button
                onClick={() => removeMatchingPair(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            )}
          </div>
        ))}

        {pairs.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No matching pairs added yet. Add at least one pair.
          </div>
        )}
      </div>
    );
  };

  const renderPreviewMode = () => {
    const options = question.options || [];
    const leftItems = [];
    const rightItems: string[] = [];

    for (let i = 0; i < options.length; i += 2) {
      if (i + 1 < options.length) {
        leftItems.push(options[i]);
        rightItems.push(options[i + 1]);
      }
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Items to Match</h4>
            {leftItems.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Select Matches</h4>
            {leftItems.map((leftItem, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <select
                  value={userAnswer[leftItem] || ''}
                  onChange={(e) => handleMatchChange(leftItem, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a match...</option>
                  {rightItems.map((rightItem, rightIndex) => (
                    <option key={rightIndex} value={rightItem}>
                      {rightItem}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return <div>{isEditing ? renderEditingMode() : renderPreviewMode()}</div>;
};

export default Matching;
