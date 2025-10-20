import React, { useState, useMemo, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiTag, mdiPlus, mdiClose, mdiLightbulb } from '@mdi/js';
import { useContentAISettings } from '../../../hooks/useContentAISettings';

interface SmartTagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  content: string;
  title: string;
}

export const SmartTagManager: React.FC<SmartTagManagerProps> = ({
  tags,
  onTagsChange,
  content,
  title,
}) => {
  const [newTag, setNewTag] = useState('');
  const { settings } = useContentAISettings();

  // Generate smart tag suggestions based on content
  const smartTagSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    const lowerContent = (content + ' ' + title).toLowerCase();

    // Content-based suggestions
    if (lowerContent.includes('safety') && !tags.includes('safety'))
      suggestions.push('safety');
    if (lowerContent.includes('compliance') && !tags.includes('compliance'))
      suggestions.push('compliance');
    if (lowerContent.includes('training') && !tags.includes('training'))
      suggestions.push('training');
    if (lowerContent.includes('procedure') && !tags.includes('procedure'))
      suggestions.push('procedure');
    if (lowerContent.includes('policy') && !tags.includes('policy'))
      suggestions.push('policy');
    if (lowerContent.includes('chemical') && !tags.includes('chemical'))
      suggestions.push('chemical');
    if (lowerContent.includes('hazard') && !tags.includes('hazard'))
      suggestions.push('hazard');
    if (lowerContent.includes('emergency') && !tags.includes('emergency'))
      suggestions.push('emergency');
    if (lowerContent.includes('ppe') && !tags.includes('ppe'))
      suggestions.push('ppe');
    if (lowerContent.includes('equipment') && !tags.includes('equipment'))
      suggestions.push('equipment');
    if (lowerContent.includes('maintenance') && !tags.includes('maintenance'))
      suggestions.push('maintenance');
    if (lowerContent.includes('cleaning') && !tags.includes('cleaning'))
      suggestions.push('cleaning');
    if (lowerContent.includes('disposal') && !tags.includes('disposal'))
      suggestions.push('disposal');
    if (lowerContent.includes('storage') && !tags.includes('storage'))
      suggestions.push('storage');
    if (lowerContent.includes('transport') && !tags.includes('transport'))
      suggestions.push('transport');
    if (lowerContent.includes('inspection') && !tags.includes('inspection'))
      suggestions.push('inspection');
    if (lowerContent.includes('testing') && !tags.includes('testing'))
      suggestions.push('testing');
    if (lowerContent.includes('calibration') && !tags.includes('calibration'))
      suggestions.push('calibration');
    if (
      lowerContent.includes('documentation') &&
      !tags.includes('documentation')
    )
      suggestions.push('documentation');
    if (lowerContent.includes('reporting') && !tags.includes('reporting'))
      suggestions.push('reporting');
    if (lowerContent.includes('incident') && !tags.includes('incident'))
      suggestions.push('incident');
    if (
      lowerContent.includes('investigation') &&
      !tags.includes('investigation')
    )
      suggestions.push('investigation');
    if (lowerContent.includes('corrective') && !tags.includes('corrective'))
      suggestions.push('corrective');
    if (lowerContent.includes('preventive') && !tags.includes('preventive'))
      suggestions.push('preventive');
    if (lowerContent.includes('risk') && !tags.includes('risk'))
      suggestions.push('risk');
    if (lowerContent.includes('assessment') && !tags.includes('assessment'))
      suggestions.push('assessment');
    if (lowerContent.includes('monitoring') && !tags.includes('monitoring'))
      suggestions.push('monitoring');
    if (lowerContent.includes('supply') && !tags.includes('supply'))
      suggestions.push('supply');
    if (lowerContent.includes('admin') && !tags.includes('admin'))
      suggestions.push('admin');

    // Remove duplicates and sort
    return [...new Set(suggestions)].sort();
  }, [content, title, tags]);

  // Auto-merge suggestions when autoTagging is enabled
  useEffect(() => {
    if (!settings.autoTagging) return;
    if (!smartTagSuggestions.length) return;

    const merged = Array.from(
      new Set([...tags, ...smartTagSuggestions])
    );

    if (merged.length !== tags.length) {
      onTagsChange(merged);
    }
  }, [settings.autoTagging, smartTagSuggestions, tags, onTagsChange]);

  // Tag validation - prevent useless tags
  const isTagValid = (tag: string): boolean => {
    const lowerTag = tag.toLowerCase();

    // Block useless/generic tags
    const blockedTags = [
      'stuff',
      'things',
      'random',
      'important',
      'good',
      'useful',
      'new',
      'updated',
      'recent',
      'document',
      'file',
      'content',
      'info',
      'data',
      'item',
      'stuff',
      'thing',
      'random',
      'misc',
      'other',
      'general',
      'basic',
      'simple',
      'easy',
    ];

    if (blockedTags.includes(lowerTag)) {
      return false;
    }

    // Block single letters and very short tags
    if (tag.length < 2) {
      return false;
    }

    // Block tags that are too generic
    if (
      lowerTag === 'policy' ||
      lowerTag === 'procedure' ||
      lowerTag === 'course'
    ) {
      return false; // These are already categorized
    }

    return true;
  };

  const addSmartTag = (tag: string) => {
    if (tag && !tags.includes(tag) && isTagValid(tag)) {
      onTagsChange([...tags, tag]);
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (isTagValid(trimmedTag)) {
        onTagsChange([...tags, trimmedTag]);
        setNewTag(''); // Clear input after adding
      } else {
        alert(
          'Please use a more specific and meaningful tag. Avoid generic terms like "stuff", "things", or "important".'
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon path={mdiTag} size={1.2} className="text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">Smart Tagging</h3>
      </div>

      {/* Current Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => removeTag(index)}
                className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                title="Remove tag"
              >
                <Icon path={mdiClose} size={0.8} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add New Tag */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTag();
            }
          }}
          placeholder="Add a new tag..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent text-sm"
        />
        <button
          onClick={handleAddTag}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <Icon path={mdiPlus} size={0.8} />
        </button>
      </div>

      {/* Smart Tag Suggestions */}
      {smartTagSuggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon path={mdiLightbulb} size={1} className="text-yellow-500" />
            <h4 className="text-sm font-medium text-gray-700">
              Suggested Tags
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartTagSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addSmartTag(suggestion)}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            These tags are automatically suggested based on your content. Click
            to add them.
          </p>
        </div>
      )}

      {/* Tag Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h4 className="text-xs font-medium text-gray-900 mb-2">
          Tag Guidelines:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            • Use specific, descriptive terms (e.g., "chemical-safety" not
            "stuff")
          </li>
          <li>• Avoid generic words like "important", "good", or "new"</li>
          <li>• Tags should help others find and categorize your content</li>
          <li>• Use 2-3 words maximum per tag</li>
        </ul>
      </div>
    </div>
  );
};
