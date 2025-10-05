// ============================================================================
// KNOWLEDGE HUB QUIZ PROVIDER - Quiz Operations
// ============================================================================

import {
  ContentItem,
  ContentCategory,
  ContentStatus,
} from '../../pages/KnowledgeHub/types';
import {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizAnswer,
} from '../../pages/KnowledgeHub/services/types/knowledgeHubTypes';

export class KnowledgeHubQuizProvider {
  /**
   * Get all quizzes
   */
  static async getQuizzes(): Promise<ContentItem[]> {
    try {
      const { QuizService } = await import(
        '../../pages/KnowledgeHub/services/quizService'
      );
      const quizzes = await QuizService.getAllQuizzes();

      return quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        category: 'Courses' as ContentCategory,
        status: quiz.is_active ? 'published' : ('draft' as ContentStatus),
        dueDate: quiz.created_at,
        progress: 0,
        lastUpdated: quiz.updated_at,
        description: quiz.description || 'Interactive quiz to test knowledge',
        tags: ['quiz', 'assessment', 'knowledge-test'],
        createdAt: quiz.created_at,
        type: 'quiz',
        contentType: 'quiz',
        domain: 'knowledge-assessment',
        isActive: quiz.is_active,
        estimatedDuration: quiz.time_limit_minutes || 15,
        difficultyLevel: 'medium',
        mandatoryRepeat: false,
        passingScore: quiz.passing_score,
      }));
    } catch (error) {
      console.error('Failed to get quizzes:', error);
      return [];
    }
  }

  /**
   * Get quiz by ID with questions
   */
  static async getQuizById(
    quizId: string
  ): Promise<{ quiz: Quiz; questions: QuizQuestion[] } | null> {
    try {
      const { QuizService } = await import(
        '../../pages/KnowledgeHub/services/quizService'
      );
      return await QuizService.getQuizWithQuestions(quizId);
    } catch (error) {
      console.error('Failed to get quiz by ID:', error);
      return null;
    }
  }

  /**
   * Start a quiz attempt
   */
  static async startQuizAttempt(quizId: string): Promise<QuizAttempt | null> {
    try {
      const { QuizService } = await import(
        '../../pages/KnowledgeHub/services/quizService'
      );
      return await QuizService.startQuizAttempt(quizId);
    } catch (error) {
      console.error('Failed to start quiz attempt:', error);
      return null;
    }
  }

  /**
   * Submit quiz answers
   */
  static async submitQuizAnswers(
    attemptId: string,
    answers: QuizAnswer[]
  ): Promise<{ success: boolean; score: number; passed: boolean }> {
    try {
      const { QuizService } = await import(
        '../../pages/KnowledgeHub/services/quizService'
      );
      return await QuizService.submitQuizAttempt(attemptId, answers);
    } catch (error) {
      console.error('Failed to submit quiz answers:', error);
      return { success: false, score: 0, passed: false };
    }
  }

  /**
   * Get user's quiz attempts
   */
  static async getUserQuizAttempts(): Promise<QuizAttempt[]> {
    try {
      const { QuizService } = await import(
        '../../pages/KnowledgeHub/services/quizService'
      );
      return await QuizService.getUserQuizAttempts();
    } catch (error) {
      console.error('Failed to get user quiz attempts:', error);
      return [];
    }
  }

  /**
   * Create a new quiz
   */
  static async createQuiz(quizData: {
    title: string;
    description?: string;
    category_id: string;
    passing_score: number;
    time_limit_minutes?: number;
  }): Promise<Quiz | null> {
    try {
      const { QuizService } = await import(
        '../../pages/KnowledgeHub/services/quizService'
      );
      return await QuizService.createQuiz(quizData);
    } catch (error) {
      console.error('Failed to create quiz:', error);
      return null;
    }
  }

  /**
   * Update quiz
   */
  static async updateQuiz(
    quizId: string,
    quizData: Partial<Quiz>
  ): Promise<Quiz | null> {
    try {
      const { QuizService } = await import(
        '../../pages/KnowledgeHub/services/quizService'
      );
      return await QuizService.updateQuiz(quizId, quizData);
    } catch (error) {
      console.error('Failed to update quiz:', error);
      return null;
    }
  }

  /**
   * Delete quiz
   */
  static async deleteQuiz(quizId: string): Promise<boolean> {
    try {
      const { QuizService } = await import(
        '../../pages/KnowledgeHub/services/quizService'
      );
      return await QuizService.deleteQuiz(quizId);
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      return false;
    }
  }
}
