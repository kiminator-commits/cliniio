import { Assessment, AssessmentScore } from '../types/assessmentTypes';

export class AssessmentScoring {
  /**
   * Calculate assessment score
   */
  calculateScore(
    assessment: Assessment,
    answers: Record<string, string>
  ): AssessmentScore {
    let totalScore = 0;
    const maxScore = assessment.questions.reduce(
      (sum, question) => sum + question.points,
      0
    );
    const questionScores: Record<string, number> = {};

    assessment.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      let score = 0;

      if (userAnswer) {
        switch (question.type) {
          case 'multiple-choice':
          case 'true-false':
            if (userAnswer === question.correctAnswer) {
              score = question.points;
            }
            break;
          case 'short-answer':
          case 'essay':
            // For open-ended questions, assume partial credit
            score = userAnswer.trim().length > 10 ? question.points * 0.8 : 0;
            break;
        }
      }

      questionScores[question.id] = score;
      totalScore += score;
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentage >= assessment.passingScore;

    return {
      totalScore,
      maxScore,
      percentage,
      passed,
      questionScores,
    };
  }
}
