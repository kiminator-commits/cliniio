import { ContentItem } from '../libraryTypes';
import { supabase } from '../../../lib/supabaseClient';

export async function fetchLibraryContent(): Promise<ContentItem[]> {
  try {
    // Fetch from knowledge_hub_content table
    const { data, error } = await supabase
      .from('knowledge_hub_content')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching content:', error);
      return getFallbackContent();
    }

    // Map content to ContentItem format
    const allContent = (data || []).map((item) =>
      mapToContentItem(item, 'knowledge_hub_content')
    );

    return allContent;
  } catch (error) {
    console.error('Error in fetchLibraryContent:', error);
    return getFallbackContent();
  }
}

// Fallback content if database is not available
function getFallbackContent(): ContentItem[] {
  console.log('Using fallback content');
  return [
    {
      id: 'handwashing-policy-1',
      title: 'Handwashing Policies for Staff',
      category: 'Policies',
      status: 'Not Started',
      dueDate: undefined,
      progress: 0,
      department: 'infection_control',
      lastUpdated: new Date().toISOString(),
      source: 'Cliniio',
      description:
        'Comprehensive handwashing protocols and procedures for healthcare staff to maintain infection control standards',
      level: 'Beginner',
      duration: '20 min',
      points: 7,
      publishedDate: new Date().toISOString(),
    },
    {
      id: 'test-item-2',
      title: 'TEST ITEM - This Should Show',
      category: 'Courses',
      status: 'Not Started',
      dueDate: undefined,
      progress: 0,
      department: 'general',
      lastUpdated: new Date().toISOString(),
      source: 'Cliniio',
      description: 'This is a test item to verify the library is working',
      level: 'Beginner',
      duration: '15 min',
      points: 5,
      publishedDate: new Date().toISOString(),
    },
  ];
}

// Removed unused createHandwashingPolicy function

// Helper functions to map database fields to ContentItem interface
function mapContentTypeToCategory(contentType: string): string {
  const typeMapping: Record<string, string> = {
    course: 'Courses',
    procedure: 'Procedures',
    policy: 'Policies',
    learning_pathway: 'Learning Pathways',
  };
  return typeMapping[contentType] || 'Courses';
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '15 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

// Removed unused calculatePoints function

const mapToContentItem = (
  item: Record<string, unknown>,
  sourceTable: string
): ContentItem => {
  const baseItem: ContentItem = {
    id: item.id as string,
    title: item.title as string,
    description: (item.data as { description?: string })?.description as string,
    category: mapContentTypeToCategory(
      (item.content_type as string) || sourceTable
    ),
    level: (item.difficulty_level as string) || 'Beginner',
    duration: formatDuration(
      (item.estimated_duration_minutes as number) ||
        (item.estimated_read_time_minutes as number) ||
        0
    ),
    points: (item.points as number) || 0,
    status: 'Not Started',
    dueDate: undefined,
    progress: 0,
    department: (item.department as string) || 'general',
    lastUpdated:
      (item.updated_at as string) ||
      (item.created_at as string) ||
      new Date().toISOString(),
    source: 'Cliniio',
    publishedDate:
      (item.published_at as string) ||
      (item.created_at as string) ||
      new Date().toISOString(),
  };

  return baseItem;
};
