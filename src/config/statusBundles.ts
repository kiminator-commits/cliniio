/**
 * Pre-configured status bundles by healthcare specialty
 * Users can select a bundle to quickly populate relevant custom statuses
 */

import { StatusType } from '../store/statusTypesStore';

export interface StatusBundle {
  id: string;
  name: string;
  description: string;
  category: string;
  statuses: Omit<StatusType, 'id' | 'isDefault' | 'isCore' | 'isPublished'>[];
}

// Dental Practice Bundle
export const DENTAL_BUNDLE: StatusBundle = {
  id: 'dental',
  name: 'Dental Practice',
  description: 'Statuses optimized for dental offices and clinics',
  category: 'Specialty Care',
  statuses: [
    {
      name: 'Pre-Procedure Ready',
      color: '#16a34a',
      icon: 'check-circle',
      description:
        'Dental chair prepared, instruments sterilized, ready for patient',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
    {
      name: 'Post-Procedure Cleaning',
      color: '#dc2626',
      icon: 'broom',
      description: 'Biohazard cleanup required after dental procedure',
      requiresVerification: true,
      autoTransition: false,
      alertLevel: 'high',
    },
    {
      name: 'Sterilization Cycle',
      color: '#ca8a04',
      icon: 'progress-clock',
      description: 'Instruments currently in autoclave sterilization cycle',
      requiresVerification: false,
      autoTransition: true,
      transitionTo: 'Pre-Procedure Ready',
      alertLevel: 'medium',
    },
    {
      name: 'Patient in Chair',
      color: '#3b82f6',
      icon: 'account',
      description: 'Patient currently in dental chair, room occupied',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
    {
      name: 'X-Ray Room Ready',
      color: '#8b5cf6',
      icon: 'radiology-box',
      description: 'X-ray room prepared and ready for imaging',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
    {
      name: 'Equipment Maintenance',
      color: '#ea580c',
      icon: 'wrench',
      description: 'Dental equipment under maintenance or repair',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'medium',
    },
  ],
};

// Primary Care Bundle
export const PRIMARY_CARE_BUNDLE: StatusBundle = {
  id: 'primary_care',
  name: 'Primary Care',
  description: 'Statuses for general practice and family medicine',
  category: 'General Practice',
  statuses: [
    {
      name: 'Patient Exam Room',
      color: '#3b82f6',
      icon: 'account',
      description: 'Patient currently in exam room for consultation',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
    {
      name: 'Waiting for Labs',
      color: '#ca8a04',
      icon: 'progress-clock',
      description: 'Room waiting for lab results or test completion',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
    {
      name: 'Vaccination Ready',
      color: '#16a34a',
      icon: 'needle',
      description: 'Vaccination station prepared and ready',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
    {
      name: 'Chronic Care Visit',
      color: '#8b5cf6',
      icon: 'account-clock',
      description: 'Extended visit for chronic condition management',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'medium',
    },
    {
      name: 'Wellness Check',
      color: '#059669',
      icon: 'heart-pulse',
      description: 'Routine physical examination in progress',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
    {
      name: 'Follow-up Visit',
      color: '#3b82f6',
      icon: 'calendar-check',
      description: 'Follow-up appointment for previous condition',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
  ],
};

// Private Surgery Bundle
export const PRIVATE_SURGERY_BUNDLE: StatusBundle = {
  id: 'private_surgery',
  name: 'Private Surgery',
  description: 'Statuses for surgical centers and operating rooms',
  category: 'Surgical',
  statuses: [
    {
      name: 'Pre-Op Ready',
      color: '#16a34a',
      icon: 'check-circle',
      description: 'Pre-operative room prepared for patient',
      requiresVerification: true,
      autoTransition: false,
      alertLevel: 'medium',
    },
    {
      name: 'Surgery in Progress',
      color: '#dc2626',
      icon: 'scissors-cutting',
      description: 'Active surgery currently in progress',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'critical',
    },
    {
      name: 'Post-Op Recovery',
      color: '#3b82f6',
      icon: 'bed',
      description: 'Post-operative recovery room occupied',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'high',
    },
    {
      name: 'Sterile Instruments',
      color: '#8b5cf6',
      icon: 'package-variant',
      description: 'Surgical instruments sterilized and ready',
      requiresVerification: true,
      autoTransition: false,
      alertLevel: 'medium',
    },
    {
      name: 'Anesthesia Ready',
      color: '#ca8a04',
      icon: 'gas-cylinder',
      description: 'Anesthesia equipment prepared and ready',
      requiresVerification: true,
      autoTransition: false,
      alertLevel: 'high',
    },
    {
      name: 'Surgical Suite Clean',
      color: '#16a34a',
      icon: 'broom',
      description: 'Surgical suite cleaned and sanitized post-procedure',
      requiresVerification: true,
      autoTransition: false,
      alertLevel: 'medium',
    },
  ],
};

// Emergency Room Bundle
export const EMERGENCY_ROOM_BUNDLE: StatusBundle = {
  id: 'emergency_room',
  name: 'Emergency Room',
  description: 'Statuses for emergency departments and urgent care',
  category: 'Emergency',
  statuses: [
    {
      name: 'Trauma Bay Ready',
      color: '#16a34a',
      icon: 'ambulance',
      description: 'Trauma bay prepared for emergency patient',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'critical',
    },
    {
      name: 'Code Blue',
      color: '#dc2626',
      icon: 'alert-circle',
      description: 'Cardiac arrest or medical emergency in progress',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'critical',
    },
    {
      name: 'Isolation Room',
      color: '#ea580c',
      icon: 'shield-lock',
      description: 'Isolation room for infectious disease patients',
      requiresVerification: true,
      autoTransition: false,
      alertLevel: 'high',
    },
    {
      name: 'Waiting for Specialist',
      color: '#ca8a04',
      icon: 'account-clock',
      description: 'Patient waiting for specialist consultation',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'medium',
    },
    {
      name: 'Discharge Pending',
      color: '#8b5cf6',
      icon: 'exit-to-app',
      description: 'Patient ready for discharge, paperwork pending',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
  ],
};

// Laboratory Bundle
export const LABORATORY_BUNDLE: StatusBundle = {
  id: 'laboratory',
  name: 'Laboratory',
  description: 'Statuses for medical laboratories and testing facilities',
  category: 'Diagnostic',
  statuses: [
    {
      name: 'Sample Processing',
      color: '#ca8a04',
      icon: 'test-tube',
      description: 'Laboratory samples currently being processed',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'medium',
    },
    {
      name: 'Equipment Calibration',
      color: '#ea580c',
      icon: 'wrench',
      description: 'Laboratory equipment under calibration',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'medium',
    },
    {
      name: 'Quality Control',
      color: '#8b5cf6',
      icon: 'clipboard-check',
      description: 'Quality control testing in progress',
      requiresVerification: true,
      autoTransition: false,
      alertLevel: 'high',
    },
    {
      name: 'Results Ready',
      color: '#16a34a',
      icon: 'file-document',
      description: 'Test results completed and ready for review',
      requiresVerification: false,
      autoTransition: false,
      alertLevel: 'low',
    },
    {
      name: 'Hazardous Materials',
      color: '#dc2626',
      icon: 'biohazard',
      description: 'Hazardous materials handling in progress',
      requiresVerification: true,
      autoTransition: false,
      alertLevel: 'critical',
    },
  ],
};

// All available bundles
export const STATUS_BUNDLES: StatusBundle[] = [
  DENTAL_BUNDLE,
  PRIMARY_CARE_BUNDLE,
  PRIVATE_SURGERY_BUNDLE,
  EMERGENCY_ROOM_BUNDLE,
  LABORATORY_BUNDLE,
];

/**
 * Get bundle by ID
 */
export function getBundleById(bundleId: string): StatusBundle | undefined {
  return STATUS_BUNDLES.find((bundle) => bundle.id === bundleId);
}

/**
 * Get bundles by category
 */
export function getBundlesByCategory(category: string): StatusBundle[] {
  return STATUS_BUNDLES.filter((bundle) => bundle.category === category);
}

/**
 * Get all categories
 */
export function getBundleCategories(): string[] {
  const categories = new Set(STATUS_BUNDLES.map((bundle) => bundle.category));
  return Array.from(categories).sort();
}

/**
 * Convert bundle statuses to full StatusType objects
 */
export function convertBundleToStatusTypes(bundle: StatusBundle): StatusType[] {
  return bundle.statuses.map((status) => ({
    ...status,
    id: status.name.toLowerCase().replace(/\s+/g, '_'),
    isDefault: false,
    isCore: false,
    isPublished: false, // Start as unpublished
  }));
}

/**
 * Check for duplicate statuses between bundle and existing statuses
 */
export function findDuplicateStatuses(
  bundle: StatusBundle,
  existingStatuses: StatusType[]
): { bundleStatus: string; existingStatus: string; similarity: number }[] {
  const duplicates: {
    bundleStatus: string;
    existingStatus: string;
    similarity: number;
  }[] = [];

  for (const bundleStatus of bundle.statuses) {
    for (const existingStatus of existingStatuses) {
      // Check exact name match
      if (
        bundleStatus.name.toLowerCase() === existingStatus.name.toLowerCase()
      ) {
        duplicates.push({
          bundleStatus: bundleStatus.name,
          existingStatus: existingStatus.name,
          similarity: 1.0,
        });
        continue;
      }

      // Check similarity (simplified)
      const bundleWords = bundleStatus.name.toLowerCase().split(/\s+/);
      const existingWords = existingStatus.name.toLowerCase().split(/\s+/);
      const commonWords = bundleWords.filter((word) =>
        existingWords.includes(word)
      );

      if (commonWords.length > 0) {
        const similarity =
          commonWords.length /
          Math.max(bundleWords.length, existingWords.length);
        if (similarity >= 0.5) {
          duplicates.push({
            bundleStatus: bundleStatus.name,
            existingStatus: existingStatus.name,
            similarity,
          });
        }
      }
    }
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity);
}
