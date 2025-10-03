import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiContentSave, mdiAlertCircle, mdiCheckCircle } from '@mdi/js';
import RoomManagement from '../../../components/Settings/RoomManagement';
import ChecklistManagement from '../../../components/Settings/ChecklistManagement';
import {
  GeneralTab,
  AITab,
  ProtocolsTab,
  NotificationsTab,
  ComplianceTab,
  AdvancedTab,
  useEnvironmentalCleaningSettings,
  TABS,
} from './environmentalCleaning/index';

const EnvironmentalCleaningSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const {
    aiSettings,
    protocolSettings,
    notificationSettings,
    message,
    isLoading,
    handleAISettingChange,
    handleProtocolSettingChange,
    handleNotificationSettingChange,
    handleSaveSettings,
  } = useEnvironmentalCleaningSettings();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralTab
            protocolSettings={protocolSettings}
            onProtocolSettingChange={handleProtocolSettingChange}
          />
        );
      case 'ai':
        return (
          <AITab
            aiSettings={aiSettings}
            onAISettingChange={handleAISettingChange}
          />
        );
      case 'protocols':
        return (
          <ProtocolsTab
            protocolSettings={protocolSettings}
            onProtocolSettingChange={handleProtocolSettingChange}
          />
        );
      case 'rooms':
        return <RoomManagement />;
      case 'checklists':
        return <ChecklistManagement />;
      case 'notifications':
        return (
          <NotificationsTab
            notificationSettings={notificationSettings}
            onNotificationSettingChange={handleNotificationSettingChange}
          />
        );
      case 'compliance':
        return (
          <ComplianceTab
            protocolSettings={protocolSettings}
            onProtocolSettingChange={handleProtocolSettingChange}
          />
        );
      case 'advanced':
        return (
          <AdvancedTab
            aiSettings={aiSettings}
            onAISettingChange={handleAISettingChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-2">
          Environmental Cleaning Settings
        </h4>
        <p className="text-gray-600 mb-4">
          Configure comprehensive settings for environmental cleaning workflows,
          AI features, protocols, and compliance.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              path={
                message.type === 'success' ? mdiCheckCircle : mdiAlertCircle
              }
              size={1}
              className="text-current"
            />
            {message.text}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab: { id: string; label: string; icon: string }) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#4ECDC4] text-[#4ECDC4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon path={tab.icon} size={1} />
              {tab.label || tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTabContent()}</div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="px-6 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#45B7AF] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Icon path={mdiContentSave} size={1} />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default EnvironmentalCleaningSettings;
