import React from 'react';
import HomeLayout from './components/HomeLayout';
import { useHomeDataLoader } from '../../hooks/useHomeDataLoader';
import { RocketLoading } from '../../components/ui/RocketLoading';
import { useUser } from '../../contexts/UserContext';
import { Navigate } from 'react-router-dom';
import { useLoginStore } from '../../stores/useLoginStore';

export default function HomePage() {
  const { currentUser, isLoading: userLoading } = useUser();
  const authToken = useLoginStore((state) => state.authToken);
  const isTokenExpired = useLoginStore((state) => state.isTokenExpired);
  const homeData = useHomeDataLoader();

  // AUTHENTICATION GUARD: No user data should show until after login
  const isAuthenticated = !!(currentUser && authToken && !isTokenExpired());

  // Redirect to login if not authenticated
  if (!isAuthenticated && !userLoading) {
    // User not authenticated, redirecting silently
    return <Navigate to="/login" replace />;
  }

  // Show loading while authentication/user data is being verified
  if (userLoading || !currentUser) {
    return <RocketLoading size="lg" message="Verifying Authentication..." />;
  }

  if (homeData.loading) {
    return (
      <RocketLoading size="lg" message="Data Compilation In Progress..." />
    );
  }

  return <HomeLayout homeData={homeData} />;
}
