import React from 'react';
import Icon from '@mdi/react';
import { mdiPublish, mdiClock } from '@mdi/js';

interface PublishingWorkflowProps {
  validationStatus: {
    status: 'valid' | 'warning' | 'error';
    message: string;
  };
  isPublishing: boolean;
  handlePublish: () => void;
}

export const PublishingWorkflow: React.FC<PublishingWorkflowProps> = ({
  validationStatus,
  isPublishing,
  handlePublish,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon path={mdiPublish} size={1.5} className="text-green-600" />
        <h5 className="text-lg font-medium text-green-900">
          Ready to Publish?
        </h5>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-sm text-green-700">
          Your course has been reviewed and is ready for publication. Here's
          what will happen:
        </p>
        <ul className="text-sm text-green-700 space-y-1 ml-4">
          <li>• Course will be available in the library</li>
          <li>• Users can enroll and start learning</li>
          <li>• Progress tracking will be enabled</li>
          <li>• Certificates will be issued upon completion</li>
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePublish}
          disabled={validationStatus.status === 'error' || isPublishing}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            validationStatus.status === 'error' || isPublishing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
          }`}
        >
          <Icon path={isPublishing ? mdiClock : mdiPublish} size={1.2} />
          <span>{isPublishing ? 'Publishing...' : 'Publish Course Now'}</span>
        </button>

        <button
          onClick={() => alert('Course will be saved as draft')}
          className="px-4 py-3 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Save as Draft
        </button>
      </div>
    </div>
  );
};

export default PublishingWorkflow;
