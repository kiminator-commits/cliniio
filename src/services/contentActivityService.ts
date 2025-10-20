import { supabase } from '../lib/supabase';

export interface ContentActivity {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  facility_id: string;
  activity_type: 'created' | 'updated' | 'published' | 'deleted' | 'draft_saved';
  content_type: 'policy' | 'procedure' | 'course' | 'learning_pathway';
  content_id: string;
  content_title: string;
  content_description?: string;
  created_at: string;
  metadata?: {
    auto_saved?: boolean;
    version?: string;
    department?: string;
    tags?: string[];
  };
}

export interface ContentActivityFilters {
  facility_id: string;
  content_type?: string;
  activity_type?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

/**
 * Logs a content activity event to the database
 */
export async function logContentActivity(activity: Omit<ContentActivity, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('content_activities')
      .insert({
        ...activity,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging content activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error logging content activity:', error);
    return false;
  }
}

/**
 * Fetches recent content activities for a facility
 */
export async function fetchContentActivities(filters: ContentActivityFilters): Promise<ContentActivity[]> {
  try {
    let query = supabase
      .from('content_activities')
      .select('*')
      .eq('facility_id', filters.facility_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.content_type) {
      query = query.eq('content_type', filters.content_type);
    }
    if (filters.activity_type) {
      query = query.eq('activity_type', filters.activity_type);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching content activities:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching content activities:', error);
    return [];
  }
}

/**
 * Gets activity statistics for a facility
 */
export async function getContentActivityStats(facilityId: string, days: number = 30): Promise<{
  total_activities: number;
  activities_by_type: Record<string, number>;
  activities_by_content_type: Record<string, number>;
  activities_by_user: Record<string, number>;
  recent_activities: ContentActivity[];
}> {
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    const activities = await fetchContentActivities({
      facility_id: facilityId,
      date_from: dateFrom.toISOString(),
      limit: 1000 // Get more data for stats
    });

    const stats = {
      total_activities: activities.length,
      activities_by_type: {} as Record<string, number>,
      activities_by_content_type: {} as Record<string, number>,
      activities_by_user: {} as Record<string, number>,
      recent_activities: activities.slice(0, 20) // Last 20 activities
    };

    // Calculate statistics
    activities.forEach(activity => {
      // Count by activity type
      stats.activities_by_type[activity.activity_type] = 
        (stats.activities_by_type[activity.activity_type] || 0) + 1;
      
      // Count by content type
      stats.activities_by_content_type[activity.content_type] = 
        (stats.activities_by_content_type[activity.content_type] || 0) + 1;
      
      // Count by user
      stats.activities_by_user[activity.user_name] = 
        (stats.activities_by_user[activity.user_name] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting content activity stats:', error);
    return {
      total_activities: 0,
      activities_by_type: {},
      activities_by_content_type: {},
      activities_by_user: {},
      recent_activities: []
    };
  }
}

/**
 * Formats activity timestamp for display
 */
export function formatActivityTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Gets activity type display text and icon
 */
export function getActivityDisplayInfo(activityType: string): {
  text: string;
  icon: string;
  color: string;
} {
  const activityMap: Record<string, { text: string; icon: string; color: string }> = {
    created: { text: 'Created', icon: 'mdiPlus', color: 'text-green-600' },
    updated: { text: 'Updated', icon: 'mdiPencil', color: 'text-blue-600' },
    published: { text: 'Published', icon: 'mdiPublish', color: 'text-purple-600' },
    deleted: { text: 'Deleted', icon: 'mdiTrashCan', color: 'text-red-600' },
    draft_saved: { text: 'Draft Saved', icon: 'mdiContentSave', color: 'text-yellow-600' }
  };

  return activityMap[activityType] || { text: activityType, icon: 'mdiCircle', color: 'text-gray-600' };
}

/**
 * Gets content type display text and icon
 */
export function getContentTypeDisplayInfo(contentType: string): {
  text: string;
  icon: string;
  color: string;
} {
  const contentTypeMap: Record<string, { text: string; icon: string; color: string }> = {
    policy: { text: 'Policy', icon: 'mdiFileDocument', color: 'text-blue-600' },
    procedure: { text: 'Procedure', icon: 'mdiClipboardText', color: 'text-green-600' },
    course: { text: 'Course', icon: 'mdiSchool', color: 'text-purple-600' },
    learning_pathway: { text: 'Learning Pathway', icon: 'mdiMapMarkerPath', color: 'text-orange-600' }
  };

  return contentTypeMap[contentType] || { text: contentType, icon: 'mdiFile', color: 'text-gray-600' };
}
