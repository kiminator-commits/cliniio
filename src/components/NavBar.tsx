import React from 'react';
import { mdiChartPie, mdiTrophy, mdiTarget } from '@mdi/js';
import Icon from '@mdi/react';
import Greeting from './Greeting';
import { Tooltip } from './ui/Tooltip';

interface NavBarProps {
  onStatsClick?: () => void;
  onLeaderboardClick?: () => void;
  onChallengeClick?: () => void;
}

const features = [
  {
    icon: mdiChartPie,
    bg: 'teal',
    label: 'Cumulative Stats',
    description: 'Performance\nStatistics',
  },
  {
    icon: mdiTrophy,
    bg: 'purple',
    label: 'Leaderboard',
    description: 'Team\nRankings',
  },
  {
    icon: mdiTarget,
    bg: 'blue',
    label: 'Daily Challenge',
    description: 'Daily\nChallenge',
  },
];

const NavBar: React.FC<NavBarProps> = ({
  onStatsClick,
  onLeaderboardClick,
  onChallengeClick,
}) => {
  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, action?: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action?.();
    }
  };

  return (
    <header className="mb-6 pl-8" aria-label="Dashboard header">
      <div className="flex items-center justify-between">
        <Greeting />

        {/* Feature buttons with enhanced accessibility */}
        <nav
          className="flex gap-4 pr-8"
          role="navigation"
          aria-label="Dashboard actions"
        >
          {features.map((f) => {
            const handleClick =
              f.label === 'Cumulative Stats'
                ? onStatsClick
                : f.label === 'Leaderboard'
                  ? onLeaderboardClick
                  : f.label === 'Daily Challenge'
                    ? onChallengeClick
                    : undefined;

            return (
              <Tooltip key={f.label} content={f.description}>
                <button
                  className={`rounded-xl w-12 h-12 flex items-center justify-center transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    f.label === 'Cumulative Stats'
                      ? 'bg-purple-100 focus:ring-purple-500'
                      : f.label === 'Leaderboard'
                        ? 'bg-amber-100 focus:ring-amber-500'
                        : 'bg-blue-100 focus:ring-blue-500'
                  }`}
                  aria-label={`${f.label}: ${f.description}`}
                  onClick={handleClick}
                  onKeyDown={(e) => handleKeyDown(e, handleClick)}
                  tabIndex={0}
                >
                  <Icon
                    path={f.icon}
                    size={1.1}
                    aria-hidden="true"
                    color={
                      f.label === 'Cumulative Stats'
                        ? '#9333ea' // purple-600
                        : f.label === 'Leaderboard'
                          ? '#d97706' // amber-600
                          : '#2563eb' // blue-600
                    }
                  />
                </button>
              </Tooltip>
            );
          })}
        </nav>
      </div>

      <p className="text-sm text-gray-500" role="status" aria-live="polite">
        Here&apos;s your impact and progress for today.
      </p>
    </header>
  );
};

export default NavBar;
