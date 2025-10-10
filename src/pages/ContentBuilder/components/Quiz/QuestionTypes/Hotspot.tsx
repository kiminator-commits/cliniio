import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiTarget } from '@mdi/js';
import { QuizQuestion } from '../../../types';

interface HotspotProps {
  question: QuizQuestion;
  userAnswer?: { x: number; y: number }[];
  onAnswerChange?: (answer: { x: number; y: number }[]) => void;
  onUpdate?: (updates: Partial<QuizQuestion>) => void;
  isPreview?: boolean;
}

const Hotspot: React.FC<HotspotProps> = ({
  question,
  userAnswer = [],
  onAnswerChange,
  onUpdate,
  isPreview = false,
}) => {
  const isEditing = !isPreview && onUpdate;
  const [imageUrl, setImageUrl] = useState(
    (question as { content?: string }).content || ''
  );
  const [hotspots, setHotspots] = useState<
    { x: number; y: number; label: string }[]
  >(question.correctAnswer ? JSON.parse(question.correctAnswer as string) : []);

  const handleImageChange = (url: string) => {
    setImageUrl(url);
    if (onUpdate) {
      onUpdate({ content: url } as Partial<QuizQuestion>);
    }
  };

  const addHotspot = () => {
    const newHotspot = {
      x: 50,
      y: 50,
      label: `Hotspot ${hotspots.length + 1}`,
    };
    const newHotspots = [...hotspots, newHotspot];
    setHotspots(newHotspots);

    if (onUpdate) {
      onUpdate({ correctAnswer: JSON.stringify(newHotspots) });
    }
  };

  const removeHotspot = (index: number) => {
    const newHotspots = hotspots.filter((_, i) => i !== index);
    setHotspots(newHotspots);

    if (onUpdate) {
      onUpdate({ correctAnswer: JSON.stringify(newHotspots) });
    }
  };

  const updateHotspot = (
    index: number,
    updates: Partial<{ x: number; y: number; label: string }>
  ) => {
    const newHotspots = hotspots.map((hotspot, i) =>
      i === index ? { ...hotspot, ...updates } : hotspot
    );
    setHotspots(newHotspots);

    if (onUpdate) {
      onUpdate({ correctAnswer: JSON.stringify(newHotspots) });
    }
  };

  const handleImageClick = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>
  ) => {
    if (isPreview && onAnswerChange) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      const newAnswer = [...userAnswer, { x, y }];
      onAnswerChange(newAnswer);
    }
  };

  const handleKeyboardClick = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Create a synthetic mouse event for the keyboard handler
      const syntheticEvent = {
        currentTarget: e.currentTarget,
        clientX: e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2,
        clientY: e.currentTarget.offsetTop + e.currentTarget.offsetHeight / 2,
      } as React.MouseEvent<HTMLDivElement | HTMLButtonElement>;
      handleImageClick(syntheticEvent);
    }
  };

  const renderEditingMode = () => (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="hotspot-image-url"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Image URL
        </label>
        <input
          id="hotspot-image-url"
          type="url"
          value={imageUrl}
          onChange={(e) => handleImageChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {imageUrl && (
        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Hotspot question"
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          {hotspots.map((hotspot, index) => (
            <div
              key={index}
              className="absolute w-6 h-6 bg-red-500 border-2 border-white rounded-full cursor-move flex items-center justify-center text-white text-xs font-bold"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Hotspots ({hotspots.length})
        </label>
        <button
          onClick={addHotspot}
          className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Icon path={mdiPlus} size={0.8} />
          Add Hotspot
        </button>
      </div>

      {hotspots.map((hotspot, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
        >
          <Icon path={mdiTarget} size={1} className="text-red-500" />

          <div className="flex-1 grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor={`hotspot-x-${index}`}
                className="block text-xs text-gray-600 mb-1"
              >
                X (%)
              </label>
              <input
                id={`hotspot-x-${index}`}
                type="number"
                value={hotspot.x}
                onChange={(e) =>
                  updateHotspot(index, { x: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label
                htmlFor={`hotspot-y-${index}`}
                className="block text-xs text-gray-600 mb-1"
              >
                Y (%)
              </label>
              <input
                id={`hotspot-y-${index}`}
                type="number"
                value={hotspot.y}
                onChange={(e) =>
                  updateHotspot(index, { y: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label
                htmlFor={`hotspot-label-${index}`}
                className="block text-xs text-gray-600 mb-1"
              >
                Label
              </label>
              <input
                id={`hotspot-label-${index}`}
                type="text"
                value={hotspot.label}
                onChange={(e) =>
                  updateHotspot(index, { label: e.target.value })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {hotspots.length > 1 && (
            <button
              onClick={() => removeHotspot(index)}
              className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Icon path={mdiClose} size={1} />
            </button>
          )}
        </div>
      ))}

      {hotspots.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          No hotspots added yet. Add at least one hotspot.
        </div>
      )}
    </div>
  );

  const renderPreviewMode = () => {
    if (!imageUrl) {
      return (
        <div className="text-center py-8 text-gray-500">
          No image provided for this hotspot question.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={handleImageClick}
            onKeyDown={handleKeyboardClick}
            className="w-full h-64 relative cursor-crosshair"
            aria-label="Click to mark hotspot answer points"
          >
            <img
              src={imageUrl}
              alt=""
              className="w-full h-64 object-cover pointer-events-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />

            {/* User's answers */}
            {userAnswer.map((point, index) => (
              <div
                key={index}
                className="absolute w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {index + 1}
              </div>
            ))}

            {/* Correct answer hotspots (if showing results) */}
            {question.explanation &&
              hotspots.map((hotspot, index) => (
                <div
                  key={`correct-${index}`}
                  className="absolute w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  ✓
                </div>
              ))}
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Click on the image to mark your answer points. You've marked{' '}
          {userAnswer.length} point
          {userAnswer.length !== 1 ? 's' : ''}.
        </div>
      </div>
    );
  };

  return <div>{isEditing ? renderEditingMode() : renderPreviewMode()}</div>;
};

export default Hotspot;
