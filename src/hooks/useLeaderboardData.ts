import { useMemo } from 'react';
import { LeaderboardUser } from '../types/leaderboard';
import { DEFAULT_RANK } from '../constants/homeUiConstants';

export function useLeaderboardData(
  users: LeaderboardUser[] = [],
  totalScore: number
) {
  const sorted = useMemo(() => {
    return [...users].sort((a, b) => b.score - a.score);
  }, [users]);

  const rank = useMemo(() => {
    if (!sorted.length) return DEFAULT_RANK;
    const index = sorted.findIndex((user) => user.score <= totalScore);
    return index >= 0 ? index + 1 : DEFAULT_RANK;
  }, [sorted, totalScore]);

  const topThree = useMemo(() => sorted.slice(0, 3), [sorted]);

  return {
    sortedLeaderboard: sorted,
    leaderboardRank: rank,
    topUsers: topThree,
  };
}
