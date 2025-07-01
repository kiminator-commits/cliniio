import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiStar, mdiViewGrid, mdiFileDocument, mdiRobot } from '@mdi/js';

interface LibraryTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LibraryTabs: React.FC<LibraryTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'favourites',
      label: 'Favorites',
      icon: mdiStar,
      description: 'Your saved content',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: mdiViewGrid,
      description: 'Browse by category',
    },
    {
      id: 'sds',
      label: 'SDS Sheets',
      icon: mdiFileDocument,
      description: 'Safety data sheets',
    },
    {
      id: 'aisuggestions',
      label: 'AI Suggestions',
      icon: mdiRobot,
      description: 'Personalized recommendations',
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#4ECDC4] text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[#4ECDC4]/30 hover:text-[#4ECDC4]'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon
              path={tab.icon}
              size={1}
              className={activeTab === tab.id ? 'text-white' : 'text-gray-500'}
            />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[#4ECDC4] rounded-xl -z-10"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab Description */}
      <div className="text-center mt-4">
        <p className="text-gray-600 text-sm">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
};

export default LibraryTabs;
