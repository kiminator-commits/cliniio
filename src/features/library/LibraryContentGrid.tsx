import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
const ContentCard = React.lazy(() => import('./components/ContentCard'));

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
}

const LibraryContentGrid: React.FC<LibraryContentGridProps> = ({
  filteredContent,
  handleAddToList,
  getItemStatus,
  favorites,
  handleToggleFavorite,
}) => {
  return (
    <section
      role="list"
      aria-label="Library content list"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <Suspense fallback={<div>Loading...</div>}>
        {filteredContent.map((item, index) => (
          <motion.div
            key={item.id}
            role="listitem"
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
              isAiSuggestion={false}
              index={index}
            />
          </motion.div>
        ))}
      </Suspense>
    </section>
  );
};

export default LibraryContentGrid;
