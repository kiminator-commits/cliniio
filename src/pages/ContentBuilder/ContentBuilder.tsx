import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import { ContentBuilderProvider, useContentBuilder } from './context';
import { useContentBuilderActions } from './hooks';
import { CourseBuilder, SimpleContentEditor } from './components';
import { contentTypes } from './constants';

const ContentBuilderContent: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useContentBuilder();
  const { setSelectedContentType } = useContentBuilderActions();
  const { selectedContentType } = state;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleBackToSettings = () => {
    navigate('/settings');
  };

  const renderContentEditor = () => {
    if (selectedContentType === 'course') {
      return <CourseBuilder />;
    }

    const contentType = contentTypes.find((t) => t.id === selectedContentType);
    if (!contentType) return null;

    return <SimpleContentEditor contentType={contentType} />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Title and Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center space-x-4 mb-4 md:flex-row md:mb-0">
          <button
            onClick={handleBackToSettings}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#4ECDC4] transition-colors duration-200"
          >
            <Icon path={mdiArrowLeft} size={0.8} />
            Back to Settings
          </button>
        </div>
      </div>

      {/* Title Section */}
      <div>
        <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">
          Content Builder
        </h1>
        <p className="text-gray-500 text-sm">
          Create and manage content for your library
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex bg-white rounded-lg shadow">
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-50 border-r border-gray-200 rounded-l-lg transition-all duration-300`}
        >
          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-sm font-medium text-gray-900 ${sidebarCollapsed ? 'sr-only' : ''}`}
              >
                Content Types
              </h3>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Icon
                  path={sidebarCollapsed ? mdiChevronRight : mdiChevronLeft}
                  size={0.8}
                />
              </button>
            </div>
            <div className="space-y-2">
              {contentTypes.map((contentType) => (
                <button
                  key={contentType.id}
                  onClick={() => setSelectedContentType(contentType.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedContentType === contentType.id
                      ? 'bg-[#4ECDC4] text-white'
                      : 'text-[#5b5b5b] hover:bg-gray-100'
                  }`}
                  title={sidebarCollapsed ? contentType.label : undefined}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
                  >
                    <Icon
                      path={contentType.icon}
                      size={sidebarCollapsed ? 1.5 : 1.2}
                      className={`${selectedContentType === contentType.id ? 'text-white' : 'text-gray-400'}`}
                    />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{contentType.label}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 rounded-r-lg">{renderContentEditor()}</div>
      </div>
    </div>
  );
};

const ContentBuilder: React.FC = () => {
  return (
    <ContentBuilderProvider>
      <SharedLayout>
        <ContentBuilderContent />
      </SharedLayout>
    </ContentBuilderProvider>
  );
};

export default ContentBuilder;
