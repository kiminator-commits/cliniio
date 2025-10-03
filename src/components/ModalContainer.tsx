import React from 'react';
import StatsModal from './StatsModal';
import LeaderboardModal from './LeaderboardModal';
import ChallengeModal from './ChallengeModal';
import { GamificationData } from '../store/homeStore';
import { GamificationData as StatsModalGamificationData } from './StatsModal';
import { GamificationData as LeaderboardModalGamificationData } from './LeaderboardModal';

interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

interface ModalContainerProps {
  isStatsOpen: boolean;
  onStatsClose: () => void;
  isLeaderboardOpen: boolean;
  onLeaderboardClose: () => void;
  isChallengeOpen: boolean;
  onChallengeClose: () => void;
  gamificationData: GamificationData;
  leaderboardRank: number;
  leaderboardTopUsers: LeaderboardUser[];
  leaderboardLoading?: boolean;
  leaderboardError?: string | null;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  isStatsOpen,
  onStatsClose,
  isLeaderboardOpen,
  onLeaderboardClose,
  isChallengeOpen,
  onChallengeClose,
  gamificationData,
  leaderboardRank,
  leaderboardTopUsers,
  leaderboardLoading = false,
  leaderboardError = null,
}) => {
  // Transform store gamification data to StatsModal format
  const statsModalData: StatsModalGamificationData = {
    stats: gamificationData.stats || {
      toolsSterilized: 0,
      inventoryChecks: 0,
      perfectDays: 0,
      totalTasks: 0,
      completedTasks: 0,
      currentStreak: 0,
      bestStreak: 0,
    },
  };

  // Transform store gamification data to LeaderboardModal format
  const leaderboardModalData: LeaderboardModalGamificationData = {
    rank: leaderboardRank,
    topUsers: leaderboardTopUsers,
  };

  return (
    <>
      <StatsModal
        isOpen={isStatsOpen}
        onClose={onStatsClose}
        gamificationData={statsModalData}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={onLeaderboardClose}
        gamificationData={leaderboardModalData}
        loading={leaderboardLoading}
        error={leaderboardError}
      />

      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={onChallengeClose}
        onChallengeComplete={(points) => {
          // Handle challenge completion
          console.log('Challenge completed with points:', points);
          // Refresh stats when challenge is completed
          // The StatsModal will automatically refresh when opened
        }}
      />
    </>
  );
};

export default ModalContainer;
