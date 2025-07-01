import React from 'react';
import NavBar from '@/components/NavBar';
import { calculateNavBarMargins } from '../../../utils/homeUtils';

interface DashboardHeaderProps {
  drawerOpen: boolean;
  setShowStatsModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setShowChallengeModal: (show: boolean) => void;
}

export function DashboardHeader({
  drawerOpen,
  setShowStatsModal,
  setShowLeaderboardModal,
  setShowChallengeModal,
}: DashboardHeaderProps) {
  const { navBarMarginLeft, navBarMarginTop } = calculateNavBarMargins(drawerOpen);

  return (
    <div style={{ marginLeft: navBarMarginLeft, marginTop: navBarMarginTop }}>
      <NavBar
        onStatsClick={() => setShowStatsModal(true)}
        onLeaderboardClick={() => setShowLeaderboardModal(true)}
        onChallengeClick={() => setShowChallengeModal(true)}
      />
    </div>
  );
}
