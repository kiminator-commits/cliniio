import React from 'react';
import { QuizQuestion } from '../../types';
import MultipleChoice from './QuestionTypes/MultipleChoice';
import TrueFalse from './QuestionTypes/TrueFalse';
import FillBlank from './QuestionTypes/FillBlank';
import Matching from './QuestionTypes/Matching';
import DragDrop from './QuestionTypes/DragDrop';
import Hotspot from './QuestionTypes/Hotspot';

interface QuizRendererProps {
  question: QuizQuestion;
  userAnswer?: string | string[] | boolean;
  onAnswerChange: (answer: string | string[] | boolean) => void;
  isPreview?: boolean;
}

const QuizRenderer: React.FC<QuizRendererProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  isPreview = false,
}) => {
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <MultipleChoice
            question={question}
            userAnswer={userAnswer as string}
            onAnswerChange={onAnswerChange}
            isPreview={isPreview}
          />
        );

      case 'true-false':
        return (
          <TrueFalse
            question={question}
            userAnswer={userAnswer as string}
            onAnswerChange={onAnswerChange}
            isPreview={isPreview}
          />
        );

      case 'fill-blank':
        return (
          <FillBlank
            question={question}
            userAnswer={userAnswer as string | string[]}
            onAnswerChange={onAnswerChange}
            isPreview={isPreview}
          />
        );

      case 'matching':
        return (
          <Matching
            question={question}
            userAnswer={userAnswer as unknown as Record<string, string>}
            onAnswerChange={
              onAnswerChange as unknown as (
                answer: Record<string, string>
              ) => void
            }
            isPreview={isPreview}
          />
        );

      case 'drag-drop':
        return (
          <DragDrop
            question={question}
            userAnswer={userAnswer as string[]}
            onAnswerChange={onAnswerChange}
            isPreview={isPreview}
          />
        );

      case 'hotspot':
        return (
          <Hotspot
            question={question}
            userAnswer={userAnswer as unknown as { x: number; y: number }[]}
            onAnswerChange={
              onAnswerChange as unknown as (
                answer: { x: number; y: number }[]
              ) => void
            }
            isPreview={isPreview}
          />
        );

      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div className="text-lg text-gray-900 leading-relaxed">
        {question.question}
      </div>

      {/* Question Type Specific Renderer */}
      {renderQuestionContent()}

      {/* Explanation (if preview mode and explanation exists) */}
      {isPreview && question.explanation && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Explanation:
          </div>
          <div className="text-sm text-blue-700">{question.explanation}</div>
        </div>
      )}
    </div>
  );
};

export default QuizRenderer;
