import React from 'react';
import { useFeedbackSubmission } from '../../../hooks/useFeedbackSubmission';

interface FeedbackFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onBack,
  onSuccess,
}) => {
  const {
    feedbackType,
    setFeedbackType,
    feedbackTitle,
    setFeedbackTitle,
    feedbackDescription,
    setFeedbackDescription,
    feedbackPriority,
    setFeedbackPriority,
    feedbackEmail,
    setFeedbackEmail,
    isSubmittingFeedback,
    handleFeedbackSubmit,
  } = useFeedbackSubmission();

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleFeedbackSubmit(e);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">Product Feedback</h3>
            <p className="text-xs text-gray-500">Help us improve Cliniio</p>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#4ECDC4] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">💡</span>
            </div>
            <h4 className="font-semibold text-gray-800 text-lg">
              Share Your Feedback
            </h4>
            <p className="text-sm text-gray-600">
              Help us make Cliniio better for everyone
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Feedback Type */}
            <div>
              <label
                htmlFor="feedbackType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Feedback Type *
              </label>
              <select
                id="feedbackType"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                required
              >
                <option value="">Select feedback type</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="feedbackTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                id="feedbackTitle"
                type="text"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="Brief description of your feedback"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="feedbackDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description *
              </label>
              <textarea
                id="feedbackDescription"
                value={feedbackDescription}
                onChange={(e) => setFeedbackDescription(e.target.value)}
                placeholder="Please provide detailed information..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="feedbackPriority"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Priority
              </label>
              <select
                id="feedbackPriority"
                value={feedbackPriority}
                onChange={(e) => setFeedbackPriority(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Contact Info */}
            <div>
              <label
                htmlFor="feedbackEmail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contact Email (optional)
              </label>
              <input
                id="feedbackEmail"
                type="email"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                placeholder="your.email@facility.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll only use this to follow up on your feedback
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingFeedback}
              className="w-full bg-[#4ECDC4] text-white py-3 px-4 rounded-lg hover:bg-[#4ECDC4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
