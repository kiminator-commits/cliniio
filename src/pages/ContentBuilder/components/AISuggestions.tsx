import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '../context/ContentBuilderContext';
import { useContentAISettings } from '../../../hooks/useContentAISettings';
import Icon from '@mdi/react';
import { mdiLightbulb, mdiTrendingUp, mdiCheck } from '@mdi/js';
import { AISuggestion } from '../types';

const AISuggestions: React.FC = () => {
  const { state, dispatch } = useContentBuilder();
  const { settings } = useContentAISettings();

  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Mock AI suggestions - in a real app, these would come from your AI service
    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'content-gap',
        title: 'Sterilization Safety Protocols',
        description:
          'Based on recent incidents, users need more comprehensive safety training materials for sterilization procedures.',
        priority: 'high',
        confidence: 0.89,
      },
      {
        id: '2',
        type: 'improvement',
        title: 'Inventory Management Best Practices',
        description:
          'Current inventory content could be enhanced with real-world examples and case studies.',
        priority: 'medium',
        confidence: 0.76,
      },
      {
        id: '3',
        type: 'new-topic',
        title: 'Environmental Cleaning Standards',
        description:
          'New regulations require updated training materials for environmental cleaning procedures.',
        priority: 'high',
        confidence: 0.92,
      },
      {
        id: '4',
        type: 'content-gap',
        title: 'Emergency Response Procedures',
        description:
          'Users frequently search for emergency protocols but find limited content available.',
        priority: 'medium',
        confidence: 0.68,
      },
    ];

    // Load AI suggestions when component mounts
    dispatch({ type: 'SET_AI_SUGGESTIONS', payload: mockSuggestions });
  }, [dispatch]);

  const getPriorityColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getTypeIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'content-gap':
        return '📚';
      case 'improvement':
        return '✨';
      case 'new-topic':
        return '🆕';
      default:
        return '💡';
    }
  };

  const getTypeLabel = (type: AISuggestion['type']) => {
    switch (type) {
      case 'content-gap':
        return 'Content Gap';
      case 'improvement':
        return 'Improvement';
      case 'new-topic':
        return 'New Topic';
      default:
        return 'Suggestion';
    }
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    if (state.currentContent) {
      // Apply the suggestion to current content
      const updatedContent = {
        ...state.currentContent,
        title: suggestion.title,
        description: suggestion.description,
        tags: settings.autoTagging 
          ? [...new Set([...state.currentContent.tags, 'AI-suggested'])]
          : state.currentContent.tags,
      };
      dispatch({ type: 'UPDATE_CONTENT', payload: updatedContent });
    }
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    const updatedSuggestions = (state.aiSuggestions || []).filter(
      (s) => s.id !== suggestionId
    );
    dispatch({ type: 'SET_AI_SUGGESTIONS', payload: updatedSuggestions });
  };

  const toggleSuggestionExpansion = (suggestionId: string) => {
    setExpandedSuggestion(
      expandedSuggestion === suggestionId ? null : suggestionId
    );
  };

  if (!state.aiSuggestions || state.aiSuggestions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon path={mdiLightbulb} size={20} className="text-yellow-500" />
          <h3 className="text-lg font-medium text-gray-900">AI Suggestions</h3>
        </div>
        <div className="text-center py-6">
          <Icon
            path={mdiTrendingUp}
            size={32}
            className="mx-auto text-gray-400 mb-2"
          />
          <p className="text-sm text-gray-500">No AI suggestions available</p>
          <p className="text-xs text-gray-400 mt-1">
            Suggestions appear based on usage data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon path={mdiLightbulb} size={20} className="text-yellow-500" />
        <h3 className="text-lg font-medium text-gray-900">AI Suggestions</h3>
      </div>

      <p className="text-xs text-gray-600">
        Based on usage patterns and content gaps
      </p>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {(state.aiSuggestions || []).map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium opacity-75">
                    {getTypeLabel(suggestion.type)}
                  </span>
                  <span className="text-xs">
                    {getPriorityIcon(suggestion.priority)}
                  </span>
                  <span className="text-xs opacity-75">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>

                <h4 className="text-sm font-medium mb-1">{suggestion.title}</h4>

                {expandedSuggestion === suggestion.id ? (
                  <p className="text-xs opacity-75 mb-3">
                    {suggestion.description}
                  </p>
                ) : (
                  <p
                    className="text-xs opacity-75 mb-3 overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {suggestion.description}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleSuggestionExpansion(suggestion.id)}
                    className="text-xs underline hover:no-underline"
                  >
                    {expandedSuggestion === suggestion.id
                      ? 'Show less'
                      : 'Show more'}
                  </button>

                  <button
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Icon path={mdiCheck} size={12} className="mr-1" />
                    Apply
                  </button>

                  <button
                    onClick={() => handleDismissSuggestion(suggestion.id)}
                    className="text-xs opacity-75 hover:opacity-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500">
        <p>Suggestions update based on:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Content gaps in searches</li>
          <li>User feedback and ratings</li>
          <li>Industry best practices</li>
          <li>Regulatory requirements</li>
        </ul>
      </div>
    </div>
  );
};

export default AISuggestions;
