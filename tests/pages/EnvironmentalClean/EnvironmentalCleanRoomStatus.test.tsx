import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnvironmentalCleanRoomStatus from '@/pages/EnvironmentalClean/components/EnvironmentalCleanRoomStatus';
import { EnvironmentalCleanProvider } from '@/pages/EnvironmentalClean/providers/EnvironmentalCleanProvider';
import { useEnvironmentalCleanStore } from '@/pages/EnvironmentalClean/store/environmentalCleanStore';
import { testRooms } from './__mocks__/environmentalCleanTestData';

// Mock the store
vi.mock('@/pages/EnvironmentalClean/store/environmentalCleanStore');

describe('EnvironmentalCleanRoomStatus', () => {
  beforeEach(() => {
    // Mock the store implementation with proper type casting
    (useEnvironmentalCleanStore as unknown as vi.Mock).mockImplementation(
      (selector) => {
        const mockState = {
          rooms: testRooms,
          fetchRooms: vi.fn(),
        };
        return selector(mockState);
      }
    );
  });

  it('renders room status section and room cards', () => {
    render(
      <EnvironmentalCleanProvider>
        <EnvironmentalCleanRoomStatus />
      </EnvironmentalCleanProvider>
    );

    expect(screen.getByText('Room Status')).toBeInTheDocument();
    expect(screen.getByText('Operating Room 1')).toBeInTheDocument();
    expect(screen.getByText('Operating Room 2')).toBeInTheDocument();
    expect(screen.getByText('Recovery Room')).toBeInTheDocument();
  });
});
