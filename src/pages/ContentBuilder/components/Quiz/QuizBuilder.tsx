import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiContentSave,
  mdiEye,
  mdiCog,
  mdiChevronDown,
  mdiChevronUp,
  mdiDrag,
  mdiHelpCircle,
  mdiAlertCircle,
} from '@mdi/js';
import { LessonQuiz, QuizQuestion } from '../../types';
import QuizEditor from './QuizEditor';
import QuizPreview from './QuizPreview';

// Utility function to generate unique IDs
const generateQuizId = () => `quiz-${crypto.randomUUID()}`;

interface QuizBuilderProps {
  quiz?: LessonQuiz;
  onSave: (quiz: LessonQuiz) => void;
  onCancel: () => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({
  quiz,
  onSave,
  onCancel,
}) => {
  const [quizData, setQuizData] = useState<LessonQuiz>(
    quiz || {
      id: generateQuizId(),
      title: '',
      description: '',
      questions: [],
      passingScore: 70,
      timeLimit: undefined,
      allowRetries: true,
      maxRetries: 3,
      isRequired: true,
      showResults: true,
      randomizeQuestions: false,
    }
  );

  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['general', 'questions'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `question-${Date.now()}`,
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      explanation: '',
      difficulty: 'medium',
      tags: [],
    };

    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
    });
  };

  const updateQuestion = (
    questionId: string,
    updates: Partial<QuizQuestion>
  ) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const removeQuestion = (questionId: string) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter((q) => q.id !== questionId),
    });
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = quizData.questions.findIndex(
      (q) => q.id === questionId
    );
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= quizData.questions.length) return;

    const newQuestions = [...quizData.questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[currentIndex],
    ];

    setQuizData({
      ...quizData,
      questions: newQuestions,
    });
  };

  const handleSave = () => {
    if (quizData.title.trim() === '') {
      alert('Please enter a quiz title');
      return;
    }
    if (quizData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    onSave(quizData);
  };

  const getValidationStatus = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!quizData.title.trim()) errors.push('Quiz title is required');
    if (quizData.questions.length === 0)
      errors.push('At least one question is required');

    const questionsWithContent = quizData.questions.filter(
      (q) => q.question.trim() && q.correctAnswer
    );
    if (questionsWithContent.length < quizData.questions.length) {
      warnings.push('Some questions are incomplete');
    }

    if (quizData.passingScore < 50) warnings.push('Passing score is quite low');
    if (quizData.passingScore > 90)
      warnings.push('Passing score is quite high');

    return { errors, warnings };
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quiz Builder</h2>
          <p className="text-gray-600">
            Create engaging assessments for your course
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setActiveTab(activeTab === 'builder' ? 'preview' : 'builder')
            }
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <Icon path={activeTab === 'builder' ? mdiEye : mdiCog} size={1} />
            {activeTab === 'builder' ? 'Preview' : 'Builder'}
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Icon path={mdiContentSave} size={1} />
            Save Quiz
          </button>

          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {(validationStatus.errors.length > 0 ||
        validationStatus.warnings.length > 0) && (
        <div className="mb-6 space-y-3">
          {validationStatus.errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <Icon path={mdiAlertCircle} size={1} className="text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          ))}

          {validationStatus.warnings.map((warning, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
            >
              <Icon
                path={mdiAlertCircle}
                size={1}
                className="text-yellow-600"
              />
              <span className="text-yellow-800">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'builder' ? (
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('general')}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                General Settings
              </h3>
              <Icon
                path={
                  expandedSections.has('general')
                    ? mdiChevronUp
                    : mdiChevronDown
                }
                size={1}
                className="text-gray-400"
              />
            </button>

            {expandedSections.has('general') && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                <div>
                  <label
                    htmlFor="quiz-title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Quiz Title *
                  </label>
                  <input
                    id="quiz-title"
                    type="text"
                    value={quizData.title}
                    onChange={(e) =>
                      setQuizData({ ...quizData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quiz title..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="quiz-description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="quiz-description"
                    value={quizData.description}
                    onChange={(e) =>
                      setQuizData({ ...quizData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter quiz description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quiz-passing-score"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Passing Score (%)
                    </label>
                    <input
                      id="quiz-passing-score"
                      type="number"
                      value={quizData.passingScore}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          passingScore: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quiz-time-limit"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Time Limit (minutes)
                    </label>
                    <input
                      id="quiz-time-limit"
                      type="number"
                      value={quizData.timeLimit || ''}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          timeLimit: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowRetries"
                      checked={quizData.allowRetries}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          allowRetries: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="allowRetries"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Allow Retries
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showResults"
                      checked={quizData.showResults}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          showResults: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="showResults"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Show Results
                    </label>
                  </div>
                </div>

                {quizData.allowRetries && (
                  <div>
                    <label
                      htmlFor="quiz-max-retries"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Maximum Retries
                    </label>
                    <input
                      id="quiz-max-retries"
                      type="number"
                      value={quizData.maxRetries}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          maxRetries: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Questions Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('questions')}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Questions
                </h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {quizData.questions.length} question
                  {quizData.questions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Icon
                path={
                  expandedSections.has('questions')
                    ? mdiChevronUp
                    : mdiChevronDown
                }
                size={1}
                className="text-gray-400"
              />
            </button>

            {expandedSections.has('questions') && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Add questions to test learner knowledge
                  </p>
                  <button
                    onClick={addQuestion}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Icon path={mdiPlus} size={1} />
                    Add Question
                  </button>
                </div>

                {quizData.questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon
                      path={mdiHelpCircle}
                      size={3}
                      className="mx-auto text-gray-300 mb-3"
                    />
                    <p>No questions added yet</p>
                    <p className="text-sm">
                      Click "Add Question" to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quizData.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Icon
                            path={mdiDrag}
                            size={1}
                            className="text-gray-400 cursor-move"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Q{index + 1}
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
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {question.points} point
                            {question.points !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <QuizEditor
                          question={question}
                          onUpdate={(updates) =>
                            updateQuestion(question.id, updates)
                          }
                          onDelete={() => removeQuestion(question.id)}
                          onMoveUp={() => moveQuestion(question.id, 'up')}
                          onMoveDown={() => moveQuestion(question.id, 'down')}
                          canMoveUp={index > 0}
                          canMoveDown={index < quizData.questions.length - 1}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <QuizPreview quiz={quizData} />
      )}
    </div>
  );
};

export default QuizBuilder;
