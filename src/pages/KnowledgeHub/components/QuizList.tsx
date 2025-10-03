import React, { useState } from 'react';
import { ContentItem } from '../types';
import QuizComponent from './QuizComponent';
import { QuizCreationForm } from './QuizCreationForm';

interface QuizListProps {
  quizzes: ContentItem[];
  onQuizStart?: (quizId: string) => void;
  onQuizComplete?: (quizId: string, score: number, passed: boolean) => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  onQuizStart,
  onQuizComplete,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setShowQuiz(true);
    onQuizStart?.(quizId);
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    if (selectedQuizId) {
      onQuizComplete?.(selectedQuizId, score, passed);
    }
    setShowQuiz(false);
    setSelectedQuizId(null);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setSelectedQuizId(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No quizzes available</div>
        <div className="text-gray-400 text-sm">
          Check back later for new knowledge assessments
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Knowledge Quizzes
          </h3>
          <p className="text-sm text-gray-600">
            Test your knowledge with interactive assessments
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Quiz
        </button>
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
          >
            {/* Quiz Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {quiz.title}
                </h3>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}
                  >
                    {quiz.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficultyLevel || 'medium')}`}
                  >
                    {quiz.difficultyLevel || 'Medium'}
                  </span>
                </div>
              </div>

              {/* Quiz Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {quiz.description ||
                  'Test your knowledge with this interactive quiz'}
              </p>

              {/* Quiz Metadata */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Duration:</span>
                  <span>{quiz.estimatedDuration || 15} min</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Category:</span>
                  <span>{quiz.category}</span>
                </div>
                {quiz.passingScore && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Passing Score:</span>
                    <span>{quiz.passingScore}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last Updated:</span>
                  <span>
                    {quiz.lastUpdated
                      ? new Date(quiz.lastUpdated).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Quiz Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Quiz
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {showQuiz && selectedQuizId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <QuizComponent
                quizId={selectedQuizId}
                onComplete={handleQuizComplete}
                onClose={handleCloseQuiz}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quiz Creation Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <QuizCreationForm
                onQuizCreated={(_quiz) => {
                  setShowCreateForm(false);
                  // TODO: Refresh quiz list // TRACK: Migrate to GitHub issue
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
