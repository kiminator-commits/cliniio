// Authentication migration service to transition from old to new system
import { secureAuthService } from './secureAuthenticationService';

interface MigrationStatus {
  isComplete: boolean;
  stepsCompleted: string[];
  stepsRemaining: string[];
  errors: string[];
  warnings: string[];
}

interface MigrationStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  error?: string;
}

class AuthMigrationService {
  private migrationSteps: MigrationStep[] = [];
  private isRunning = false;
  private migrationStatus: MigrationStatus = {
    isComplete: false,
    stepsCompleted: [],
    stepsRemaining: [],
    errors: [],
    warnings: [],
  };

  constructor() {
    this.initializeMigrationSteps();
  }

  private initializeMigrationSteps(): void {
    this.migrationSteps = [
      {
        id: 'backup_tokens',
        name: 'Backup Existing Tokens',
        description: 'Save any existing authentication tokens for recovery',
        required: true,
        completed: false,
      },
      {
        id: 'clear_old_tokens',
        name: 'Clear Old Authentication Data',
        description: 'Remove old Supabase tokens and authentication data',
        required: true,
        completed: false,
      },
      {
        id: 'initialize_secure_auth',
        name: 'Initialize Secure Authentication',
        description: 'Initialize the new secure authentication service',
        required: true,
        completed: false,
      },
      {
        id: 'migrate_user_preferences',
        name: 'Migrate User Preferences',
        description: 'Transfer user preferences and settings to new system',
        required: false,
        completed: false,
      },
      {
        id: 'validate_migration',
        name: 'Validate Migration',
        description: 'Verify that the migration completed successfully',
        required: true,
        completed: false,
      },
    ];
  }

  async runMigration(): Promise<MigrationStatus> {
    if (this.isRunning) {
      throw new Error('Migration is already running');
    }

    this.isRunning = true;
    this.migrationStatus = {
      isComplete: false,
      stepsCompleted: [],
      stepsRemaining: [],
      errors: [],
      warnings: [],
    };

    try {
      console.log('[MIGRATION] Starting authentication system migration');

      for (const step of this.migrationSteps) {
        if (step.completed) continue;

        try {
          console.log(`[MIGRATION] Executing step: ${step.name}`);
          await this.executeStep(step);

          step.completed = true;
          this.migrationStatus.stepsCompleted.push(step.id);

          console.log(`[MIGRATION] Completed step: ${step.name}`);
        } catch (error) {
          step.error = error.message;
          this.migrationStatus.errors.push(`${step.name}: ${error.message}`);

          if (step.required) {
            console.error(
              `[MIGRATION] Required step failed: ${step.name}`,
              error
            );
            break;
          } else {
            console.warn(
              `[MIGRATION] Optional step failed: ${step.name}`,
              error
            );
            this.migrationStatus.warnings.push(
              `${step.name}: ${error.message}`
            );
          }
        }
      }

      // Check if migration is complete
      const requiredStepsCompleted = this.migrationSteps
        .filter((step) => step.required)
        .every((step) => step.completed);

      this.migrationStatus.isComplete = requiredStepsCompleted;
      this.migrationStatus.stepsRemaining = this.migrationSteps
        .filter((step) => !step.completed)
        .map((step) => step.id);

      if (this.migrationStatus.isComplete) {
        console.log(
          '[MIGRATION] Authentication migration completed successfully'
        );
      } else {
        console.error('[MIGRATION] Authentication migration failed');
      }

      return this.migrationStatus;
    } finally {
      this.isRunning = false;
    }
  }

  private async executeStep(step: MigrationStep): Promise<void> {
    switch (step.id) {
      case 'backup_tokens':
        await this.backupExistingTokens();
        break;
      case 'clear_old_tokens':
        await this.clearOldTokens();
        break;
      case 'initialize_secure_auth':
        await this.initializeSecureAuth();
        break;
      case 'migrate_user_preferences':
        await this.migrateUserPreferences();
        break;
      case 'validate_migration':
        await this.validateMigration();
        break;
      default:
        throw new Error(`Unknown migration step: ${step.id}`);
    }
  }

