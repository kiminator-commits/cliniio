import React, { useState, useEffect, useCallback } from 'react';
import { KnowledgeHubService } from '../services/knowledgeHubService';
import { ContentItem } from '../types';
import { QuizList } from './QuizList';
// Icons removed as they're not used

interface KnowledgeHubContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const KnowledgeHubContent: React.FC<KnowledgeHubContentProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let contentData: ContentItem[] = [];

      switch (activeTab) {
        case 'articles':
          contentData = await KnowledgeHubService.getKnowledgeArticles();
          break;
        case 'courses':
          contentData = await KnowledgeHubService.getLearningPathways();
          break;
        case 'quizzes':
          contentData = await KnowledgeHubService.getQuizzes();
          break;
        default:
          contentData = await KnowledgeHubService.getAllContent();
      }

      setContent(contentData);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Load content based on active tab and search query
  useEffect(() => {
    loadContent();
  }, [activeTab, searchQuery, loadContent]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery(''); // Clear search when changing tabs
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderContentItem = (item: ContentItem) => {
    // Special handling for quizzes
    if (item.type === 'quiz') {
      return null; // Quizzes will be rendered separately by QuizList
    }

    return (
      <div
        key={item.id}
        className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.status === 'published'
                ? 'bg-green-100 text-green-800'
                : item.status === 'review'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {item.status}
          </span>
        </div>

        <p className="text-gray-600 mb-3">{item.data?.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Category: {item.category}</span>
          <span>
            Updated:{' '}
            {item.lastUpdated
              ? new Date(item.lastUpdated).toLocaleDateString()
              : 'N/A'}
          </span>
        </div>

        <div className="mt-4 flex space-x-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            View
          </button>
          {item.status === 'draft' && (
            <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
              Edit
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading content</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button
          onClick={loadContent}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['articles', 'courses', 'quizzes'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content List */}
      {activeTab === 'quizzes' ? (
        <QuizList
          quizzes={content.filter((item) => item.type === 'quiz')}
          onQuizStart={(quizId) => {
            console.log('Starting quiz:', quizId);
          }}
          onQuizComplete={(quizId, score, passed) => {
            console.log(
              `Quiz completed: ${quizId}, Score: ${score}%, Passed: ${passed}`
            );
          }}
        />
      ) : (
        <div className="space-y-4">
          {content.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? 'No content found matching your search.'
                : 'No content available.'}
            </div>
          ) : (
            content.map(renderContentItem)
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeHubContent;
