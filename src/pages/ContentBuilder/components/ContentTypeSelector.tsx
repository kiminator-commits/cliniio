import React from 'react';
import Icon from '@mdi/react';
import {
  mdiSchool,
  mdiFileDocument,
  mdiClipboardList,
  mdiFlask,
  mdiMapMarkerPath,
} from '@mdi/js';
import { useContentBuilder } from '../context/ContentBuilderContext';
import { ContentType } from '../types';

interface ContentTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
}) => {
  const { createNewContent } = useContentBuilder();

  const contentTypes = [
    {
      type: 'course' as ContentType,
      label: 'Course',
      description: 'Interactive learning modules with assessments',
      icon: mdiSchool,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      hoverColor: 'hover:bg-blue-50 hover:border-blue-300',
    },
    {
      type: 'policy' as ContentType,
      label: 'Policy',
      description: 'Organizational rules and guidelines',
      icon: mdiFileDocument,
      color: 'bg-green-100 text-green-700 border-green-200',
      hoverColor: 'hover:bg-green-50 hover:border-green-300',
    },
    {
      type: 'procedure' as ContentType,
      label: 'Procedure',
      description: 'Step-by-step operational instructions',
      icon: mdiClipboardList,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      hoverColor: 'hover:bg-purple-50 hover:border-purple-300',
    },
    {
      type: 'sms' as ContentType,
      label: 'SDS Sheet',
      description: 'Safety data sheets and chemical information',
      icon: mdiFlask,
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      hoverColor: 'hover:bg-orange-50 hover:border-orange-300',
    },
    {
      type: 'pathway' as ContentType,
      label: 'Learning Pathway',
      description: 'Combined learning experiences',
      icon: mdiMapMarkerPath,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      hoverColor: 'hover:bg-indigo-50 hover:border-indigo-300',
    },
  ];

  const handleTypeSelect = (type: ContentType) => {
    onTypeSelect(type);
    createNewContent(type);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Content Type</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose the type of content you want to create
        </p>
      </div>

      <div className="space-y-3">
        {contentTypes.map((contentType) => (
          <button
            key={contentType.type}
            onClick={() => handleTypeSelect(contentType.type)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
              selectedType === contentType.type
                ? 'border-blue-500 bg-blue-50'
                : `${contentType.color} border ${contentType.hoverColor}`
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  selectedType === contentType.type
                    ? 'bg-blue-100'
                    : 'bg-white bg-opacity-50'
                }`}
              >
                <Icon
                  path={contentType.icon}
                  size={20}
                  className={
                    selectedType === contentType.type ? 'text-blue-600' : ''
                  }
                />
              </div>
              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    selectedType === contentType.type ? 'text-blue-900' : ''
                  }`}
                >
                  {contentType.label}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    selectedType === contentType.type
                      ? 'text-blue-700'
                      : 'text-gray-600'
                  }`}
                >
                  {contentType.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedType && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong>{' '}
            {contentTypes.find((t) => t.type === selectedType)?.label}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Click on a different type to change your selection
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentTypeSelector;
