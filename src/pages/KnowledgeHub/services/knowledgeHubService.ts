// ============================================================================
// KNOWLEDGE HUB SERVICE - SIMPLIFIED FACADE
// ============================================================================

import { ContentItem, ContentStatus } from '../types';
import {
  BulkResponse,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizAnswer,
} from './types/knowledgeHubTypes';

// Import providers
import { KnowledgeHubContentProvider } from '../../../services/knowledgeHub/KnowledgeHubContentProvider';
import { KnowledgeHubBulkProvider } from '../../../services/knowledgeHub/KnowledgeHubBulkProvider';
import { KnowledgeHubPathwayProvider } from '../../../services/knowledgeHub/KnowledgeHubPathwayProvider';
import { KnowledgeHubCategoryProvider } from '../../../services/knowledgeHub/KnowledgeHubCategoryProvider';
import { KnowledgeHubQuizProvider } from '../../../services/knowledgeHub/KnowledgeHubQuizProvider';
import { KnowledgeHubActivityProvider } from '../../../services/knowledgeHub/KnowledgeHubActivityProvider';

// 🎯 PRIMARY ENTRY POINT - Use KnowledgeHubService for ALL Knowledge Hub operations
export class KnowledgeHubService {
  // === CONTENT OPERATIONS ===

  /**
   * Get all knowledge articles
   */
  static async getKnowledgeArticles(): Promise<ContentItem[]> {
    return KnowledgeHubContentProvider.getKnowledgeArticles();
  }

  /**
   * Get knowledge article by ID
   */
  static async getKnowledgeArticleById(
    id: string
  ): Promise<ContentItem | null> {
    return KnowledgeHubContentProvider.getKnowledgeArticleById(id);
  }

  /**
   * Create knowledge article
   */
  static async createKnowledgeArticle(
    article: Omit<ContentItem, 'id' | 'createdAt'>
  ): Promise<ContentItem> {
    return KnowledgeHubContentProvider.createKnowledgeArticle(article);
  }

  /**
   * Update knowledge article
   */
  static async updateKnowledgeArticle(
    id: string,
    updates: Partial<ContentItem>
  ): Promise<ContentItem> {
    return KnowledgeHubContentProvider.updateKnowledgeArticle(id, updates);
  }

  /**
   * Delete knowledge article
   */
  static async deleteKnowledgeArticle(id: string): Promise<void> {
    return KnowledgeHubContentProvider.deleteKnowledgeArticle(id);
  }

  /**
   * Update content status
   */
  static async updateContentStatus(
    id: string,
    status: ContentStatus
  ): Promise<void> {
    return KnowledgeHubContentProvider.updateContentStatus(id, status);
  }

  // === BULK CONTENT OPERATIONS ===

  /**
   * Bulk update content status
   */
  static async bulkUpdateContentStatus(
    ids: string[],
    status: ContentStatus
  ): Promise<BulkResponse> {
    return KnowledgeHubBulkProvider.bulkUpdateContentStatus(ids, status);
  }

  /**
   * Bulk delete content
   */
  static async bulkDeleteContent(ids: string[]): Promise<BulkResponse> {
    return KnowledgeHubBulkProvider.bulkDeleteContent(ids);
  }

  // === LEARNING PATH OPERATIONS ===

  /**
   * Get all learning pathways
   */
  static async getLearningPathways(): Promise<ContentItem[]> {
    return KnowledgeHubPathwayProvider.getLearningPathways();
  }

  /**
   * Get learning pathway by ID
   */
  static async getLearningPathwayById(id: string): Promise<ContentItem | null> {
    return KnowledgeHubPathwayProvider.getLearningPathwayById(id);
  }

  /**
   * Create learning pathway
   */
  static async createLearningPathway(
    pathway: Omit<ContentItem, 'id' | 'createdAt'>
  ): Promise<ContentItem> {
    return KnowledgeHubPathwayProvider.createLearningPathway(pathway);
  }

