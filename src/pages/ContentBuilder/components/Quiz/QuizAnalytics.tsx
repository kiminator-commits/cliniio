import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiChartLine,
  mdiAccountGroup,
  mdiClock,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiRefresh,
} from '@mdi/js';
import { LessonQuiz } from '../../types';

interface QuizAttempt {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // in minutes
  attempts: number;
}

interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  correctAnswers: number;
  totalAttempts: number;
  averageTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  successRate: number;
}

interface QuizAnalyticsProps {
  quiz: LessonQuiz;
  attempts?: QuizAttempt[];
  onRefresh?: () => void;
}

const QuizAnalytics: React.FC<QuizAnalyticsProps> = ({
  quiz,
  attempts = [],
  onRefresh,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>(
    '30d'
  );
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // Filter attempts based on time range
  const filteredAttempts = attempts.filter((attempt) => {
    if (timeRange === 'all') return true;

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return new Date(attempt.startTime) >= cutoffDate;
  });

  // Calculate overall statistics
  const totalAttempts = filteredAttempts.length;
  const passedAttempts = filteredAttempts.filter((a) => a.passed).length;
  const passRate =
    totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
  const averageScore =
    totalAttempts > 0
      ? filteredAttempts.reduce((sum, a) => sum + a.percentage, 0) /
        totalAttempts
      : 0;
  const averageTime =
    totalAttempts > 0
      ? filteredAttempts.reduce((sum, a) => sum + a.timeSpent, 0) /
        totalAttempts
      : 0;

  // Calculate question-level analytics
  const questionAnalytics: QuestionAnalytics[] = quiz.questions.map(
    (question) => {
      const questionAttempts = filteredAttempts.filter(
        (attempt) => attempt.score > 0 // Only count attempts where the question was answered
      );

      const correctAnswers = questionAttempts.filter(
        (attempt) => attempt.percentage >= quiz.passingScore
      ).length;

      return {
        questionId: question.id,
        questionText: question.question,
        correctAnswers,
        totalAttempts: questionAttempts.length,
        averageTime:
          questionAttempts.length > 0
            ? questionAttempts.reduce((sum, a) => sum + a.timeSpent, 0) /
              questionAttempts.length
            : 0,
        difficulty: question.difficulty,
        successRate:
          questionAttempts.length > 0
            ? (correctAnswers / questionAttempts.length) * 100
            : 0,
      };
    }
  );

  // Get recent activity
  const recentAttempts = filteredAttempts
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
    .slice(0, 10);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quiz Analytics</h2>
          <p className="text-gray-600">
            Performance insights for "{quiz.title}"
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Icon path={mdiRefresh} size={1} />
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon
                path={mdiAccountGroup}
                size={1.5}
                className="text-blue-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Attempts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalAttempts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Icon
                path={mdiCheckCircle}
                size={1.5}
                className="text-green-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {passRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Icon
                path={mdiChartLine}
                size={1.5}
                className="text-yellow-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Icon path={mdiClock} size={1.5} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageTime.toFixed(1)}m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Performance */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Question Performance
          </h3>
          <p className="text-sm text-gray-600">
            How learners performed on each question
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questionAnalytics.map((question, index) => (
                <tr
                  key={question.questionId}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedQuestion(question.questionId)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Q{index + 1}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {question.questionText}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}
                    >
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${question.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {question.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {question.totalAttempts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {question.averageTime.toFixed(1)}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-600">Latest quiz attempts</p>
        </div>

        <div className="p-6">
          {recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent attempts found
            </div>
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        attempt.passed ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <Icon
                        path={attempt.passed ? mdiCheckCircle : mdiAlertCircle}
                        size={1}
                        className={
                          attempt.passed ? 'text-green-600' : 'text-red-600'
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attempt.userName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(attempt.startTime).toLocaleDateString()} at{' '}
                        {new Date(attempt.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {attempt.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {attempt.timeSpent}m
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Question Details
              </h3>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Question details would go here */}
              <p className="text-gray-600">
                Detailed analytics for the selected question would be displayed
                here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAnalytics;
