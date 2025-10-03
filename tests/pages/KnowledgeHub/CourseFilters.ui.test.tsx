import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CourseFilters from '@/pages/KnowledgeHub/components/CourseFilters';

// Mock the courseConfig module
vi.mock('@/pages/KnowledgeHub/config/courseConfig', () => ({
  COURSE_TABS: [
    { id: 'assigned', label: 'Assigned' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'library', label: 'Library' },
    { id: 'completed', label: 'Completed' },
  ],
}));

// Mock the lucide-react icons since they're not installed
vi.mock('lucide-react', () => ({
  Search: ({ className }: { className?: string }) => (
    <div data-testid="search-icon" className={className} />
  ),
  Filter: ({ className }: { className?: string }) => (
    <div data-testid="filter-icon" className={className} />
  ),
}));

describe('CourseFilters - UI', () => {
  const defaultProps = {
    activeCourseTab: 'assigned',
    setActiveCourseTab: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    selectedDomain: '',
    setSelectedDomain: vi.fn(),
    selectedContentType: '',
    setSelectedContentType: vi.fn(),
    uniqueDomains: ['Safety', 'Hygiene', 'General'],
    uniqueContentTypes: ['Video', 'Interactive', 'Document'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CourseFilters {...defaultProps} />);
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays all tabs correctly', () => {
    render(<CourseFilters {...defaultProps} />);

    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    render(<CourseFilters {...defaultProps} activeCourseTab="recommended" />);

    const recommendedTab = screen.getByText('Recommended');
    expect(recommendedTab).toHaveClass(
      'border-b-2',
      'border-blue-500',
      'text-blue-600'
    );
  });

  it('renders search input with correct placeholder', () => {
    render(<CourseFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search courses...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('displays search query value', () => {
    render(<CourseFilters {...defaultProps} searchQuery="safety" />);

    const searchInput = screen.getByPlaceholderText('Search courses...');
    expect(searchInput).toHaveValue('safety');
  });

  it('renders domain filter with correct options', () => {
    render(<CourseFilters {...defaultProps} />);

    const domainFilter = screen.getByDisplayValue('All Domains');
    expect(domainFilter).toBeInTheDocument();

    // Check that all domains are present
    expect(screen.getByText('Safety')).toBeInTheDocument();
    expect(screen.getByText('Hygiene')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('displays selected domain value', () => {
    render(<CourseFilters {...defaultProps} selectedDomain="Safety" />);

    const domainFilter = screen.getByDisplayValue('Safety');
    expect(domainFilter).toBeInTheDocument();
  });

  it('renders content type filter with correct options', () => {
    render(<CourseFilters {...defaultProps} />);

    const contentTypeFilter = screen.getByDisplayValue('All Types');
    expect(contentTypeFilter).toBeInTheDocument();

    // Check that all content types are present
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Interactive')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
  });

  it('displays selected content type value', () => {
    render(<CourseFilters {...defaultProps} selectedContentType="Video" />);

    const contentTypeFilter = screen.getByDisplayValue('Video');
    expect(contentTypeFilter).toBeInTheDocument();
  });

  it('renders search and filter icons', () => {
    render(<CourseFilters {...defaultProps} />);

    expect(screen.getAllByTestId('search-icon')).toHaveLength(1);
    expect(screen.getAllByTestId('filter-icon')).toHaveLength(2); // One for each filter
  });

  it('applies correct CSS classes for active tab', () => {
    render(<CourseFilters {...defaultProps} activeCourseTab="assigned" />);

    const assignedTab = screen.getByText('Assigned');
    expect(assignedTab).toHaveClass(
      'border-b-2',
      'border-blue-500',
      'text-blue-600'
    );

    const recommendedTab = screen.getByText('Recommended');
    expect(recommendedTab).toHaveClass('text-gray-500', 'hover:text-gray-700');
  });

  it('applies correct CSS classes for inactive tabs', () => {
    render(<CourseFilters {...defaultProps} activeCourseTab="assigned" />);

    const recommendedTab = screen.getByText('Recommended');
    expect(recommendedTab).toHaveClass('text-gray-500', 'hover:text-gray-700');
    expect(recommendedTab).not.toHaveClass(
      'border-b-2',
      'border-blue-500',
      'text-blue-600'
    );
  });

  it('applies correct CSS classes to search input', () => {
    render(<CourseFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search courses...');
    expect(searchInput).toHaveClass(
      'w-full',
      'rounded-lg',
      'border',
      'border-gray-300',
      'py-2',
      'pl-10',
      'pr-4',
      'text-sm',
      'focus:border-blue-500',
      'focus:outline-none',
      'focus:ring-1',
      'focus:ring-blue-500'
    );
  });

  it('applies correct CSS classes to filter selects', () => {
    render(<CourseFilters {...defaultProps} />);

    const domainFilter = screen.getByDisplayValue('All Domains');
    expect(domainFilter).toHaveClass(
      'w-full',
      'rounded-lg',
      'border',
      'border-gray-300',
      'py-2',
      'pl-10',
      'pr-4',
      'text-sm',
      'focus:border-blue-500',
      'focus:outline-none',
      'focus:ring-1',
      'focus:ring-blue-500'
    );
  });
});
