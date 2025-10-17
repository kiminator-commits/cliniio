import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnvironmentalCleanHeader from '../../../src/components/EnvironmentalCleaning/EnvironmentalCleaningHeader';

// Mock the constants
vi.mock('../../../src/constants/homeUiConstants', () => ({
  HOME_UI_CONSTANTS: {
    NAV_BAR_MARGIN_LEFT_DRAWER_OPEN: '250px',
    NAV_BAR_MARGIN_LEFT_DRAWER_CLOSED: '0px',
  },
}));

vi.mock('../../../src/pages/Home/constants/homeConstants', () => ({
  HOME_SECTION_TITLES: {
    CLEANING: 'Environmental Cleaning',
  },
}));

describe('EnvironmentalCleanHeader', () => {
  it('renders the component with correct title', () => {
    render(<EnvironmentalCleanHeader isDrawerOpen={false} />);

    expect(screen.getByText('Environmental Cleaning')).toBeInTheDocument();
  });

  it('applies correct margin when drawer is closed', () => {
    const { container } = render(
      <EnvironmentalCleanHeader isDrawerOpen={false} />
    );

    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveStyle({ marginLeft: '0px' });
  });

  it('applies correct margin when drawer is open', () => {
    const { container } = render(
      <EnvironmentalCleanHeader isDrawerOpen={true} />
    );

    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveStyle({ marginLeft: '250px' });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <EnvironmentalCleanHeader isDrawerOpen={false} />
    );

    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveClass(
      'fixed',
      'top-0',
      'left-0',
      'w-full',
      'z-30',
      'transition-all',
      'duration-300',
      'bg-white',
      'shadow-md'
    );
  });

  it('renders header content with correct structure', () => {
    const { container } = render(
      <EnvironmentalCleanHeader isDrawerOpen={false} />
    );

    const headerElement = container.firstChild as HTMLElement;
    const contentDiv = headerElement.querySelector('div');

    expect(contentDiv).toHaveClass(
      'flex',
      'items-center',
      'justify-between',
      'px-6',
      'py-4'
    );

    const titleElement = contentDiv?.querySelector('h1');
    expect(titleElement).toHaveClass('text-2xl', 'font-bold', 'text-gray-800');
    expect(titleElement).toHaveTextContent('Environmental Cleaning');
  });

  it('handles drawer state changes correctly', () => {
    const { rerender, container } = render(
      <EnvironmentalCleanHeader isDrawerOpen={false} />
    );

    let headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveStyle({ marginLeft: '0px' });

    rerender(<EnvironmentalCleanHeader isDrawerOpen={true} />);

    headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveStyle({ marginLeft: '250px' });
  });

  it('maintains consistent styling across different drawer states', () => {
    const { rerender, container } = render(
      <EnvironmentalCleanHeader isDrawerOpen={false} />
    );

    const initialClasses = (container.firstChild as HTMLElement).className;

    rerender(<EnvironmentalCleanHeader isDrawerOpen={true} />);

    const updatedClasses = (container.firstChild as HTMLElement).className;

    // Should maintain all classes except marginLeft
    expect(updatedClasses).toBe(initialClasses);
  });
});
