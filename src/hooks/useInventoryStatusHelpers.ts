import { getStatusBadge, getStatusText } from '@/utils/inventory/statusUtils';

export function useInventoryStatusHelpers() {
  return { getStatusBadge, getStatusText };
}