  /**
   * Update learning pathway
   */
  static async updateLearningPathway(
    id: string,
    updates: Partial<ContentItem>
  ): Promise<ContentItem> {
    return KnowledgeHubPathwayProvider.updateLearningPathway(id, updates);
  }

  /**
   * Delete learning pathway
   */
  static async deleteLearningPathway(id: string): Promise<void> {
    return KnowledgeHubPathwayProvider.deleteLearningPathway(id);
  }

  /**
   * Update learning path status
   */
  static async updateLearningPathStatus(
    id: string,
    isActive: boolean
  ): Promise<void> {
    return KnowledgeHubPathwayProvider.updateLearningPathStatus(id, isActive);
  }

  // === BULK LEARNING PATH OPERATIONS ===

  /**
   * Bulk update learning path status
   */
  static async bulkUpdateLearningPathStatus(
    ids: string[],
    isActive: boolean
  ): Promise<BulkResponse> {
    return KnowledgeHubBulkProvider.bulkUpdateLearningPathStatus(ids, isActive);
  }

  /**
   * Bulk delete learning pathways
   */
  static async bulkDeleteLearningPathways(
    ids: string[]
  ): Promise<BulkResponse> {
    return KnowledgeHubBulkProvider.bulkDeleteLearningPathways(ids);
  }

  // === CATEGORY OPERATIONS ===

  /**
   * Get knowledge categories
   */
  static async getKnowledgeCategories(): Promise<string[]> {
    return KnowledgeHubCategoryProvider.getKnowledgeCategories();
  }

  /**
   * Add category
   */
  static async addCategory(category: string): Promise<string> {
    return KnowledgeHubCategoryProvider.addCategory(category);
  }

  /**
   * Delete category
   */
  static async deleteCategory(category: string): Promise<void> {
    return KnowledgeHubCategoryProvider.deleteCategory(category);
  }

  // === CONTENT OPERATIONS ===

  /**
   * Get all content (articles and learning pathways)
   */
  static async getAllContent(): Promise<ContentItem[]> {
    return KnowledgeHubActivityProvider.getAllContent();
  }

  // === USER ACTIVITY ===

  /**
   * Get recent user activity
   */
  static async getRecentUserActivity(userId?: string, limit?: number): Promise<Record<string, unknown>[]> {
    return KnowledgeHubActivityProvider.getRecentUserActivity(userId, limit);
  }

  // === QUIZ OPERATIONS ===

  /**
   * Get all quizzes
   */
  static async getQuizzes(): Promise<ContentItem[]> {
    return KnowledgeHubQuizProvider.getQuizzes();
  }

  /**
   * Get quiz by ID with questions
   */
  static async getQuizById(
    quizId: string
  ): Promise<{ quiz: Quiz; questions: QuizQuestion[] } | null> {
    return KnowledgeHubQuizProvider.getQuizById(quizId);
  }

  /**
   * Start a quiz attempt
   */
  static async startQuizAttempt(quizId: string): Promise<QuizAttempt | null> {
    return KnowledgeHubQuizProvider.startQuizAttempt(quizId);
  }

  /**
   * Submit quiz answers
   */
  static async submitQuizAnswers(
    attemptId: string,
    answers: QuizAnswer[]
  ): Promise<{ success: boolean; score: number; passed: boolean }> {
    return KnowledgeHubQuizProvider.submitQuizAnswers(attemptId, answers);
  }

  /**
   * Get user's quiz attempts
   */
  static async getUserQuizAttempts(): Promise<QuizAttempt[]> {
    return KnowledgeHubQuizProvider.getUserQuizAttempts();
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
    return KnowledgeHubQuizProvider.createQuiz(quizData);
  }

  /**
   * Update quiz
   */
  static async updateQuiz(
    quizId: string,
    quizData: Partial<Quiz>
  ): Promise<Quiz | null> {
    return KnowledgeHubQuizProvider.updateQuiz(quizId, quizData);
  }

  /**
   * Delete quiz
   */
  static async deleteQuiz(quizId: string): Promise<boolean> {
    return KnowledgeHubQuizProvider.deleteQuiz(quizId);
  }
}
