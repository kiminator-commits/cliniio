import React from 'react';
import { vi, describe, test, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilter from '@/features/library/components/CategoryFilter';

describe('CategoryFilter', () => {
  const mockCategories = ['Safety', 'Cleaning', 'HR'];

  it('renders all category buttons', () => {
    const mockOnSelect = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onSelect={mockOnSelect}
      />
    );

    mockCategories.forEach((category) => {
      expect(
        screen.getByRole('button', { name: category })
      ).toBeInTheDocument();
    });
  });

  it('calls onSelect when a button is clicked', () => {
    const mockOnSelect = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onSelect={mockOnSelect}
      />
    );

    const safetyButton = screen.getByRole('button', { name: 'Safety' });
    fireEvent.click(safetyButton);

    expect(mockOnSelect).toHaveBeenCalledWith('Safety');
  });
});
