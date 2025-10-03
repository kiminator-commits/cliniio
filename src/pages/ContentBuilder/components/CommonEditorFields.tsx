import React, { memo } from 'react';

interface CommonEditorFieldsProps {
  title: string;
  description: string;
  content: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onContentChange: (content: string) => void;
}

const CommonEditorFields: React.FC<CommonEditorFieldsProps> = memo(
  ({
    title,
    description,
    content,
    onTitleChange,
    onDescriptionChange,
    onContentChange,
  }) => {
    return (
      <div className="space-y-4">
        {/* Title Field */}
        <div>
          <label
            htmlFor="content-title-tab"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title
          </label>
          <input
            id="content-title-tab"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
            placeholder="Enter content title..."
          />
        </div>

        {/* Description Field */}
        <div>
          <label
            htmlFor="content-description-tab"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="content-description-tab"
            rows={2}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
            placeholder="Enter content description..."
          />
        </div>

        {/* Content Field */}
        <div>
          <label
            htmlFor="content-main-tab"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Content
          </label>
          <textarea
            id="content-main-tab"
            rows={12}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
            placeholder="Enter your content here..."
          />
        </div>
      </div>
    );
  }
);

CommonEditorFields.displayName = 'CommonEditorFields';

export default CommonEditorFields;
