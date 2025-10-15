export interface Location {
  id: string;
  facility_id: string;
  name: string;
  barcode: string;
  parent_id?: string | null;
  capacity?: number | null;
  status: 'active' | 'full' | 'maintenance' | 'inactive';
  created_at: string;
}
