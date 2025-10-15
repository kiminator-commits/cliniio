export interface AuditFlag {
  id: string;
  facility_id: string;
  related_table: string;
  related_id: string | null;
  severity: 'low' | 'medium' | 'high';
  description: string;
  resolved: boolean;
  created_at: string;
}

export interface ActivityRecord {
  id: string;
  module: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
}

export interface AiSummary {
  id: string;
  summary: string;
  created_at: string;
}
