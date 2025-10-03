import React, { useState } from 'react';
import { useContentBuilder } from '../context/ContentBuilderContext';
import Icon from '@mdi/react';
import { mdiPlus, mdiTag, mdiClock } from '@mdi/js';

interface ContentEditorProps {
  contentType: string;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  contentType,
  isEditing,
  onEditToggle,
}) => {
  const { state, dispatch } = useContentBuilder();
  const [newTag, setNewTag] = useState('');

  const handleTitleChange = (title: string) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { title } });
  };

  const handleDescriptionChange = (description: string) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { description } });
  };

  const handleContentChange = (content: string) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { content } });
  };

  const handleAddTag = () => {
    if (newTag.trim() && state.currentContent) {
      const updatedTags = [...state.currentContent.tags, newTag.trim()];
      dispatch({ type: 'UPDATE_CONTENT', payload: { tags: updatedTags } });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (state.currentContent) {
      const updatedTags = state.currentContent.tags.filter(
        (tag) => tag !== tagToRemove
      );
      dispatch({ type: 'UPDATE_CONTENT', payload: { tags: updatedTags } });
    }
  };

  const handleDifficultyChange = (
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      payload: { difficultyLevel: difficulty },
    });
  };

  const handleDurationChange = (duration: string) => {
    const numDuration = parseInt(duration) || 0;
    dispatch({
      type: 'UPDATE_CONTENT',
      payload: { estimatedDuration: numDuration },
    });
  };

  const handleDepartmentChange = (department: string) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { department } });
  };

  if (!state.currentContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Icon
            path={mdiPlus}
            size={48}
            className="mx-auto text-gray-400 mb-4"
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Content Selected
          </h3>
          <p className="text-gray-600">
            Choose a content type from the sidebar to start creating
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {state.currentContent.title || 'Untitled Content'}
          </h2>
          <p className="text-sm text-gray-600">
            {contentType.charAt(0).toUpperCase() +
              contentType.slice(1).replace('-', ' ')}{' '}
            • Draft
          </p>
        </div>
        <button
          onClick={() => onEditToggle(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isEditing ? 'Preview' : 'Edit'}
        </button>
      </div>

      {/* Content Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="content-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              id="content-title"
              type="text"
              value={state.currentContent.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter content title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="content-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="content-description"
              value={state.currentContent.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe your content..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="content-department"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Department
            </label>
            <select
              id="content-department"
              value={state.currentContent.department || ''}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select department...</option>
              <option value="Sterilization">Sterilization</option>
              <option value="Inventory">Inventory</option>
              <option value="Environmental Cleaning">
                Environmental Cleaning
              </option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label
              htmlFor="content-difficulty"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Difficulty Level
            </label>
            <select
              id="content-difficulty"
              value={state.currentContent.difficultyLevel || 'beginner'}
              onChange={(e) =>
                handleDifficultyChange(
                  e.target.value as 'beginner' | 'intermediate' | 'advanced'
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Estimated Duration */}
          <div>
            <label
              htmlFor="content-duration"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Icon path={mdiClock} size={16} className="inline mr-2" />
              Estimated Duration (minutes)
            </label>
            <input
              id="content-duration"
              type="number"
              value={state.currentContent.estimatedDuration || ''}
              onChange={(e) => handleDurationChange(e.target.value)}
              placeholder="30"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="content-tags"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <Icon path={mdiTag} size={16} className="inline mr-2" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {state.currentContent.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              id="content-tags"
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <label
            htmlFor="content-main"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Content
          </label>
          <textarea
            id="content-main"
            value={state.currentContent.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write your content here... You can use markdown formatting."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supports markdown formatting for rich content
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
