import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiPackageVariant,
  mdiBrain,
  mdiCog,
  mdiContentSave,
  mdiRefresh,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiChartBar,
  mdiTune,
  mdiMapMarker,
} from '@mdi/js';
import GeneralTab from './GeneralTab';
import StockTab from './StockTab';
import CategoriesTab from './CategoriesTab';
import ReportingTab from './ReportingTab';
import AITab from './AITab';
import LocationManagementPage from '../../LocationManagementPage';
import { useInventorySettings } from './useInventorySettings';

const InventoryManagementSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    settings,
    setSettings,
    aiSettings: _aiSettings,
    aiMessage: _aiMessage,
    isLoading,
    handleAISettingChange: _handleAISettingChange,
    handleAISettingsSave: _handleAISettingsSave,
    handleAISettingsReset: _handleAISettingsReset,
    saveSettings,
    loadSettings,
  } = useInventorySettings();

  const tabs = [
    { id: 'general', label: 'General Settings', icon: mdiCog },
    { id: 'stock', label: 'Stock Management', icon: mdiPackageVariant },
    { id: 'categories', label: 'Categories & Tags', icon: mdiTune },
    { id: 'locations', label: 'Location Management', icon: mdiMapMarker },
    { id: 'reporting', label: 'Reporting & Analytics', icon: mdiChartBar },
    { id: 'ai', label: 'AI & Machine Learning', icon: mdiBrain },
  ];

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      await saveSettings();
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralTab settings={settings} onSettingsChange={setSettings} />
        );
      case 'stock':
        return <StockTab settings={settings} onSettingsChange={setSettings} />;
      case 'categories':
        return (
          <CategoriesTab settings={settings} onSettingsChange={setSettings} />
        );
      case 'locations':
        return <LocationManagementPage />;
      case 'reporting':
        return (
          <ReportingTab settings={settings} onSettingsChange={setSettings} />
        );
      case 'ai':
        return (
          <AITab />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          Loading inventory settings...
        </span>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">
        Inventory Management Settings
      </h4>
      <p className="text-sm text-gray-600 mb-6">
        Configure inventory behavior, AI features, and system preferences
      </p>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg border mb-6 ${
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
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-[#4ECDC4] text-[#4ECDC4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon path={tab.icon} size={1} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content-area">{renderTabContent()}</div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={loadSettings}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <Icon path={mdiRefresh} size={1} className="inline mr-2" />
          Reset
        </button>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Icon path={mdiContentSave} size={1} className="inline mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default InventoryManagementSettings;
