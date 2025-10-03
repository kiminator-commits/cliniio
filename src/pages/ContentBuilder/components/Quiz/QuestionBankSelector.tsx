import React, { useState, useCallback, useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { QuestionBank, QuizQuestion } from '../../types';

interface QuestionBankSelectorProps {
  questionBanks: QuestionBank[];
  onImportQuestions: (questions: QuizQuestion[]) => void;
  onClose: () => void;
}

export const QuestionBankSelector: React.FC<QuestionBankSelectorProps> = ({
  questionBanks,
  onImportQuestions,
  onClose,
}) => {
  const [selectedBanks, setSelectedBanks] = useState<Set<string>>(new Set());
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'banks' | 'questions'>('banks');

  const handleBankToggle = useCallback(
    (bankId: string) => {
      const newSelected = new Set(selectedBanks);
      if (newSelected.has(bankId)) {
        newSelected.delete(bankId);
      } else {
        newSelected.add(bankId);
      }
      setSelectedBanks(newSelected);
    },
    [selectedBanks]
  );

  const handleQuestionToggle = useCallback(
    (questionId: string) => {
      const newSelected = new Set(selectedQuestions);
      if (newSelected.has(questionId)) {
        newSelected.delete(questionId);
      } else {
        newSelected.add(questionId);
      }
      setSelectedQuestions(newSelected);
    },
    [selectedQuestions]
  );

  const handleSelectAllQuestions = useCallback(
    (bankId: string) => {
      const bank = questionBanks.find((b) => b.id === bankId);
      if (bank) {
        const newSelected = new Set(selectedQuestions);
        bank.questions.forEach((q) => newSelected.add(q.id));
        setSelectedQuestions(newSelected);
      }
    },
    [questionBanks, selectedQuestions]
  );

  const handleDeselectAllQuestions = useCallback(
    (bankId: string) => {
      const bank = questionBanks.find((b) => b.id === bankId);
      if (bank) {
        const newSelected = new Set(selectedQuestions);
        bank.questions.forEach((q) => newSelected.delete(q.id));
        setSelectedQuestions(newSelected);
      }
    },
    [questionBanks, selectedQuestions]
  );

  const handleImportSelected = useCallback(() => {
    const questionsToImport = questionBanks
      .flatMap((bank) => bank.questions)
      .filter((question) => selectedQuestions.has(question.id));

    if (questionsToImport.length > 0) {
      onImportQuestions(questionsToImport);
      onClose();
    }
  }, [questionBanks, selectedQuestions, onImportQuestions, onClose]);

  const filteredBanks = useMemo(() => {
    return questionBanks.filter((bank) => {
      const matchesSearch =
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'all' || bank.category === filterCategory;
      const matchesDifficulty =
        filterDifficulty === 'all' || bank.difficulty === filterDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [questionBanks, searchTerm, filterCategory, filterDifficulty]);

  const filteredQuestions = useMemo(() => {
    const allQuestions = questionBanks.flatMap((bank) => bank.questions);
    return allQuestions.filter((question) => {
      const matchesSearch = question.question
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || question.type === filterType;
      const matchesDifficulty =
        filterDifficulty === 'all' || question.difficulty === filterDifficulty;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }, [questionBanks, searchTerm, filterType, filterDifficulty]);

  const categories = Array.from(
    new Set(questionBanks.map((bank) => bank.category))
  ).filter(Boolean);
  const questionTypes = [
    'multiple-choice',
    'true-false',
    'fill-blank',
    'matching',
    'drag-drop',
    'hotspot',
  ];

  const selectedQuestionsCount = selectedQuestions.size;
  const totalQuestionsCount = questionBanks.reduce(
    (total, bank) => total + bank.questions.length,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Select Questions from Question Banks
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode('banks')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'banks'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                View by Banks
              </button>
              <button
                onClick={() => setViewMode('questions')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'questions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                View by Questions
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {selectedQuestionsCount} of {totalQuestionsCount} questions
              selected
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="search-banks-questions"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <div className="relative">
                <Icon
                  path={mdiMagnify}
                  size={0.8}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  id="search-banks-questions"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                  placeholder="Search banks or questions..."
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="filter-category-selector"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="filter-category-selector"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-difficulty-selector"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty
              </label>
              <select
                id="filter-difficulty-selector"
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

            {viewMode === 'questions' && (
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
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {viewMode === 'banks' ? (
            <div className="space-y-4">
              {filteredBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedBanks.has(bank.id)}
                        onChange={() => handleBankToggle(bank.id)}
                        className="rounded"
                      />
                      <h3 className="font-semibold text-lg">{bank.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          bank.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : bank.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {bank.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {bank.questions.length} questions
                      </span>
                      <button
                        onClick={() => handleSelectAllQuestions(bank.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => handleDeselectAllQuestions(bank.id)}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {bank.description && (
                    <p className="text-gray-600 mb-3">{bank.description}</p>
                  )}

                  <div className="space-y-2">
                    {bank.questions.map((question) => (
                      <div
                        key={question.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.has(question.id)}
                            onChange={() => handleQuestionToggle(question.id)}
                            className="rounded"
                          />
                          <span className="text-sm">{question.question}</span>
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
                        </div>
                        <span className="text-sm text-gray-500">
                          {question.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question) => {
                const bank = questionBanks.find((b) =>
                  b.questions.some((q) => q.id === question.id)
                );
                return (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={() => handleQuestionToggle(question.id)}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium">{question.question}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>From: {bank?.name}</span>
                          <span>•</span>
                          <span className="capitalize">
                            {question.difficulty}
                          </span>
                          <span>•</span>
                          <span>{question.type.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>{question.points} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredBanks.length === 0 && viewMode === 'banks' && (
            <div className="text-center py-12 text-gray-500">
              <p>No question banks found matching your criteria.</p>
            </div>
          )}

          {filteredQuestions.length === 0 && viewMode === 'questions' && (
            <div className="text-center py-12 text-gray-500">
              <p>No questions found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImportSelected}
            disabled={selectedQuestionsCount === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Import {selectedQuestionsCount} Question
            {selectedQuestionsCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
