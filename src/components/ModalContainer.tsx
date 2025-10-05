import React, { useState, useEffect } from 'react';
import StatsModal from './StatsModal';
import LeaderboardModal from './LeaderboardModal';
import ChallengeModal from './ChallengeModal';
import { GamificationData } from '../store/homeStore';
import { GamificationData as StatsModalGamificationData } from './StatsModal';
import { GamificationData as LeaderboardModalGamificationData } from './LeaderboardModal';
import { leaderboardService } from '../services/leaderboardService';

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
  leaderboardLoading: _leaderboardLoading = false,
  leaderboardError: _leaderboardError = null,
}) => {
  // Load leaderboard data only when modal opens
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardModalGamificationData>({
      rank: leaderboardRank,
      topUsers: leaderboardTopUsers,
    });
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardErrorState, setLeaderboardErrorState] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (isLeaderboardOpen && leaderboardTopUsers.length === 0) {
      // Only load if modal is open and we don't have data yet
      setIsLoadingLeaderboard(true);
      setLeaderboardErrorState(null);

      leaderboardService
        .fetchLeaderboardData()
        .then((data) => {
          setLeaderboardData({
            rank: data.userRank || 1,
            topUsers:
              data.users?.map((user) => ({
                id: user.id,
                name: user.full_name || 'Anonymous',
                score: user.score || 0,
                avatar: user.avatar || '👤',
              })) || [],
          });
        })
        .catch((error) => {
          setLeaderboardErrorState(
            error.message || 'Failed to load leaderboard'
          );
        })
        .finally(() => {
          setIsLoadingLeaderboard(false);
        });
    }
  }, [isLeaderboardOpen, leaderboardTopUsers.length]);
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
  const _leaderboardModalData: LeaderboardModalGamificationData = {
    rank: leaderboardRank,
    topUsers: leaderboardTopUsers,
  };

  return (
    <>
      {/* Only render StatsModal when it's open to prevent unnecessary stats calculations */}
      {isStatsOpen && (
        <StatsModal
          isOpen={isStatsOpen}
          onClose={onStatsClose}
          gamificationData={statsModalData}
        />
      )}

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={onLeaderboardClose}
        gamificationData={leaderboardData}
        loading={isLoadingLeaderboard}
        error={leaderboardErrorState}
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
