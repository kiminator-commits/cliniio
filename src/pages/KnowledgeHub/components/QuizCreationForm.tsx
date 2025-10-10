import React, { useState } from 'react';
import { KnowledgeHubService } from '../services/knowledgeHubService';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category_id: string;
  passing_score: number;
  time_limit_minutes: number;
  questions: Question[];
}

interface QuizCreationFormProps {
  onQuizCreated?: (quiz: Quiz) => void;
  onCancel?: () => void;
}

interface Question {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
}

export const QuizCreationForm: React.FC<QuizCreationFormProps> = ({
  onQuizCreated,
  onCancel,
}) => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category_id: '',
    passing_score: 70,
    time_limit_minutes: 15,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      points: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuizDataChange = (field: string, value: string | number) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string | number | string[]
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!quizData.title.trim()) {
        throw new Error('Quiz title is required');
      }

      if (questions.some((q) => !q.question_text.trim())) {
        throw new Error('All questions must have text');
      }

      if (questions.some((q) => !q.correct_answer.trim())) {
        throw new Error('All questions must have correct answers');
      }

      // Create quiz
      const quiz = await KnowledgeHubService.createQuiz(quizData);
      if (!quiz) {
        throw new Error('Failed to create quiz');
      }

      // TODO: Create questions for the quiz // TRACK: Migrate to GitHub issue
      // This would require additional service methods

      onQuizCreated?.(quiz as unknown as Quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create New Quiz
        </h2>
        <p className="text-gray-600">
          Design an interactive quiz to test knowledge
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quizTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quiz Title *
            </label>
            <input
              id="quizTitle"
              type="text"
              value={quizData.title}
              onChange={(e) => handleQuizDataChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="quizCategory"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="quizCategory"
              value={quizData.category_id}
              onChange={(e) =>
                handleQuizDataChange('category_id', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select category</option>
              <option value="general">General Knowledge</option>
              <option value="procedures">Procedures</option>
              <option value="policies">Policies</option>
              <option value="safety">Safety</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="passingScore"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Passing Score (%) *
            </label>
            <input
              id="passingScore"
              type="number"
              min="0"
              max="100"
              value={quizData.passing_score}
              onChange={(e) =>
                handleQuizDataChange('passing_score', parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="timeLimit"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Time Limit (minutes)
            </label>
            <input
              id="timeLimit"
              type="number"
              min="1"
              value={quizData.time_limit_minutes}
              onChange={(e) =>
                handleQuizDataChange(
                  'time_limit_minutes',
                  parseInt(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="quizDescription"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="quizDescription"
            value={quizData.description}
            onChange={(e) =>
              handleQuizDataChange('description', e.target.value)
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe what this quiz covers"
          />
        </div>

        {/* Questions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-800">
                    Question {index + 1}
                  </h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`question-text-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Question Text *
                    </label>
                    <input
                      id={`question-text-${index}`}
                      type="text"
                      value={question.question_text}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          'question_text',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your question"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`question-type-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Question Type *
                    </label>
                    <select
                      id={`question-type-${index}`}
                      value={question.question_type}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          'question_type',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`question-points-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Points *
                    </label>
                    <input
                      id={`question-points-${index}`}
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          'points',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {question.question_type === 'multiple_choice' && (
                    <div className="md:col-span-2">
                      <label
                        htmlFor={`answer-options-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Answer Options
                      </label>
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-2"
                          >
                            <input
                              id={
                                optionIndex === 0
                                  ? `answer-options-${index}`
                                  : undefined
                              }
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [
                                  ...(question.options || []),
                                ];
                                newOptions[optionIndex] = e.target.value;
                                handleQuestionChange(
                                  index,
                                  'options',
                                  newOptions
                                );
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              checked={question.correct_answer === option}
                              onChange={() =>
                                handleQuestionChange(
                                  index,
                                  'correct_answer',
                                  option
                                )
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.question_type === 'true_false' && (
                    <div className="md:col-span-2">
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer *
                        </legend>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              value="True"
                              checked={question.correct_answer === 'True'}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  'correct_answer',
                                  e.target.value
                                )
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">True</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              value="False"
                              checked={question.correct_answer === 'False'}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  'correct_answer',
                                  e.target.value
                                )
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">False</span>
                          </label>
                        </div>
                      </fieldset>
                    </div>
                  )}

                  {question.question_type === 'short_answer' && (
                    <div className="md:col-span-2">
                      <label
                        htmlFor={`correct-answer-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Correct Answer *
                      </label>
                      <input
                        id={`correct-answer-${index}`}
                        type="text"
                        value={question.correct_answer}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            'correct_answer',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter the correct answer"
                        required
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label
                      htmlFor={`explanation-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Explanation (Optional)
                    </label>
                    <textarea
                      id={`explanation-${index}`}
                      value={question.explanation}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          'explanation',
                          e.target.value
                        )
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Explain why this answer is correct"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};
