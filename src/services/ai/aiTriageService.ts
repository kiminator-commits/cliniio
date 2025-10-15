import { supabase } from '@/lib/supabaseClient';

export interface LocationAssignmentSummary {
  batchId: string;
  toolsCount: number;
  assignedLocation: string;
  technicianId?: string;
}

export type LocationValidationStatus =
  | 'valid'
  | 'unassigned'
  | 'invalid_location';

interface LocationValidationResult {
  status: LocationValidationStatus;
  confidence: number;
  reasoning: string;
}

export function shouldValidateLocation(
  summary: LocationAssignmentSummary
): boolean {
  const { assignedLocation, toolsCount } = summary;
  return (
    !assignedLocation || assignedLocation.trim() === '' || toolsCount === 0
  );
}

export async function validateLocationAssignment(
  summary: LocationAssignmentSummary
): Promise<LocationValidationResult> {
  const { assignedLocation, toolsCount } = summary;

  // 1️⃣ Check if location is assigned
  if (!assignedLocation || assignedLocation.trim() === '') {
    return {
      status: 'unassigned',
      confidence: 1,
      reasoning: 'No location assigned to batch',
    };
  }

  // 2️⃣ Check if tools exist in batch
  if (toolsCount === 0) {
    return {
      status: 'unassigned',
      confidence: 1,
      reasoning: 'No tools in batch to assign location',
    };
  }

  // 3️⃣ Validate location exists in facility
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const facilityId = user?.user_metadata?.facility_id;

    if (!facilityId) {
      return {
        status: 'invalid_location',
        confidence: 0.8,
        reasoning: 'Cannot validate location without facility context',
      };
    }

    // Check if location exists in facility settings or rooms
    const { data: locationData, error } = await supabase
      .from('rooms')
      .select('id, name')
      .eq('facility_id', facilityId)
      .ilike('name', `%${assignedLocation}%`)
      .limit(1);

    if (error || !locationData || locationData.length === 0) {
      return {
        status: 'invalid_location',
        confidence: 0.9,
        reasoning: `Location "${assignedLocation}" not found in facility`,
      };
    }

    return {
      status: 'valid',
      confidence: 1,
      reasoning: `Location "${assignedLocation}" validated successfully`,
    };
  } catch (err) {
    console.error('Location validation failed:', err);
    return {
      status: 'invalid_location',
      confidence: 0.3,
      reasoning: 'Location validation error occurred',
    };
  }
}

export function resetMonthlyUsage() {
  // No longer needed for location validation
}
