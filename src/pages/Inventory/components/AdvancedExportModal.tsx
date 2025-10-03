import React from 'react';
import { InventoryItem } from '@/types/inventoryTypes';
import { TabNavigation } from './AdvancedExportModal/TabNavigation';
import { ExportNowTab } from './AdvancedExportModal/ExportNowTab';
import { ScheduledExportsTab } from './AdvancedExportModal/ScheduledExportsTab';
import { TemplatesTab } from './AdvancedExportModal/TemplatesTab';
import { useAdvancedExportModal } from './AdvancedExportModal/hooks/useAdvancedExportModal';

interface AdvancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onExportSuccess?: (result: unknown) => void;
  onExportError?: (error: string) => void;
}

export const AdvancedExportModal: React.FC<AdvancedExportModalProps> = ({
  isOpen,
  onClose,
  items,
  onExportSuccess,
  onExportError,
}) => {
  const {
    templates,
    selectedTemplate,
    schedules,
    isLoading,
    activeTab,
    showScheduleForm,
    scheduleForm,
    setSelectedTemplate,
    setActiveTab,
    setShowScheduleForm,
    setScheduleForm,
    handleExport,
    handleCreateSchedule,
    handleToggleSchedule,
    handleDeleteSchedule,
    handleTriggerExport,
  } = useAdvancedExportModal({
    isOpen,
    items,
    onExportSuccess,
    onExportError,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Advanced Export
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'export' && (
            <ExportNowTab
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              onExport={handleExport}
              onCancel={onClose}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduledExportsTab
              templates={templates}
              schedules={schedules}
              showScheduleForm={showScheduleForm}
              scheduleForm={scheduleForm}
              onShowScheduleForm={setShowScheduleForm}
              onScheduleFormChange={setScheduleForm}
              onCreateSchedule={handleCreateSchedule}
              onToggleSchedule={handleToggleSchedule}
              onTriggerExport={handleTriggerExport}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesTab
              templates={templates}
              onTemplateSelect={setSelectedTemplate}
              onTabChange={setActiveTab}
            />
          )}
        </div>
      </div>
    </div>
  );
};
