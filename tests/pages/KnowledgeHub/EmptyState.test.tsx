import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/pages/KnowledgeHub/components/EmptyState';

describe('EmptyState', () => {
  it('renders without crashing', () => {
    render(<EmptyState selectedCategory="" />);
    expect(
      screen.getByText('Select a category to view content.')
    ).toBeInTheDocument();
  });

  it('shows correct message when no category is selected', () => {
    render(<EmptyState selectedCategory="" />);
    expect(
      screen.getByText('Select a category to view content.')
    ).toBeInTheDocument();
  });

  it('shows correct message when category is selected but empty', () => {
    render(<EmptyState selectedCategory="Courses" />);
    expect(
      screen.getByText('No content available in this category.')
    ).toBeInTheDocument();
  });

  it('displays table headers for Courses category', () => {
    render(<EmptyState selectedCategory="Courses" />);
    expect(screen.getByText('Course Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('displays table headers for Learning Pathways category', () => {
    render(<EmptyState selectedCategory="Learning Pathways" />);
    expect(screen.getByText('Pathway Name')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('displays table headers for Procedures category', () => {
    render(<EmptyState selectedCategory="Procedures" />);
    expect(screen.getByText('Procedure Name')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('displays table headers for Policies category', () => {
    render(<EmptyState selectedCategory="Policies" />);
    expect(screen.getByText('Policy Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('displays default headers for unknown category', () => {
    render(<EmptyState selectedCategory="Unknown" />);
    expect(screen.getByText('Content Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});

test('renders EmptyState with no category', () => {
  render(<EmptyState selectedCategory="" />);
  expect(
    screen.getByText('Select a category to view content.')
  ).toBeInTheDocument();
});
