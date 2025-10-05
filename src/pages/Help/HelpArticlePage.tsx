import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SharedLayout as _SharedLayout } from '../../components/Layout/SharedLayout';
import {
  helpArticlesService,
  HelpArticle,
} from '../../services/helpArticlesService';
import { RocketLoading } from '../../components/ui/RocketLoading';
import '../../styles/help-articles.css';

export default function HelpArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setError('Article not found');
        setLoading(false);
        return;
      }

      try {
        const articleData = await helpArticlesService.getArticleBySlug(slug);

        if (!articleData) {
          setError('Article not found');
          setLoading(false);
          return;
        }

        setArticle(articleData);

        // Increment view count
        await helpArticlesService.incrementViewCount(slug);
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const handleBackToHelp = () => {
    // Close the current tab to return to the original authenticated tab
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RocketLoading size="lg" message="Loading article..." />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBackToHelp}
            className="bg-[#4ECDC4] text-white px-4 py-2 rounded-lg hover:bg-[#4ECDC4]/90 transition-colors"
          >
            Back to Help
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToHelp}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <span className="mr-2">←</span>
            Back to Help
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {article.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="bg-[#4ECDC4]/10 text-[#4ECDC4] px-2 py-1 rounded-full">
                  {article.category.replace('-', ' ').toUpperCase()}
                </span>
                {article.subcategory && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {article.subcategory.replace('-', ' ')}
                  </span>
                )}
                <span>{article.view_count} views</span>
                <span>
                  Updated {new Date(article.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            {/* Render content as HTML */}
            <div
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="help-article-content"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Was this article helpful?
            <button
              onClick={() => navigate('/help')}
              className="text-[#4ECDC4] hover:text-[#4ECDC4]/80 ml-1 underline"
            >
              Provide feedback
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
