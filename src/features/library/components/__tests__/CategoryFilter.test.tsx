import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilter from '../CategoryFilter';

describe('CategoryFilter', () => {
  const mockCategories = ['Safety', 'Cleaning', 'HR'];

  it('renders all category buttons', () => {
    const mockOnSelect = jest.fn();
    render(
      <CategoryFilter categories={mockCategories} selectedCategory="All" onSelect={mockOnSelect} />
    );

    mockCategories.forEach(category => {
      expect(screen.getByRole('button', { name: category })).toBeInTheDocument();
    });
  });

  it('calls onSelect when a button is clicked', () => {
    const mockOnSelect = jest.fn();
    render(
      <CategoryFilter categories={mockCategories} selectedCategory="All" onSelect={mockOnSelect} />
    );

    const safetyButton = screen.getByRole('button', { name: 'Safety' });
    fireEvent.click(safetyButton);

    expect(mockOnSelect).toHaveBeenCalledWith('Safety');
  });
});
