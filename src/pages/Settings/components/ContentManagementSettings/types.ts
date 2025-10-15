export interface ContentManagementTab {
  id: string;
  label: string;
  icon: React.ComponentType | string;
}

export interface ContentBuilderSettings {
  enableContentCreation: boolean;
  autoSave: boolean;
  draftRetention: number;
  templateLibrary: boolean;
  collaborativeEditing: boolean;
}

export interface PublishingSettings {
  autoPublish: boolean;
  publishSchedule: string;
  approvalWorkflow: boolean;
  versionControl: boolean;
  contentExpiry: boolean;
  expiryDays: number;
}

export interface WorkflowSettings {
  enableWorkflow: boolean;
  approvalSteps: number;
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  escalationRules: boolean;
  deadlineReminders: boolean;
}

export interface AISettings {
  enableAISuggestions: boolean;
  contentOptimization: boolean;
  seoOptimization: boolean;
  readabilityScore: boolean;
  plagiarismCheck: boolean;
  autoTagging: boolean;
}

export interface MediaSettings {
  maxFileSize: number;
  allowedFormats: string[];
  autoCompression: boolean;
  watermarkSettings: {
    enabled: boolean;
    position: string;
    opacity: number;
  };
  cdnEnabled: boolean;
  backupEnabled: boolean;
}
