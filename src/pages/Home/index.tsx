import React, { useMemo } from 'react';
import clsx from 'clsx';
import { DrawerMenu } from '../../components/Navigation/DrawerMenu';
import NavBar from '@/components/NavBar';
import { FaBars } from 'react-icons/fa';
import { mdiClipboardText, mdiFilter } from '@mdi/js';
import Icon from '@mdi/react';
import StatsModal from '@/components/StatsModal';
import LeaderboardModal from '@/components/LeaderboardModal';
import ChallengeModal from '@/components/ChallengeModal';
import { GamificationStats } from '../../components/Dashboard/GamificationStats';
import { PerformanceMetrics } from '../../components/PerformanceMetrics/PerformanceMetrics';
import { HOME_UI_CONSTANTS } from '../../constants/homeUiConstants';
import { useHomeState } from '../../hooks/useHomeState';
import {
  calculateNavBarMargins,
  getSectionCardClass,
  getTaskCardClass,
} from '../../utils/homeUtils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useHomeStore } from '../../store/homeStore';
import { HOME_SECTION_TITLES } from './constants/homeConstants';
import TasksList from '@/components/TasksList';

export default function HomePage() {
  const {
    drawerOpen,
    setDrawerOpen,
    tasks,
    gamificationData,
    mockMetricsData,
    handleTaskComplete,
    handleRefresh,
  } = useHomeState();

  const {
    totalScore,
    availablePoints: storeAvailablePoints,
    showFilters: storeShowFilters,
    setShowFilters: setStoreShowFilters,
    showStatsModal,
    setShowStatsModal,
    showLeaderboardModal,
    setShowLeaderboardModal,
    showChallengeModal,
    setShowChallengeModal,
    leaderboardUsers,
  } = useHomeStore();

  const { navBarMarginLeft, navBarMarginTop } = calculateNavBarMargins(drawerOpen);

  const leaderboardRank = useMemo(() => {
    const idx = leaderboardUsers.findIndex((user: { score: number }) => user.score <= totalScore);
    return idx + 1 || leaderboardUsers.length + 1;
  }, [leaderboardUsers, totalScore]);

  const leaderboardTopUsers = useMemo(
    () =>
      leaderboardUsers.map(user => ({
        name: user.name || 'Anonymous',
        score: user.score || 0,
        avatar: user.avatar || '/default-avatar.png',
      })),
    [leaderboardUsers]
  );

  return (
    <ErrorBoundary>
      <div
        className={clsx(
          'flex min-h-screen bg-gradient-to-br hide-scrollbar',
          `from-${HOME_UI_CONSTANTS.COLORS.BG_GRADIENT.FROM}`,
          `to-${HOME_UI_CONSTANTS.COLORS.BG_GRADIENT.TO}`
        )}
      >
        {drawerOpen && <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />}
        <div
          className={`flex-1 border-l-${HOME_UI_CONSTANTS.BORDER.LEFT_WIDTH} border-${HOME_UI_CONSTANTS.COLORS.BORDER} pt-6`}
        >
          {!drawerOpen && (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                position: 'fixed',
                top: HOME_UI_CONSTANTS.MENU_BUTTON.TOP,
                left: HOME_UI_CONSTANTS.MENU_BUTTON.LEFT,
                zIndex: HOME_UI_CONSTANTS.MENU_BUTTON.Z_INDEX,
                background: HOME_UI_CONSTANTS.MENU_BUTTON.BACKGROUND,
                color: HOME_UI_CONSTANTS.MENU_BUTTON.COLOR,
                borderRadius: HOME_UI_CONSTANTS.MENU_BUTTON.BORDER_RADIUS,
                padding: HOME_UI_CONSTANTS.MENU_BUTTON.PADDING,
                boxShadow: HOME_UI_CONSTANTS.MENU_BUTTON.BOX_SHADOW,
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Open main menu"
            >
              <FaBars size={HOME_UI_CONSTANTS.MENU_BUTTON.ICON_SIZE} />
            </button>
          )}
          <div style={{ marginLeft: navBarMarginLeft, marginTop: navBarMarginTop }}>
            <NavBar
              onStatsClick={() => setShowStatsModal(true)}
              onLeaderboardClick={() => setShowLeaderboardModal(true)}
              onChallengeClick={() => setShowChallengeModal(true)}
            />
            <div className={clsx(`p-${HOME_UI_CONSTANTS.SPACING.PADDING}`)}>
              <GamificationStats gamificationData={gamificationData} />
              <div
                className={clsx(
                  'grid grid-cols-1 lg:grid-cols-2',
                  `gap-${HOME_UI_CONSTANTS.SPACING.GAP}`,
                  `mt-${HOME_UI_CONSTANTS.SPACING.MARGIN_TOP}`
                )}
              >
                <div className={getTaskCardClass()}>
                  <div
                    className="flex items-center justify-between mb-6"
                    style={{ marginTop: '-8px' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`bg-${HOME_UI_CONSTANTS.COLORS.PRIMARY_BG} rounded-md p-1`}>
                        <Icon
                          path={mdiClipboardText}
                          size={1}
                          color={HOME_UI_CONSTANTS.COLORS.PRIMARY}
                        />
                      </span>
                      <h2 className="text-lg font-semibold text-gray-600">
                        {HOME_SECTION_TITLES.TASKS}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-sm ${HOME_UI_CONSTANTS.COLORS.TEXT_SECONDARY} border border-gray-300 rounded-${HOME_UI_CONSTANTS.BORDER.RADIUS} hidden sm:inline-block`}
                      >
                        Available: {storeAvailablePoints} Points
                      </span>
                      <button
                        onClick={() => setStoreShowFilters(!storeShowFilters)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 flex items-center"
                      >
                        <Icon path={mdiFilter} size={0.8} />
                        <span className="ml-1 text-sm hidden sm:inline-block">Filter</span>
                      </button>
                    </div>
                  </div>
                  {storeShowFilters && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
                          <option value="">Category</option>
                          <option value="operations">Operations</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="safety">Safety</option>
                        </select>
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
                          <option value="">Type</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
                          <option value="">Due Date</option>
                          <option value="today">Today</option>
                          <option value="tomorrow">Tomorrow</option>
                          <option value="this_week">This Week</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <TasksList
                      tasks={tasks}
                      onTaskComplete={handleTaskComplete}
                      onRefresh={handleRefresh}
                      showFilters={storeShowFilters}
                    />
                  </div>
                </div>
                <div className={getSectionCardClass()}>
                  <PerformanceMetrics metrics={mockMetricsData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <StatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          gamificationData={gamificationData}
        />

        <LeaderboardModal
          isOpen={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
          gamificationData={{
            rank: leaderboardRank,
            topUsers: leaderboardTopUsers,
          }}
        />

        <ChallengeModal
          isOpen={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          gamificationData={gamificationData}
        />
      </div>
    </ErrorBoundary>
  );
}
