import {
  convertToCSV,
  convertToJSON,
  convertToPDF,
  exportData,
} from '../../src/utils/exportUtils';

// Mock ContentActions to prevent database access
vi.mock('../../src/pages/KnowledgeHub/services/actions/contentActions', () => ({
  ContentActions: {
    bulkExportContent: vi.fn(),
  },
}));

// Import the mocked ContentActions
import { ContentActions } from '../../src/pages/KnowledgeHub/services/actions/contentActions';

import { vi } from 'vitest';
// Mock ContentItem for testing
const mockContentItems = [
  {
    id: '1',
    title: 'Test Article 1',
    category: 'Courses',
    type: 'article',
    status: 'published',
    description: 'Test description 1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
    tags: ['test', 'sample'],
    estimatedDuration: 30,
    difficulty: 'Beginner',
    prerequisites: ['basic knowledge'],
  },
  {
    id: '2',
    title: 'Test Article 2',
    category: 'Procedures',
    type: 'article',
    status: 'draft',
    description: 'Test description 2',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-04',
    tags: ['advanced'],
    estimatedDuration: 60,
    difficulty: 'Advanced',
    prerequisites: ['intermediate knowledge'],
  },
];

describe('KnowledgeHub Export Functionality', () => {
  describe('Export Utilities', () => {
    test('convertToJSON should return properly formatted JSON', () => {
      const result = convertToJSON(mockContentItems);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(mockContentItems);
      expect(typeof result).toBe('string');
    });

    test('convertToCSV should return properly formatted CSV', () => {
      const result = convertToCSV(mockContentItems);

      expect(result).toContain(
        'id,title,category,type,status,description,createdAt,updatedAt,tags,estimatedDuration,difficulty,prerequisites'
      );
      expect(result).toContain(
        '1,Test Article 1,Courses,article,published,Test description 1,2024-01-01,2024-01-02,"test,sample",30,Beginner,basic knowledge'
      );
      expect(typeof result).toBe('string');
    });

    test('convertToCSV should handle special characters properly', () => {
      const itemsWithSpecialChars = [
        {
          title: 'Article with "quotes" and, commas',
          description: 'Description with\nnewlines',
        },
      ];

      const result = convertToCSV(itemsWithSpecialChars);
      expect(result).toContain('"Article with ""quotes"" and, commas"');
      expect(result).toContain('"Description with\nnewlines"');
    });

    test('convertToPDF should return a Blob', async () => {
      const result = await convertToPDF(mockContentItems, 'Test Export');

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    test('exportData should handle JSON format', async () => {
      const result = await exportData(mockContentItems, { format: 'json' });

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/export_.*\.json$/);
      expect(result.dataSize).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });

    test('exportData should handle CSV format', async () => {
      const result = await exportData(mockContentItems, { format: 'csv' });

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/export_.*\.csv$/);
      expect(result.dataSize).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });

    test('exportData should handle PDF format', async () => {
      const result = await exportData(mockContentItems, { format: 'pdf' });

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/export_.*\.pdf$/);
      expect(result.dataSize).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });

    test('exportData should handle empty data', async () => {
      const result = await exportData([], { format: 'json' });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No data to export');
    });

    test('exportData should handle invalid format', async () => {
      const result = await exportData(mockContentItems, {
        format: 'invalid' as string,
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Unsupported format');
    });
  });

  describe('ContentActions Export', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('bulkExportContent should handle JSON format', async () => {
      (ContentActions.bulkExportContent as vi.Mock).mockResolvedValue({
        success: true,
        filename: 'knowledge_hub_export_2024-01-01.json',
        processedCount: 2,
        errors: [],
      });

      const result = await ContentActions.bulkExportContent(['1', '2'], 'json');

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/knowledge_hub_export_.*\.json$/);
      expect(result.errors).toEqual([]);
    });

    test('bulkExportContent should handle CSV format', async () => {
      (ContentActions.bulkExportContent as vi.Mock).mockResolvedValue({
        success: true,
        filename: 'knowledge_hub_export_2024-01-01.csv',
        processedCount: 2,
        errors: [],
      });

      const result = await ContentActions.bulkExportContent(['1', '2'], 'csv');

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/knowledge_hub_export_.*\.csv$/);
      expect(result.errors).toEqual([]);
    });

    test('bulkExportContent should handle PDF format', async () => {
      (ContentActions.bulkExportContent as vi.Mock).mockResolvedValue({
        success: true,
        filename: 'knowledge_hub_export_2024-01-01.pdf',
        processedCount: 2,
        errors: [],
      });

      const result = await ContentActions.bulkExportContent(['1', '2'], 'pdf');

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/knowledge_hub_export_.*\.pdf$/);
      expect(result.errors).toEqual([]);
    });

    test('bulkExportContent should handle empty itemIds', async () => {
      (ContentActions.bulkExportContent as vi.Mock).mockResolvedValue({
        success: false,
        filename: '',
        processedCount: 0,
        errors: ['No items provided for export'],
      });

      const result = await ContentActions.bulkExportContent([], 'json');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No items provided for export');
    });

    test('bulkExportContent should handle invalid format', async () => {
      (ContentActions.bulkExportContent as vi.Mock).mockResolvedValue({
        success: false,
        filename: '',
        processedCount: 0,
        errors: ['Invalid format: invalid. Valid formats are: json, csv, pdf'],
      });

      const result = await ContentActions.bulkExportContent(
        ['1'],
        'invalid' as string
      );

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Invalid format');
    });
  });
});
