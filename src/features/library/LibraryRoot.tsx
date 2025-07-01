import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiMagnify, mdiFilter, mdiChevronRight, mdiRobot } from '@mdi/js';
import ContentCard from './components/ContentCard';
import LibraryContentGrid from './LibraryContentGrid';
import LibraryFilters from './components/LibraryFilters';
import LibraryHeader from './components/LibraryHeader';
import LearningProgressService from '../../services/learningProgressService';
import { ContentItem } from './libraryTypes';
import { useLibraryContent } from './hooks/useLibraryContent';
import { useFilteredContent } from './hooks/useFilteredContent';

const LibraryRoot = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    category: '',
    skillLevel: '',
    timeline: '',
    status: '',
    source: '',
    showNewOnly: false,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [progressService] = useState(() => LearningProgressService.getInstance());
  const [aiSuggestionsActive, setAiSuggestionsActive] = useState(false);
  const [aiGlowIntensity, setAiGlowIntensity] = useState(0);
  const [showAiTooltip, setShowAiTooltip] = useState(false);

  const skillLevels = useMemo(() => ['All', 'Beginner', 'Intermediate', 'Advanced'], []);
  const timelines = useMemo(() => ['< 1 hour', '1-3 hours', '3-5 hours', '5+ hours'], []);
  const statuses = useMemo(() => ['Not Started', 'In Progress', 'Completed'], []);
  const sources = useMemo(() => ['All Sources', 'Cliniio', 'Admin'], []);
  const categories = useMemo(
    () => [
      'All',
      'Favorites',
      'Courses',
      'Learning Pathways',
      'Procedures',
      'Policies',
      'SDS Sheets',
    ],
    []
  );

  const { content } = useLibraryContent();

  const getRelevanceScore = useCallback(
    (item: ContentItem, completed: Array<{ category: string; level: string }>) => {
      let score = 0;

      // Category relevance
      const categoryMatch = completed.some(c => c.category === item.category);
      if (categoryMatch) score += 30;

      // Level progression
      const levelMatch = completed.some(c => c.level === item.level);
      if (levelMatch) score += 20;

      // Points value
      score += item.points * 0.5;

      // Duration preference (shorter items get slight boost)
      const duration = parseInt(item.duration.split(' ')[0]);
      if (duration <= 60) score += 10;

      return score;
    },
    []
  );

  useEffect(() => {
    // AI Suggestions logic
    const interval = setInterval(() => {
      setAiGlowIntensity(prev => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [aiSuggestionsActive]);

  const getAiSuggestions = useCallback(() => {
    if (!aiSuggestionsActive) return content;

    // Mock user's learning history - in a real app, this would come from the service
    const mockUserProgress = [
      { id: '1', status: 'Completed', category: 'Procedures', level: 'Beginner' },
      { id: '3', status: 'In Progress', category: 'Courses', level: 'Beginner' },
    ];

    const completedItems = mockUserProgress.filter(item => item.status === 'Completed');
    const inProgressItems = mockUserProgress.filter(item => item.status === 'In Progress');

    // AI recommendation algorithm
    const suggestions = content.filter(item => {
      // Prioritize items that complement completed content
      const hasRelatedCompleted = completedItems.some(c => c.category === item.category);
      const hasRelatedInProgress = inProgressItems.some(c => c.category === item.category);

      // Boost items that are next level up from completed items
      const isNextLevel = completedItems.some(c => {
        const levels = ['Beginner', 'Intermediate', 'Advanced'];
        const currentIndex = levels.indexOf(c.level);
        const itemIndex = levels.indexOf(item.level);
        return itemIndex === currentIndex + 1;
      });

      return hasRelatedCompleted || hasRelatedInProgress || isNextLevel || item.points > 50;
    });

    // Sort by relevance score
    return suggestions.sort((a, b) => {
      const scoreA = getRelevanceScore(a, completedItems);
      const scoreB = getRelevanceScore(b, completedItems);
      return scoreB - scoreA;
    });
  }, [aiSuggestionsActive, content, getRelevanceScore]);

  const handleToggleAiSuggestions = useCallback(() => {
    setAiSuggestionsActive(prev => !prev);
  }, []);

  const handleToggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setFilters({
      category: '',
      skillLevel: '',
      timeline: '',
      status: '',
      source: '',
      showNewOnly: false,
    });
  }, []);

  const getCategoryCount = useCallback(
    (category: string) => {
      if (category === 'All') return content.length;
      if (category === 'Favorites') return favorites.size;
      return content.filter(item => item.category === category).length;
    },
    [content, favorites]
  );

  const isNewContent = useCallback((publishedDate?: string) => {
    if (!publishedDate) return false;
    const publishDate = new Date(publishedDate);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Debug logging
    console.log('Checking if new:', {
      title: 'Content item',
      publishedDate,
      publishDate: publishDate.toISOString(),
      ninetyDaysAgo: ninetyDaysAgo.toISOString(),
      isNew: publishDate > ninetyDaysAgo,
    });

    return publishDate > ninetyDaysAgo;
  }, []);

  const filteredContent = useFilteredContent({
    content,
    searchQuery,
    selectedCategory,
    selectedLevel,
    filters,
    favorites,
    aiSuggestionsActive,
    getAiSuggestions,
    isNewContent,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Back Navigation */}
      <div className="p-6">
        <button
          onClick={() => navigate('/knowledge-hub')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#4ECDC4] transition-colors duration-200"
        >
          <Icon path={mdiChevronRight} size={0.8} className="rotate-180" />
          Back to Knowledge Hub
        </button>
      </div>

      {/* Enhanced Header */}
      <LibraryHeader />

      {/* Enhanced Search Bar */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon path={mdiMagnify} size={1.2} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses, procedures, policies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4ECDC4]/20 focus:border-[#4ECDC4] transition-all duration-200 shadow-sm"
                aria-label="Search content"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 shadow-md ${
                    showFilters
                      ? 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0]'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon path={mdiFilter} size={1} />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Filter Panel */}
          <LibraryFilters
            showFilters={showFilters}
            filters={filters}
            setFilters={setFilters}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            handleResetFilters={handleResetFilters}
            handleToggleAiSuggestions={handleToggleAiSuggestions}
            aiSuggestionsActive={aiSuggestionsActive}
            aiGlowIntensity={aiGlowIntensity}
            showAiTooltip={showAiTooltip}
            setShowAiTooltip={setShowAiTooltip}
            skillLevels={skillLevels}
            timelines={timelines}
            statuses={statuses}
            sources={sources}
            categories={categories}
            getCategoryCount={getCategoryCount}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* <LibraryTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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
          )} */}

          {/* Enhanced Content Grid */}
          {aiSuggestionsActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#4ECDC4]/10 to-[#3db8b0]/10 rounded-2xl p-8 mb-8 border border-[#4ECDC4]/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                  <Icon path={mdiRobot} size={1.2} color="white" />
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

          <LibraryContentGrid
            filteredContent={filteredContent}
            handleAddToList={item => {
              progressService.markInProgress(item.id);
            }}
            getItemStatus={id => progressService.getItemStatus(id)}
            favorites={favorites}
            handleToggleFavorite={handleToggleFavorite}
            aiSuggestionsActive={aiSuggestionsActive}
            aiGlowIntensity={aiGlowIntensity}
          />
        </div>
      </div>
    </div>
  );
};

export default LibraryRoot;
