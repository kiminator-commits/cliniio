import React from 'react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';

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

interface LibraryContentGridProps {
  filteredContent: ContentItem[];
  handleAddToList: (item: ContentItem) => void;
  getItemStatus: (id: string) => string;
  favorites: Set<string>;
  handleToggleFavorite: (itemId: string) => void;
  aiSuggestionsActive: boolean;
  aiGlowIntensity: number;
}

const LibraryContentGrid: React.FC<LibraryContentGridProps> = ({
  filteredContent,
  handleAddToList,
  getItemStatus,
  favorites,
  handleToggleFavorite,
  aiSuggestionsActive,
  aiGlowIntensity,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContent.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ContentCard
            item={item}
            status={getItemStatus(item.id)}
            onActionClick={() => handleAddToList(item)}
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
            isAiSuggestion={aiSuggestionsActive}
            aiGlowIntensity={aiGlowIntensity}
            index={index}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default LibraryContentGrid;
