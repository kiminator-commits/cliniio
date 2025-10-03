import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiClock,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiPlay,
  mdiPause,
  mdiRefresh,
} from '@mdi/js';
import { LessonQuiz } from '../../types';
import QuizRenderer from './QuizRenderer';

interface QuizPreviewProps {
  quiz: LessonQuiz;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | boolean>
  >({});
  const [timeRemaining, setTimeRemaining] = useState(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const startQuiz = () => {
    setIsStarted(true);
    if (quiz.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60);
    }
  };

  const pauseQuiz = () => {
    setIsPaused(!isPaused);
  };

  const resetQuiz = () => {
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null);
    setIsPaused(false);
    setShowResults(false);
  };

  const submitAnswer = (
    questionId: string,
    answer: string | string[] | boolean
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];

      if (userAnswer) {
        if (
          question.type === 'multiple-choice' ||
          question.type === 'true-false'
        ) {
          if (userAnswer === question.correctAnswer) {
            earnedPoints += question.points;
          }
        } else if (question.type === 'fill-blank') {
          if (Array.isArray(question.correctAnswer)) {
            const isCorrect =
              Array.isArray(userAnswer) &&
              userAnswer.length === question.correctAnswer.length &&
              userAnswer.every(
                (ans, index) =>
                  question.correctAnswer[index].toLowerCase() ===
                  ans.toLowerCase()
              );
            if (isCorrect) earnedPoints += question.points;
          } else {
            if (
              typeof userAnswer === 'string' &&
              userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()
            ) {
              earnedPoints += question.points;
            }
          }
        }
        // Add more question type scoring logic here
      }
    });

    return {
      totalPoints,
      earnedPoints,
      percentage: Math.round((earnedPoints / totalPoints) * 100),
    };
  };

  const getPassedStatus = () => {
    const { percentage } = calculateScore();
    return percentage >= quiz.passingScore;
  };

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {quiz.title}
          </h3>

          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {quiz.questions.length}
              </div>
              <div className="text-sm text-blue-600">Questions</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {quiz.passingScore}%
              </div>
              <div className="text-sm text-green-600">Passing Score</div>
            </div>

            {quiz.timeLimit && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {quiz.timeLimit}
                </div>
                <div className="text-sm text-yellow-600">Minutes</div>
              </div>
            )}

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {quiz.allowRetries ? quiz.maxRetries : 0}
              </div>
              <div className="text-sm text-purple-600">Retries</div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
          >
            <Icon path={mdiPlay} size={1.2} />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const { totalPoints, earnedPoints, percentage } = calculateScore();
    const passed = getPassedStatus();

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <Icon
              path={passed ? mdiCheckCircle : mdiAlertCircle}
              size={2}
              className={passed ? 'text-green-600' : 'text-red-600'}
            />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations! You passed!' : 'Quiz completed'}
          </h3>

          <p className="text-gray-600 mb-6">
            {passed
              ? `You scored ${percentage}% and met the passing requirement of ${quiz.passingScore}%`
              : `You scored ${percentage}% but needed ${quiz.passingScore}% to pass`}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {earnedPoints}
              </div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {totalPoints}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Icon path={mdiRefresh} size={1} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Quiz Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>

          <div className="flex items-center gap-4">
            {quiz.timeLimit && timeRemaining !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Icon path={mdiClock} size={1} className="text-gray-400" />
                <span className="font-mono">
                  {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            <button
              onClick={pauseQuiz}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <Icon path={isPaused ? mdiPlay : mdiPause} size={1} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
            Q{currentQuestionIndex + 1}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              currentQuestion.difficulty === 'easy'
                ? 'bg-green-100 text-green-800'
                : currentQuestion.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {currentQuestion.difficulty}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {currentQuestion.points} point
            {currentQuestion.points !== 1 ? 's' : ''}
          </span>
        </div>

        <QuizRenderer
          question={currentQuestion}
          userAnswer={answers[currentQuestion.id]}
          onAnswerChange={(answer) => submitAnswer(currentQuestion.id, answer)}
          isPreview={true}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded-md ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Previous
        </button>

        <div className="flex gap-2">
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={finishQuiz}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Finish Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
