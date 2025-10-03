import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiTag,
  mdiCheck,
  mdiAlert,
  mdiInformation,
  mdiSchool,
  mdiClipboardList,
  mdiShieldCheck,
  mdiMap,
  mdiStar,
  mdiRefresh,
} from '@mdi/js';
import { ContentItem } from '../libraryTypes';
import { ContentCategory } from '../../../pages/KnowledgeHub/types';
import {
  categoryOrganizationService,
  CategorySyncResult,
} from '../services/categoryOrganizationService';

interface CategoryOrganizationInsightsProps {
  libraryItem: ContentItem;
  onCategoryChange?: (newCategory: ContentCategory) => void;
  showReviewMode?: boolean;
}

const CategoryOrganizationInsights: React.FC<
  CategoryOrganizationInsightsProps
> = ({ libraryItem, onCategoryChange, showReviewMode = false }) => {
  const [categorySync, setCategorySync] = useState<CategorySyncResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ContentCategory | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const analyzeCategory = useCallback(async () => {
    setLoading(true);
    try {
      const syncResult =
        await categoryOrganizationService.syncCategoryToKnowledgeHub(
          libraryItem
        );
      setCategorySync(syncResult);
      setSelectedCategory(syncResult.mappedCategory);
    } catch (error) {
      console.error('Error analyzing category:', error);
    } finally {
      setLoading(false);
    }
  }, [libraryItem]);

  useEffect(() => {
    analyzeCategory();
  }, [libraryItem, analyzeCategory]);

  const handleCategoryChange = (newCategory: ContentCategory) => {
    setSelectedCategory(newCategory);
    onCategoryChange?.(newCategory);
  };

  const getCategoryIcon = (category: ContentCategory) => {
    const icons = {
      Courses: mdiSchool,
      Procedures: mdiClipboardList,
      Policies: mdiShieldCheck,
      'Learning Pathways': mdiMap,
      Advanced: mdiStar,
    };
    return icons[category];
  };

  const getCategoryColor = (category: ContentCategory) => {
    const colors = {
      Courses: '#3B82F6',
      Procedures: '#10B981',
      Policies: '#F59E0B',
      'Learning Pathways': '#8B5CF6',
      Advanced: '#EF4444',
    };
    return colors[category];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-blue-800">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Analyzing content categorization...</span>
        </div>
      </div>
    );
  }

  if (!categorySync) {
    return null;
  }

  const metadata = categoryOrganizationService.getCategoryMetadata(
    categorySync.mappedCategory
  );
  const validCategories = categoryOrganizationService.getValidCategories();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon path={mdiTag} size={1} className="text-gray-600" />
          <h4 className="font-medium text-gray-900">Category Organization</h4>
        </div>
        <button
          onClick={analyzeCategory}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh analysis"
        >
          <Icon path={mdiRefresh} size={0.8} />
        </button>
      </div>

      {/* Current Category Display */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: getCategoryColor(categorySync.mappedCategory),
          }}
        >
          <Icon
            path={getCategoryIcon(categorySync.mappedCategory)}
            size={1}
            color="white"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {categorySync.mappedCategory}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(categorySync.confidence)} bg-opacity-10`}
            >
              {getConfidenceText(categorySync.confidence)} Confidence
            </span>
          </div>
          <p className="text-sm text-gray-600">{metadata.description}</p>
        </div>
      </div>

      {/* Confidence and Reasoning */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon
            path={categorySync.needsReview ? mdiAlert : mdiCheck}
            size={0.8}
            className={
              categorySync.needsReview ? 'text-yellow-600' : 'text-green-600'
            }
          />
          <span className="text-sm font-medium text-gray-700">
            {categorySync.needsReview
              ? 'Review Recommended'
              : 'Auto-categorized'}
          </span>
        </div>

        {categorySync.reasoning.length > 0 && (
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Reasoning:</p>
            <ul className="space-y-1">
              {categorySync.reasoning.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Category Review Mode */}
      {showReviewMode && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiInformation} size={0.8} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Review & Adjust Category
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {validCategories.map((category) => {
              const isSelected = selectedCategory === category;
              const categoryMeta =
                categoryOrganizationService.getCategoryMetadata(category);

              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    >
                      <Icon
                        path={getCategoryIcon(category)}
                        size={0.8}
                        color="white"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {category}
                      </div>
                      <div className="text-xs text-gray-600">
                        {categoryMeta.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Icon
                        path={mdiCheck}
                        size={0.8}
                        className="text-blue-600"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Examples */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} category examples
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">
                  Examples of {categorySync.mappedCategory}:
                </p>
                <ul className="space-y-1">
                  {metadata.examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Original Category Info */}
      {categorySync.originalCategory !== categorySync.mappedCategory && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Original category:</span>{' '}
            {categorySync.originalCategory}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryOrganizationInsights;
