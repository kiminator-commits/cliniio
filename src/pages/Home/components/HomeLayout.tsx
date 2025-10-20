import React, { useRef, useCallback } from 'react';
import clsx from 'clsx';
import { SharedLayout } from '../../../components/Layout/SharedLayout';
import NavBar from '../../../components/NavBar';
import { HOME_UI_CONSTANTS } from '../../../constants/homeUiConstants';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useHomeStore } from '../../../store/homeStore';
import { useNavigation } from '../../../contexts/NavigationContext';
import { HomeData } from '../../../types/homeDataTypes';
import { calculateNavBarMargins } from '../../../utils/homeUtils';

// Import components directly to avoid lazy loading waterfalls
import HomeModals from './HomeModals';
import HomeContent from './HomeContent';

interface HomeLayoutProps {
  homeData: HomeData;
}

export default function HomeLayout({ homeData }: HomeLayoutProps) {
  const { setShowStatsModal, setShowLeaderboardModal, setShowChallengeModal } =
    useHomeStore();
  const { isDrawerOpen } = useNavigation();
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Calculate navbar margins based on drawer state
  const { navBarMarginLeft, navBarMarginTop } = calculateNavBarMargins(isDrawerOpen);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleStatsClick = useCallback(
    () => setShowStatsModal(true),
    [setShowStatsModal]
  );
  const handleLeaderboardClick = useCallback(
    () => setShowLeaderboardModal(true),
    [setShowLeaderboardModal]
  );
  const handleChallengeClick = useCallback(
    () => setShowChallengeModal(true),
    [setShowChallengeModal]
  );

  const content = (
    <ErrorBoundary>
      <SharedLayout>
        <div
          className={clsx(
            'min-h-[100dvh] md:h-screen bg-gradient-to-br hide-scrollbar overflow-hidden',
            `from-${HOME_UI_CONSTANTS.COLORS.BG_GRADIENT.FROM}`,
            `to-${HOME_UI_CONSTANTS.COLORS.BG_GRADIENT.TO}`
          )}
          aria-label="Cliniio Home Dashboard"
          data-testid="home-layout"
        >
          {/* Skip link for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black p-2 z-50 rounded shadow-lg"
            aria-label="Skip to main content"
          >
            Skip to main content
          </a>

          {/* Main content area */}
          <main
            className={`flex-1 border-l-${HOME_UI_CONSTANTS.BORDER.LEFT_WIDTH} border-${HOME_UI_CONSTANTS.COLORS.BORDER} pt-6 overflow-hidden`}
            role="main"
            id="main-content"
            ref={mainContentRef}
            tabIndex={-1}
            aria-label="Main content area"
          >
            {/* Fixed header with NavBar */}
            <div
              className="flex-shrink-0"
              style={{ 
                marginLeft: navBarMarginLeft,
                marginTop: navBarMarginTop 
              }}
              aria-label="Dashboard header container"
            >
              <NavBar
                onStatsClick={handleStatsClick}
                onLeaderboardClick={handleLeaderboardClick}
                onChallengeClick={handleChallengeClick}
              />
            </div>

            {/* Scrollable content area */}
            <div
              className="flex-1 overflow-y-auto hide-scrollbar"
              style={{ marginLeft: navBarMarginLeft }}
              role="region"
              aria-label="Dashboard content"
            >
              <HomeContent homeData={homeData} />
            </div>
          </main>
        </div>

        {/* Modals loaded directly to avoid lazy loading waterfalls */}
        <HomeModals
          leaderboardData={{
            ...homeData.leaderboardData,
            users: [],
            userRank: 1,
          }}
        />
      </SharedLayout>
    </ErrorBoundary>
  );

  return content;
}
