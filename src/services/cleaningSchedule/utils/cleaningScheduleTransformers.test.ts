import { CleaningScheduleDataTransformer } from './cleaningScheduleTransformers';

// import { vi } from 'vitest';
describe('CleaningScheduleDataTransformer', () => {
  describe('transformFromSupabase', () => {
    it('should transform data from Supabase format', () => {
      const data = {
        id: '1',
        name: 'Test Schedule',
        description: 'Test Description',
        type: 'daily',
        frequency: 'daily',
        assigned_to: 'John Doe',
        assigned_to_id: 'user-123',
        priority: 'high',
        estimated_duration: 30,
        points: 100,
        status: 'pending',
        due_date: '2024-01-15T10:00:00Z',
        completed_date: '2024-01-15T12:00:00Z',
        completed_by: 'Jane Doe',
        notes: 'Test notes',
        checklist_id: 'checklist-123',
        room_id: 'room-123',
        patient_id: 'patient-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result =
        CleaningScheduleDataTransformer.transformFromSupabase(data);

      expect(result).toEqual({
        id: '1',
        name: 'Test Schedule',
        description: 'Test Description',
        type: 'daily',
        frequency: 'daily',
        assignedTo: 'John Doe',
        assignedToId: 'user-123',
        priority: 'high',
        estimatedDuration: 30,
        points: 100,
        status: 'pending',
        dueDate: '2024-01-15T10:00:00Z',
        completedDate: '2024-01-15T12:00:00Z',
        completedBy: 'Jane Doe',
        notes: 'Test notes',
        checklistId: 'checklist-123',
        roomId: 'room-123',
        patientId: 'patient-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      });
    });

    it('should handle missing optional fields', () => {
      const data = {
        id: '1',
        name: 'Test Schedule',
        description: 'Test Description',
        type: 'daily',
        frequency: 'daily',
        assigned_to: null,
        assigned_to_id: null,
        priority: 'high',
        estimated_duration: null,
        points: null,
        status: 'pending',
        due_date: null,
        completed_date: null,
        completed_by: null,
        notes: null,
        checklist_id: null,
        room_id: null,
        patient_id: null,
        created_at: null,
        updated_at: null,
      };

      const result =
        CleaningScheduleDataTransformer.transformFromSupabase(data);

      expect(result).toEqual({
        id: '1',
        name: 'Test Schedule',
        description: 'Test Description',
        type: 'daily',
        frequency: 'daily',
        assignedTo: '',
        assignedToId: '',
        priority: 'high',
        estimatedDuration: 0,
        points: 0,
        status: 'pending',
        dueDate: '',
        completedDate: '',
        completedBy: '',
        notes: '',
        checklistId: '',
        roomId: '',
        patientId: '',
        createdAt: '',
        updatedAt: '',
      });
    });
  });

  describe('transformToSupabase', () => {
    it('should transform data to Supabase format', () => {
      const schedule = {
        id: '1',
        name: 'Test Schedule',
        description: 'Test Description',
        type: 'daily' as any,
        frequency: 'daily' as any,
        assignedTo: 'John Doe',
        assignedToId: 'user-123',
        priority: 'high' as any,
        estimatedDuration: 30,
        points: 100,
        status: 'pending',
        dueDate: '2024-01-15T10:00:00Z',
        completedDate: '2024-01-15T12:00:00Z',
        completedBy: 'Jane Doe',
        notes: 'Test notes',
        checklistId: 'checklist-123',
        roomId: 'room-123',
        patientId: 'patient-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const result =
        CleaningScheduleDataTransformer.transformToSupabase(schedule);

      expect(result).toEqual({
        name: 'Test Schedule',
        description: 'Test Description',
        type: 'daily',
        frequency: 'daily',
        assigned_to: 'John Doe',
        assigned_to_id: 'user-123',
        priority: 'high',
        estimated_duration: 30,
        points: 100,
        status: 'pending',
        due_date: '2024-01-15T10:00:00Z',
        completed_date: '2024-01-15T12:00:00Z',
        completed_by: 'Jane Doe',
        notes: 'Test notes',
        checklist_id: 'checklist-123',
        room_id: 'room-123',
        patient_id: 'patient-123',
      });
    });
  });
});
