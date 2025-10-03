import { supabase } from '@/lib/supabase';

export interface CourseSearchResult {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration: number;
  department: string;
  tags: string[];
}

export async function searchCourses(
  query: string
): Promise<CourseSearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_hub_content')
      .select(
        'id, title, description, difficulty_level, estimated_duration, department, tags'
      )
      .eq('is_active', true)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching courses:', error);
      return [];
    }

    return (data as CourseSearchResult[]) || [];
  } catch (error) {
    console.error('Error in searchCourses:', error);
    return [];
  }
}

export async function getCourseById(
  id: string
): Promise<CourseSearchResult | null> {
  try {
    const { data, error } = await supabase
      .from('knowledge_hub_content')
      .select(
        'id, title, description, difficulty_level, estimated_duration, department, tags'
      )
      .eq('id', id)
      .eq('is_active', true)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      return null;
    }

    return data as CourseSearchResult;
  } catch (error) {
    console.error('Error in getCourseById:', error);
    return null;
  }
}
