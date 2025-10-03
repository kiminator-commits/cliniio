/**
 * Comprehensive status validation utilities
 * Prevents creation of similar statuses that could mess up data collection
 */

export interface StatusValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SimilarStatus {
  existingStatus: string;
  similarityScore: number;
  reason: string;
}

// Common status patterns that should be avoided
const SIMILAR_STATUS_PATTERNS = {
  // Clean variations
  clean: [
    'clean',
    'cleaned',
    'cleaning',
    'available',
    'ready',
    'complete',
    'finished',
  ],

  // Dirty variations
  dirty: [
    'dirty',
    'soiled',
    'contaminated',
    'unclean',
    'needs_cleaning',
    'requires_cleaning',
  ],

  // Progress variations
  in_progress: [
    'in_progress',
    'in progress',
    'cleaning',
    'being_cleaned',
    'active',
    'ongoing',
  ],

  // Maintenance variations
  maintenance: [
    'maintenance',
    'repair',
    'servicing',
    'out_of_service',
    'broken',
    'damaged',
  ],

  // Safety variations
  biohazard: [
    'biohazard',
    'contamination',
    'hazard',
    'danger',
    'unsafe',
    'quarantine',
  ],

  // Inventory variations
  low_inventory: [
    'low_inventory',
    'low_stock',
    'supplies_low',
    'shortage',
    'depleted',
  ],

  // Security variations
  theft: ['theft', 'stolen', 'missing', 'security', 'breach', 'unauthorized'],

  // Patient variations
  patient_occupied: [
    'patient_occupied',
    'occupied',
    'in_use',
    'patient',
    'occupied_by_patient',
  ],

  // Supervisor variations
  supervisor: [
    'supervisor',
    'review',
    'approval',
    'inspection',
    'audit',
    'check',
  ],
};

// Minimum similarity threshold (0-1 scale)
const SIMILARITY_THRESHOLD = 0.7;

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Check if status name is too similar to existing statuses
 */
