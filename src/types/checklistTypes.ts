/**
 * Shared types for checklist functionality
 * Consolidates ChecklistFormData interface to eliminate duplication across components
 */

export interface ChecklistFormData {
  title: string;
  category:
    | 'setup'
    | 'patient'
    | 'weekly'
    | 'public'
    | 'deep'
    | 'environmental_cleaning';
  // Scheduling properties
  autoSchedule: boolean;
  scheduleFrequency:
    | 'daily'
    | 'per_patient'
    | 'weekly'
    | 'bi_weekly'
    | 'monthly'
    | 'quarterly'
    | 'custom';
  scheduleDay:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  scheduleTime: string;
  schedulePriority: 'low' | 'medium' | 'high' | 'urgent';
  schedulePoints: number;
  scheduleDuration: number;
  triggerRoomStatus: boolean;
  triggerStaffSchedule: boolean;
  triggerAdminDecision: boolean;
}

// Type helpers for better developer experience
export type ChecklistCategory = ChecklistFormData['category'];
export type ScheduleFrequency = ChecklistFormData['scheduleFrequency'];
export type ScheduleDay = ChecklistFormData['scheduleDay'];
export type SchedulePriority = ChecklistFormData['schedulePriority'];

// Default values for form initialization
export const DEFAULT_CHECKLIST_FORM_DATA: ChecklistFormData = {
  title: '',
  category: 'setup',
  autoSchedule: false,
  scheduleFrequency: 'weekly',
  scheduleDay: 'monday',
  scheduleTime: '09:00',
  schedulePriority: 'medium',
  schedulePoints: 50,
  scheduleDuration: 30,
  triggerRoomStatus: false,
  triggerStaffSchedule: false,
  triggerAdminDecision: false,
};
