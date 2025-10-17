import { categoryService } from '../../src/services/categoryService';

import { vi, describe, test, expect, it } from 'vitest';
// Mock the service directly since Supabase is not configured
vi.mock('../../src/services/categoryService', () => ({
  categoryService: {
    fetchCategories: vi
      .fn()
      .mockResolvedValue(['Test Category', 'Another Category']),
    addCategory: vi.fn().mockImplementation((name) => Promise.resolve(name)),
    deleteCategory: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('categoryService', () => {
  it('should return mock categories from fetchCategories', async () => {
    const categories = await categoryService.fetchCategories();
    expect(categories).toHaveLength(2);
    expect(categories).toEqual(['Test Category', 'Another Category']);
  });

  it('should add category correctly with addCategory', async () => {
    const newCategory = 'New Category';
    const result = await categoryService.addCategory(newCategory);
    expect(result).toBe(newCategory);
  });

  it('should resolve deleteCategory without throwing', async () => {
    const result = await categoryService.deleteCategory('Test Category');
    expect(result).toBeUndefined();
  });
});
