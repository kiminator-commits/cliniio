import {
  Assessment,
  Question,
  AssessmentStatistics as AssessmentStats,
  QuestionStatistics,
} from '../types/assessmentTypes';

export class AssessmentStatistics {
  /**
   * Get assessment statistics
   */
  getAssessmentStatistics(assessment: Assessment): AssessmentStats {
    const totalQuestions = assessment.questions.length;
    const totalPoints = assessment.questions.reduce((sum, question) => sum + question.points, 0);
    const averagePointsPerQuestion = totalQuestions > 0 ? totalPoints / totalQuestions : 0;
    
    // Estimate time based on question types and points
    const estimatedTimeMinutes = assessment.questions.reduce((sum, question) => {
      const baseTime = question.points * 2; // 2 minutes per point
      switch (question.type) {
        case 'multiple-choice':
          return sum + baseTime;
        case 'true-false':
          return sum + baseTime * 0.5;
        case 'short-answer':
          return sum + baseTime * 1.5;
        case 'essay':
          return sum + baseTime * 3;
        default:
          return sum + baseTime;
      }
    }, 0);

    // Determine difficulty level
    let difficultyLevel: 'easy' | 'medium' | 'hard' = 'easy';
    if (averagePointsPerQuestion > 3) {
      difficultyLevel = 'hard';
    } else if (averagePointsPerQuestion > 1.5) {
      difficultyLevel = 'medium';
    }

    return {
      totalQuestions,
      totalPoints,
      averagePointsPerQuestion,
      estimatedTimeMinutes: Math.ceil(estimatedTimeMinutes),
      difficultyLevel,
    };
  }

  /**
   * Get question statistics
   */
  getQuestionStatistics(question: Question): QuestionStatistics {
    const wordCount = question.text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = question.text.length;
    const readingTimeSeconds = Math.ceil(wordCount / 3); // Average reading speed: 3 words per second
    
    // Calculate difficulty score based on various factors
    let difficultyScore = 1;
    if (question.points > 2) difficultyScore += 1;
    if (question.type === 'essay') difficultyScore += 2;
    if (question.type === 'short-answer') difficultyScore += 1;
    if (wordCount > 50) difficultyScore += 1;

    return {
      wordCount,
      characterCount,
      readingTimeSeconds,
      difficultyScore: Math.min(difficultyScore, 5), // Cap at 5
    };
  }
}
