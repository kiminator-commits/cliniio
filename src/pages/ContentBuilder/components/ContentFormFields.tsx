import React from 'react';
import Icon from '@mdi/react';
import { mdiBookOpen, mdiFlask, mdiFileDocument } from '@mdi/js';

interface ContentFormFieldsProps {
  contentType: {
    id: string;
    label: string;
    description: string;
    icon: string;
  };
  title: string;
  description: string;
  content: string;
  chemicalName: string;
  casNumber: string;
  isRequired: boolean;
  reviewAnnually: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onContentChange: (content: string) => void;
  onChemicalNameChange: (name: string) => void;
  onCasNumberChange: (cas: string) => void;
  onRequiredChange: (required: boolean) => void;
  onReviewAnnuallyChange: (review: boolean) => void;
}

export const ContentFormFields: React.FC<ContentFormFieldsProps> = ({
  contentType,
  title,
  description,
  content,
  chemicalName,
  casNumber,
  isRequired,
  reviewAnnually,
  onTitleChange,
  onDescriptionChange,
  onContentChange,
  onChemicalNameChange,
  onCasNumberChange,
  onRequiredChange,
  onReviewAnnuallyChange,
}) => {
  const getContentIcon = () => {
    switch (contentType.id) {
      case 'policy':
        return mdiFileDocument;
      case 'procedure':
        return mdiBookOpen;
      case 'sds':
        return mdiFlask;
      default:
        return mdiBookOpen;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon path={getContentIcon()} size={1.5} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {contentType.label}
          </h2>
          <p className="text-sm text-gray-600">{contentType.description}</p>
        </div>
      </div>

      {/* Basic Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
            placeholder={`Enter ${contentType.label.toLowerCase()} title...`}
          />
        </div>

        <div>
          <label
            htmlFor="is-required"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Required
          </label>
          <div className="flex items-center">
            <input
              id="is-required"
              type="checkbox"
              checked={isRequired}
              onChange={(e) => onRequiredChange(e.target.checked)}
              className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
            />
            <label htmlFor="is-required" className="ml-2 text-sm text-gray-700">
              Mark as required content
            </label>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
          placeholder={`Describe this ${contentType.label.toLowerCase()}...`}
        />
      </div>

      {/* Chemical-specific fields for SDS sheets */}
      {contentType.id === 'sds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="chemical-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Chemical Name
            </label>
            <input
              id="chemical-name"
              type="text"
              value={chemicalName}
              onChange={(e) => onChemicalNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              placeholder="Enter chemical name..."
            />
          </div>

          <div>
            <label
              htmlFor="cas-number"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              CAS Number
            </label>
            <input
              id="cas-number"
              type="text"
              value={casNumber}
              onChange={(e) => onCasNumberChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              placeholder="Enter CAS number..."
            />
          </div>
        </div>
      )}

      {/* Annual Review for Policies and Procedures */}
      {(contentType.id === 'policy' || contentType.id === 'procedure') && (
        <div>
          <label
            htmlFor="review-annually"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Annual Review
          </label>
          <div className="flex items-center">
            <input
              id="review-annually"
              type="checkbox"
              checked={reviewAnnually}
              onChange={(e) => onReviewAnnuallyChange(e.target.checked)}
              className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
            />
            <label
              htmlFor="review-annually"
              className="ml-2 text-sm text-gray-700"
            >
              Mark for annual review and updates
            </label>
          </div>
          {reviewAnnually && (
            <p className="mt-2 text-xs text-blue-600">
              This {contentType.label.toLowerCase()} will be automatically
              flagged for annual review and compliance checks.
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Content *
        </label>
        <textarea
          id="content"
          rows={12}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent font-mono text-sm"
          placeholder={`Start writing your ${contentType.label.toLowerCase()} content...`}
        />
        <p className="mt-1 text-xs text-gray-500">
          Use markdown formatting for better structure and readability.
        </p>
      </div>
    </div>
  );
};
