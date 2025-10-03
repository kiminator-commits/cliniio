import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnvironmentalCleanChecklists from '@/pages/EnvironmentalClean/components/EnvironmentalCleanChecklists';
import { EnvironmentalCleanProvider } from '@/pages/EnvironmentalClean/providers/EnvironmentalCleanProvider';
import { useEnvironmentalCleanStore } from '@/pages/EnvironmentalClean/store/environmentalCleanStore';
import { testChecklists } from './__mocks__/environmentalCleanTestData';

// Mock the store
vi.mock('@/pages/EnvironmentalClean/store/environmentalCleanStore');

describe('EnvironmentalCleanChecklists', () => {
  beforeEach(() => {
    // Mock the store implementation with proper type casting
    (useEnvironmentalCleanStore as unknown as vi.Mock).mockImplementation(
      (selector) => {
        const mockState = {
          checklists: testChecklists,
          fetchChecklists: vi.fn(),
        };
        return selector(mockState);
      }
    );
  });

  it('renders checklist section with category titles', () => {
    render(
      <EnvironmentalCleanProvider>
        <EnvironmentalCleanChecklists />
      </EnvironmentalCleanProvider>
    );

    expect(screen.getByText('Cleaning Checklists')).toBeInTheDocument();
    expect(screen.getByText('Daily Cleaning Checklist')).toBeInTheDocument();
    expect(screen.getByText('Terminal Cleaning Checklist')).toBeInTheDocument();
  });
});
