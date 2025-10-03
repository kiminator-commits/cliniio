import { useMemo } from 'react';
import { LeaderboardUser } from '@/types/task';

export function useTopUsers(
  leaderboardUsers: LeaderboardUser[]
): LeaderboardUser[] {
  return useMemo(() => {
    if (!leaderboardUsers || leaderboardUsers.length === 0) return [];
    return leaderboardUsers
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [leaderboardUsers]);
}
