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

describe('CourseFilters - Integration', () => {
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

  describe('Edge Cases', () => {
    it('handles empty unique domains array', () => {
      render(<CourseFilters {...defaultProps} uniqueDomains={[]} />);

      const domainFilter = screen.getByDisplayValue('All Domains');
      expect(domainFilter).toBeInTheDocument();

      // Should only have the "All Domains" option
      expect(screen.queryByText('Safety')).not.toBeInTheDocument();
    });

    it('handles empty unique content types array', () => {
      render(<CourseFilters {...defaultProps} uniqueContentTypes={[]} />);

      const contentTypeFilter = screen.getByDisplayValue('All Types');
      expect(contentTypeFilter).toBeInTheDocument();

      // Should only have the "All Types" option
      expect(screen.queryByText('Video')).not.toBeInTheDocument();
    });

    it('handles special characters in domain names', () => {
      const domainsWithSpecialChars = [
        'Safety & Health',
        'Infection-Control',
        'General',
      ];
      render(
        <CourseFilters
          {...defaultProps}
          uniqueDomains={domainsWithSpecialChars}
        />
      );

      expect(screen.getByText('Safety & Health')).toBeInTheDocument();
      expect(screen.getByText('Infection-Control')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('handles special characters in content type names', () => {
      const contentTypesWithSpecialChars = [
        'Video & Audio',
        'Interactive-Quiz',
        'Document',
      ];
      render(
        <CourseFilters
          {...defaultProps}
          uniqueContentTypes={contentTypesWithSpecialChars}
        />
      );

      expect(screen.getByText('Video & Audio')).toBeInTheDocument();
      expect(screen.getByText('Interactive-Quiz')).toBeInTheDocument();
      expect(screen.getByText('Document')).toBeInTheDocument();
    });

    it('handles long domain names', () => {
      const longDomains = ['Very Long Domain Name That Might Break Layout'];
      render(<CourseFilters {...defaultProps} uniqueDomains={longDomains} />);

      expect(
        screen.getByText('Very Long Domain Name That Might Break Layout')
      ).toBeInTheDocument();
    });

    it('handles long content type names', () => {
      const longContentTypes = [
        'Very Long Content Type Name That Might Break Layout',
      ];
      render(
        <CourseFilters
          {...defaultProps}
          uniqueContentTypes={longContentTypes}
        />
      );

      expect(
        screen.getByText('Very Long Content Type Name That Might Break Layout')
      ).toBeInTheDocument();
    });
  });

  describe('Data Integration', () => {
    it('integrates with course tab configuration', () => {
      render(<CourseFilters {...defaultProps} />);

      // Verify that all tabs from courseConfig are rendered
      expect(screen.getByText('Assigned')).toBeInTheDocument();
      expect(screen.getByText('Recommended')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('integrates with unique domains data', () => {
      const customDomains = ['Custom Domain 1', 'Custom Domain 2'];
      render(<CourseFilters {...defaultProps} uniqueDomains={customDomains} />);

      expect(screen.getByText('Custom Domain 1')).toBeInTheDocument();
      expect(screen.getByText('Custom Domain 2')).toBeInTheDocument();
    });

    it('integrates with unique content types data', () => {
      const customContentTypes = ['Custom Type 1', 'Custom Type 2'];
      render(
        <CourseFilters
          {...defaultProps}
          uniqueContentTypes={customContentTypes}
        />
      );

      expect(screen.getByText('Custom Type 1')).toBeInTheDocument();
      expect(screen.getByText('Custom Type 2')).toBeInTheDocument();
    });

    it('maintains state consistency across prop changes', () => {
      const { rerender } = render(<CourseFilters {...defaultProps} />);

      // Change active tab
      rerender(
        <CourseFilters {...defaultProps} activeCourseTab="recommended" />
      );

      const recommendedTab = screen.getByText('Recommended');
      expect(recommendedTab).toHaveClass(
        'border-b-2',
        'border-blue-500',
        'text-blue-600'
      );

      // Change search query
      rerender(<CourseFilters {...defaultProps} searchQuery="test query" />);

      const searchInput = screen.getByPlaceholderText('Search courses...');
      expect(searchInput).toHaveValue('test query');

      // Change selected domain
      rerender(<CourseFilters {...defaultProps} selectedDomain="Safety" />);

      const domainFilter = screen.getByDisplayValue('Safety');
      expect(domainFilter).toBeInTheDocument();

      // Change selected content type
      rerender(<CourseFilters {...defaultProps} selectedContentType="Video" />);

      const contentTypeFilter = screen.getByDisplayValue('Video');
      expect(contentTypeFilter).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('renders all components together correctly', () => {
      render(<CourseFilters {...defaultProps} />);

      // Verify all main components are present
      expect(screen.getByText('Assigned')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Search courses...')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Domains')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
      expect(screen.getAllByTestId('search-icon')).toHaveLength(1);
      expect(screen.getAllByTestId('filter-icon')).toHaveLength(2);
    });

    it('handles multiple filter combinations', () => {
      render(
        <CourseFilters
          {...defaultProps}
          searchQuery="safety"
          selectedDomain="Safety"
          selectedContentType="Video"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search courses...');
      const domainFilter = screen.getByDisplayValue('Safety');
      const contentTypeFilter = screen.getByDisplayValue('Video');

      expect(searchInput).toHaveValue('safety');
      expect(domainFilter).toBeInTheDocument();
      expect(contentTypeFilter).toBeInTheDocument();
    });

    it('handles mixed data types in filters', () => {
      const mixedDomains = ['Safety', '123', 'Domain-With-Numbers'];
      const mixedContentTypes = ['Video', '456', 'Type-With-Special-Chars'];

      render(
        <CourseFilters
          {...defaultProps}
          uniqueDomains={mixedDomains}
          uniqueContentTypes={mixedContentTypes}
        />
      );

      expect(screen.getByText('Safety')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('Domain-With-Numbers')).toBeInTheDocument();
      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(screen.getByText('456')).toBeInTheDocument();
      expect(screen.getByText('Type-With-Special-Chars')).toBeInTheDocument();
    });
  });
});
