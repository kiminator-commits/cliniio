import React, { useState, useEffect, useCallback } from 'react';
import {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizAnswer,
} from '../services/types/knowledgeHubTypes';
import { QuizService } from '../services/quizService';

interface QuizComponentProps {
  quizId: string;
  onComplete?: (score: number, passed: boolean) => void;
  onClose?: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  quizId,
  onComplete,
  onClose,
}) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  // startTime variable removed as it's not used
  const [questionStartTimes, setQuestionStartTimes] = useState<
    Record<string, Date>
  >({});

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const quizData = await QuizService.getQuizWithQuestions(quizId);
      if (!quizData) {
        setError('Quiz not found');
        return;
      }

      setQuiz(quizData.quiz);
      setQuestions(quizData.questions);

      // Initialize timing for first question
      if (quizData.questions.length > 0) {
        setQuestionStartTimes({
          [quizData.questions[0].id]: new Date(),
        });
      }

      // Start or resume quiz attempt
      const quizAttempt = await QuizService.startQuizAttempt(quizId);
      if (quizAttempt) {
        setAttempt(quizAttempt);

        // Load existing answers if resuming
        if (quizAttempt.answers) {
          const existingAnswers: { [questionId: string]: string } = {};
          quizAttempt.answers.forEach((answer: QuizAnswer) => {
            existingAnswers[answer.question_id] = answer.user_answer;
          });
          setAnswers(existingAnswers);
        }

        // Start timing if this is a new attempt
        if (!quizAttempt.answers || quizAttempt.answers.length === 0) {
          // Initialize timing for first question
          if (quizData.questions.length > 0) {
            setQuestionStartTimes({
              [quizData.questions[0].id]: new Date(),
            });
          }
        }
      }
    } catch (err) {
      console.error('Error loading quiz:', err);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadQuiz();
  }, [quizId, loadQuiz]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Track time spent on current question
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && questionStartTimes[currentQuestion.id]) {
        const timeSpent = Math.round(
          (Date.now() - questionStartTimes[currentQuestion.id].getTime()) / 1000
        );
        console.log(
          `Time spent on question ${currentQuestion.id}: ${timeSpent} seconds`
        );
      }

      setCurrentQuestionIndex((prev) => prev + 1);

      // Start timing for next question
      const nextQuestion = questions[currentQuestionIndex + 1];
      if (nextQuestion) {
        setQuestionStartTimes((prev) => ({
          ...prev,
          [nextQuestion.id]: new Date(),
        }));
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Track time spent on current question
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && questionStartTimes[currentQuestion.id]) {
        const timeSpent = Math.round(
          (Date.now() - questionStartTimes[currentQuestion.id].getTime()) / 1000
        );
        console.log(
          `Time spent on question ${currentQuestion.id}: ${timeSpent} seconds`
        );
      }

      setCurrentQuestionIndex((prev) => prev - 1);

      // Start timing for previous question
      const prevQuestion = questions[currentQuestionIndex - 1];
      if (prevQuestion) {
        setQuestionStartTimes((prev) => ({
          ...prev,
          [prevQuestion.id]: new Date(),
        }));
      }
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;

    try {
      setSubmitting(true);

      // Convert answers to QuizAnswer format with timing
      const quizAnswers: QuizAnswer[] = Object.entries(answers).map(
        ([questionId, userAnswer]) => {
          // Calculate time spent on this question
          let timeSpent = 0;
          if (questionStartTimes[questionId]) {
            timeSpent = Math.round(
              (Date.now() - questionStartTimes[questionId].getTime()) / 1000
            );
          }

          return {
            question_id: questionId,
            user_answer: userAnswer,
            is_correct: false, // Will be calculated by service
            time_spent_seconds: timeSpent,
          };
        }
      );

      const result = await QuizService.submitQuizAttempt(
        attempt.id,
        quizAnswers
      );

      if (result.success) {
        setResult(result);
        setCompleted(true);
        onComplete?.(result.score, result.passed);
      } else {
        setError('Failed to submit quiz');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    return Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading quiz...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading quiz</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button
          onClick={loadQuiz}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (completed && result) {
    return (
      <div className="text-center py-8">
        <div
          className={`text-2xl font-bold mb-4 ${result.passed ? 'text-green-600' : 'text-red-600'}`}
        >
          {result.passed ? 'Quiz Passed!' : 'Quiz Failed'}
        </div>
        <div className="text-lg mb-4">Score: {result.score}%</div>
        <div className="text-gray-600 mb-6">
          {result.passed
            ? 'Congratulations! You have successfully completed this quiz.'
            : `You need ${quiz?.passing_score || 70}% to pass. Keep studying and try again!`}
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600">No quiz available</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
        {quiz.description && (
          <p className="text-gray-600 mb-4">{quiz.description}</p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {getAnsweredCount()} of {questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-4">
            {currentQuestion.question_text}
          </h3>

          {/* Answer Options */}
          {currentQuestion.question_type === 'multiple_choice' &&
            currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value)
                      }
                      className="mr-3"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

          {currentQuestion.question_type === 'true_false' && (
            <div className="space-y-3">
              {['True', 'False'].map((option) => (
                <label
                  key={option}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.question_type === 'short_answer' && (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              placeholder="Enter your answer..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || getAnsweredCount() < questions.length}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded text-sm font-medium ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white'
                  : answers[questions[index].id]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;
