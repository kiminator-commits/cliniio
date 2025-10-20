import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiFileEdit } from '@mdi/js';
import { useContentBuilderSettings } from '../../../../hooks/useContentBuilderSettings';
import { useContentCreationAccess } from '../../../../hooks/useContentCreationAccess';
import { useContentActivities } from '../../../../hooks/useContentActivities';
import { formatActivityTimestamp, getActivityDisplayInfo, getContentTypeDisplayInfo } from '../../../../services/contentActivityService';

interface ContentBuilderTabProps {
  onLaunchBuilder: () => void;
}

export const ContentBuilderTab: React.FC<ContentBuilderTabProps> = ({
  onLaunchBuilder,
}) => {
  const { 
    settings, 
    loading, 
    error, 
    updateSetting,
    facilityLoading
  } = useContentBuilderSettings();
  
  const { 
    isContentCreationEnabled, 
    hasRolePermission, 
    userRole 
  } = useContentCreationAccess();

  const { activities, loading: activitiesLoading, error: activitiesError } = useContentActivities();
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading settings
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

  // Show loading state while facility or settings are loading
  if (facilityLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Loading settings...
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
          Content Builder
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Launch Content Builder
            </span>
            <button
              onClick={onLaunchBuilder}
              disabled={!isContentCreationEnabled || facilityLoading || loading}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
                isContentCreationEnabled && !facilityLoading && !loading
                  ? 'text-white bg-[#4ECDC4] hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}
            >
              <Icon path={mdiPlus} size={1} className="mr-2" />
              Launch Builder
            </button>
          </div>
          {!isContentCreationEnabled && (
            <div className="text-xs text-gray-500 mt-1">
              Content creation is disabled. 
              {hasRolePermission ? 
                ' Enable it above in the facility settings.' : 
                ` You need Administrator role to create content. (Current role: ${userRole})`}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Enable content creation
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="enable-content-creation"
                className="sr-only peer"
                checked={settings.enableContentCreation}
                onChange={(e) => updateSetting('enableContentCreation', e.target.checked)}
                disabled={facilityLoading || loading}
              />
              <div className={`w-11 h-6 ${settings.enableContentCreation ? 'bg-[#4ECDC4]' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.enableContentCreation ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Enable content creation</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Auto-save drafts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-save-drafts"
                className="sr-only peer"
                checked={settings.autoSave}
                onChange={(e) => updateSetting('autoSave', e.target.checked)}
                disabled={facilityLoading || loading}
              />
              <div className={`w-11 h-6 ${settings.autoSave ? 'bg-[#4ECDC4]' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.autoSave ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Auto-save drafts</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Draft retention (days)</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="365"
                value={settings.draftRetention}
                onChange={(e) => updateSetting('draftRetention', parseInt(e.target.value) || 30)}
                disabled={facilityLoading || loading}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              />
              <span className="text-sm text-gray-500">days</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enable template library</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="template-library"
                className="sr-only peer"
                checked={settings.templateLibrary}
                onChange={(e) => updateSetting('templateLibrary', e.target.checked)}
                disabled={facilityLoading || loading}
              />
              <div className={`w-11 h-6 ${settings.templateLibrary ? 'bg-[#4ECDC4]' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.templateLibrary ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Enable template library</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Collaborative editing</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="collaborative-editing"
                className="sr-only peer"
                checked={settings.collaborativeEditing}
                onChange={(e) => updateSetting('collaborativeEditing', e.target.checked)}
                disabled={facilityLoading || loading}
              />
              <div className={`w-11 h-6 ${settings.collaborativeEditing ? 'bg-[#4ECDC4]' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.collaborativeEditing ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Collaborative editing</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          Recent Activity
        </h4>
        
        {activitiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4ECDC4]"></div>
            <span className="ml-2 text-sm text-gray-600">Loading activities...</span>
          </div>
        ) : activitiesError ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">Error loading activities: {activitiesError}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Icon path={mdiFileEdit} size={2} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">
              Content creation activity will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity) => {
              const activityInfo = getActivityDisplayInfo(activity.activity_type);
              const contentTypeInfo = getContentTypeDisplayInfo(activity.content_type);
              
              return (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.activity_type === 'published' ? 'bg-green-500' :
                    activity.activity_type === 'draft_saved' ? 'bg-yellow-500' :
                    activity.activity_type === 'created' ? 'bg-blue-500' :
                    activity.activity_type === 'updated' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon path={activityInfo.icon} size={0.8} className={activityInfo.color} />
                      <p className="text-sm font-medium text-gray-900">
                        {activityInfo.text}
                      </p>
                      <Icon path={contentTypeInfo.icon} size={0.7} className={contentTypeInfo.color} />
                      <span className="text-xs text-gray-500">{contentTypeInfo.text}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.content_title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.user_name}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatActivityTimestamp(activity.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
