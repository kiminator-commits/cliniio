import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnvironmentalCleanDashboard from '@/pages/EnvironmentalClean/components/EnvironmentalCleanDashboard';
import { EnvironmentalCleanProvider } from '@/pages/EnvironmentalClean/providers/EnvironmentalCleanProvider';
import { useEnvironmentalCleanStore } from '@/pages/EnvironmentalClean/store/environmentalCleanStore';
import {
  testRooms,
  testChecklists,
  testAnalytics,
} from './__mocks__/environmentalCleanTestData';

// Mock the store
vi.mock('@/pages/EnvironmentalClean/store/environmentalCleanStore');

describe('EnvironmentalCleanDashboard', () => {
  beforeEach(() => {
    // Mock the store implementation with proper type casting
    (useEnvironmentalCleanStore as unknown as vi.Mock).mockImplementation(
      (selector) => {
        const mockState = {
          rooms: testRooms,
          checklists: testChecklists,
          analytics: testAnalytics,
          fetchRooms: vi.fn(),
          fetchChecklists: vi.fn(),
          fetchAnalytics: vi.fn(),
        };
        return selector(mockState);
      }
    );
  });

  it('renders all core dashboard sections', () => {
    render(
      <EnvironmentalCleanProvider>
        <EnvironmentalCleanDashboard />
      </EnvironmentalCleanProvider>
    );

    expect(screen.getByText('Cleaning Analytics')).toBeInTheDocument();
    expect(screen.getByText('Room Status')).toBeInTheDocument();
    expect(screen.getByText('Cleaning Checklists')).toBeInTheDocument();
  });
});
