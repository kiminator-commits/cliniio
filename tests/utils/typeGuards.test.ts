import {
  isTask,
  isTaskArray,
  isGamificationData,
} from '../../src/utils/typeGuards';
import { Task } from '../../src/store/homeStore';
import { describe, test, expect, it } from 'vitest';

describe('typeGuards', () => {
  describe('isTask', () => {
    const validTask: Task = {
      id: '1',
      title: 'Test Task',
      completed: false,
      type: 'inventory',
      category: 'daily',
      dueDate: '2024-01-01',
      status: 'pending',
    };

    it('should return true for valid task objects', () => {
      expect(isTask(validTask)).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isTask(null)).toBe(false);
      expect(isTask(undefined)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isTask('string')).toBe(false);
      expect(isTask(123)).toBe(false);
      expect(isTask([])).toBe(false);
    });

    it('should return false for objects missing required properties', () => {
      expect(isTask({ id: '1', title: 'Test' })).toBe(false);
      expect(isTask({ ...validTask, id: undefined })).toBe(false);
      expect(isTask({ ...validTask, status: 'invalid' })).toBe(false);
    });
  });

  describe('isTaskArray', () => {
    const validTasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        completed: false,
        type: 'inventory',
        category: 'daily',
        dueDate: '2024-01-01',
        status: 'pending',
      },
      {
        id: '2',
        title: 'Task 2',
        completed: true,
        type: 'sterilization',
        category: 'weekly',
        dueDate: '2024-01-02',
        status: 'completed',
      },
    ];

    it('should return true for arrays of valid tasks', () => {
      expect(isTaskArray(validTasks)).toBe(true);
    });

    it('should return false for empty arrays', () => {
      expect(isTaskArray([])).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(isTaskArray('string')).toBe(false);
      expect(isTaskArray(123)).toBe(false);
      expect(isTaskArray({})).toBe(false);
    });

    it('should return false for arrays with invalid tasks', () => {
      expect(isTaskArray([...validTasks, { invalid: 'task' }])).toBe(false);
    });
  });

  describe('isGamificationData', () => {
    const validGamificationData = {
      totalScore: 1000,
      level: 5,
      totalPoints: 500,
      availablePoints: 250,
      streak: 7,
      rank: 10,
      stats: {
        toolsSterilized: 50,
        inventoryChecks: 25,
        perfectDays: 10,
        totalTasks: 100,
        completedTasks: 85,
        currentStreak: 7,
        bestStreak: 15,
      },
    };

    it('should return true for valid gamification data', () => {
      expect(isGamificationData(validGamificationData)).toBe(true);
    });

    it('should return true for minimal valid data', () => {
      expect(
        isGamificationData({
          totalScore: 0,
          level: 1,
          totalPoints: 0,
        })
      ).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isGamificationData(null)).toBe(false);
      expect(isGamificationData(undefined)).toBe(false);
    });

    it('should return false for objects missing required properties', () => {
      expect(isGamificationData({ totalScore: 100 })).toBe(false);
      expect(isGamificationData({ level: 1, totalPoints: 0 })).toBe(false);
    });

    it('should return false for invalid property types', () => {
      expect(
        isGamificationData({
          ...validGamificationData,
          totalScore: 'invalid',
        })
      ).toBe(false);
    });
  });
});
