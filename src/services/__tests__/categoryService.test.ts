import { categoryService } from '../categoryService';

// Mock Supabase client
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () =>
        Promise.resolve({
          data: [
            { id: '1', name: 'Test Category' },
            { id: '2', name: 'Another Category' },
          ],
          error: null,
        }),
      insert: () =>
        Promise.resolve({
          data: { id: '3', name: 'New Category' },
          error: null,
        }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
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
    await expect(categoryService.deleteCategory('Test Category')).resolves.toBeUndefined();
  });
});
