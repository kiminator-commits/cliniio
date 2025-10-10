import { BITestService } from './bi/BITestService';
import { BIFailureIncidentService } from './bi/failure/BIFailureIncidentService';
import { supabase } from '../lib/supabaseClient';
import { FacilityService } from './facilityService';

/**
 * State persistence configuration
 */
export interface StatePersistenceConfig {
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
  maxBackupCount: number;
  syncOnConnect: boolean;
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

/**
 * State backup interface
 */
export interface StateBackup {
  id: string;
  timestamp: Date;
  data: unknown;
  version: string;
  checksum: string;
}

/**
 * Sync status interface
 */
export interface SyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
  failedChanges: number;
  syncErrors: string[];
}

/**
 * BI Workflow State interface
 */
export interface BIWorkflowState {
  biTestResults?: unknown[];
  biFailureHistory?: unknown[];
  enforceBI?: boolean;
  enforceCI?: boolean;
  allowOverrides?: boolean;
}

/**
 * BI Workflow State Service
 * Handles state persistence, synchronization, and recovery
 */
export class BIWorkflowStateService {
  private static readonly STORAGE_KEY = 'biWorkflowState';
  private static readonly BACKUP_KEY = 'biWorkflowBackups';
  private static readonly VERSION = '1.0.0';
  private static readonly DEFAULT_CONFIG: StatePersistenceConfig = {
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    maxBackupCount: 10,
    syncOnConnect: true,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  private config: StatePersistenceConfig;
  private syncStatus: SyncStatus;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<StatePersistenceConfig> = {}) {
    this.config = { ...BIWorkflowStateService.DEFAULT_CONFIG, ...config };
    this.syncStatus = {
      lastSyncTime: null,
      isSyncing: false,
      pendingChanges: 0,
      failedChanges: 0,
      syncErrors: [],
    };
  }

