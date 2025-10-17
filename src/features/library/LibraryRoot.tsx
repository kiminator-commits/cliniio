import React, { useCallback, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiMagnify, mdiFilter, mdiChevronRight, mdiRobot } from '@mdi/js';
import ContentCard from './components/ContentCard';
import LibraryContentGrid from './LibraryContentGrid';
const LibraryFilters = React.lazy(() => import('./components/LibraryFilters'));
const LibraryHeader = React.lazy(() => import('./components/LibraryHeader'));
import { LibraryErrorBoundary } from './components/LibraryErrorBoundary';
import { CardSkeleton, SearchSkeleton } from '../../components/ui/Skeleton';

import { useLibraryContent } from './hooks/useLibraryContent';
import { ContentItem } from './libraryTypes';
import { supabase } from '../../lib/supabaseClient';
import { useKnowledgeHubIntegration } from './hooks/useKnowledgeHubIntegration';
import { useUser } from '@/contexts/UserContext';

import { useLibraryRootState } from './hooks/useLibraryRootState';

const LibraryRoot = () => {
  const navigate = useNavigate();
  const { addToKnowledgeHub } = useKnowledgeHubIntegration();
  const { currentUser: _currentUser } = useUser();
  const {
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    favorites,
    setFavorites,
    filters,
    setFilters,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
    progressService,
    aiSuggestionsActive,
    setAiSuggestionsActive,
    aiGlowIntensity,
    setAiGlowIntensity,
    showAiTooltip,
    setShowAiTooltip,
    skillLevels,
    timelines,
    statuses,
    sources,
    categories,
  } = useLibraryRootState();

  const { content } = useLibraryContent();

  useEffect(() => {
    // AI Suggestions logic
    const interval = setInterval(() => {
      setAiGlowIntensity((prev) => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [aiSuggestionsActive, setAiGlowIntensity]);

  // Get filtered content based on search and filters
  const filteredContent = content.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.data?.description || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !filters.category || item.category === filters.category;
    const matchesLevel =
      !filters.skillLevel || item.level === filters.skillLevel;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesSource = !filters.source || item.source === filters.source;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLevel &&
      matchesStatus &&
      matchesSource
    );
  });

  // Enhanced AI suggestions handling with tracking
  const handleToggleAiSuggestions = useCallback(() => {
    setAiSuggestionsActive((prev) => {
      const newValue = !prev;

      // Store session analytics when AI suggestions are enabled
      if (newValue) {
        const sessionData = {
          session_start: new Date().toISOString(),
          content_items_accessed: content.map((item) => item.id),
          learning_path_progress: { ai_suggestions_enabled: true },
          learning_patterns: { ai_interaction: 'enabled' },
        };

        // Store analytics asynchronously
        import('./services/aiSuggestionsService').then(
          ({ AISuggestionsService }) => {
            const aiService = new AISuggestionsService();
            aiService.storeLearningSessionAnalytics(sessionData);
          }
        );
      }

      return newValue;
    });
  }, [content, setAiSuggestionsActive]);

  const handleToggleFavorite = useCallback(
    (itemId: string) => {
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(itemId)) {
          newFavorites.delete(itemId);
        } else {
          newFavorites.add(itemId);
        }

        // Track favorite actions for AI analytics
        const action = prev.has(itemId) ? 'removed' : 'added';
        const sessionData = {
          session_start: new Date().toISOString(),
          content_items_accessed: [itemId],
          learning_path_progress: { favorites_updated: true },
          learning_patterns: { favorite_action: action },
        };

        // Store analytics asynchronously
        import('./services/aiSuggestionsService').then(
          ({ AISuggestionsService }) => {
            const aiService = new AISuggestionsService();
            aiService.storeLearningSessionAnalytics(sessionData);
          }
        );

        return newFavorites;
      });
    },
    [setFavorites]
  );

  const getItemStatus = useCallback(
    (id: string) => {
      return progressService?.getItemStatus(id) || 'Not Started';
    },
    [progressService]
  );

  const getCategoryCount = useCallback(
    (category: string) => {
      return content.filter((item) => item.category === category).length;
    },
    [content]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      category: '',
      skillLevel: '',
      status: '',
      source: '',
      timeline: '',
      showNewOnly: false,
    });
    setSelectedCategory('');
    setSelectedLevel('');
  }, [setFilters, setSelectedCategory, setSelectedLevel]);

  // Memoized callback functions for performance optimization
  const handleAddToList = useCallback(async (item: ContentItem) => {
    try {
      // Add to user_progress table
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      // Determine content type based on category
      let contentType = 'courses';
      if (item.category === 'Policies') contentType = 'policies';
      else if (item.category === 'Procedures') contentType = 'procedures';

      const progressData = {
        user_id: user.id,
        content_id: item.id,
        content_type: contentType,
        status: 'not_started',
        progress_percentage: 0,
        assigned_at: new Date().toISOString(),
        is_repeat: item.isRepeat || false,
      };

      const { error } = await supabase
        .from('knowledge_hub_user_progress')
        .insert([progressData]);

      if (error) {
        console.error('Error adding to knowledge hub:', error);
        return;
      }

      console.log('Successfully added to knowledge hub:', item.title);

      // Add to Knowledge Hub integration
      await addToKnowledgeHub(item);
      console.log('✅ Added to Knowledge Hub:', item.title);

      // Add visual feedback
      const card = document.querySelector(`[data-item-id="${item.id}"]`);
      if (card) {
        const button =
          card.querySelector('button[onclick]') ||
          card.querySelector('button:last-child');
        if (button) {
          const originalText = button.textContent;
          button.textContent = 'Added!';
          button.classList.add('bg-green-500', 'text-white');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-500', 'text-white');
          }, 2000);
        } else {
          console.log('Button not found in card, item ID:', item.id);
        }
      } else {
        console.log('Card not found for visual feedback, item ID:', item.id);
      }
    } catch (error) {
      console.error('Error adding to knowledge hub:', error);
    }
  }, [addToKnowledgeHub]);

  return (
    <LibraryErrorBoundary>
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
        <Suspense fallback={<CardSkeleton />}>
          <LibraryHeader />
        </Suspense>

        {/* Enhanced Search Bar */}
        <div className="px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon
                    path={mdiMagnify}
                    size={1.2}
                    className="text-gray-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search courses, procedures, policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            <Suspense fallback={<SearchSkeleton />}>
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
            </Suspense>
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
                    <h3 className="text-xl font-bold text-gray-900">
                      AI-Powered Recommendations
                    </h3>
                    <p className="text-gray-600">
                      Personalized content suggestions based on your role and
                      learning history
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ContentCard
                    item={{
                      id: 'ai-1',
                      title: 'Infection Control Mastery',
                      category: 'Procedures',
                      description:
                        'Advanced techniques for maintaining sterile environments',
                      level: 'Advanced',
                      duration: '75 min',
                      points: 65,
                      status: 'Not Started',
                      source: 'Cliniio',
                      publishedDate: '2025-01-15',
                    }}
                    status={
                      progressService?.getItemStatus('ai-1') || 'Not Started'
                    }
                    onActionClick={() => {
                      progressService?.markInProgress('ai-1');
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
                      description:
                        'Develop leadership skills in patient safety protocols',
                      level: 'Advanced',
                      duration: '120 min',
                      points: 85,
                      status: 'Not Started',
                      source: 'Cliniio',
                      publishedDate: '2025-01-10',
                    }}
                    status={
                      progressService?.getItemStatus('ai-2') || 'Not Started'
                    }
                    onActionClick={() => {
                      progressService?.markInProgress('ai-2');
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
              handleAddToList={handleAddToList}
              getItemStatus={getItemStatus}
              favorites={favorites}
              handleToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      </div>
    </LibraryErrorBoundary>
  );
};

export default LibraryRoot;
