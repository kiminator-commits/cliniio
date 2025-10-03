import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CourseCard from '@/pages/KnowledgeHub/components/CourseCard';
import { Course } from '@/pages/KnowledgeHub/types';

describe('CourseCard', () => {
  const mockCourse: Course = {
    id: '1',
    title: 'Safety Course',
    description: 'Safety guidelines and procedures',
    domain: 'Safety',
    progress: 0,
    status: 'Not Started',
  };

  const defaultProps = {
    course: mockCourse,
    isCourseDueForRepeat: false,
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CourseCard {...defaultProps} />);
    expect(screen.getByText('Safety Course')).toBeInTheDocument();
  });

  it('displays course title', () => {
    render(<CourseCard {...defaultProps} />);
    expect(screen.getByText('Safety Course')).toBeInTheDocument();
  });

  it('displays course description', () => {
    render(<CourseCard {...defaultProps} />);
    expect(
      screen.getByText('Safety guidelines and procedures')
    ).toBeInTheDocument();
  });

  it('displays due for review indicator when course is due for repeat', () => {
    render(<CourseCard {...defaultProps} isCourseDueForRepeat={true} />);
    expect(screen.getByText('Due for Review')).toBeInTheDocument();
  });

  it('does not display due for review indicator when course is not due for repeat', () => {
    render(<CourseCard {...defaultProps} isCourseDueForRepeat={false} />);
    expect(screen.queryByText('Due for Review')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const mockOnClick = vi.fn();
    render(<CourseCard {...defaultProps} onClick={mockOnClick} />);

    const card = screen.getByText('Safety Course').closest('div');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation on card click', () => {
    const mockOnClick = vi.fn();
    render(<CourseCard {...defaultProps} onClick={mockOnClick} />);

    const card = screen.getByText('Safety Course').closest('div');
    fireEvent.keyDown(card!, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation with space key', () => {
    const mockOnClick = vi.fn();
    render(<CourseCard {...defaultProps} onClick={mockOnClick} />);

    const card = screen.getByText('Safety Course').closest('div');
    fireEvent.keyDown(card!, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles rapid card clicks', () => {
    const mockOnClick = vi.fn();
    render(<CourseCard {...defaultProps} onClick={mockOnClick} />);

    const card = screen.getByText('Safety Course').closest('div');
    fireEvent.click(card!);
    fireEvent.click(card!);
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it('applies correct CSS classes', () => {
    render(<CourseCard {...defaultProps} />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass(
      'p-4',
      'border',
      'rounded-lg',
      'shadow-sm',
      'hover:shadow-md',
      'transition-shadow',
      'cursor-pointer',
      'bg-white'
    );
  });

  it('has correct accessibility attributes', () => {
    render(<CourseCard {...defaultProps} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
