import { supabase } from '../lib/supabase';

export interface ContentApproval {
  id: string;
  title: string;
  description?: string;
  type: 'course' | 'policy' | 'procedure' | 'learning_pathway';
  authorId: string;
  authorName: string;
  submittedAt: string;
  revisionNumber: number;
  previousRejections: number;
  facilityId: string;
  taskId?: string; // Optional task ID for associated approval tasks
}

export class ContentApprovalService {
  /**
   * Get all content pending approval for the current facility
   */
  static async getPendingContent(facilityId: string): Promise<ContentApproval[]> {
    try {
      const pendingContent: ContentApproval[] = [];

      // Get pending courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          author_id,
          submitted_for_approval_at,
          users!author_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('facility_id', facilityId)
        .eq('approval_status', 'pending_approval')
        .is('published_at', null);

      if (coursesError) {
        console.error('Error fetching pending courses:', coursesError);
      } else if (courses) {
        courses.forEach(course => {
          pendingContent.push({
            id: course.id,
            title: course.title,
            description: course.description,
            type: 'course',
            authorId: course.author_id,
            authorName: `${course.users?.[0]?.first_name || ''} ${course.users?.[0]?.last_name || ''}`.trim() || course.users?.[0]?.email || 'Unknown',
            submittedAt: course.submitted_for_approval_at,
            revisionNumber: 1, // TODO: Implement revision tracking
            previousRejections: 0, // TODO: Implement rejection tracking
            facilityId: facilityId
          });
        });
      }

      // Get pending policies (policies table doesn't have facility_id)
      const { data: policies, error: policiesError } = await supabase
        .from('policies')
        .select(`
          id,
          title,
          description,
          author_id,
          submitted_for_approval_at,
          users!author_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('approval_status', 'pending_approval')
        .is('published_at', null);

      if (policiesError) {
        console.error('Error fetching pending policies:', policiesError);
      } else if (policies) {
        policies.forEach(policy => {
          pendingContent.push({
            id: policy.id,
            title: policy.title,
            description: policy.description,
            type: 'policy',
            authorId: policy.author_id,
            authorName: `${policy.users?.[0]?.first_name || ''} ${policy.users?.[0]?.last_name || ''}`.trim() || policy.users?.[0]?.email || 'Unknown',
            submittedAt: policy.submitted_for_approval_at,
            revisionNumber: 1,
            previousRejections: 0,
            facilityId: facilityId
          });
        });
      }

      // Get pending procedures (procedures table doesn't have facility_id)
      const { data: procedures, error: proceduresError } = await supabase
        .from('procedures')
        .select(`
          id,
          title,
          description,
          author_id,
          submitted_for_approval_at,
          users!author_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('approval_status', 'pending_approval')
        .is('published_at', null);

      if (proceduresError) {
        console.error('Error fetching pending procedures:', proceduresError);
      } else if (procedures) {
        procedures.forEach(procedure => {
          pendingContent.push({
            id: procedure.id,
            title: procedure.title,
            description: procedure.description,
            type: 'procedure',
            authorId: procedure.author_id,
            authorName: `${procedure.users?.[0]?.first_name || ''} ${procedure.users?.[0]?.last_name || ''}`.trim() || procedure.users?.[0]?.email || 'Unknown',
            submittedAt: procedure.submitted_for_approval_at,
            revisionNumber: 1,
            previousRejections: 0,
            facilityId: facilityId
          });
        });
      }

      // Sort by submission date (newest first)
      pendingContent.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      return pendingContent;
    } catch (error) {
      console.error('Error fetching pending content:', error);
      throw error;
    }
  }

  /**
   * Approve content and publish it with concurrency protection
   */
  static async approveContent(
    contentId: string, 
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway',
    approvedBy: string
  ): Promise<void> {
    try {
      const tableName = contentType === 'learning_pathway' ? 'courses' : contentType;
      
      // First check if content is still pending approval
      const { data: currentContent, error: checkError } = await supabase
        .from(tableName)
        .select('approval_status')
        .eq('id', contentId)
        .single();

      if (checkError) {
        throw checkError;
      }

      if (currentContent.approval_status !== 'pending_approval') {
        throw new Error(`Content ${contentId} is no longer pending approval (status: ${currentContent.approval_status})`);
      }
      
      const { error } = await supabase
        .from(tableName)
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          published_at: new Date().toISOString() // Publish the content
        })
        .eq('id', contentId)
        .eq('approval_status', 'pending_approval'); // Additional concurrency protection

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error approving content:', error);
      throw error;
    }
  }

  /**
   * Reject content and return it to draft status with concurrency protection
   */
  static async rejectContent(
    contentId: string, 
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway',
    rejectedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      const tableName = contentType === 'learning_pathway' ? 'courses' : contentType;
      
      // First check if content is still pending approval
      const { data: currentContent, error: checkError } = await supabase
        .from(tableName)
        .select('approval_status')
        .eq('id', contentId)
        .single();

      if (checkError) {
        throw checkError;
      }

      if (currentContent.approval_status !== 'pending_approval') {
        throw new Error(`Content ${contentId} is no longer pending approval (status: ${currentContent.approval_status})`);
      }
      
      const { error } = await supabase
        .from(tableName)
        .update({
          approval_status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: rejectedBy,
          rejection_reason: reason
        })
        .eq('id', contentId)
        .eq('approval_status', 'pending_approval'); // Additional concurrency protection

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error rejecting content:', error);
      throw error;
    }
  }
}
