// Gradual Migration Configuration
// This file helps manage the gradual migration to strict TypeScript

export const MIGRATION_CONFIG = {
  // Files that are currently being migrated (allow more lenient checking)
  MIGRATING_FILES: [
    'src/utils/Inventory/',
    'src/services/inventory/',
    'src/pages/Inventory/',
    'src/components/Sterilization/',
    'src/services/ai/',
    'src/pages/KnowledgeHub/',
    'src/services/bi/',
  ],

  // Files that should maintain strict checking
  STRICT_FILES: [
    'src/types/',
    'src/utils/typeValidation.ts',
    'src/utils/legacyTypeHelpers.ts',
    'src/types/consolidated.ts',
  ],

  // Common error patterns to fix first
  PRIORITY_ERRORS: [
    'TS2339', // Property does not exist
    'TS2322', // Type assignment issues
    'TS2345', // Argument type mismatches
    'TS2740', // Missing properties in type
  ],

  // Error patterns to suppress temporarily during migration
  SUPPRESSED_ERRORS: [
    'TS7030', // Not all code paths return a value (fix after property access)
    'TS2769', // No overload matches (fix after argument types)
  ],
};

// Helper function to check if a file should use strict checking
export function shouldUseStrictChecking(filePath: string): boolean {
  return MIGRATION_CONFIG.STRICT_FILES.some((strictPath) =>
    filePath.includes(strictPath)
  );
}

// Helper function to check if a file is being migrated
export function isMigratingFile(filePath: string): boolean {
  return MIGRATION_CONFIG.MIGRATING_FILES.some((migratingPath) =>
    filePath.includes(migratingPath)
  );
}
