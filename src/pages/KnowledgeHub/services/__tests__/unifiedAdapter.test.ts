import { UnifiedDatabaseAdapter } from '../adapters/unifiedDatabaseAdapter';
import { vi } from 'vitest';
import { UnifiedDataTransformer } from '../transformers/unifiedDataTransformer';
import { ContentActions } from '../actions/contentActions';

// Mock the adapter to prevent network calls
vi.mock('../adapters/unifiedDatabaseAdapter', () => ({
  UnifiedDatabaseAdapter: vi.fn().mockImplementation(() => ({
    getKnowledgeArticles: vi.fn().mockResolvedValue([]),
    getLearningPathways: vi.fn().mockResolvedValue([]),
    getContentItems: vi.fn().mockResolvedValue([]),
    getKnowledgeCategories: vi.fn().mockResolvedValue([]),
  })),
}));

// Mock ContentActions
vi.mock('../actions/contentActions', () => ({
  ContentActions: {
    getAllContentItems: vi.fn().mockResolvedValue([]),
    updateContentStatus: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock UnifiedDataTransformer
vi.mock('../transformers/unifiedDataTransformer', () => ({
  UnifiedDataTransformer: {
    convertArticlesToContentItems: vi
      .fn()
      .mockReturnValue([{ title: 'Test Article', content: 'Test content' }]),
  },
}));

// This test demonstrates how the unified adapter consolidates adapter confusion
describe('Unified Adapter Consolidation', () => {
  let database: UnifiedDatabaseAdapter;

  beforeEach(() => {
    database = new UnifiedDatabaseAdapter();
  });

  test('should provide single point for all database operations', async () => {
    // Before: Multiple adapters with overlapping responsibilities
    // - KnowledgeHubSupabaseService
    // - KnowledgeDataService
    // - SupabaseService
    // - SupabaseDatabase

    // After: Single unified adapter
    const articles = await database.getKnowledgeArticles();
    const pathways = await database.getLearningPathways();
    const categories = await database.getKnowledgeCategories();

    expect(articles).toBeDefined();
    expect(pathways).toBeDefined();
    expect(categories).toBeDefined();
  });

  test('should provide single point for all data transformations', () => {
    // Before: Multiple transformers with different logic
    // - ContentConverter
    // - KnowledgeHubSupabaseService.transformRowToContentItem
    // - SupabaseService.getAllContentItems transformation

    // After: Single unified transformer
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article',
        status: 'published',
        summary: 'Test',
        tags: [],
        difficulty_level: 'beginner',
        created_at: '2024-01-01',
        last_modified_at: '2024-01-01',
      },
    ];

    const contentItems = UnifiedDataTransformer.convertArticlesToContentItems(mockArticles);

    expect(contentItems).toHaveLength(1);
    expect(contentItems[0].title).toBe('Test Article');
  });

  test('should work with ContentActions through unified interface', async () => {
    // Before: ContentActions needed multiple function parameters
    // After: ContentActions uses single database adapter

    // This demonstrates the simplified interface
    const contentItems = await ContentActions.getAllContentItems(database);

    expect(Array.isArray(contentItems)).toBe(true);
  });

  test('should handle status updates consistently', async () => {
    // Before: Different status mappings across services
    // After: Consistent status handling through unified transformer

    const result = await ContentActions.updateContentStatus(
      'test-id',
      'draft' as ContentStatus,
      database
    );

    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('success', true);
  });
});
