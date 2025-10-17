import React from 'react';
import { render, screen } from '@testing-library/react';
import ChecklistItem from '@/pages/EnvironmentalClean/components/ui/ChecklistItem';
import { CleaningChecklistItem } from '@/pages/EnvironmentalClean/models';
import { describe, test, expect } from 'vitest';

describe('ChecklistItem', () => {
  const task: CleaningChecklistItem = {
    id: 't1',
    description: 'Test wipe surface',
    isRequired: true,
    isCompleted: false,
  };

  it('renders checklist item with description', () => {
    render(<ChecklistItem item={task} />);
    expect(screen.getByText('Test wipe surface')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders completed checklist item correctly', () => {
    const completedTask = { ...task, isCompleted: true };
    render(<ChecklistItem item={completedTask} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
