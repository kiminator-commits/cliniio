import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiDrag } from '@mdi/js';
import { QuizQuestion } from '../../../types';

interface DragDropProps {
  question: QuizQuestion;
  userAnswer?: string[];
  onAnswerChange?: (answer: string[]) => void;
  onUpdate?: (updates: Partial<QuizQuestion>) => void;
  isPreview?: boolean;
}

const DragDrop: React.FC<DragDropProps> = ({
  question,
  userAnswer = [],
  onAnswerChange,
  onUpdate,
  isPreview = false,
}) => {
  const isEditing = !isPreview && onUpdate;
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const addDragItem = () => {
    if (onUpdate) {
      const currentOptions = question.options || [];
      onUpdate({
        options: [...currentOptions, `Item ${currentOptions.length + 1}`],
      });
    }
  };

  const removeDragItem = (index: number) => {
    if (onUpdate && question.options) {
      const newOptions = question.options.filter((_, i) => i !== index);
      onUpdate({ options: newOptions });
    }
  };

  const updateDragItem = (index: number, value: string) => {
    if (onUpdate && question.options) {
      const newOptions = [...question.options];
      newOptions[index] = value;
      onUpdate({ options: newOptions });
    }
  };

  const handleDragStart = (item: string) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItem && onAnswerChange) {
      const newAnswer = [...userAnswer];
      const draggedIndex = newAnswer.indexOf(draggedItem);

      if (draggedIndex !== -1) {
        newAnswer.splice(draggedIndex, 1);
      }

      newAnswer.splice(targetIndex, 0, draggedItem);
      onAnswerChange(newAnswer);
      setDraggedItem(null);
    }
  };

  const renderEditingMode = () => {
    const options = question.options || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium text-gray-700">
            Drag & Drop Items
          </span>
          <button
            onClick={addDragItem}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Icon path={mdiPlus} size={0.8} />
            Add Item
          </button>
        </div>

        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
          >
            <Icon
              path={mdiDrag}
              size={1}
              className="text-gray-400 cursor-move"
            />

            <input
              type="text"
              value={option}
              onChange={(e) => updateDragItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {options.length > 1 && (
              <button
                onClick={() => removeDragItem(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            )}
          </div>
        ))}

        {options.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No items added yet. Add at least 2 items.
          </div>
        )}

        <div className="text-sm text-gray-500">
          Learners will drag these items to reorder them in the correct
          sequence.
        </div>
      </div>
    );
  };

  const renderPreviewMode = () => {
    const options = question.options || [];
    const answer = userAnswer.length > 0 ? userAnswer : [...options];

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Drag items to reorder them:
          </h4>

          {/* Answer Area */}
          <div className="min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {answer.map((item, index) => (
              <div
                key={`${item}-${index}`}
                draggable
                onDragStart={() => handleDragStart(item)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className="inline-block m-2 p-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
              >
                {item}
              </div>
            ))}

            {answer.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Drag items here to answer
              </div>
            )}
          </div>
        </div>

        {/* Available Items */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Available Items:</h4>
          <div className="flex flex-wrap gap-2">
            {options.map((item, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="inline-block p-3 bg-blue-100 border border-blue-300 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return <div>{isEditing ? renderEditingMode() : renderPreviewMode()}</div>;
};

export default DragDrop;
