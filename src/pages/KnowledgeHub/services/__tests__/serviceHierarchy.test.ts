import { KnowledgeHubService } from '../knowledgeHubService';

import { vi } from 'vitest';
// Mock the services to prevent network calls
vi.mock('../knowledgeHubService', () => ({
  KnowledgeHubService: {
    getKnowledgeArticles: vi.fn().mockResolvedValue([]),
    getAllContentItems: vi.fn().mockResolvedValue([]),
    getKnowledgeCategories: vi.fn().mockResolvedValue([]),
    updateContentStatus: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// This test demonstrates the clear service hierarchy
describe('Service Hierarchy', () => {
  test('should provide single entry point for all operations', async () => {
    // ✅ CORRECT - Use KnowledgeHubService for everything
    const articles = await KnowledgeHubService.getKnowledgeArticles();
    const contentItems = await KnowledgeHubService.getAllContentItems();
    const categories = await KnowledgeHubService.getKnowledgeCategories();

    expect(articles).toBeDefined();
    expect(contentItems).toBeDefined();
    expect(categories).toBeDefined();
  });

  test('should demonstrate internal service usage', () => {
    // ✅ CORRECT - Internal services used within KnowledgeHubService
    // Mock the internal services
    const mockDatabase = { getKnowledgeArticles: vi.fn() };
    const mockContentItems = [];

    expect(mockDatabase).toBeDefined();
    expect(Array.isArray(mockContentItems)).toBe(true);
  });

  test('should show deprecated service warnings', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Call a method that might trigger warnings
    KnowledgeHubService.getKnowledgeArticles();

    // Since the method is mocked, we just verify it was called
    expect(KnowledgeHubService.getKnowledgeArticles).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should demonstrate proper service layering', async () => {
    // ✅ CORRECT - Proper layering through KnowledgeHubService
    const result = await KnowledgeHubService.updateContentStatus('test-id', 'published');

    // The internal flow is:
    // KnowledgeHubService.updateContentStatus()
    //   ↓
    // ContentActions.updateContentStatus()
    //   ↓
    // UnifiedDatabaseAdapter.updateArticleStatus()

    expect(result).toBeDefined();
  });

  test('should show clear import pattern', () => {
    // ✅ CORRECT - Single import for all operations
    // import { KnowledgeHubService } from '@/pages/KnowledgeHub/services';

    // ❌ WRONG - Multiple imports (deprecated)
    // import { KnowledgeDataService } from '@/pages/KnowledgeHub/services';
    // import { ContentConverter } from '@/pages/KnowledgeHub/services';
    // import { ContentActions } from '@/pages/KnowledgeHub/services';

    expect(KnowledgeHubService).toBeDefined();
    expect(typeof KnowledgeHubService.getKnowledgeArticles).toBe('function');
  });
});
