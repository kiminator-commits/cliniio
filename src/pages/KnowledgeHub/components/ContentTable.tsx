import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimplifiedKnowledgeHub } from '../providers/SimplifiedKnowledgeHubProvider';
import { useContentFiltering } from '../hooks/useContentFiltering';
import { useUIRenderState } from '../hooks/useUIRenderState';
import { EmptyState } from './EmptyState';
import { TableLoadingFallback } from './table-components/TableLoadingFallback';
import { ErrorState } from './table-components/ErrorState';
import { TableHeader } from './table-components/TableHeader';
import { TableContent } from './table-components/TableContent';
import { CoursesTable } from './tables/CoursesTable';
import { LearningPathwaysTable } from './tables/LearningPathwaysTable';
import { ProceduresTable } from './tables/ProceduresTable';
import { PoliciesTable } from './tables/PoliciesTable';
import { UnifiedSearchFilterBar } from './UnifiedSearchFilterBar';

export const ContentTable: React.FC = React.memo(() => {
  // Error state for component-level errors
  const [componentError, setComponentError] = useState<Error | null>(null);
  const navigate = useNavigate();

  // Global error handler
  const handleError = useCallback((error: Error) => {
    console.error('ContentTable error:', error);
    setComponentError(error);
  }, []);

  // Reset error
  const resetError = useCallback(() => {
    setComponentError(null);
  }, []);

  const {
    selectedCategory,
    selectedContent,
    isLoading,
    error,
    refetchContent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteContent,
    updateContentStatus,
    setSelectedCategory,
  } = useSimplifiedKnowledgeHub();

  // Filter state
  const [filters, setFilters] = useState({
    searchQuery: '',
    statusFilter: 'all',
    departmentFilter: 'all',
    difficultyFilter: 'all',
    durationFilter: 'all',
    sortBy: 'title',
    sortOrder: 'asc' as 'asc' | 'desc',
  });

  // Filter options
  const statusOptions = ['Not Started', 'In Progress', 'Completed'];
  const departmentOptions = [
    'central_sterile',
    'clinical',
    'biomedical',
    'supply_chain',
    'general',
  ];
  const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const durationOptions = ['15 min', '30 min', '45 min', '60 min', '90 min+'];

  // Filter handlers
  const handleFiltersChange = useCallback(
    (newFilters: {
      searchQuery: string;
      statusFilter: string;
      departmentFilter: string;
      difficultyFilter: string;
      durationFilter: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }) => {
      setFilters(newFilters);
    },
    []
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      if (category === 'all') {
        setSelectedCategory('all');
      } else {
        setSelectedCategory(category);
      }
    },
    [setSelectedCategory]
  );

  const handleStartContent = useCallback(
    (contentId: string) => {
      navigate(`/course/${contentId}`);
    },
    [navigate]
  );

  // Performance optimization: Removed excessive logging

  // UI state management
  const uiState = {
    isLoading,
    error,
    validationError: null,
  };

  // Filter options (simplified for this component)
  const filterOptions = {
    searchQuery: '',
    selectedDomain: '',
    selectedContentType: '',
    activeTab: '',
  };

  // Apply filters to content
  const filteredContent = useMemo(() => {
    if (!selectedContent) return [];

    let filtered = selectedContent;

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        // Create searchable text from multiple fields
        const searchableText = [
          item.title,
          item.data?.description || '',
          item.department || '',
          item.data?.tags?.join(' ') || '',
          item.domain || '',
          item.contentType || '',
        ]
          .join(' ')
          .toLowerCase();

        // Check for exact match first
        if (searchableText.includes(query)) {
          return true;
        }

        // Check for word boundary matches (partial word matches)
        const words = query.split(/\s+/);
        return words.some((word) => {
          if (word.length < 2) return false; // Skip very short words

          // Check if any word in the searchable text starts with this word
          const searchableWords = searchableText.split(/\s+/);
          return searchableWords.some((searchableWord) =>
            searchableWord.startsWith(word)
          );
        });
      });
    }

    // Apply status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(
        (item) => item.status === filters.statusFilter
      );
    }

    // Apply difficulty filter
    if (filters.difficultyFilter !== 'all') {
      filtered = filtered.filter(
        (item) => item.difficultyLevel === filters.difficultyFilter
      );
    }

    // Apply duration filter
    if (filters.durationFilter !== 'all') {
      filtered = filtered.filter((item) => {
        if (!item.estimatedDuration) return false;
        const duration = item.estimatedDuration;
        switch (filters.durationFilter) {
          case '15 min':
            return duration <= 15;
          case '30 min':
            return duration <= 30;
          case '45 min':
            return duration <= 45;
          case '60 min':
            return duration <= 60;
          case '90 min+':
            return duration > 90;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: unknown, bValue: unknown;

      switch (filters.sortBy) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'date':
          aValue = a.lastUpdated ? new Date(a.lastUpdated) : new Date(0);
          bValue = b.lastUpdated ? new Date(b.lastUpdated) : new Date(0);
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'difficulty':
          aValue = a.difficultyLevel || '';
          bValue = b.difficultyLevel || '';
          break;
        case 'duration':
          aValue = a.estimatedDuration || 0;
          bValue = b.estimatedDuration || 0;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return (aValue as string | number) < (bValue as string | number)
          ? -1
          : (aValue as string | number) > (bValue as string | number)
            ? 1
            : 0;
      } else {
        return (aValue as string | number) > (bValue as string | number)
          ? -1
          : (aValue as string | number) < (bValue as string | number)
            ? 1
            : 0;
      }
    });

    return filtered;
  }, [selectedContent, filters]);

  // Business logic separated into hooks
  const { categoryItems } = useContentFiltering({
    content: filteredContent,
    selectedCategory: selectedCategory === 'all' ? null : selectedCategory,
    filterOptions,
  });

  const renderState = useUIRenderState({
    uiState,
    selectedCategory,
    categoryItems,
  });

  // Pure UI rendering logic
  const renderContent = () => {
    if (renderState.shouldShowLoading) {
      return <TableLoadingFallback />;
    }

    if (renderState.shouldShowError) {
      return <ErrorState error={error!} onRetry={refetchContent} />;
    }

    if (renderState.shouldShowEmpty) {
      return <EmptyState selectedCategory={selectedCategory} />;
    }

    if (renderState.shouldShowContent) {
      return (
        <TableContent
          category={selectedCategory!}
          items={categoryItems}
          onStatusUpdate={updateContentStatus}
          onStartContent={handleStartContent}
          CoursesTable={CoursesTable}
          LearningPathwaysTable={LearningPathwaysTable}
          ProceduresTable={ProceduresTable}
          PoliciesTable={PoliciesTable}
        />
      );
    }

    return null;
  };

  // If there's a component error, show error state
  if (componentError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-600 text-lg font-medium mb-2">
            Something went wrong
          </div>
          <div className="text-gray-600 mb-4">{componentError.message}</div>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow p-6"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      {/* Unified Search and Filter Bar */}
      <UnifiedSearchFilterBar
        onFiltersChange={handleFiltersChange}
        selectedCategory={selectedCategory || 'all'}
        onCategoryChange={handleCategoryChange}
        statusOptions={statusOptions}
        difficultyOptions={difficultyOptions}
        durationOptions={durationOptions}
      />

      <TableHeader
        category={
          selectedCategory === 'all' ? 'All Categories' : selectedCategory || ''
        }
        isLoading={isLoading}
      />
      {(() => {
        try {
          return renderContent();
        } catch (error) {
          console.error('Error rendering content:', error);
          handleError(
            error instanceof Error ? error : new Error('Unknown error')
          );
          return null;
        }
      })()}
    </div>
  );
});

ContentTable.displayName = 'ContentTable';
