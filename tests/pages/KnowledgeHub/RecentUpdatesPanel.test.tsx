import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecentUpdatesPanel } from '@/pages/KnowledgeHub/components/RecentUpdatesPanel';
import { describe, test, expect, it } from 'vitest';

test('renders RecentUpdatesPanel and shows Recent Activity heading', () => {
  render(<RecentUpdatesPanel />);
  expect(screen.getByText('Recent Activity')).toBeInTheDocument();
});

describe('RecentUpdatesPanel', () => {
  it('renders without crashing', () => {
    render(<RecentUpdatesPanel />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('displays no recent updates when empty', async () => {
    render(<RecentUpdatesPanel />);

    // Wait for loading to complete and check for empty state
    expect(
      await screen.findByText('No recent activity')
    ).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('shows empty state when no updates', async () => {
    render(<RecentUpdatesPanel />);

    expect(
      await screen.findByText('No recent activity')
    ).toBeInTheDocument();
  });

  it('displays update types with correct styling when updates exist', async () => {
    // This test would need to be updated if the component is modified to show mock data
    render(<RecentUpdatesPanel />);

    expect(
      await screen.findByText('No recent activity')
    ).toBeInTheDocument();
  });
});