  private async backupExistingTokens(): Promise<void> {
    try {
      // Check for existing Supabase tokens
      const supabaseTokens = {
        accessToken: localStorage.getItem('sb-access-token'),
        refreshToken: localStorage.getItem('sb-refresh-token'),
        expiresAt: localStorage.getItem('sb-expires-at'),
        user: localStorage.getItem('sb-user'),
      };

      // Check for other authentication tokens
      const otherTokens = {
        authToken: localStorage.getItem('auth_token'),
        authExpiry: localStorage.getItem('auth_expiry'),
        userData: localStorage.getItem('user_data'),
      };

      // Create backup
      const backup = {
        timestamp: Date.now(),
        supabaseTokens,
        otherTokens,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Store backup in localStorage with expiration
      const backupKey = `auth_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));

      // Set expiration (7 days)
      const expirationKey = `${backupKey}_expires`;
      localStorage.setItem(
        expirationKey,
        (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
      );

      console.log('[MIGRATION] Existing tokens backed up successfully');
    } catch (error) {
      console.warn('[MIGRATION] Failed to backup existing tokens:', error);
      // Non-critical error, continue migration
    }
  }

  private async clearOldTokens(): Promise<void> {
    try {
      // Clear Supabase tokens
      const supabaseKeys = [
        'sb-access-token',
        'sb-refresh-token',
        'sb-expires-at',
        'sb-user',
        'supabase.auth.token',
        'supabase.auth.refresh_token',
      ];

      supabaseKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Clear other authentication tokens
      const authKeys = [
        'auth_token',
        'auth_expiry',
        'user_data',
        'login_token',
        'session_token',
      ];

      authKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Clear any Supabase client instances
      if (typeof window !== 'undefined') {
        // Remove any global Supabase references
        delete (window as Record<string, unknown>).supabase;
        delete (window as Record<string, unknown>).supabaseClient;
      }

      console.log('[MIGRATION] Old authentication tokens cleared');
    } catch (error) {
      throw new Error(`Failed to clear old tokens: ${error.message}`);
    }
  }

  private async initializeSecureAuth(): Promise<void> {
    try {
      // Initialize the secure authentication service
      await secureAuthService.getCurrentUser();

      console.log('[MIGRATION] Secure authentication service initialized');
    } catch (error) {
      throw new Error(`Failed to initialize secure auth: ${error.message}`);
    }
  }

  private async migrateUserPreferences(): Promise<void> {
    try {
      // Migrate user preferences from old system
      const oldPreferences = localStorage.getItem('user_preferences');
      if (oldPreferences) {
        const preferences = JSON.parse(oldPreferences);

        // Store in new format
        sessionStorage.setItem(
          'user_preferences',
          JSON.stringify({
            ...preferences,
            migratedAt: Date.now(),
            migrationVersion: '1.0',
          })
        );

        console.log('[MIGRATION] User preferences migrated');
      }
    } catch (error) {
      console.warn('[MIGRATION] Failed to migrate user preferences:', error);
      // Non-critical error, continue migration
    }
  }

  private async validateMigration(): Promise<void> {
    try {
      // Validate that the new authentication system is working
      const isAuthenticated = await secureAuthService.isAuthenticated();

      if (!isAuthenticated) {
        // Check if we have any stored tokens
        const hasTokens = secureAuthService.getAccessToken() !== null;

        if (hasTokens) {
          throw new Error(
            'Migration validation failed: tokens present but authentication failed'
          );
        }
      }

      // Validate that old tokens are cleared
      const oldTokensExist = [
        'sb-access-token',
        'sb-refresh-token',
        'auth_token',
      ].some((key) => localStorage.getItem(key) !== null);

      if (oldTokensExist) {
        throw new Error(
          'Migration validation failed: old tokens still present'
        );
      }

      console.log('[MIGRATION] Migration validation successful');
    } catch (error) {
      throw new Error(`Migration validation failed: ${error.message}`);
    }
  }

  getMigrationStatus(): MigrationStatus {
    return { ...this.migrationStatus };
  }

  getMigrationSteps(): MigrationStep[] {
    return [...this.migrationSteps];
  }

  isMigrationComplete(): boolean {
    return this.migrationStatus.isComplete;
  }

  isMigrationRunning(): boolean {
    return this.isRunning;
  }

  async rollbackMigration(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Cannot rollback while migration is running');
    }

    try {
      console.log('[MIGRATION] Starting migration rollback');

      // Find the most recent backup
      const backupKeys = Object.keys(localStorage)
        .filter((key) => key.startsWith('auth_backup_'))
        .sort()
        .reverse();

      if (backupKeys.length === 0) {
        throw new Error('No backup found for rollback');
      }

      const latestBackupKey = backupKeys[0];
      const backupData = localStorage.getItem(latestBackupKey);

      if (!backupData) {
        throw new Error('Backup data is corrupted');
      }

      const backup = JSON.parse(backupData);

      // Restore Supabase tokens
      if (backup.supabaseTokens) {
        Object.entries(backup.supabaseTokens).forEach(([key, value]) => {
          if (value) {
            localStorage.setItem(key, value as string);
          }
        });
      }

      // Restore other tokens
      if (backup.otherTokens) {
        Object.entries(backup.otherTokens).forEach(([key, value]) => {
          if (value) {
            localStorage.setItem(key, value as string);
          }
        });
      }

      // Clear new authentication data
      await secureAuthService.logout();

      // Reset migration status
      this.migrationSteps.forEach((step) => {
        step.completed = false;
        step.error = undefined;
      });

      this.migrationStatus = {
        isComplete: false,
        stepsCompleted: [],
        stepsRemaining: this.migrationSteps.map((step) => step.id),
        errors: [],
        warnings: [],
      };

      console.log('[MIGRATION] Migration rollback completed');
    } catch (error) {
      console.error('[MIGRATION] Rollback failed:', error);
      throw new Error(`Migration rollback failed: ${error.message}`);
    }
  }

  async cleanupBackups(): Promise<void> {
    try {
      const now = Date.now();
      const backupKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith('auth_backup_')
      );

      for (const key of backupKeys) {
        const expirationKey = `${key}_expires`;
        const expiration = localStorage.getItem(expirationKey);

        if (expiration && parseInt(expiration) < now) {
          localStorage.removeItem(key);
          localStorage.removeItem(expirationKey);
        }
      }

      console.log('[MIGRATION] Backup cleanup completed');
    } catch (error) {
      console.warn('[MIGRATION] Backup cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const authMigrationService = new AuthMigrationService();

// Export types and class for testing
export { AuthMigrationService, type MigrationStatus, type MigrationStep };
