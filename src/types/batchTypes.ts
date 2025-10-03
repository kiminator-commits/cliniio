export interface SterilizationBatch {
  id: string;
  batchCode: string;
  createdAt: Date;
  createdBy: string;
  status: 'creating' | 'ready' | 'in_autoclave' | 'completed' | 'failed';
  tools: string[]; // Array of tool IDs
  packageInfo: {
    packageType: string;
    packageSize: string;
    notes?: string;
  };
  sterilizationInfo: {
    cycleId?: string;
    autoclaveId?: string;
    startTime?: Date;
    endTime?: Date;
    temperature?: number;
    pressure?: number;
  };
  auditTrail: BatchAuditEvent[];
}

export interface BatchAuditEvent {
  id: string;
  timestamp: Date;
  action:
    | 'created'
    | 'tool_added'
    | 'tool_removed'
    | 'ready_for_autoclave'
    | 'autoclave_started'
    | 'autoclave_completed'
    | 'bi_failure';
  operator: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

export interface PackagingSession {
  id: string;
  operator: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  scannedTools: string[]; // Array of tool IDs
  currentBatchId?: string;
  isBatchMode: boolean;
}

export interface BatchCodeGeneration {
  code: string;
  generatedAt: Date;
  operator: string;
  toolCount: number;
  isSingleTool: boolean;
}
