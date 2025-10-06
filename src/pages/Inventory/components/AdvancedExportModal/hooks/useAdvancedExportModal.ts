import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventoryTypes';
import {
  InventoryExportTemplateService,
  ExportTemplate,
  ExportSchedule,
} from '../../../services/inventoryExportTemplateService';
import { InventoryScheduledExportService } from '../../../services/inventoryScheduledExportService';
import { InventoryExportService } from '../../../services/inventoryExportService';

interface ScheduleFormData {
  name: string;
  templateId: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  dayOfWeek: number;
  dayOfMonth: number;
  cronExpression: string;
  recipients: string[];
  enabled: boolean;
}

interface UseAdvancedExportModalProps {
  isOpen: boolean;
  items: InventoryItem[];
  onExportSuccess?: (result: unknown) => void;
  onExportError?: (error: string) => void;
}

export const useAdvancedExportModal = ({
  isOpen,
  items,
  onExportSuccess,
  onExportError,
}: UseAdvancedExportModalProps) => {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ExportTemplate | null>(null);
  const [schedules, setSchedules] = useState<ExportSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'export' | 'schedule' | 'templates'
  >('export');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    name: '',
    templateId: '',
    schedule: 'daily',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    cronExpression: '',
    recipients: [''],
    enabled: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadSchedules();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const templateList = await InventoryExportTemplateService.getTemplates();
      setTemplates(templateList);
      if (templateList.length > 0) {
        setSelectedTemplate(templateList[0]);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const scheduleList = await InventoryScheduledExportService.getSchedules();
      setSchedules(scheduleList);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const handleExport = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const result = await InventoryExportService.exportWithTemplate(
        items,
        selectedTemplate
      );
      onExportSuccess?.(result);
    } catch (error) {
      onExportError?.(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (
      !scheduleForm.name ||
      !scheduleForm.templateId ||
      scheduleForm.recipients.length === 0
    ) {
      onExportError?.('Please fill in all required fields');
      return;
    }

    try {
      const schedule = await InventoryScheduledExportService.createSchedule({
        name: scheduleForm.name,
        templateId: scheduleForm.templateId,
        schedule: scheduleForm.schedule,
        time: scheduleForm.time,
        dayOfWeek:
          scheduleForm.schedule === 'weekly'
            ? scheduleForm.dayOfWeek
            : undefined,
        dayOfMonth:
          scheduleForm.schedule === 'monthly'
            ? scheduleForm.dayOfMonth
            : undefined,
        cronExpression:
          scheduleForm.schedule === 'custom'
            ? scheduleForm.cronExpression
            : undefined,
        recipients: scheduleForm.recipients.filter((email) => email.trim()),
        enabled: scheduleForm.enabled,
      });

      setSchedules((prev) => [...prev, schedule]);
      setShowScheduleForm(false);
      setScheduleForm({
        name: '',
        templateId: '',
        schedule: 'daily',
        time: '09:00',
        dayOfWeek: 1,
        dayOfMonth: 1,
        cronExpression: '',
        recipients: [''],
        enabled: true,
      });
    } catch (error) {
      onExportError?.(
        error instanceof Error ? error.message : 'Failed to create schedule'
      );
    }
  };

  const handleToggleSchedule = async (scheduleId: string, enabled: boolean) => {
    try {
      await InventoryScheduledExportService.toggleSchedule(scheduleId, enabled);
      await loadSchedules();
    } catch (error) {
      onExportError?.(
        error instanceof Error ? error.message : 'Failed to toggle schedule'
      );
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await InventoryScheduledExportService.deleteSchedule(scheduleId);
      await loadSchedules();
    } catch (error) {
      onExportError?.(
        error instanceof Error ? error.message : 'Failed to delete schedule'
      );
    }
  };

  const handleTriggerExport = async (scheduleId: string) => {
    try {
      await InventoryScheduledExportService.triggerExport(scheduleId);
      onExportSuccess?.({ message: 'Scheduled export triggered successfully' });
    } catch (error) {
      onExportError?.(
        error instanceof Error ? error.message : 'Failed to trigger export'
      );
    }
  };

  return {
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
  };
};
