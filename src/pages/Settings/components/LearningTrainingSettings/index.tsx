import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiCog,
  mdiBrain,
  mdiCertificate,
  mdiTarget,
  mdiContentSave,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiTune,
} from '@mdi/js';
import GeneralTab from './GeneralTab';
import AITab from './AITab';
import CertificationsTab from './CertificationsTab';
import LearningPathsTab from './LearningPathsTab';
import AdvancedTab from './AdvancedTab';
import { useLearningSettings } from './useLearningSettings';

const LearningTrainingSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    aiSettings,
    setAiSettings,
    generalSettings,
    setGeneralSettings,
    certificationSettings,
    setCertificationSettings,
    learningPathSettings,
    setLearningPathSettings,
  } = useLearningSettings();

  const tabs = [
    { id: 'general', label: 'General Settings', icon: mdiCog },
    { id: 'ai', label: 'AI & Analytics', icon: mdiBrain },
    { id: 'certifications', label: 'Certifications', icon: mdiCertificate },
    { id: 'learning-paths', label: 'Learning Paths', icon: mdiTarget },
    { id: 'advanced', label: 'Advanced', icon: mdiTune },
  ];

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Save settings to database/local storage
      // This would integrate with your existing settings system

      setMessage({ type: 'success', text: 'Settings saved successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'Failed to save settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralTab
            settings={generalSettings}
            onSettingsChange={setGeneralSettings}
          />
        );
      case 'ai':
        return <AITab settings={aiSettings} onSettingsChange={setAiSettings} />;
      case 'certifications':
        return (
          <CertificationsTab
            settings={certificationSettings}
            onSettingsChange={setCertificationSettings}
          />
        );
      case 'learning-paths':
        return (
          <LearningPathsTab
            settings={learningPathSettings}
            onSettingsChange={setLearningPathSettings}
          />
        );
      case 'advanced':
        return (
          <AdvancedTab
            aiSettings={aiSettings}
            onAiSettingsChange={setAiSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Learning & Training Settings
          </h3>
          <p className="text-gray-600">
            Configure AI-powered learning features and training modules
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4ECDC4] hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50"
        >
          <Icon path={mdiContentSave} size={1} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center">
            <Icon
              path={
                message.type === 'success' ? mdiCheckCircle : mdiAlertCircle
              }
              size={1.2}
              className={`mr-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
            />
            {message.text}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
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

      {/* Tab Content */}
      <div className="tab-content-area">{renderTabContent()}</div>
    </div>
  );
};

export default LearningTrainingSettings;
