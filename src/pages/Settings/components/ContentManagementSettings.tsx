import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiPencil, mdiLightbulb, mdiFileImage, mdiPublish } from '@mdi/js';
import { ContentBuilderTab } from './ContentManagementSettings/ContentBuilderTab';
import { PublishingTab } from './ContentManagementSettings/PublishingTab';
import { AITab } from './ContentManagementSettings/AITab';
import { MediaTab } from './ContentManagementSettings/MediaTab';
import { ContentManagementTab } from './ContentManagementSettings/types';

const ContentManagementSettings: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize state with URL parameters
  const getInitialTab = () => {
    const subtab = searchParams.get('subtab');
    const review = searchParams.get('review');
    
    if (review) return 'publishing';
    if (subtab && ['builder', 'publishing', 'ai', 'media'].includes(subtab)) {
      return subtab;
    }
    return 'builder';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [reviewContentId, setReviewContentId] = useState<string | null>(
    searchParams.get('review')
  );

  // Handle URL parameter changes
  useEffect(() => {
    const review = searchParams.get('review');
    
    if (review) {
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => setReviewContentId(review), 0);
    }
  }, [searchParams]);

  const handleLaunchContentBuilder = () => {
    navigate('/content-builder');
  };

  const tabs: ContentManagementTab[] = [
    { id: 'builder', label: 'Content Builder', icon: mdiPencil },
    { id: 'publishing', label: 'Publishing', icon: mdiPublish },
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
        return <PublishingTab reviewContentId={reviewContentId} />;
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
                <Icon path={tab.icon as string} size={1} className="mr-2" />
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
