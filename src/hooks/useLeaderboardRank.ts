import { useMemo } from 'react';
import { LeaderboardUser } from '@/types/task';
import { DEFAULT_RANK } from '@/constants/homeUiConstants';

export function useLeaderboardRank(
  leaderboardUsers: LeaderboardUser[],
  totalScore: number
): number {
  return useMemo(() => {
    if (!leaderboardUsers || leaderboardUsers.length === 0) {
      return DEFAULT_RANK;
    }
    const idx = leaderboardUsers.findIndex(
      (user: LeaderboardUser) => user.score <= totalScore
    );
    return idx >= 0 ? idx + 1 : DEFAULT_RANK;
  }, [leaderboardUsers, totalScore]);
}
