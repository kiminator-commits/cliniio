import {
  QuestionTypeInfo,
  AssessmentTemplate,
} from '../types/assessmentTypes';

export class AssessmentTemplates {
  /**
   * Get available question types
   */
  getAvailableQuestionTypes(): QuestionTypeInfo[] {
    return [
      {
        value: 'multiple-choice',
        label: 'Multiple Choice',
        description: 'Choose one correct answer from multiple options',
        icon: '☑️',
      },
      {
        value: 'true-false',
        label: 'True/False',
        description: 'Choose between true or false',
        icon: '✅',
      },
      {
        value: 'short-answer',
        label: 'Short Answer',
        description: 'Brief written response',
        icon: '📝',
      },
      {
        value: 'essay',
        label: 'Essay',
        description: 'Detailed written response',
        icon: '📄',
      },
    ];
  }

  /**
   * Get assessment templates
   */
  getAssessmentTemplates(): AssessmentTemplate[] {
    return [
      {
        name: 'Basic Quiz',
        description: 'A simple quiz with multiple choice questions',
        template: {
          id: this.generateId(),
          title: 'Basic Quiz',
          passingScore: 70,
          questions: [
            {
              id: this.generateId(),
              text: 'What is the correct answer?',
              type: 'multiple-choice',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A',
              points: 1,
            },
          ],
        },
      },
      {
        name: 'Mixed Assessment',
        description: 'An assessment with various question types',
        template: {
          id: this.generateId(),
          title: 'Mixed Assessment',
          passingScore: 75,
          questions: [
            {
              id: this.generateId(),
              text: 'True or False: This statement is correct.',
              type: 'true-false',
              correctAnswer: 'true',
              points: 1,
            },
            {
              id: this.generateId(),
              text: 'Explain the main concept in your own words.',
              type: 'short-answer',
              points: 2,
            },
          ],
        },
      },
      {
        name: 'Comprehensive Test',
        description: 'A comprehensive test with multiple question types',
        template: {
          id: this.generateId(),
          title: 'Comprehensive Test',
          passingScore: 80,
          timeLimit: 60,
          questions: [
            {
              id: this.generateId(),
              text: 'Choose the best answer:',
              type: 'multiple-choice',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 'A',
              points: 2,
            },
            {
              id: this.generateId(),
              text: 'True or False:',
              type: 'true-false',
              correctAnswer: 'true',
              points: 1,
            },
            {
              id: this.generateId(),
              text: 'Write a detailed explanation:',
              type: 'essay',
              points: 5,
            },
          ],
        },
      },
    ];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
