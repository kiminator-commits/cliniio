import React from 'react';
import { render, screen } from '@testing-library/react';
import ContentCard from '../ContentCard';

describe('ContentCard', () => {
  const mockItem = {
    id: '123',
    title: 'Test Course',
    category: 'Cleaning',
    description: 'Test description',
    level: 'Beginner',
    duration: '30 min',
    points: 10,
  };

  it('renders content card with title and category', () => {
    render(<ContentCard item={mockItem} status="Not Started" onActionClick={() => {}} />);
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
  });

  it('displays correct button text based on status', () => {
    render(<ContentCard item={mockItem} status="Not Started" onActionClick={() => {}} />);
    expect(screen.getByText('Add to My List')).toBeInTheDocument();
  });
});
