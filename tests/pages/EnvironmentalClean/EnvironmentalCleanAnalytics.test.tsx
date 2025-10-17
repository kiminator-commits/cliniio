import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnvironmentalCleanAnalytics from '@/pages/EnvironmentalClean/components/EnvironmentalCleanAnalytics';
import { EnvironmentalCleanProvider } from '@/pages/EnvironmentalClean/providers/EnvironmentalCleanProvider';
import { useEnvironmentalCleanStore } from '@/pages/EnvironmentalClean/store/environmentalCleanStore';
import { testAnalytics } from './__mocks__/environmentalCleanTestData';

// Mock the store
vi.mock('@/pages/EnvironmentalClean/store/environmentalCleanStore');

describe('EnvironmentalCleanAnalytics', () => {
  beforeEach(() => {
    // Mock the store implementation with proper type casting
    (useEnvironmentalCleanStore as unknown as vi.Mock).mockImplementation(
      (selector) => {
        const mockState = {
          analytics: testAnalytics,
          fetchAnalytics: vi.fn(),
        };
        return selector(mockState);
      }
    );
  });

  it('displays analytics data correctly', () => {
    render(
      <EnvironmentalCleanProvider>
        <EnvironmentalCleanAnalytics />
      </EnvironmentalCleanProvider>
    );

    expect(screen.getByText('Cleaning Analytics')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // cleanRooms
    expect(screen.getByText('1')).toBeInTheDocument(); // dirtyRooms
    expect(screen.getByText('3')).toBeInTheDocument(); // totalRooms
    expect(screen.getByText('85%')).toBeInTheDocument(); // cleaningEfficiency
  });
});
