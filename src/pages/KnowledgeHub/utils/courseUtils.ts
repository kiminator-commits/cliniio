import { COURSE_TAG_COLORS } from '../config/courseConfig';

export const getTagColor = (tag: string): string => {
  return (
    COURSE_TAG_COLORS[tag as keyof typeof COURSE_TAG_COLORS] ||
    'bg-gray-100 text-gray-800'
  );
};
