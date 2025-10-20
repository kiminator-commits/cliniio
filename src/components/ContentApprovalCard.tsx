import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiFileDocument, mdiAccount, mdiClock } from '@mdi/js';
import { ContentApproval } from '../services/contentApprovalService';

interface ContentApprovalCardProps {
  content: ContentApproval;
  onApprove: (id: string, type: string, comments?: string) => void;
  onReject: (id: string, type: string, reason: string) => void;
}

export const ContentApprovalCard: React.FC<ContentApprovalCardProps> = ({ 
  content, 
  onApprove, 
  onReject 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return mdiFileDocument;
      case 'policy':
        return mdiFileDocument;
      case 'procedure':
        return mdiFileDocument;
      case 'learning_pathway':
        return mdiFileDocument;
      default:
        return mdiFileDocument;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'text-blue-600 bg-blue-100';
      case 'policy':
        return 'text-purple-600 bg-purple-100';
      case 'procedure':
        return 'text-green-600 bg-green-100';
      case 'learning_pathway':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getContentTypeDisplay = (type: string) => {
    switch (type) {
      case 'course':
        return 'Course';
      case 'policy':
        return 'Policy';
      case 'procedure':
        return 'Procedure';
      case 'learning_pathway':
        return 'Learning Pathway';
      default:
        return type;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
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
  };

  const handleApprove = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onApprove(content.id, content.type, comments.trim() || undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing || !rejectionReason.trim()) return;
    
    setIsProcessing(true);
    try {
      await onReject(content.id, content.type, rejectionReason.trim());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowRejectionForm = () => {
    setShowRejectionForm(true);
    setShowComments(false);
  };

  const handleCancelRejection = () => {
    setShowRejectionForm(false);
    setRejectionReason('');
  };

  return (
    <div 
      id={`content-${content.id}`}
      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Content Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getContentTypeColor(content.type)}`}>
              <Icon 
                path={getContentTypeIcon(content.type)} 
                size={1} 
              />
            </div>
          </div>

          {/* Content Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h5 className="font-medium text-gray-900 truncate">{content.title}</h5>
              <span className={`text-xs px-2 py-1 rounded-full ${getContentTypeColor(content.type)}`}>
                {getContentTypeDisplay(content.type)}
              </span>
            </div>
            
            {content.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{content.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Icon path={mdiAccount} size={0.8} />
                <span>by {content.authorName}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Icon path={mdiClock} size={0.8} />
                <span>Submitted {formatTimeAgo(content.submittedAt)}</span>
              </div>
              {content.revisionNumber > 1 && (
                <>
                  <span>•</span>
                  <span>Revision {content.revisionNumber}</span>
                </>
              )}
              {content.previousRejections > 0 && (
                <>
                  <span>•</span>
                  <span className="text-orange-600">
                    {content.previousRejections} previous rejection{content.previousRejections > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-blue-600 hover:text-blue-800 text-sm"
            disabled={isProcessing}
          >
            {showComments ? 'Hide Comments' : 'Add Comments'}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Optional comments for the creator..."
            className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
            rows={2}
            disabled={isProcessing}
          />
        </div>
      )}

      {/* Rejection Form */}
      {showRejectionForm && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide specific feedback for the creator..."
                className="w-full p-2 border border-red-300 rounded-md text-sm resize-none focus:ring-red-500 focus:border-red-500"
                rows={3}
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCancelRejection}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isProcessing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!showRejectionForm && (
        <div className="flex items-center justify-end space-x-3 mt-4">
          <button
            onClick={handleShowRejectionForm}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm"
            disabled={isProcessing}
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Approve & Publish'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentApprovalCard;
