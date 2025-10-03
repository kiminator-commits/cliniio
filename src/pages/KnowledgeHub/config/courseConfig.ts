export interface CourseTab {
  id: string;
  label: string;
}

export const COURSE_TABS: CourseTab[] = [
  { id: 'assigned', label: 'Assigned' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'library', label: 'Library' },
  { id: 'completed', label: 'Completed' },
];

export const COURSE_TAG_COLORS = {
  Required: 'bg-red-100 text-red-800',
  Optional: 'bg-blue-100 text-blue-800',
  New: 'bg-green-100 text-green-800',
  Updated: 'bg-yellow-100 text-yellow-800',
} as const;

export const COURSE_REPEAT_INTERVAL_DAYS = 30;
