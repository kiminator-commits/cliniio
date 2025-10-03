import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('CourseFilters - Interactions', () => {
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

  describe('Tab Interactions', () => {
    it('calls setActiveCourseTab when tab is clicked', () => {
      const mockSetActiveCourseTab = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setActiveCourseTab={mockSetActiveCourseTab}
        />
      );

      fireEvent.click(screen.getByText('Recommended'));
      expect(mockSetActiveCourseTab).toHaveBeenCalledWith('recommended');
    });

    it('calls setActiveCourseTab when library tab is clicked', () => {
      const mockSetActiveCourseTab = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setActiveCourseTab={mockSetActiveCourseTab}
        />
      );

      fireEvent.click(screen.getByText('Library'));
      expect(mockSetActiveCourseTab).toHaveBeenCalledWith('library');
    });

    it('calls setActiveCourseTab when completed tab is clicked', () => {
      const mockSetActiveCourseTab = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setActiveCourseTab={mockSetActiveCourseTab}
        />
      );

      fireEvent.click(screen.getByText('Completed'));
      expect(mockSetActiveCourseTab).toHaveBeenCalledWith('completed');
    });

    it('calls setActiveCourseTab when assigned tab is clicked', () => {
      const mockSetActiveCourseTab = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setActiveCourseTab={mockSetActiveCourseTab}
        />
      );

      fireEvent.click(screen.getByText('Assigned'));
      expect(mockSetActiveCourseTab).toHaveBeenCalledWith('assigned');
    });

    it('handles rapid tab switching', () => {
      const mockSetActiveCourseTab = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setActiveCourseTab={mockSetActiveCourseTab}
        />
      );

      fireEvent.click(screen.getByText('Recommended'));
      fireEvent.click(screen.getByText('Library'));
      fireEvent.click(screen.getByText('Completed'));

      expect(mockSetActiveCourseTab).toHaveBeenCalledTimes(3);
      expect(mockSetActiveCourseTab).toHaveBeenNthCalledWith(1, 'recommended');
      expect(mockSetActiveCourseTab).toHaveBeenNthCalledWith(2, 'library');
      expect(mockSetActiveCourseTab).toHaveBeenNthCalledWith(3, 'completed');
    });

    it('handles keyboard navigation on tabs', () => {
      const mockSetActiveCourseTab = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setActiveCourseTab={mockSetActiveCourseTab}
        />
      );

      const recommendedTab = screen.getByText('Recommended');
      fireEvent.keyDown(recommendedTab, { key: 'Enter' });

      expect(mockSetActiveCourseTab).toHaveBeenCalledWith('recommended');
    });
  });

  describe('Search Interactions', () => {
    it('calls setSearchQuery when search input changes', () => {
      const mockSetSearchQuery = vi.fn();
      render(
        <CourseFilters {...defaultProps} setSearchQuery={mockSetSearchQuery} />
      );

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'new search' } });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('new search');
    });

    it('handles search input with special characters', () => {
      const mockSetSearchQuery = vi.fn();
      render(
        <CourseFilters {...defaultProps} setSearchQuery={mockSetSearchQuery} />
      );

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, {
        target: { value: 'search with & special chars!' },
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith(
        'search with & special chars!'
      );
    });

    it('handles search input with numbers', () => {
      const mockSetSearchQuery = vi.fn();
      render(
        <CourseFilters {...defaultProps} setSearchQuery={mockSetSearchQuery} />
      );

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'course 123' } });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('course 123');
    });

    it('handles keyboard navigation on search input', () => {
      const mockSetSearchQuery = vi.fn();
      render(
        <CourseFilters {...defaultProps} setSearchQuery={mockSetSearchQuery} />
      );

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      // Should not trigger any action on Enter in search input
      expect(mockSetSearchQuery).not.toHaveBeenCalled();
    });
  });

  describe('Filter Interactions', () => {
    it('calls setSelectedDomain when domain filter changes', () => {
      const mockSetSelectedDomain = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setSelectedDomain={mockSetSelectedDomain}
        />
      );

      const domainFilter = screen.getByDisplayValue('All Domains');
      fireEvent.change(domainFilter, { target: { value: 'Safety' } });

      expect(mockSetSelectedDomain).toHaveBeenCalledWith('Safety');
    });

    it('calls setSelectedContentType when content type filter changes', () => {
      const mockSetSelectedContentType = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setSelectedContentType={mockSetSelectedContentType}
        />
      );

      const contentTypeFilter = screen.getByDisplayValue('All Types');
      fireEvent.change(contentTypeFilter, { target: { value: 'Video' } });

      expect(mockSetSelectedContentType).toHaveBeenCalledWith('Video');
    });

    it('handles rapid filter changes', () => {
      const mockSetSelectedDomain = vi.fn();
      const mockSetSelectedContentType = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setSelectedDomain={mockSetSelectedDomain}
          setSelectedContentType={mockSetSelectedContentType}
        />
      );

      const domainFilter = screen.getByDisplayValue('All Domains');
      const contentTypeFilter = screen.getByDisplayValue('All Types');

      fireEvent.change(domainFilter, { target: { value: 'Safety' } });
      fireEvent.change(contentTypeFilter, { target: { value: 'Video' } });
      fireEvent.change(domainFilter, { target: { value: 'Hygiene' } });

      expect(mockSetSelectedDomain).toHaveBeenCalledTimes(2);
      expect(mockSetSelectedContentType).toHaveBeenCalledTimes(1);
    });

    it('handles domain filter with empty string value', () => {
      const mockSetSelectedDomain = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setSelectedDomain={mockSetSelectedDomain}
        />
      );

      const domainFilter = screen.getByDisplayValue('All Domains');
      fireEvent.change(domainFilter, { target: { value: '' } });

      expect(mockSetSelectedDomain).toHaveBeenCalledWith('');
    });

    it('handles content type filter with empty string value', () => {
      const mockSetSelectedContentType = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setSelectedContentType={mockSetSelectedContentType}
        />
      );

      const contentTypeFilter = screen.getByDisplayValue('All Types');
      fireEvent.change(contentTypeFilter, { target: { value: '' } });

      expect(mockSetSelectedContentType).toHaveBeenCalledWith('');
    });

    it('handles keyboard navigation on filters', () => {
      const mockSetSelectedDomain = vi.fn();
      render(
        <CourseFilters
          {...defaultProps}
          setSelectedDomain={mockSetSelectedDomain}
        />
      );

      const domainFilter = screen.getByDisplayValue('All Domains');
      fireEvent.keyDown(domainFilter, { key: 'Enter' });

      // Should not trigger any action on Enter in select
      expect(mockSetSelectedDomain).not.toHaveBeenCalled();
    });
  });
});
