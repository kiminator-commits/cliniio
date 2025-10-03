import React, { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiPlus,
  mdiPencil,
  mdiDelete,
  mdiEye,
  mdiTag,
  mdiAccount,
  mdiCalendar,
  mdiLock,
  mdiLockOpen,
} from '@mdi/js';
import { QuestionBank, QuizQuestion } from '../../types';

interface QuestionBankViewerProps {
  questionBank: QuestionBank;
  onBack: () => void;
  onEdit: (questionBank: QuestionBank) => void;
  onDelete: (id: string) => void;
  onAddQuestion: (question: QuizQuestion) => void;
  onEditQuestion: (question: QuizQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onImportQuestions: (questions: QuizQuestion[]) => void;
}

export const QuestionBankViewer: React.FC<QuestionBankViewerProps> = ({
  questionBank,
  onBack,
  onEdit,
  onDelete,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onImportQuestions,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleEditBank = useCallback(() => {
    onEdit(questionBank);
  }, [onEdit, questionBank]);

  const handleDeleteBank = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this question bank?')) {
      onDelete(questionBank.id);
    }
  }, [onDelete, questionBank.id]);

  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'multiple-choice',
      options: [''],
      correctAnswer: '',
      points: 1,
      difficulty: 'medium',
      tags: [],
    };
    setSelectedQuestion(newQuestion);
    setIsEditingQuestion(true);
  }, []);

  const handleEditQuestion = useCallback((question: QuizQuestion) => {
    setSelectedQuestion(question);
    setIsEditingQuestion(true);
  }, []);

  const handleSaveQuestion = useCallback(() => {
    if (selectedQuestion && selectedQuestion.question.trim()) {
      if (selectedQuestion.id.startsWith('q_')) {
        onAddQuestion(selectedQuestion);
      } else {
        onEditQuestion(selectedQuestion);
      }
      setIsEditingQuestion(false);
      setSelectedQuestion(null);
    }
  }, [selectedQuestion, onAddQuestion, onEditQuestion]);

  const handleCancelQuestion = useCallback(() => {
    setIsEditingQuestion(false);
    setSelectedQuestion(null);
  }, []);

  const handleDeleteQuestion = useCallback(
    (id: string) => {
      if (window.confirm('Are you sure you want to delete this question?')) {
        onDeleteQuestion(id);
      }
    },
    [onDeleteQuestion]
  );

  const filteredQuestions = questionBank.questions.filter((question) => {
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || question.type === filterType;
    const matchesDifficulty =
      filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const questionTypes = [
    'multiple-choice',
    'true-false',
    'fill-blank',
    'matching',
    'drag-drop',
    'hotspot',
  ];

  if (isEditingQuestion && selectedQuestion) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedQuestion.id.startsWith('q_')
            ? 'Add New Question'
            : 'Edit Question'}
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="question-text"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Question
            </label>
            <textarea
              id="question-text"
              value={selectedQuestion.question}
              onChange={(e) =>
                setSelectedQuestion({
                  ...selectedQuestion,
                  question: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              placeholder="Enter your question"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="question-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type
              </label>
              <select
                id="question-type"
                value={selectedQuestion.type}
                onChange={(e) =>
                  setSelectedQuestion({
                    ...selectedQuestion,
                    type: e.target.value as QuizQuestion['type'],
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {questionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="question-difficulty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty
              </label>
              <select
                id="question-difficulty"
                value={selectedQuestion.difficulty}
                onChange={(e) =>
                  setSelectedQuestion({
                    ...selectedQuestion,
                    difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="question-points"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Points
            </label>
            <input
              id="question-points"
              type="number"
              min="1"
              value={selectedQuestion.points}
              onChange={(e) =>
                setSelectedQuestion({
                  ...selectedQuestion,
                  points: parseInt(e.target.value) || 1,
                })
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="question-tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags (comma-separated)
            </label>
            <input
              id="question-tags"
              type="text"
              value={selectedQuestion.tags?.join(', ') || ''}
              onChange={(e) =>
                setSelectedQuestion({
                  ...selectedQuestion,
                  tags: e.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter tags"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelQuestion}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuestion}
              disabled={!selectedQuestion.question.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <Icon path={mdiArrowLeft} size={1} className="mr-2" />
            Back to Question Banks
          </button>
          <h1 className="text-2xl font-bold">{questionBank.name}</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleEditBank}
            className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            <Icon path={mdiPencil} size={0.8} className="mr-2" />
            Edit Bank
          </button>
          <button
            onClick={handleDeleteBank}
            className="flex items-center px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
          >
            <Icon path={mdiDelete} size={0.8} className="mr-2" />
            Delete Bank
          </button>
        </div>
      </div>

      {/* Bank Info */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Bank Information</h3>
            {questionBank.description && (
              <p className="text-gray-600 mb-4">{questionBank.description}</p>
            )}

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Icon path={mdiTag} size={0.6} className="mr-2" />
                <span className="capitalize">{questionBank.difficulty}</span>
                {questionBank.category && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{questionBank.category}</span>
                  </>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Icon path={mdiAccount} size={0.6} className="mr-2" />
                <span>{questionBank.questions.length} questions</span>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Icon path={mdiCalendar} size={0.6} className="mr-2" />
                <span>
                  Created{' '}
                  {new Date(questionBank.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                {questionBank.isPublic ? (
                  <Icon
                    path={mdiLockOpen}
                    size={0.6}
                    className="mr-2 text-green-600"
                  />
                ) : (
                  <Icon
                    path={mdiLock}
                    size={0.6}
                    className="mr-2 text-gray-600"
                  />
                )}
                <span>{questionBank.isPublic ? 'Public' : 'Private'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleAddQuestion}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Icon path={mdiPlus} size={0.8} className="mr-2" />
                Add New Question
              </button>

              <button
                onClick={() => onImportQuestions(questionBank.questions)}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Icon path={mdiEye} size={0.8} className="mr-2" />
                Import All Questions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            Questions ({questionBank.questions.length})
          </h3>
          <button
            onClick={handleAddQuestion}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Icon path={mdiPlus} size={0.8} className="mr-2" />
            Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label
              htmlFor="search-questions"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Questions
            </label>
            <input
              id="search-questions"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Search questions..."
            />
          </div>

          <div>
            <label
              htmlFor="filter-question-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Question Type
            </label>
            <select
              id="filter-question-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">All Types</option>
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-difficulty"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Difficulty
            </label>
            <select
              id="filter-difficulty"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <div
              key={question.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 font-mono">
                    #{index + 1}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      question.difficulty === 'easy'
                        ? 'bg-green-100 text-green-800'
                        : question.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {question.difficulty}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {question.type.replace('-', ' ')}
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {question.points} pt{question.points !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Icon path={mdiPencil} size={0.8} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Icon path={mdiDelete} size={0.8} />
                  </button>
                </div>
              </div>

              <p className="text-gray-900 mb-2">{question.question}</p>

              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {question.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {question.explanation && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              )}
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No questions found matching your criteria.</p>
              {questionBank.questions.length === 0 && (
                <p className="mt-2">Add your first question to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