export function checkSimilarStatuses(
  newStatusName: string,
  existingStatuses: string[]
): SimilarStatus[] {
  const normalizedNewStatus = newStatusName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const similarStatuses: SimilarStatus[] = [];

  // Check against existing statuses
  for (const existingStatus of existingStatuses) {
    const normalizedExisting = existingStatus
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const similarity = calculateSimilarity(
      normalizedNewStatus,
      normalizedExisting
    );

    if (similarity >= SIMILARITY_THRESHOLD) {
      similarStatuses.push({
        existingStatus,
        similarityScore: similarity,
        reason: `Similar to existing status "${existingStatus}" (${Math.round(similarity * 100)}% match)`,
      });
    }
  }

  // Check against known patterns
  for (const [pattern, variations] of Object.entries(SIMILAR_STATUS_PATTERNS)) {
    for (const variation of variations) {
      const similarity = calculateSimilarity(normalizedNewStatus, variation);
      if (similarity >= SIMILARITY_THRESHOLD) {
        similarStatuses.push({
          existingStatus: pattern,
          similarityScore: similarity,
          reason: `Similar to "${pattern}" pattern (${Math.round(similarity * 100)}% match)`,
        });
      }
    }
  }

  return similarStatuses.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Validate status name for data collection integrity
 */
export function validateStatusName(
  statusName: string,
  existingStatuses: string[]
): StatusValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Basic validation
  if (!statusName || statusName.trim().length === 0) {
    errors.push('Status name is required');
    return { isValid: false, errors, warnings, suggestions };
  }

  if (statusName.length < 2) {
    errors.push('Status name must be at least 2 characters long');
  }

  if (statusName.length > 50) {
    errors.push('Status name must be less than 50 characters');
  }

  // Check for exact duplicates
  if (
    existingStatuses.some(
      (status) => status.toLowerCase() === statusName.toLowerCase()
    )
  ) {
    errors.push(`Status "${statusName}" already exists`);
  }

  // Check for similar statuses
  const similarStatuses = checkSimilarStatuses(statusName, existingStatuses);

  if (similarStatuses.length > 0) {
    const highestSimilarity = similarStatuses[0].similarityScore;

    if (highestSimilarity >= 0.9) {
      errors.push(
        `Status is too similar to existing status: ${similarStatuses[0].existingStatus}`
      );
    } else if (highestSimilarity >= 0.8) {
      warnings.push(
        `Status is very similar to: ${similarStatuses[0].existingStatus}`
      );
      suggestions.push(
        'Consider using the existing status or choose a more distinct name'
      );
    } else if (highestSimilarity >= 0.7) {
      warnings.push(
        `Status is similar to: ${similarStatuses[0].existingStatus}`
      );
      suggestions.push(
        'Consider if this status is truly different from existing ones'
      );
    }

    // Add all similar statuses to suggestions
    similarStatuses.slice(0, 3).forEach((similar) => {
      suggestions.push(`Similar: ${similar.reason}`);
    });
  }

  // Check for problematic patterns
  const normalizedName = statusName.toLowerCase();

  if (normalizedName.includes('clean') && normalizedName.includes('dirty')) {
    errors.push('Status cannot contain both "clean" and "dirty"');
  }

  if (normalizedName.includes('in') && normalizedName.includes('progress')) {
    warnings.push('Consider using "In Progress" instead of separate words');
  }

  // Suggest better alternatives
  if (
    normalizedName.includes('cleaning') &&
    !normalizedName.includes('in_progress')
  ) {
    suggestions.push('Consider using "In Progress" for ongoing cleaning');
  }

  if (
    normalizedName.includes('available') &&
    !normalizedName.includes('clean')
  ) {
    suggestions.push('Consider using "Clean" for available rooms');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validate status description
 */
export function validateStatusDescription(
  description: string
): StatusValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!description || description.trim().length === 0) {
    errors.push('Status description is required');
    return { isValid: false, errors, warnings, suggestions };
  }

  if (description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (description.length > 200) {
    errors.push('Description must be less than 200 characters');
  }

  // Check for vague descriptions
  const vagueTerms = ['stuff', 'things', 'etc', 'and so on', 'whatever'];
  const normalizedDesc = description.toLowerCase();

  for (const term of vagueTerms) {
    if (normalizedDesc.includes(term)) {
      warnings.push('Description contains vague language');
      suggestions.push('Be more specific about what this status means');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Comprehensive status validation
 */
export function validateStatus(
  statusName: string,
  description: string,
  existingStatuses: string[]
): StatusValidationResult {
  const nameValidation = validateStatusName(statusName, existingStatuses);
  const descriptionValidation = validateStatusDescription(description);

  return {
    isValid: nameValidation.isValid && descriptionValidation.isValid,
    errors: [...nameValidation.errors, ...descriptionValidation.errors],
    warnings: [...nameValidation.warnings, ...descriptionValidation.warnings],
    suggestions: [
      ...nameValidation.suggestions,
      ...descriptionValidation.suggestions,
    ],
  };
}

/**
 * Get status name suggestions based on description
 */
export function getStatusNameSuggestions(description: string): string[] {
  const suggestions: string[] = [];
  const normalizedDesc = description.toLowerCase();

  // Extract key words from description
  normalizedDesc.split(/\s+/).filter((word) => word.length > 3);

  // Common patterns
  if (normalizedDesc.includes('clean') || normalizedDesc.includes('ready')) {
    suggestions.push('Clean', 'Available', 'Ready');
  }

  if (
    normalizedDesc.includes('dirty') ||
    normalizedDesc.includes('needs cleaning')
  ) {
    suggestions.push('Dirty', 'Needs Cleaning', 'Requires Cleaning');
  }

  if (
    normalizedDesc.includes('progress') ||
    normalizedDesc.includes('ongoing')
  ) {
    suggestions.push('In Progress', 'Cleaning', 'Active');
  }

  if (
    normalizedDesc.includes('maintenance') ||
    normalizedDesc.includes('repair')
  ) {
    suggestions.push('Maintenance', 'Out of Service', 'Repair');
  }

  if (
    normalizedDesc.includes('hazard') ||
    normalizedDesc.includes('contamination')
  ) {
    suggestions.push('Biohazard', 'Contamination', 'Hazard');
  }

  if (
    normalizedDesc.includes('inventory') ||
    normalizedDesc.includes('supplies')
  ) {
    suggestions.push('Low Inventory', 'Supplies Low', 'Stock Issue');
  }

  if (normalizedDesc.includes('security') || normalizedDesc.includes('theft')) {
    suggestions.push('Security Issue', 'Theft', 'Unauthorized');
  }

  if (
    normalizedDesc.includes('patient') ||
    normalizedDesc.includes('occupied')
  ) {
    suggestions.push('Patient Occupied', 'Occupied', 'In Use');
  }

  if (
    normalizedDesc.includes('supervisor') ||
    normalizedDesc.includes('review')
  ) {
    suggestions.push(
      'Supervisor Review',
      'Pending Review',
      'Approval Required'
    );
  }

  return [...new Set(suggestions)]; // Remove duplicates
}
