export interface AutoclaveReceipt {
  id: string;
  batchId: string;
  batchCode: string;
  cycleNumber?: string;
  photoUrl: string;
  photoFilename: string;
  photoSize: number;
  temperatureEvidence?: string;
  uploadedBy: string;
  uploadedAt: Date;
  retentionUntil: Date;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoclaveReceiptUpload {
  batchCode: string;
  cycleNumber?: string;
  photoFile: File;
  temperatureEvidence?: string;
}

export interface FacilitySettings {
  id: string;
  facilityId?: string;
  autoclaveHasPrinter: boolean;
  receiptRetentionMonths: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoclaveReceiptSettings {
  autoclaveHasPrinter: boolean;
  receiptRetentionMonths: number;
}
