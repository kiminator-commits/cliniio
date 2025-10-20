import { supabase } from '../lib/supabase';

export interface ContentDraft {
  id: string;
  title: string;
  description?: string;
  content?: string;
  content_type?: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  facility_id: string;
  published_at?: string;
  archived_at?: string;
  is_active?: boolean;
  status?: string;
  // Additional fields for different content types
  estimated_duration_minutes?: number;
  department?: string;
  tags?: string[];
  prerequisites?: string[];
  learning_objectives?: string[];
  points?: number;
  is_repeat?: boolean;
  media?: any;
  policy_number?: string;
  version?: string;
  domain?: string;
  difficulty_level?: string;
  safety_level?: string;
  equipment_required?: string[];
  materials_required?: string[];
  estimated_read_time_minutes?: number;
}

export interface DraftsByType {
  courses: ContentDraft[];
  policies: ContentDraft[];
  procedures: ContentDraft[];
  learning_pathways: ContentDraft[];
}

/**
 * Fetches all drafts for a specific user and facility
 * Drafts are identified by published_at being NULL and archived_at being NULL
 */
export async function fetchUserDrafts(
  userId: string,
  facilityId: string
): Promise<DraftsByType> {
  try {
    // Fetch drafts from all content tables in parallel
    const [coursesResult, policiesResult, proceduresResult, pathwaysResult] = await Promise.all([
      // Courses drafts
      supabase
        .from('courses')
        .select('*')
        .eq('author_id', userId)
        .eq('facility_id', facilityId)
        .is('published_at', null)
        .is('archived_at', null)
        .order('updated_at', { ascending: false }),
      
      // Policies drafts
      supabase
        .from('policies')
        .select('*')
        .eq('author_id', userId)
        .eq('facility_id', facilityId)
        .is('published_at', null)
        .is('archived_at', null)
        .order('updated_at', { ascending: false }),
      
      // Procedures drafts
      supabase
        .from('procedures')
        .select('*')
        .eq('author_id', userId)
        .eq('facility_id', facilityId)
        .is('published_at', null)
        .is('archived_at', null)
        .order('updated_at', { ascending: false }),
      
      // Learning pathways drafts (assuming they're stored in courses table with content_type)
      supabase
        .from('courses')
        .select('*')
        .eq('author_id', userId)
        .eq('facility_id', facilityId)
        .eq('content_type', 'learning_pathway')
        .is('published_at', null)
        .is('archived_at', null)
        .order('updated_at', { ascending: false })
    ]);

    // Handle errors
    if (coursesResult.error) {
      console.error('Error fetching course drafts:', coursesResult.error);
    }
    if (policiesResult.error) {
      console.error('Error fetching policy drafts:', policiesResult.error);
    }
    if (proceduresResult.error) {
      console.error('Error fetching procedure drafts:', proceduresResult.error);
    }
    if (pathwaysResult.error) {
      console.error('Error fetching pathway drafts:', pathwaysResult.error);
    }

    return {
      courses: coursesResult.data || [],
      policies: policiesResult.data || [],
      procedures: proceduresResult.data || [],
      learning_pathways: pathwaysResult.data || []
    };
  } catch (error) {
    console.error('Error fetching user drafts:', error);
    return {
      courses: [],
      policies: [],
      procedures: [],
      learning_pathways: []
    };
  }
}

/**
 * Fetches a specific draft by ID and content type
 */
export async function fetchDraftById(
  draftId: string,
  contentType: 'courses' | 'policies' | 'procedures' | 'learning_pathways'
): Promise<ContentDraft | null> {
  try {
    const tableName = contentType === 'learning_pathways' ? 'courses' : contentType;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', draftId)
      .single();

    if (error) {
      console.error(`Error fetching ${contentType} draft:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching draft ${draftId}:`, error);
    return null;
  }
}

/**
 * Deletes a draft by ID and content type
 */
export async function deleteDraft(
  draftId: string,
  contentType: 'courses' | 'policies' | 'procedures' | 'learning_pathways'
): Promise<boolean> {
  try {
    const tableName = contentType === 'learning_pathways' ? 'courses' : contentType;
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', draftId);

    if (error) {
      console.error(`Error deleting ${contentType} draft:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting draft ${draftId}:`, error);
    return false;
  }
}

/**
 * Publishes a draft by setting published_at timestamp
 */
export async function publishDraft(
  draftId: string,
  contentType: 'courses' | 'policies' | 'procedures' | 'learning_pathways'
): Promise<boolean> {
  try {
    const tableName = contentType === 'learning_pathways' ? 'courses' : contentType;
    
    const { error } = await supabase
      .from(tableName)
      .update({ published_at: new Date().toISOString() })
      .eq('id', draftId);

    if (error) {
      console.error(`Error publishing ${contentType} draft:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error publishing draft ${draftId}:`, error);
    return false;
  }
}

/**
 * Submits a draft for approval workflow
 */
export async function submitForApproval(
  draftId: string,
  contentType: 'courses' | 'policies' | 'procedures' | 'learning_pathways'
): Promise<boolean> {
  try {
    const tableName = contentType === 'learning_pathways' ? 'courses' : contentType;
    
    // 1. Update content status to pending approval
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        approval_status: 'pending_approval',
        submitted_for_approval_at: new Date().toISOString()
      })
      .eq('id', draftId);

    if (updateError) {
      console.error(`Error updating ${contentType} approval status:`, updateError);
      return false;
    }

    // 2. Get content details to create tasks
    const { data: content, error: fetchError } = await supabase
      .from(tableName)
      .select('facility_id')
      .eq('id', draftId)
      .single();

    if (fetchError || !content) {
      console.error(`Error fetching ${contentType} details:`, fetchError);
      return false;
    }

    // 3. Create approval tasks (import TaskService dynamically to avoid circular imports)
    const { TaskService } = await import('./taskService');
    const mappedContentType = contentType === 'courses' ? 'course' :
                             contentType === 'policies' ? 'policy' :
                             contentType === 'procedures' ? 'procedure' :
                             contentType === 'learning_pathways' ? 'learning_pathway' : 'course';
    await TaskService.createContentApprovalTask(draftId, mappedContentType, content.facility_id);

    console.log(`Successfully submitted ${contentType} ${draftId} for approval`);
    return true;
  } catch (error) {
    console.error(`Error submitting ${contentType} draft for approval:`, error);
    return false;
  }
}

/**
 * Formats the last updated timestamp for display
 */
export function formatDraftTimestamp(timestamp: string): string {
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
