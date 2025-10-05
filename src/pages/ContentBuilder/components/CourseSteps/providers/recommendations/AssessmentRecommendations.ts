import { Assessment, Question, Recommendation } from '../types/assessmentTypes';
import { AssessmentValidator } from '../validators/AssessmentValidator';
import { AssessmentStatistics } from '../statistics/AssessmentStatistics';

export class AssessmentRecommendations {
  private validator: AssessmentValidator;
  private statistics: AssessmentStatistics;

  constructor() {
    this.validator = new AssessmentValidator();
    this.statistics = new AssessmentStatistics();
  }

  /**
   * Get assessment recommendations
   */
  getAssessmentRecommendations(assessment: Assessment): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const validation = this.validator.validateAssessment(assessment);

    // Add validation errors as recommendations
    validation.errors.forEach((error) => {
      recommendations.push({
        type: 'error',
        message: error,
        action: 'Fix this issue to complete the assessment',
      });
    });

    validation.warnings.forEach((warning) => {
      recommendations.push({
        type: 'warning',
        message: warning,
        action: 'Consider improving this aspect',
      });
    });

    // Add content suggestions
    if (assessment.questions.length === 0) {
      recommendations.push({
        type: 'error',
        message: 'Assessment has no questions',
        action: 'Add at least one question to make the assessment functional',
      });
    } else if (assessment.questions.length < 5) {
      recommendations.push({
        type: 'suggestion',
        message: 'Assessment has few questions',
        action: 'Consider adding more questions for better assessment coverage',
      });
    }

    // Check question variety
    const questionTypes = new Set(assessment.questions.map((q) => q.type));
    if (questionTypes.size === 1 && assessment.questions.length > 1) {
      recommendations.push({
        type: 'suggestion',
        message: 'All questions are of the same type',
        action: 'Consider mixing different question types for variety',
      });
    }

    // Check passing score
    if (assessment.passingScore < 60) {
      recommendations.push({
        type: 'warning',
        message: 'Passing score is quite low',
        action: 'Consider setting a higher passing score for better standards',
      });
    }

    return recommendations;
  }

  /**
   * Get question recommendations
   */
  getQuestionRecommendations(question: Question): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const validation = this.validator.validateQuestion(question);

    // Add validation errors as recommendations
    validation.errors.forEach((error) => {
      recommendations.push({
        type: 'error',
        message: error,
        action: 'Fix this issue to complete the question',
      });
    });

    validation.warnings.forEach((warning) => {
      recommendations.push({
        type: 'warning',
        message: warning,
        action: 'Consider improving this aspect',
      });
    });

    // Add content suggestions
    const stats = this.statistics.getQuestionStatistics(question);

    if (stats.wordCount < 10) {
      recommendations.push({
        type: 'suggestion',
        message: 'Question text is quite short',
        action: 'Consider making the question more descriptive',
      });
    }

    if (question.type === 'multiple-choice' && question.options) {
      const validOptions = question.options.filter((option) => option.trim());
      if (validOptions.length < 4) {
        recommendations.push({
          type: 'suggestion',
          message: 'Multiple choice question has few options',
          action: 'Consider adding more options for better variety',
        });
      }
    }

    return recommendations;
  }
}
