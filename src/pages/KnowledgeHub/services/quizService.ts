import { supabase } from '@/lib/supabase';
import {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizAnswer,
} from './types/knowledgeHubTypes';
import type { Json } from '../../../types/database.types';

// Define types for database table operations
interface KnowledgeQuizRow {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  facility_id: string;
  passing_score: number;
  time_limit_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  data?: Json;
}

interface KnowledgeQuizQuestionRow {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: Json;
  correct_answer: Json;
  explanation?: string;
  question_order: number;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface KnowledgeQuizAttemptRow {
  id: string;
  user_id: string;
  quiz_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  passed?: boolean;
  time_spent_minutes?: number;
  answers: Json;
  created_at: string;
  updated_at: string;
}

/**
 * Quiz Service for Knowledge Hub
 *
 * Handles quiz operations including:
 * - Fetching quizzes and questions
 * - Starting and completing quiz attempts
 * - Tracking quiz progress and scores
 */
export class QuizService {
  /**
   * Get quizzes by category
   */
  static async getQuizzesByCategory(categoryId: string): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_quizzes')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quizzes:', error);
        throw new Error('Failed to fetch quizzes');
      }

      if (!data) return [];

      // Transform the data to match Quiz interface
      return ((data as KnowledgeQuizRow[]) || []).map(
        (item): Quiz => ({
          id: item.id,
          title: item.title,
          description:
            item.description ||
            (item.data as { description?: string })?.description,
          category_id: item.category_id,
          facility_id: item.facility_id,
          passing_score: item.passing_score,
          time_limit_minutes: item.time_limit_minutes,
          is_active: item.is_active,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })
      );
    } catch (error) {
      console.error('Error in getQuizzesByCategory:', error);
      return [];
    }
  }

  /**
   * Get quiz by ID with questions
   */
  static async getQuizWithQuestions(
    quizId: string
  ): Promise<{ quiz: Quiz; questions: QuizQuestion[] } | null> {
    try {
      // Get quiz
      const { data: quizData, error: quizError } = await supabase
        .from('knowledge_quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('is_active', true)
        .single();

      if (quizError || !quizData) {
        console.error('Error fetching quiz:', quizError);
        return null;
      }

      // Get questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('knowledge_quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('is_active', true)
        .order('question_order', { ascending: true });

      if (questionsError) {
        console.error('Error fetching quiz questions:', questionsError);
        return null;
      }

      // Transform quiz data
      const quizRow = quizData as KnowledgeQuizRow;
      const quiz: Quiz = {
        id: quizRow.id,
        title: quizRow.title,
        description: quizRow.description,
        category_id: quizRow.category_id,
        facility_id: quizRow.facility_id,
        passing_score: quizRow.passing_score,
        time_limit_minutes: quizRow.time_limit_minutes,
        is_active: quizRow.is_active,
        created_at: quizRow.created_at,
        updated_at: quizRow.updated_at,
      };

      if (!questionsData) return null;

      // Transform questions data
      const questions: QuizQuestion[] = (
        (questionsData as KnowledgeQuizQuestionRow[]) || []
      ).map(
        (item): QuizQuestion => ({
          id: item.id,
          quiz_id: item.quiz_id,
          question_text: item.question_text,
          question_type:
            (item.question_type as
              | 'multiple_choice'
              | 'true_false'
              | 'short_answer') || 'multiple_choice',
          options: (item.options as string[]) || [],
          correct_answer: (item.correct_answer as string) || '',
          explanation: item.explanation,
          question_order: item.question_order,
          points: item.points,
          is_active: item.is_active,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })
      );

      return { quiz, questions };
    } catch (error) {
      console.error('Error in getQuizWithQuestions:', error);
      return null;
    }
  }

  /**
   * Start a quiz attempt
   */
  static async startQuizAttempt(
    quizId: string,
    userId?: string
  ): Promise<QuizAttempt | null> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Get quiz to check if it exists and is active
      const quizData = await this.getQuizWithQuestions(quizId);
      if (!quizData) {
        throw new Error('Quiz not found or inactive');
      }

      // Check if user already has an active attempt
      const { data: existingAttempt } = await supabase
        .from('knowledge_quiz_attempts')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('quiz_id', quizId)
        .eq('status', 'started')
        .single();

      if (existingAttempt) {
        // Return existing attempt
        const attemptRow = existingAttempt as KnowledgeQuizAttemptRow;
        return {
          id: attemptRow.id,
          user_id: attemptRow.user_id,
          quiz_id: attemptRow.quiz_id,
          status: 'started' as const,
          score_percentage: attemptRow.score || 0,
          total_questions: quizData.questions.length,
          correct_answers: 0, // Will be calculated when completed
          started_at: attemptRow.started_at,
          completed_at: attemptRow.completed_at,
          time_spent_seconds: attemptRow.time_spent_minutes
            ? attemptRow.time_spent_minutes * 60
            : 0,
          answers: attemptRow.answers as unknown as QuizAnswer[],
        } as QuizAttempt;
      }

      // Create new attempt
      const newAttempt: Partial<QuizAttempt> = {
        user_id: currentUserId,
        quiz_id: quizId,
        status: 'started',
        score_percentage: 0,
        total_questions: quizData.questions.length,
        correct_answers: 0,
        started_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('knowledge_quiz_attempts')
        .insert({
          user_id: newAttempt.user_id!,
          quiz_id: newAttempt.quiz_id!,
          started_at: newAttempt.started_at!,
          answers: [] as Json,
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting quiz attempt:', error);
        return null;
      }

      if (!data) return null;

      const attemptRow = data as KnowledgeQuizAttemptRow;
      return {
        id: attemptRow.id,
        user_id: attemptRow.user_id,
        quiz_id: attemptRow.quiz_id,
        status: 'started' as const,
        score_percentage: 0,
        total_questions: quizData.questions.length,
        correct_answers: 0,
        started_at: attemptRow.started_at,
        completed_at: attemptRow.completed_at,
        time_spent_seconds: 0,
        answers: attemptRow.answers as QuizAnswer[],
      } as QuizAttempt;
    } catch (error) {
      console.error('Error in startQuizAttempt:', error);
      return null;
    }
  }

  /**
   * Submit quiz answers and complete attempt
   */
  static async submitQuizAttempt(
    attemptId: string,
    answers: QuizAnswer[]
  ): Promise<{ success: boolean; score: number; passed: boolean }> {
    try {
      // Get the attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('knowledge_quiz_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptError || !attempt) {
        throw new Error('Quiz attempt not found');
      }

      const attemptRow = attempt as KnowledgeQuizAttemptRow;
      // Get quiz to check passing score
      const quizData = await this.getQuizWithQuestions(attemptRow.quiz_id);
      if (!quizData) {
        throw new Error('Quiz not found');
      }

      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = quizData.questions.length;

      for (const answer of answers) {
        const question = quizData.questions.find(
          (q) => q.id === answer.question_id
        );
        if (question && answer.user_answer === question.correct_answer) {
          correctAnswers++;
        }
      }

      const scorePercentage = Math.round(
        (correctAnswers / totalQuestions) * 100
      );
      const passed = scorePercentage >= quizData.quiz.passing_score;

      // Update attempt
      const updateData: Partial<QuizAttempt> = {
        status: 'completed',
        score_percentage: scorePercentage,
        correct_answers: correctAnswers,
        completed_at: new Date().toISOString(),
        answers: answers,
      };

      const { error: updateError } = await supabase
        .from('knowledge_quiz_attempts')
        .update({
          status: updateData.status,
          score_percentage: updateData.score_percentage,
          correct_answers: updateData.correct_answers,
          completed_at: updateData.completed_at,
          answers: updateData.answers,
        })
        .eq('id', attemptId);

      if (updateError) {
        console.error('Error updating quiz attempt:', updateError);
        return { success: false, score: 0, passed: false };
      }

      return {
        success: true,
        score: scorePercentage,
        passed,
      };
    } catch (error) {
      console.error('Error in submitQuizAttempt:', error);
      return { success: false, score: 0, passed: false };
    }
  }

  /**
   * Get user's quiz attempts
   */
  static async getUserQuizAttempts(userId?: string): Promise<QuizAttempt[]> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('knowledge_quiz_attempts')
        .select('*')
        .eq('user_id', currentUserId)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching user quiz attempts:', error);
        return [];
      }

      if (!data) return [];

      // Transform the data to match QuizAttempt interface
      return ((data as KnowledgeQuizAttemptRow[]) || []).map(
        (item): QuizAttempt => ({
          id: item.id,
          user_id: item.user_id,
          quiz_id: item.quiz_id,
          status: 'started' as const,
          score_percentage: item.score || 0,
          total_questions: 0, // Will be calculated from quiz data
          correct_answers: 0, // Will be calculated from answers
          started_at: item.started_at,
          completed_at: item.completed_at,
          time_spent_seconds: item.time_spent_minutes
            ? item.time_spent_minutes * 60
            : 0,
          answers: (item.answers as unknown as QuizAnswer[]) || [],
        })
      );
    } catch (error) {
      console.error('Error in getUserQuizAttempts:', error);
      return [];
    }
  }

  /**
   * Get current user ID
   */
  private static async getCurrentUserId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get all quizzes
   */
  static async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_quizzes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all quizzes:', error);
        return [];
      }

      if (!data) return [];

      return ((data as KnowledgeQuizRow[]) || []).map(
        (item): Quiz => ({
          id: item.id,
          title: item.title,
          description:
            item.description ||
            (item.data as { description?: string })?.description,
          category_id: item.category_id,
          facility_id: item.facility_id,
          passing_score: item.passing_score,
          time_limit_minutes: item.time_limit_minutes,
          is_active: item.is_active,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })
      );
    } catch (error) {
      console.error('Error in getAllQuizzes:', error);
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
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Get current user's facility ID
      const { FacilityService } = await import('@/services/facilityService');
      const facilityId = await FacilityService.getCurrentFacilityId();

      const { data, error } = await supabase
        .from('knowledge_quizzes')
        .insert({
          title: quizData.title,
          description: quizData.description,
          category_id: quizData.category_id,
          facility_id: facilityId,
          passing_score: quizData.passing_score,
          time_limit_minutes: quizData.time_limit_minutes,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating quiz:', error);
        return null;
      }

      if (!data) return null;

      const quiz = data as KnowledgeQuizRow;
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category_id: quiz.category_id,
        facility_id: quiz.facility_id,
        passing_score: quiz.passing_score,
        time_limit_minutes: quiz.time_limit_minutes,
        is_active: quiz.is_active,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at,
      };
    } catch (error) {
      console.error('Error in createQuiz:', error);
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
      const { data, error } = await supabase
        .from('knowledge_quizzes')
        .update({
          ...quizData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quizId)
        .select()
        .single();

      if (error) {
        console.error('Error updating quiz:', error);
        return null;
      }

      if (!data) return null;

      const quiz = data as KnowledgeQuizRow;
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category_id: quiz.category_id,
        facility_id: quiz.facility_id,
        passing_score: quiz.passing_score,
        time_limit_minutes: quiz.time_limit_minutes,
        is_active: quiz.is_active,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at,
      };
    } catch (error) {
      console.error('Error in updateQuiz:', error);
      return null;
    }
  }

  /**
   * Delete quiz
   */
  static async deleteQuiz(quizId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('knowledge_quizzes')
        .delete()
        .eq('id', quizId);

      if (error) {
        console.error('Error deleting quiz:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteQuiz:', error);
      return false;
    }
  }
}
