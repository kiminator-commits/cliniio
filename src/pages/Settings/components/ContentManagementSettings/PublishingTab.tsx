import React, { useState, useEffect } from 'react';
import { usePublishingSettings } from '../../../../hooks/usePublishingSettings';
import { useApprovalRoles } from '../../../../hooks/useApprovalRoles';
import { useFacility } from '../../../../contexts/FacilityContext';
import { useUser } from '../../../../contexts/UserContext';
import { ContentApprovalService, ContentApproval } from '../../../../services/contentApprovalService';
import { TaskService } from '../../../../services/taskService';
import { NotificationService } from '../../../../services/notificationService';
import { ApprovalErrorHandler } from '../../../../services/approvalErrorHandler';
import { toast } from 'react-hot-toast';
import ContentApprovalCard from '../../../../components/ContentApprovalCard';

export const PublishingTab: React.FC<{ reviewContentId?: string | null }> = ({ reviewContentId }) => {
  const { 
    settings, 
    loading, 
    error, 
    updateSetting,
    facilityLoading
  } = usePublishingSettings();

  const { approvalRoles } = useApprovalRoles();
  const { getCurrentFacilityId } = useFacility();
  const { currentUser } = useUser();
  
  const [pendingContent, setPendingContent] = useState<ContentApproval[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);

  // Fetch pending content
  useEffect(() => {
    const fetchPendingContent = async () => {
      const facilityId = getCurrentFacilityId();
      if (!facilityId) return;

      try {
        setPendingLoading(true);
        setPendingError(null);
        const content = await ContentApprovalService.getPendingContent(facilityId);
        setPendingContent(content);
      } catch (error) {
        const approvalError = ApprovalErrorHandler.handleApprovalError(error, 'fetch_pending_content');
        ApprovalErrorHandler.logError(approvalError, 'pending_content_fetch', 'current-user-id');
        setPendingError(approvalError.userMessage);
      } finally {
        setPendingLoading(false);
      }
    };

    if (!facilityLoading) {
      fetchPendingContent();
    }
  }, [getCurrentFacilityId, facilityLoading]);

  // Handle deep linking to specific content
  useEffect(() => {
    if (reviewContentId && pendingContent.length > 0) {
      // Find the content to highlight
      const contentToHighlight = pendingContent.find(c => c.id === reviewContentId);
      
      if (contentToHighlight) {
        // Scroll to and highlight the specific content after a short delay
        setTimeout(() => {
          const element = document.getElementById(`content-${reviewContentId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50', 'bg-blue-50');
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50', 'bg-blue-50');
            }, 5000);
          }
        }, 500);
      }
    }
  }, [reviewContentId, pendingContent]);

  const handleApprove = async (contentId: string, contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway', comments?: string) => {
    if (!currentUser) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // 1. Approve content
      await ContentApprovalService.approveContent(contentId, contentType, currentUser.id);
      
      // 2. Complete associated tasks
      const content = pendingContent.find(c => c.id === contentId);
      if (content?.taskId) {
        await TaskService.completeContentApprovalTask(content.taskId, 'approved', comments);
      }
      
      // 3. Send notification to content creator (non-critical)
      if (content) {
        try {
          await NotificationService.notifyContentApproval(
            content.authorId,
            content.facilityId,
            contentId,
            contentType,
            'approved',
            comments,
            currentUser.name || currentUser.email
          );
        } catch (notificationError) {
          ApprovalErrorHandler.handleNotificationError(notificationError);
        }
      }
      
      // 4. Update UI
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      
      toast.success('Content approved and published to Library', {
        duration: 4000,
        // action: {
        //   label: 'View Library',
        //   onClick: () => navigate('/knowledge-hub')
        // }
      });
    } catch (error) {
      const approvalError = ApprovalErrorHandler.handleApprovalActionError(error, 'approve');
      ApprovalErrorHandler.logError(approvalError, 'content_approval', currentUser.id);
      ApprovalErrorHandler.showErrorToast(approvalError);
    }
  };

  const handleReject = async (contentId: string, contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway', reason: string) => {
    if (!currentUser) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // 1. Reject content
      await ContentApprovalService.rejectContent(contentId, contentType, currentUser.id, reason);
      
      // 2. Complete associated tasks
      const content = pendingContent.find(c => c.id === contentId);
      if (content?.taskId) {
        await TaskService.completeContentApprovalTask(content.taskId, 'rejected', reason);
      }
      
      // 3. Send notification to content creator (non-critical)
      if (content) {
        try {
          await NotificationService.notifyContentApproval(
            content.authorId,
            content.facilityId,
            contentId,
            contentType,
            'rejected',
            reason,
            currentUser.name || currentUser.email
          );
        } catch (notificationError) {
          ApprovalErrorHandler.handleNotificationError(notificationError);
        }
      }
      
      // 4. Update UI
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      
      toast.success('Content rejected and returned to creator');
    } catch (error) {
      const approvalError = ApprovalErrorHandler.handleApprovalActionError(error, 'reject');
      ApprovalErrorHandler.logError(approvalError, 'content_rejection', currentUser.id);
      ApprovalErrorHandler.showErrorToast(approvalError);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading publishing settings
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wrapper functions to match ContentApprovalCard interface
  const handleApproveWrapper = (id: string, type: string, comments?: string) => {
    handleApprove(id, type as 'course' | 'policy' | 'procedure' | 'learning_pathway', comments);
  };

  const handleRejectWrapper = (id: string, type: string, reason: string) => {
    handleReject(id, type as 'course' | 'policy' | 'procedure' | 'learning_pathway', reason);
  };

  // Show loading state while facility or settings are loading
  if (facilityLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Loading publishing settings...
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Publishing Workflow
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Require approval before publishing
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="require-approval"
                className="sr-only peer"
                checked={settings.requireApproval}
                onChange={(e) => updateSetting('requireApproval', e.target.checked)}
                disabled={facilityLoading || loading}
              />
              <div className={`w-11 h-6 ${settings.requireApproval ? 'bg-[#4ECDC4]' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.requireApproval ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">
                Require approval before publishing
              </span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Notify reviewers on submission
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="notify-reviewers"
                className="sr-only peer"
                checked={settings.notifyReviewers}
                onChange={(e) => updateSetting('notifyReviewers', e.target.checked)}
                disabled={facilityLoading || loading}
              />
              <div className={`w-11 h-6 ${settings.notifyReviewers ? 'bg-[#4ECDC4]' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.notifyReviewers ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Notify reviewers on submission</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          Approval Roles
        </h4>
        <div className="space-y-3">
          {approvalRoles.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">
                {role.name}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                role.id === 'administrator' ? 'bg-red-100 text-red-800' :
                role.id === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                role.id === 'technician' ? 'bg-green-100 text-green-800' :
                role.id === 'viewer' ? 'bg-blue-100 text-blue-800' :
                role.id === 'trainer' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {role.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>Users with these roles have the "Approve Content" permission.</p>
          <p>They will be notified when content requires approval and can approve content for publishing.</p>
        </div>
      </div>

      {/* Pending Approval Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          Pending Approval ({pendingContent.length})
        </h4>
        
        {pendingLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pendingError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">Error loading pending content: {pendingError}</p>
          </div>
        ) : pendingContent.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">No pending approvals</h4>
            <p className="text-sm text-gray-500">All content has been reviewed. New submissions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingContent.map(content => (
              <ContentApprovalCard
                key={content.id}
                content={content}
                onApprove={handleApproveWrapper}
                onReject={handleRejectWrapper}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
