import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChecklistCategory from '@/pages/EnvironmentalClean/components/ui/ChecklistCategory';
import { CleaningChecklist } from '@/pages/EnvironmentalClean/models';
import { describe, test, expect } from 'vitest';

describe('ChecklistCategory', () => {
  const mockCategory: CleaningChecklist = {
    id: 'cat-1',
    name: 'Test Category',
    items: [
      { id: '1', description: 'Item 1', isRequired: true, isCompleted: false },
      { id: '2', description: 'Item 2', isRequired: true, isCompleted: true },
    ],
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  it('renders the category title and toggles item visibility', () => {
    render(<ChecklistCategory category={mockCategory} />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Test Category'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Test Category'));
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });
});
