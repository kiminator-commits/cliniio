import React, { useState, useCallback } from 'react';
import { useCurrentUserId } from '../../../../utils/authUtils';
import Icon from '@mdi/react';
import {
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

interface QuestionBankManagerProps {
  questionBanks: QuestionBank[];
  onSave: (questionBank: QuestionBank) => void;
  onDelete: (id: string) => void;
  onImportQuestions: (questions: QuizQuestion[]) => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  questionBanks,
  onSave,
  onDelete,
  onImportQuestions,
}) => {
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const currentUserId = useCurrentUserId();

  const handleCreateNew = useCallback(() => {
    const newBank: QuestionBank = {
      id: `bank_${Date.now()}`,
      name: '',
      description: '',
      category: '',
      difficulty: 'medium',
      questions: [],
      tags: [],
      createdBy: currentUserId || 'unknown-user',
      createdAt: new Date(),
      isPublic: false,
    };
    setSelectedBank(newBank);
    setIsEditing(true);
  }, [currentUserId]);

  const handleEdit = useCallback((bank: QuestionBank) => {
    setSelectedBank(bank);
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    if (selectedBank && selectedBank.name.trim()) {
      onSave(selectedBank);
      setIsEditing(false);
      setSelectedBank(null);
    }
  }, [selectedBank, onSave]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setSelectedBank(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (
        window.confirm('Are you sure you want to delete this question bank?')
      ) {
        onDelete(id);
      }
    },
    [onDelete]
  );

  const handleImportQuestions = useCallback(
    (bank: QuestionBank) => {
      onImportQuestions(bank.questions);
    },
    [onImportQuestions]
  );

  const filteredBanks = questionBanks.filter((bank) => {
    const matchesSearch =
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || bank.category === filterCategory;
    const matchesDifficulty =
      filterDifficulty === 'all' || bank.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = Array.from(
    new Set(questionBanks.map((bank) => bank.category))
  ).filter(Boolean);

  if (isEditing && selectedBank) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedBank.id.startsWith('bank_')
            ? 'Create New Question Bank'
            : 'Edit Question Bank'}
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="bank-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="bank-name"
              type="text"
              value={selectedBank.name}
              onChange={(e) =>
                setSelectedBank({ ...selectedBank, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter question bank name"
            />
          </div>

          <div>
            <label
              htmlFor="bank-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="bank-description"
              value={selectedBank.description}
              onChange={(e) =>
                setSelectedBank({
                  ...selectedBank,
                  description: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              placeholder="Enter description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="bank-category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <input
                id="bank-category"
                type="text"
                value={selectedBank.category}
                onChange={(e) =>
                  setSelectedBank({ ...selectedBank, category: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter category"
              />
            </div>

            <div>
              <label
                htmlFor="bank-difficulty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty
              </label>
              <select
                id="bank-difficulty"
                value={selectedBank.difficulty}
                onChange={(e) =>
                  setSelectedBank({
                    ...selectedBank,
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
              htmlFor="bank-tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags (comma-separated)
            </label>
            <input
              id="bank-tags"
              type="text"
              value={selectedBank.tags.join(', ')}
              onChange={(e) =>
                setSelectedBank({
                  ...selectedBank,
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={selectedBank.isPublic}
              onChange={(e) =>
                setSelectedBank({ ...selectedBank, isPublic: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Make this question bank public
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedBank.name.trim()}
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Question Banks</h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Icon path={mdiPlus} size={0.8} className="mr-2" />
          Create New Bank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="search-banks"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <input
            id="search-banks"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Search banks..."
          />
        </div>

        <div>
          <label
            htmlFor="filter-category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="filter-category"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">{bank.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(bank)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <Icon path={mdiPencil} size={0.8} />
                </button>
                <button
                  onClick={() => handleDelete(bank.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Icon path={mdiDelete} size={0.8} />
                </button>
              </div>
            </div>

            {bank.description && (
              <p className="text-gray-600 text-sm mb-3">{bank.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Icon path={mdiTag} size={0.6} className="mr-1" />
                <span className="capitalize">{bank.difficulty}</span>
                {bank.category && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{bank.category}</span>
                  </>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Icon path={mdiAccount} size={0.6} className="mr-1" />
                <span>{bank.questions.length} questions</span>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Icon path={mdiCalendar} size={0.6} className="mr-1" />
                <span>{new Date(bank.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                {bank.isPublic ? (
                  <Icon
                    path={mdiLockOpen}
                    size={0.6}
                    className="mr-1 text-green-600"
                  />
                ) : (
                  <Icon
                    path={mdiLock}
                    size={0.6}
                    className="mr-1 text-gray-600"
                  />
                )}
                <span>{bank.isPublic ? 'Public' : 'Private'}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleImportQuestions(bank)}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Import Questions
              </button>
              <button
                onClick={() => setSelectedBank(bank)}
                className="px-3 py-2 text-blue-600 border border-blue-600 text-sm rounded hover:bg-blue-50"
              >
                <Icon path={mdiEye} size={0.8} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBanks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No question banks found matching your criteria.</p>
          {questionBanks.length === 0 && (
            <p className="mt-2">
              Create your first question bank to get started.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
