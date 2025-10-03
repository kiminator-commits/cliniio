import React from 'react';
import { render, screen } from '@testing-library/react';
import RoomStatusCard from '@/pages/EnvironmentalClean/components/ui/RoomStatusCard';
import { Room } from '@/pages/EnvironmentalClean/models';

describe('RoomStatusCard', () => {
  const room: Room = {
    id: '201',
    name: 'Room 201',
    status: 'dirty',
  };

  it('displays room name and status', () => {
    render(<RoomStatusCard room={room} />);
    expect(screen.getByText('Room 201')).toBeInTheDocument();
    expect(screen.getByText('dirty')).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });
});
