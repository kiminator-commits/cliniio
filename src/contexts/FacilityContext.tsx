import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { FacilityService } from '@/services/facilityService';

interface Facility {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

interface FacilityContextType {
  currentFacility: Facility | null;
  setCurrentFacility: (facility: Facility | null) => void;
  getCurrentFacilityId: () => string | null;
  isLoading: boolean;
  error: string | null;
  refreshFacility: () => Promise<void>;
}

const FacilityContext = createContext<FacilityContextType | undefined>(
  undefined
);

export const FacilityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentFacilityId = () => currentFacility?.id || null;

  const refreshFacility = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the cached facility service instead of direct database calls
      const facilityId = await FacilityService.getCurrentFacilityId();

      // If no facility ID (user not authenticated), use fallback
      if (!facilityId) {
        throw new Error('No facility ID available - user not authenticated');
      }

      const facility = await FacilityService.getFacility(facilityId);

      setCurrentFacility(facility);
      localStorage.setItem('currentFacility', JSON.stringify(facility));
    } catch (err) {
      console.warn(
        '⚠️ Facility context error, using development fallback:',
        err
      );

      // Check if we're in development mode or test environment
      const isDevOrTest =
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test' ||
        (typeof window !== 'undefined' &&
          window.location?.hostname === 'localhost');

      if (isDevOrTest) {
        console.warn('Using dev facility fallback in development/test mode');
        // Fallback to development facility on any error
        const devFacility: Facility = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Development Facility',
          type: 'hospital',
          isActive: true,
        };

        setCurrentFacility(devFacility);
        localStorage.setItem('currentFacility', JSON.stringify(devFacility));
        setError(null); // Clear error since we're using fallback
      } else {
        throw new Error(
          'FacilityContext failed to resolve facility ID — no fallback allowed in production.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Don't try to load facility data on login page
    if (
      typeof window !== 'undefined' &&
      window.location.pathname === '/login'
    ) {
      setIsLoading(false);
      return;
    }

    refreshFacility().catch((error) => {
      // Only set error if we're in a browser environment
      if (typeof window !== 'undefined') {
        setError(error.message);
      }
    });
  }, []);

  return (
    <FacilityContext.Provider
      value={{
        currentFacility,
        setCurrentFacility,
        getCurrentFacilityId,
        isLoading,
        error,
        refreshFacility,
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
};

export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
};
