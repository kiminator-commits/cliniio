import { isTask } from '../../src/utils/validateTask';
import { Task } from '../../src/store/homeStore';

describe('isTask', () => {
  it('returns true for a valid task', () => {
    const task: Task = {
      id: 'abc123',
      title: 'Test Task',
      completed: false,
      type: 'inventory',
      category: 'daily',
      dueDate: '2024-01-01',
      status: 'pending',
    };
    expect(isTask(task)).toBe(true);
  });

  it('returns false for missing id', () => {
    const task = {
      title: 'Bad Task',
      completed: false,
      type: 'inventory',
      category: 'daily',
      dueDate: '2024-01-01',
      status: 'pending',
    };
    expect(isTask(task)).toBe(false);
  });

  it('returns false for invalid status', () => {
    const task = {
      id: 'x1',
      title: 'Bad Task',
      completed: true,
      type: 'inventory',
      category: 'daily',
      dueDate: '2024-01-01',
      status: 'invalid',
    };
    expect(isTask(task)).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(isTask(null)).toBe(false);
    expect(isTask(undefined)).toBe(false);
  });
});
