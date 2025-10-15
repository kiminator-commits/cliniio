export interface Facility {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export class FacilityService {
  static async getCurrentFacilityId(): Promise<string> {
    return 'test-facility-id';
  }

  static async getFacility(id: string): Promise<Facility> {
    return { id, name: 'Test Facility' };
  }
}
