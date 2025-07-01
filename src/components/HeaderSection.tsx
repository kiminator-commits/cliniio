import React from 'react';
import { mdiChartPie, mdiTrophy, mdiTarget } from '@mdi/js';
import Icon from '@mdi/react';
import Greeting from './Greeting';

const features = [
  {
    icon: mdiChartPie,
    bg: 'bg-teal-400',
    label: 'Cumulative Stats',
  },
  {
    icon: mdiTrophy,
    bg: 'bg-purple-400',
    label: 'Leaderboard',
  },
  {
    icon: mdiTarget,
    bg: 'bg-blue-600',
    label: 'Daily Challenge',
  },
];

const HeaderSection = () => {
  return (
    <div className="mb-6">
      <Greeting />
      <p className="text-sm text-gray-500 mb-4">Here&apos;s your impact and progress for today.</p>
      <div className="flex gap-4">
        {features.map(f => (
          <div
            key={f.label}
            className={`${f.bg} rounded-xl w-16 h-16 flex items-center justify-center`}
            title={f.label}
          >
            <Icon path={f.icon} size={1.5} color="#fff" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSection;
