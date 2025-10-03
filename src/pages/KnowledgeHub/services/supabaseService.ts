import { supabase } from '@/lib/supabase';
import { ContentItem, ContentCategory, ContentStatus } from '../types';

// Helper functions for safe type conversions
const safeString = (value: unknown, defaultValue: string = ''): string => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return defaultValue;
};

const safeNumber = (value: unknown, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
};

const safeBoolean = (
  value: unknown,
  defaultValue: boolean = false
): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  return defaultValue;
};

const safeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }
  return [];
};

const safeRecordArray = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'object' && item !== null);
  }
  return [];
};

// Fetch all content items from Supabase
export async function getAllContentItems(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('knowledge_hub_courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content items:', error);
    return [];
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    id: safeString(item.id),
    title: safeString(item.title),
    category: safeString(item.category) as ContentCategory,
    status: safeString(item.status) as ContentStatus,
    description: safeString(
      (item as { data?: { description?: string } }).data?.description
    ),
    tags: safeStringArray((item as { data?: { tags?: string[] } }).data?.tags),
    domain: safeString(item.domain),
    contentType: safeString(item.content_type),
    type: safeString(item.type),
    createdAt: safeString(item.created_at),
    lastUpdated: safeString(item.updated_at),
    publishedAt: safeString(item.published_at) || undefined,
    archivedAt: safeString(item.archived_at) || undefined,
    estimatedDuration: safeNumber(item.estimated_duration) || undefined,
    difficultyLevel: safeString(item.difficulty_level),
    department: safeString(item.department) || undefined,
    authorId: safeString(item.author_id) || undefined,
    assignedBy: safeString(item.assigned_by) || undefined,
    isRepeat: safeBoolean(item.is_repeat),
    isActive: safeBoolean(item.is_active),
    content: (item.content as Record<string, unknown>) || {},
    media: safeRecordArray(item.media),
    dueDate:
      safeString(item.due_date) || new Date().toISOString().split('T')[0],
    progress: safeNumber(item.progress),
  }));
}