  /**
   * Save state to localStorage with backup
   */
  static saveState(state: unknown): void {
    try {
      const stateData = {
        data: state,
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        checksum: this.generateChecksum(state),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateData));
      this.createBackup(stateData);
    } catch (error) {
      console.error('Failed to save state:', error);
      throw new Error(
        `State save failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Load state from localStorage with recovery
   */
  static loadState(): unknown {
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (!savedState) {
        return null;
      }

      const parsedState = JSON.parse(savedState);

      // Validate state integrity
      if (!this.validateState(parsedState)) {
        console.warn('State validation failed, attempting recovery...');
        return this.recoverState();
      }

      return parsedState.data;
    } catch (error) {
      console.error('Failed to load state:', error);
      return this.recoverState();
    }
  }

  /**
   * Create a backup of the current state
   */
  private static createBackup(stateData: unknown): void {
    try {
      const backups = this.getBackups();
      const newBackup: StateBackup = {
        id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        data: stateData,
        version: this.VERSION,
        checksum: this.generateChecksum(stateData),
      };

      backups.unshift(newBackup);

      // Keep only the most recent backups
      const maxBackups = this.DEFAULT_CONFIG.maxBackupCount;
      if (backups.length > maxBackups) {
        backups.splice(maxBackups);
      }

      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  /**
   * Get all available backups
   */
  private static getBackups(): StateBackup[] {
    try {
      const backupsData = localStorage.getItem(this.BACKUP_KEY);
      return backupsData ? JSON.parse(backupsData) : [];
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }

  /**
   * Recover state from the most recent valid backup
   */
  private static recoverState(): unknown {
    try {
      const backups = this.getBackups();

      for (const backup of backups) {
        if (this.validateState(backup.data)) {
          console.log('State recovered from backup:', backup.timestamp);
          return (backup.data as { data: unknown })?.data;
        }
      }

      console.warn('No valid backup found, returning null');
      return null;
    } catch (error) {
      console.error('Failed to recover state:', error);
      return null;
    }
  }

  /**
   * Validate state integrity
   */
  private static validateState(state: unknown): boolean {
    try {
      if (!state || typeof state !== 'object') {
        return false;
      }

      const stateObj = state as {
        version: string;
        timestamp: string;
        checksum: string;
      };
      if (!stateObj.version || !stateObj.timestamp || !stateObj.checksum) {
        return false;
      }

      const expectedChecksum = this.generateChecksum(state);
      return stateObj.checksum === expectedChecksum;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * Generate checksum for state validation
   */
  private static generateChecksum(data: unknown): string {
    const dataString = JSON.stringify(data);
    let hash = 0;

    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(16);
  }

  /**
   * Clear all stored state and backups
   */
  static clearAllState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
    } catch (err) {
      console.error(err);
      console.error('Failed to clear state');
    }
  }

  /**
   * Start auto-save functionality
   */
  startAutoSave(saveFunction: () => void): void {
    if (!this.config.autoSave) {
      return;
    }

    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      try {
        saveFunction();
      } catch (err) {
        console.error(err);
        console.error('Auto-save failed');
      }
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop auto-save functionality
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Sync state with Supabase
   */
  async syncWithSupabase(state: BIWorkflowState): Promise<void> {
    if (this.syncStatus.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.syncErrors = [];

    try {
      // Sync BI test results
      if (state.biTestResults) {
        await this.syncBITestResults(state.biTestResults);
      }

      // Sync BI failure incidents
      if (state.biFailureHistory) {
        await this.syncBIFailureIncidents(state.biFailureHistory);
      }

      // Sync compliance settings
      await this.syncComplianceSettings({
        enforceBI: state.enforceBI,
        enforceCI: state.enforceCI,
        allowOverrides: state.allowOverrides,
      });

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.pendingChanges = 0;
      this.syncStatus.failedChanges = 0;
    } catch (error) {
      this.syncStatus.syncErrors.push(
        error instanceof Error ? error.message : 'Unknown sync error'
      );
      this.syncStatus.failedChanges++;
      throw error;
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  /**
   * Sync BI test results with Supabase
   */
  private async syncBITestResults(results: unknown[]): Promise<void> {
    for (const result of results) {
      try {
        const testResult = result as {
          facility_id: string;
          operator_id?: string;
          cycle_id?: string;
          result: 'pass' | 'fail' | 'skip';
          bi_lot_number?: string;
          bi_expiry_date?: string;
          incubation_time_minutes?: number;
          incubation_temperature_celsius?: number;
          test_conditions?: Record<string, unknown>;
          failure_reason?: string;
          skip_reason?: string;
          compliance_notes?: string;
        };

        // Create or update BI test result in Supabase
        await BITestService.createBITestResult(testResult);

        console.log('Successfully synced BI test result:', testResult);
      } catch (error) {
        console.error('Failed to sync BI test result:', error);
        throw error;
      }
    }
  }

  /**
   * Sync BI failure incidents with Supabase
   */
  private async syncBIFailureIncidents(incidents: unknown[]): Promise<void> {
    for (const incident of incidents) {
      try {
        const failureIncident = incident as {
          facility_id: string;
          bi_test_result_id?: string;
          detected_by_operator_id?: string;
          affected_tools_count: number;
          affected_batch_ids: string[];
          failure_reason?: string;
          severity_level?: 'low' | 'medium' | 'high' | 'critical';
        };

        // Create BI failure incident in Supabase
        await BIFailureIncidentService.createIncident(failureIncident);

        console.log(
          'Successfully synced BI failure incident:',
          failureIncident
        );
      } catch (error) {
        console.error('Failed to sync BI failure incident:', error);
        throw error;
      }
    }
  }

  /**
   * Sync compliance settings with Supabase
   */
  private async syncComplianceSettings(settings: unknown): Promise<void> {
    try {
      const complianceSettings = settings as {
        facility_id: string;
        enforce_bi: boolean;
        enforce_ci: boolean;
        allow_overrides: boolean;
        ci_required: boolean;
        bi_required: boolean;
        autoclave_receipt_settings?: Record<string, unknown>;
        cycle_settings?: Record<string, unknown>;
        default_cycle_type?: string;
        allow_custom_cycles?: boolean;
      };

      const facilityId = await FacilityService.getCurrentFacilityId();
      if (!facilityId) {
        throw new Error(
          'No facility ID available for compliance settings sync'
        );
      }

      // Upsert compliance settings in Supabase
      const { error } = await supabase
        .from('facility_compliance_settings')
        .upsert(
          {
            facility_id: facilityId,
            enforce_bi: complianceSettings.enforce_bi,
            enforce_ci: complianceSettings.enforce_ci,
            allow_overrides: complianceSettings.allow_overrides,
            ci_required: complianceSettings.ci_required,
            bi_required: complianceSettings.bi_required,
            autoclave_receipt_settings:
              complianceSettings.autoclave_receipt_settings || {},
            cycle_settings: complianceSettings.cycle_settings || {},
            default_cycle_type:
              complianceSettings.default_cycle_type || 'pouches',
            allow_custom_cycles: complianceSettings.allow_custom_cycles || true,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'facility_id',
          }
        );

      if (error) {
        throw error;
      }

      console.log(
        'Successfully synced compliance settings:',
        complianceSettings
      );
    } catch (error) {
      console.error('Failed to sync compliance settings:', error);
      throw error;
    }
  }

  /**
   * Load state from Supabase
   */
  async loadFromSupabase(): Promise<unknown> {
    try {
      const facilityId = await FacilityService.getCurrentFacilityId();
      if (!facilityId) {
        throw new Error('No facility ID available for loading from Supabase');
      }

      // Load BI failure incidents - using a mock for now since getIncidentHistory doesn't exist
      const incidents: Record<string, unknown>[] = []; // Mock empty array since method doesn't exist

      // Load compliance settings from Supabase
      const { data: complianceSettings, error: settingsError } = await supabase
        .from('facility_compliance_settings')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error loading compliance settings:', settingsError);
      }

      // Load activity log from Supabase
      const { data: activityLog, error: activityError } = await supabase
        .from('bi_activity_log')
        .select('*')
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (activityError) {
        console.error('Error loading activity log:', activityError);
      }

      // Load recent BI test results
      const { data: biTestResults, error: testError } = await supabase
        .from('bi_test_results')
        .select('*')
        .eq('facility_id', facilityId)
        .order('test_date', { ascending: false })
        .limit(50);

      if (testError) {
        console.error('Error loading BI test results:', testError);
      }

      return {
        biFailureHistory: incidents,
        complianceSettings: complianceSettings || {
          enforce_bi: true,
          enforce_ci: true,
          allow_overrides: false,
          ci_required: true,
          bi_required: true,
        },
        activityLog: activityLog || [],
        biTestResults: biTestResults || [],
      };
    } catch (error) {
      console.error('Failed to load from Supabase:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Reset sync status
   */
  resetSyncStatus(): void {
    this.syncStatus = {
      lastSyncTime: null,
      isSyncing: false,
      pendingChanges: 0,
      failedChanges: 0,
      syncErrors: [],
    };
  }

  /**
   * Check if state needs synchronization
   */
  needsSync(lastLocalChange: Date): boolean {
    if (!this.syncStatus.lastSyncTime) {
      return true;
    }

    return lastLocalChange > this.syncStatus.lastSyncTime;
  }

  /**
   * Get state statistics
   */
  static getStateStats(): {
    hasState: boolean;
    stateSize: number;
    backupCount: number;
    lastBackup: Date | null;
  } {
    try {
      const stateData = localStorage.getItem(this.STORAGE_KEY);
      const backups = this.getBackups();

      return {
        hasState: !!stateData,
        stateSize: stateData ? stateData.length : 0,
        backupCount: backups.length,
        lastBackup: backups.length > 0 ? new Date(backups[0].timestamp) : null,
      };
    } catch (error) {
      console.error('Failed to get state stats:', error);
      return {
        hasState: false,
        stateSize: 0,
        backupCount: 0,
        lastBackup: null,
      };
    }
  }

  /**
   * Export state for backup
   */
  static exportState(): string {
    try {
      const stateData = localStorage.getItem(this.STORAGE_KEY);
      const backups = this.getBackups();

      const exportData = {
        state: stateData ? JSON.parse(stateData) : null,
        backups,
        exportDate: new Date().toISOString(),
        version: this.VERSION,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export state:', error);
      throw error;
    }
  }

  /**
   * Import state from backup
   */
  static importState(exportData: string): void {
    try {
      const parsedData = JSON.parse(exportData);

      if (parsedData.state) {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(parsedData.state)
        );
      }

      if (parsedData.backups && Array.isArray(parsedData.backups)) {
        localStorage.setItem(
          this.BACKUP_KEY,
          JSON.stringify(parsedData.backups)
        );
      }

      console.log('State imported successfully');
    } catch (error) {
      console.error('Failed to import state:', error);
      throw error;
    }
  }
}
