import React from 'react';
import Icon from '@mdi/react';
import { mdiCog, mdiChevronDown, mdiChevronUp } from '@mdi/js';

interface PublishingSettingsProps {
  collapsedSections: {
    settings: boolean;
  };
  toggleSection: (section: 'settings') => void;
  publishSettings: {
    isPublic: boolean;
    requireEnrollment: boolean;
    allowGuestAccess: boolean;
    maxEnrollments: number;
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    courseStartDate: string;
    courseEndDate: string;
    autoArchive: boolean;
    archiveAfterDays: number;
  };
  setPublishSettings: React.Dispatch<
    React.SetStateAction<{
      isPublic: boolean;
      requireEnrollment: boolean;
      allowGuestAccess: boolean;
      maxEnrollments: number;
      enrollmentStartDate: string;
      enrollmentEndDate: string;
      courseStartDate: string;
      courseEndDate: string;
      autoArchive: boolean;
      archiveAfterDays: number;
    }>
  >;
}

export const PublishingSettings: React.FC<PublishingSettingsProps> = ({
  collapsedSections,
  toggleSection,
  publishSettings,
  setPublishSettings,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50"
        onClick={() => toggleSection('settings')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection('settings');
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsedSections.settings}
      >
        <div className="flex items-center gap-3">
          <Icon path={mdiCog} size={1.2} className="text-purple-600" />
          <h5 className="text-lg font-medium text-gray-900">
            Publishing Settings & Access Controls
          </h5>
        </div>
        <Icon
          path={collapsedSections.settings ? mdiChevronDown : mdiChevronUp}
          size={1}
          className="text-gray-400"
        />
      </div>

      {!collapsedSections.settings && (
        <div className="border-t border-gray-200 p-4 space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="course-visibility"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Visibility
              </label>
              <select
                id="course-visibility"
                value={publishSettings.isPublic ? 'public' : 'private'}
                onChange={(e) =>
                  setPublishSettings((prev) => ({
                    ...prev,
                    isPublic: e.target.value === 'public',
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              >
                <option value="public">Public - Visible to all users</option>
                <option value="private">Private - Invitation only</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="enrollment-requirements"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enrollment Requirements
              </label>
              <select
                id="enrollment-requirements"
                value={
                  publishSettings.requireEnrollment ? 'required' : 'optional'
                }
                onChange={(e) =>
                  setPublishSettings((prev) => ({
                    ...prev,
                    requireEnrollment: e.target.value === 'required',
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              >
                <option value="optional">
                  Optional - Users can start immediately
                </option>
                <option value="required">Required - Approval needed</option>
              </select>
            </div>
          </div>

          {/* Access Controls */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900">
              Access Controls
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  id="allow-guest-access"
                  type="checkbox"
                  checked={publishSettings.allowGuestAccess}
                  onChange={(e) =>
                    setPublishSettings((prev) => ({
                      ...prev,
                      allowGuestAccess: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Allow guest access
                </span>
              </label>

              <label className="flex items-center">
                <input
                  id="auto-archive"
                  type="checkbox"
                  checked={publishSettings.autoArchive}
                  onChange={(e) =>
                    setPublishSettings((prev) => ({
                      ...prev,
                      autoArchive: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Auto-archive after completion
                </span>
              </label>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="enrollment-start-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enrollment Start Date
              </label>
              <input
                id="enrollment-start-date"
                type="date"
                value={publishSettings.enrollmentStartDate}
                onChange={(e) =>
                  setPublishSettings((prev) => ({
                    ...prev,
                    enrollmentStartDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="enrollment-end-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enrollment End Date
              </label>
              <input
                id="enrollment-end-date"
                type="date"
                value={publishSettings.enrollmentEndDate}
                onChange={(e) =>
                  setPublishSettings((prev) => ({
                    ...prev,
                    enrollmentEndDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishingSettings;
