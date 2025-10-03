import React from 'react';
import HomeLayout from './components/HomeLayout';
import { useHomeDataLoader } from '../../hooks/useHomeDataLoader';
import { LoadingSpinner } from '../../components/ui/Skeleton';

export default function HomePage() {
  const homeData = useHomeDataLoader();

  if (homeData.loading) {
    return <LoadingSpinner size="lg" />;
  }

  return <HomeLayout homeData={homeData} />;
}
