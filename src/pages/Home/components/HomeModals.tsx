import React, { useMemo } from 'react';
import { useHomeStore } from '../../../store/homeStore';
import ModalContainer from '../../../components/ModalContainer';
import { GamificationData } from '../../../store/homeStore';

// Define the LeaderboardData interface that matches what the component expects
interface LeaderboardData {
  users: LeaderboardUser[];
  userRank: number;
  totalUsers?: number;
}

// Define LeaderboardUser interface that matches the actual data structure
interface LeaderboardUser {
  id: string;
  full_name?: string;
  score: number;
  rank: number;
  avatar?: string;
}

interface HomeModalsProps {
  leaderboardData: LeaderboardData;
}

export default function HomeModals({ leaderboardData }: HomeModalsProps) {
  const {
    // Removed unused variable: totalScore
    showStatsModal,
    setShowStatsModal,
    showLeaderboardModal,
    setShowLeaderboardModal,
    showChallengeModal,
    setShowChallengeModal,
    gamificationData,
  } = useHomeStore();

  // Use leaderboard data passed as prop instead of calling useLeaderboard
  const typedLeaderboardUsers = useMemo((): LeaderboardUser[] => {
    return leaderboardData.users || [];
  }, [leaderboardData.users]);

  // Get top 3 users from the leaderboard
  const topUsers = useMemo(() => {
    if (!typedLeaderboardUsers || typedLeaderboardUsers.length === 0) return [];
    return typedLeaderboardUsers
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [typedLeaderboardUsers]);

  const leaderboardRank = useMemo(() => {
    return leaderboardData.userRank || 1;
  }, [leaderboardData.userRank]);

  // Memoize the leaderboard top users to prevent unnecessary re-renders
  const leaderboardTopUsers = useMemo(() => {
    if (!leaderboardData.users || leaderboardData.users.length === 0) {
      return [];
    }
    return topUsers.map((user: LeaderboardUser) => ({
      id: user.id,
      name: user.full_name || 'Anonymous',
      score: user.score || 0,
      rank: user.rank,
      avatar: user.avatar || '👤',
    }));
  }, [topUsers, leaderboardData.users]);

  return (
    <ModalContainer
      isStatsOpen={showStatsModal}
      onStatsClose={() => setShowStatsModal(false)}
      isLeaderboardOpen={showLeaderboardModal}
      onLeaderboardClose={() => setShowLeaderboardModal(false)}
      isChallengeOpen={showChallengeModal}
      onChallengeClose={() => setShowChallengeModal(false)}
      gamificationData={gamificationData as GamificationData}
      leaderboardRank={leaderboardRank}
      leaderboardTopUsers={leaderboardTopUsers}
      leaderboardLoading={false} // No loading state needed since data is passed as prop
      leaderboardError={null} // No error state needed since data is passed as prop
    />
  );
}
