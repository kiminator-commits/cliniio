import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoomCard from '@/pages/EnvironmentalClean/components/ui/RoomCard';

describe('RoomCard', () => {
  test('renders room name and update button', () => {
    const mockOnUpdateStatus = vi.fn();
    render(
      <RoomCard
        id="room-1"
        status="Dirty"
        name="Room 1"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );
    expect(screen.getByText('Room 1')).toBeInTheDocument();
    expect(screen.getByText('Update Status')).toBeInTheDocument();
  });

  test('calls onUpdateStatus when button is clicked', () => {
    const mockOnUpdateStatus = vi.fn();
    render(
      <RoomCard
        id="room-1"
        status="Dirty"
        name="Room 1"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    const updateButton = screen.getByText('Update Status');
    updateButton.click();

    expect(mockOnUpdateStatus).toHaveBeenCalledWith('room-1');
  });
});
