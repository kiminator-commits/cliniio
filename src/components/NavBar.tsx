import React from 'react';
import { mdiChartPie, mdiTrophy, mdiTarget } from '@mdi/js';
import Icon from '@mdi/react';
import Greeting from './Greeting';

interface NavBarProps {
  onStatsClick?: () => void;
  onLeaderboardClick?: () => void;
  onChallengeClick?: () => void;
}

const features = [
  { icon: mdiChartPie, bg: 'teal', label: 'Cumulative Stats' },
  { icon: mdiTrophy, bg: 'purple', label: 'Leaderboard' },
  { icon: mdiTarget, bg: 'blue', label: 'Daily Challenge' },
];

const NavBar: React.FC<NavBarProps> = ({ onStatsClick, onLeaderboardClick, onChallengeClick }) => {
  return (
    <div className="mb-6 pl-8">
      <div className="flex items-center justify-between">
        <Greeting />
        <div className="flex gap-4 pr-8">
          {features.map(f => (
            <button
              key={f.label}
              className={`rounded-xl w-12 h-12 flex items-center justify-center transition-transform duration-200 hover:scale-110 ${
                f.label === 'Cumulative Stats'
                  ? 'bg-purple-100'
                  : f.label === 'Leaderboard'
                    ? 'bg-amber-100'
                    : 'bg-blue-100'
              }`}
              title={f.label}
              onClick={
                f.label === 'Cumulative Stats'
                  ? onStatsClick
                  : f.label === 'Leaderboard'
                    ? onLeaderboardClick
                    : f.label === 'Daily Challenge'
                      ? onChallengeClick
                      : undefined
              }
              aria-label={f.label}
            >
              <Icon
                path={f.icon}
                size={1.1}
                color={
                  f.label === 'Cumulative Stats'
                    ? '#9333ea' // purple-600
                    : f.label === 'Leaderboard'
                      ? '#d97706' // amber-600
                      : '#2563eb' // blue-600
                }
              />
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-500">Here&apos;s your impact and progress for today.</p>
    </div>
  );
};

export default NavBar;
