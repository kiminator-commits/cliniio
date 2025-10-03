import React from 'react';
import Icon from '@mdi/react';
import { mdiPencil, mdiDelete, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';

interface StatusType {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isCore: boolean;
  isPublished: boolean;
  category?: string;
  requiresVerification?: boolean;
  autoTransition?: boolean;
  transitionTo?: string;
  alertLevel?: 'low' | 'medium' | 'high' | 'critical';
}

interface StatusTypeManagementProps {
  coreStatuses: StatusType[];
  customStatuses: StatusType[];
  onEditStatus: (status: StatusType) => void;
  onDeleteStatus: (statusId: string) => void;
  onTogglePublishStatus: (statusId: string, isPublished: boolean) => void;
}

const StatusTypeManagement: React.FC<StatusTypeManagementProps> = ({
  coreStatuses,
  customStatuses,
  onEditStatus,
  onDeleteStatus,
  onTogglePublishStatus,
}) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Core Status Types (Required)
      </h4>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {coreStatuses.map((status) => (
          <div
            key={status.id}
            className="p-2 rounded-lg border bg-white border-gray-200"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: status.color }}
                />
                <span className="font-medium text-xs">{status.name}</span>
                <Icon
                  path={mdiLock}
                  size={0.4}
                  className="text-gray-300 ml-1"
                  title="Core status - always available"
                />
              </div>
              <span className="px-1 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                Core
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {status.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center">
        <span className="text-sm font-medium text-gray-700">
          Custom Status Types (Optional)
        </span>
        <div className="relative ml-2 tooltip-container">
          <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold cursor-help">
            i
          </div>
          <div className="tooltip-content">
            <div className="mb-1 font-medium">💡 Data Integrity Protection</div>
            <div className="space-y-1">
              <div>• Similar statuses (≥90% match) are blocked</div>
              <div>• Very similar statuses (≥80% match) show warnings</div>
              <div>• Smart suggestions help you choose better names</div>
              <div>• All statuses start as drafts for testing</div>
            </div>
            <div className="tooltip-arrow"></div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Custom statuses start as drafts. Click the eye icon to publish them and
        make them visible in the cleaning workflow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {customStatuses.map((status) => (
          <div
            key={status.id}
            className={`p-3 rounded-lg border ${
              status.isPublished
                ? 'bg-purple-100 border-purple-300'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: status.color }}
                />
                <span className="font-medium text-sm">{status.name}</span>
                <span
                  className={`ml-2 px-1 py-0.5 text-xs rounded ${
                    status.isPublished
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {status.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => onEditStatus(status)}
                  className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                  title="Edit status"
                >
                  <Icon path={mdiPencil} size={0.6} />
                </button>
                <button
                  onClick={() =>
                    onTogglePublishStatus(status.id, !status.isPublished)
                  }
                  className={`p-1 rounded ${
                    status.isPublished
                      ? 'text-orange-600 hover:bg-orange-100'
                      : 'text-green-600 hover:bg-green-100'
                  }`}
                  title={
                    status.isPublished ? 'Unpublish status' : 'Publish status'
                  }
                >
                  <Icon
                    path={status.isPublished ? mdiEyeOff : mdiEye}
                    size={0.6}
                  />
                </button>
                <button
                  onClick={() => onDeleteStatus(status.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="Delete status"
                >
                  <Icon path={mdiDelete} size={0.6} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">{status.description}</p>
            <div className="text-xs text-purple-600">
              {status.requiresVerification && (
                <span className="mr-2">✓ Verification</span>
              )}
              {status.autoTransition && (
                <span className="mr-2">✓ Auto Transition</span>
              )}
              {status.alertLevel && status.alertLevel !== 'low' && (
                <span className="mr-2">⚠ {status.alertLevel}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTypeManagement;
