import React, { useState, useEffect } from 'react';
import StatsModal from './StatsModal';
import LeaderboardModal from './LeaderboardModal';
import ChallengeModal from './ChallengeModal';
import { GamificationData } from '../store/homeStore';
import { GamificationData as StatsModalGamificationData } from './StatsModal';
import { GamificationData as LeaderboardModalGamificationData } from './LeaderboardModal';
import { leaderboardService } from '../services/leaderboardService';
import { useFacility } from '../contexts/FacilityContext';

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
  const { getCurrentFacilityId } = useFacility();
  
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
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setIsLoadingLeaderboard(true);
        setLeaderboardErrorState(null);
      }, 0);

      const facilityId = getCurrentFacilityId();
      leaderboardService
        .fetchLeaderboardData(facilityId || undefined)
        .then((data) => {
          setLeaderboardData({
            rank: 1, // Default rank since we don't have user-specific rank in the data
            topUsers:
              data?.map((user) => ({
                id: user.user_id,
                name: user.user_name || 'Anonymous',
                score: user.points || 0,
                avatar: '👤', // Default avatar since it's not in the data
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
  }, [isLeaderboardOpen, leaderboardTopUsers.length, getCurrentFacilityId]);
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
