import { getStatusBadge, getStatusText } from '@/utils/Inventory/statusUtils';

export function useInventoryStatusHelpers() {
  return { getStatusBadge, getStatusText };
}
