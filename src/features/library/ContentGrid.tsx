import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiStar } from '@mdi/js';
import ContentCard from './components/ContentCard';
import FavouritesPanel from './panels/FavouritesPanel';
import CategoriesPanel from './panels/CategoriesPanel';
import SDSSheetsPanel from './panels/SDSSheetsPanel';
import LearningProgressService from '../../services/learningProgressService';

interface ContentItem {
  id: string;
  title: string;
  category: string;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  dueDate?: string;
  progress?: number;
  department?: string;
  lastUpdated?: string;
  source?: string;
  description: string;
  level: string;
  duration: string;
  points: number;
  publishedDate?: string;
}

interface ContentGridProps {
  activeTab: string;
  filteredContent: ContentItem[];
  progressService: LearningProgressService;
  favorites: Set<string>;
  handleToggleFavorite: (itemId: string) => void;
  aiSuggestionsActive: boolean;
  aiGlowIntensity: number;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  activeTab,
  filteredContent,
  progressService,
  favorites,
  handleToggleFavorite,
  aiSuggestionsActive,
  aiGlowIntensity,
}) => {
  return (
    <div className="px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {activeTab === 'favourites' && <FavouritesPanel />}
        {activeTab === 'categories' && <CategoriesPanel />}
        {activeTab === 'sds' && <SDSSheetsPanel />}
        {activeTab === 'aisuggestions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#4ECDC4]/10 to-[#3db8b0]/10 rounded-2xl p-8 mb-8 border border-[#4ECDC4]/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                <Icon path={mdiStar} size={1.2} color="white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI-Powered Recommendations</h3>
                <p className="text-gray-600">
                  Personalized content suggestions based on your role and learning history
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContentCard
                item={{
                  id: 'ai-1',
                  title: 'Infection Control Mastery',
                  category: 'Procedures',
                  description: 'Advanced techniques for maintaining sterile environments',
                  level: 'Advanced',
                  duration: '75 min',
                  points: 65,
                  status: 'Not Started',
                  source: 'Cliniio',
                  publishedDate: '2025-01-15',
                }}
                status={progressService.getItemStatus('ai-1')}
                onActionClick={() => {
                  progressService.markInProgress('ai-1');
                }}
                isFavorite={favorites.has('ai-1')}
                onToggleFavorite={() => handleToggleFavorite('ai-1')}
                isAiSuggestion={true}
                aiGlowIntensity={aiGlowIntensity}
                index={0}
              />
              <ContentCard
                item={{
                  id: 'ai-2',
                  title: 'Patient Safety Leadership',
                  category: 'Learning Pathways',
                  description: 'Develop leadership skills in patient safety protocols',
                  level: 'Advanced',
                  duration: '120 min',
                  points: 85,
                  status: 'Not Started',
                  source: 'Cliniio',
                  publishedDate: '2025-01-10',
                }}
                status={progressService.getItemStatus('ai-2')}
                onActionClick={() => {
                  progressService.markInProgress('ai-2');
                }}
                isFavorite={favorites.has('ai-2')}
                onToggleFavorite={() => handleToggleFavorite('ai-2')}
                isAiSuggestion={true}
                aiGlowIntensity={aiGlowIntensity}
                index={1}
              />
            </div>
          </motion.div>
        )}

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item, index) => (
            <ContentCard
              key={item.id}
              item={item}
              status={progressService.getItemStatus(item.id)}
              onActionClick={() => {
                progressService.markInProgress(item.id);
              }}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
              isAiSuggestion={aiSuggestionsActive}
              aiGlowIntensity={aiGlowIntensity}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentGrid;
