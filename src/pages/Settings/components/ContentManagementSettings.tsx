import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiPencil, mdiLightbulb, mdiFileImage, mdiPublish } from '@mdi/js';
import { ContentBuilderTab } from './ContentManagementSettings/ContentBuilderTab';
import { PublishingTab } from './ContentManagementSettings/PublishingTab';
import { WorkflowTab } from './ContentManagementSettings/WorkflowTab';
import { AITab } from './ContentManagementSettings/AITab';
import { MediaTab } from './ContentManagementSettings/MediaTab';
import { ContentManagementTab } from './ContentManagementSettings/types';

const ContentManagementSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('builder');

  const handleLaunchContentBuilder = () => {
    navigate('/content-builder');
  };

  const tabs: ContentManagementTab[] = [
    { id: 'builder', label: 'Content Builder', icon: mdiPencil },
    { id: 'publishing', label: 'Publishing', icon: mdiPublish },
    { id: 'workflow', label: 'Workflow', icon: mdiPencil },
    { id: 'ai', label: 'AI Suggestions', icon: mdiLightbulb },
    { id: 'media', label: 'Media Settings', icon: mdiFileImage },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'builder':
        return (
          <ContentBuilderTab onLaunchBuilder={handleLaunchContentBuilder} />
        );
      case 'publishing':
        return <PublishingTab />;
      case 'workflow':
        return <WorkflowTab />;
      case 'ai':
        return <AITab />;
      case 'media':
        return <MediaTab />;
      default:
        return (
          <ContentBuilderTab onLaunchBuilder={handleLaunchContentBuilder} />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-[#4ECDC4] text-[#4ECDC4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon path={tab.icon} size={1} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="py-4">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ContentManagementSettings;
