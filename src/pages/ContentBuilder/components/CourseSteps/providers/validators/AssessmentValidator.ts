import {
  Assessment,
  Question,
  AssessmentValidation,
  QuestionValidation,
} from '../types/assessmentTypes';

export class AssessmentValidator {
  /**
   * Validate assessment
   */
  validateAssessment(assessment: Assessment): AssessmentValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check title
    if (!assessment.title.trim()) {
      errors.push('Assessment title is required');
    } else if (assessment.title.trim().length < 3) {
      warnings.push('Assessment title should be at least 3 characters long');
    }

    // Check questions
    if (assessment.questions.length === 0) {
      errors.push('Assessment must have at least one question');
    }

    // Check passing score
    if (assessment.passingScore < 0 || assessment.passingScore > 100) {
      errors.push('Passing score must be between 0 and 100');
    }

    // Check time limit
    if (assessment.timeLimit !== undefined && assessment.timeLimit < 1) {
      errors.push('Time limit must be at least 1 minute');
    }

    // Validate individual questions
    assessment.questions.forEach((question, index) => {
      const questionValidation = this.validateQuestion(question);
      if (!questionValidation.isValid) {
        errors.push(
          `Question ${index + 1}: ${questionValidation.errors.join(', ')}`
        );
      }
      if (questionValidation.warnings.length > 0) {
        warnings.push(
          `Question ${index + 1}: ${questionValidation.warnings.join(', ')}`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate question
   */
  validateQuestion(question: Question): QuestionValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check text
    if (!question.text.trim()) {
      errors.push('Question text is required');
    } else if (question.text.trim().length < 10) {
      warnings.push('Question text should be more descriptive');
    }

    // Check type
    if (!question.type) {
      errors.push('Question type is required');
    }

    // Check points
    if (question.points < 1) {
      errors.push('Question must be worth at least 1 point');
    }

    // Type-specific validation
    switch (question.type) {
      case 'multiple-choice':
        if (!question.options || question.options.length < 2) {
          errors.push('Multiple choice questions must have at least 2 options');
        } else {
          const validOptions = question.options.filter((option) =>
            option.trim()
          );
          if (validOptions.length < 2) {
            errors.push(
              'Multiple choice questions must have at least 2 valid options'
            );
          }
          if (validOptions.length < 4) {
            warnings.push('Consider adding more options for better variety');
          }
        }
        if (!question.correctAnswer) {
          errors.push('Multiple choice questions must have a correct answer');
        }
        break;

      case 'true-false':
        if (question.correctAnswer === undefined) {
          errors.push('True/false questions must have a correct answer');
        }
        break;

      case 'short-answer':
      case 'essay':
        if (!question.correctAnswer) {
          warnings.push(
            'Consider providing a sample answer for grading reference'
          );
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
