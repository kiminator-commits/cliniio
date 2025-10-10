import { useFacility } from '@/contexts/FacilityContext';
import { useUser } from '@/contexts/UserContext';

export function useFacilityContext() {
  const { getCurrentFacilityId } = useFacility();
  const { currentUser } = useUser();

  // Try to get facilityId from multiple sources
  const facilityId = getCurrentFacilityId() || currentUser?.facility_id || null;

  if (!facilityId) {
    console.warn(
      '⚠️ Facility context missing — Supabase access will be blocked'
    );
  }

  return facilityId;
}
