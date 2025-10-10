import { CleaningChecklistItem, CleaningAnalytics } from '../../models';

/**
 * Transform checklist items from database format
 */
export const transformChecklistItems = (
  checklistItems: unknown[],
  completedItems: unknown[]
): CleaningChecklistItem[] => {
  if (!Array.isArray(checklistItems)) {
    return [];
  }

  return checklistItems.map((item, index) => {
    const typedItem = item as Record<string, unknown>;
    return {
      id: (typedItem.id as string) || `item-${index}`,
      description:
        ((typedItem.data as { description?: string })?.description as string) ||
        (typedItem.name as string) ||
        `Checklist item ${index + 1}`,
      isRequired: typedItem.isRequired !== false,
      isCompleted:
        (Array.isArray(completedItems) &&
          completedItems.some(
            (completed) =>
              (completed as Record<string, unknown>).id === typedItem.id
          )) ||
        false,
      completedBy: typedItem.completedBy as string,
      completedAt: typedItem.completedAt as string,
    };
  });
};

/**
 * Calculate analytics from view data
 */
export const calculateAnalyticsFromViewData = (
  viewData: unknown[]
): CleaningAnalytics => {
  const totalRooms = viewData.length;
  const cleanRooms = viewData.filter(
    (room) =>
      (room as Record<string, unknown>).status === 'completed' ||
      (room as Record<string, unknown>).status === 'verified'
  ).length;
  const dirtyRooms = viewData.filter(
    (room) => (room as Record<string, unknown>).status === 'pending'
  ).length;
  const inProgressRooms = viewData.filter(
    (room) => (room as Record<string, unknown>).status === 'in_progress'
  ).length;

  // Calculate efficiency (completed vs total)
  const cleaningEfficiency =
    totalRooms > 0 ? (cleanRooms / totalRooms) * 100 : 0;

  // Calculate average cleaning time
  const completedRooms = viewData.filter(
    (room) => (room as Record<string, unknown>).duration_seconds
  );
  const averageCleaningTime =
    completedRooms.length > 0
      ? completedRooms.reduce((sum: number, room) => {
          const duration =
            Number((room as Record<string, unknown>).duration_seconds) || 0;
          return (
            sum +
            (typeof duration === 'number' && !isNaN(duration) ? duration : 0)
          );
        }, 0) / completedRooms.length
      : 0;

  return {
    totalRooms,
    cleanRooms,
    dirtyRooms,
    inProgressRooms,
    cleaningEfficiency,
    averageCleaningTime,
    lastUpdated: new Date().toISOString(),
  };
};
