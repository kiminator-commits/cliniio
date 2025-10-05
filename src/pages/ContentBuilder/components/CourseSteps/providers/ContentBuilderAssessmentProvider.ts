import {
  Assessment,
  Question,
  AssessmentValidation,
  QuestionValidation,
  AssessmentStatistics,
  QuestionStatistics,
  Recommendation,
  QuestionTypeInfo,
  AssessmentTemplate,
  AssessmentScore,
  ImportResult,
} from './types/assessmentTypes';
import { AssessmentValidator } from './validators/AssessmentValidator';
import { AssessmentStatistics as AssessmentStats } from './statistics/AssessmentStatistics';
import { AssessmentRecommendations } from './recommendations/AssessmentRecommendations';
import { AssessmentTemplates } from './templates/AssessmentTemplates';
import { AssessmentScoring } from './scoring/AssessmentScoring';

export class ContentBuilderAssessmentProvider {
  private validator: AssessmentValidator;
  private statistics: AssessmentStats;
  private recommendations: AssessmentRecommendations;
  private templates: AssessmentTemplates;
  private scoring: AssessmentScoring;

  constructor() {
    this.validator = new AssessmentValidator();
    this.statistics = new AssessmentStats();
    this.recommendations = new AssessmentRecommendations();
    this.templates = new AssessmentTemplates();
    this.scoring = new AssessmentScoring();
  }

  /**
   * Create a new assessment
   */
  createAssessment(): Assessment {
    return {
      id: this.generateId(),
      title: '',
      questions: [],
      passingScore: 70,
    };
  }

  /**
   * Create a new question
   */
  createQuestion(type: Question['type'] = 'multiple-choice'): Question {
    return {
      id: this.generateId(),
      text: '',
      type,
      points: 1,
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
    };
  }

  /**
   * Update assessment properties
   */
  updateAssessment(
    assessment: Assessment,
    updates: Partial<Omit<Assessment, 'id' | 'questions'>>
  ): Assessment {
    return {
      ...assessment,
      ...updates,
    };
  }

  /**
   * Update question properties
   */
  updateQuestion(
    assessment: Assessment,
    questionId: string,
    updates: Partial<Omit<Question, 'id'>>
  ): Assessment {
    const updatedQuestions = assessment.questions.map((question) =>
      question.id === questionId ? { ...question, ...updates } : question
    );

    return {
      ...assessment,
      questions: updatedQuestions,
    };
  }

  /**
   * Add question to assessment
   */
  addQuestionToAssessment(
    assessment: Assessment,
    question?: Question
  ): Assessment {
    const newQuestion = question || this.createQuestion();
    return {
      ...assessment,
      questions: [...assessment.questions, newQuestion],
    };
  }

  /**
   * Remove question from assessment
   */
  removeQuestionFromAssessment(
    assessment: Assessment,
    questionId: string
  ): Assessment {
    return {
      ...assessment,
      questions: assessment.questions.filter(
        (question) => question.id !== questionId
      ),
    };
  }

  /**
   * Reorder questions in assessment
   */
  reorderQuestions(
    assessment: Assessment,
    fromIndex: number,
    toIndex: number
  ): Assessment {
    const questions = [...assessment.questions];
    const [movedQuestion] = questions.splice(fromIndex, 1);
    questions.splice(toIndex, 0, movedQuestion);

    return {
      ...assessment,
      questions,
    };
  }

  /**
   * Duplicate assessment
   */
  duplicateAssessment(assessment: Assessment): Assessment {
    return {
      ...assessment,
      id: this.generateId(),
      title: `${assessment.title} (Copy)`,
      questions: assessment.questions.map((question) => ({
        ...question,
        id: this.generateId(),
      })),
    };
  }

  /**
   * Duplicate question
   */
  duplicateQuestion(assessment: Assessment, questionId: string): Assessment {
    const questionToDuplicate = assessment.questions.find(
      (question) => question.id === questionId
    );
    if (!questionToDuplicate) return assessment;

    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: this.generateId(),
      text: `${questionToDuplicate.text} (Copy)`,
    };

    return {
      ...assessment,
      questions: [...assessment.questions, duplicatedQuestion],
    };
  }

  /**
   * Validate assessment
   */
  validateAssessment(assessment: Assessment): AssessmentValidation {
    return this.validator.validateAssessment(assessment);
  }

  /**
   * Validate question
   */
  validateQuestion(question: Question): QuestionValidation {
    return this.validator.validateQuestion(question);
  }

  /**
   * Get assessment statistics
   */
  getAssessmentStatistics(assessment: Assessment): AssessmentStatistics {
    return this.statistics.getAssessmentStatistics(assessment);
  }

  /**
   * Get question statistics
   */
  getQuestionStatistics(question: Question): QuestionStatistics {
    return this.statistics.getQuestionStatistics(question);
  }

  /**
   * Get assessment recommendations
   */
  getAssessmentRecommendations(assessment: Assessment): Recommendation[] {
    return this.recommendations.getAssessmentRecommendations(assessment);
  }

  /**
   * Get question recommendations
   */
  getQuestionRecommendations(question: Question): Recommendation[] {
    return this.recommendations.getQuestionRecommendations(question);
  }

  /**
   * Export assessment data
   */
  exportAssessmentData(assessment: Assessment): string {
    const statistics = this.getAssessmentStatistics(assessment);
    const validation = this.validateAssessment(assessment);
    const recommendations = this.getAssessmentRecommendations(assessment);

    return JSON.stringify(
      {
        assessment,
        statistics,
        validation,
        recommendations,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Import assessment data
   */
  importAssessmentData(jsonData: string): ImportResult {
    try {
      const data = JSON.parse(jsonData);

      if (!data.assessment) {
        return {
          success: false,
          assessment: null,
          errors: ['Invalid format: assessment data not found'],
        };
      }

      const assessment = data.assessment as Assessment;
      const validation = this.validateAssessment(assessment);

      return {
        success: validation.isValid,
        assessment: validation.isValid ? assessment : null,
        errors: validation.errors,
      };
    } catch {
      return {
        success: false,
        assessment: null,
        errors: ['Invalid JSON format'],
      };
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get available question types
   */
  getAvailableQuestionTypes(): QuestionTypeInfo[] {
    return this.templates.getAvailableQuestionTypes();
  }

  /**
   * Get assessment templates
   */
  getAssessmentTemplates(): AssessmentTemplate[] {
    return this.templates.getAssessmentTemplates();
  }

  /**
   * Calculate assessment score
   */
  calculateScore(
    assessment: Assessment,
    answers: Record<string, string>
  ): AssessmentScore {
    return this.scoring.calculateScore(assessment, answers);
  }
}
