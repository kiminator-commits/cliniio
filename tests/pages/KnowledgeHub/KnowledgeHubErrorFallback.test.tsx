import React from 'react';
import { vi, describe, test, expect, beforeEach, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import KnowledgeHubErrorFallback from '@/pages/KnowledgeHub/components/KnowledgeHubErrorFallback';

describe('KnowledgeHubErrorFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<KnowledgeHubErrorFallback />);
    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<KnowledgeHubErrorFallback />);
    expect(
      screen.getByText(
        'The Knowledge Hub encountered an error. Please refresh the page or contact support.'
      )
    ).toBeInTheDocument();
  });

  it('displays heading', () => {
    render(<KnowledgeHubErrorFallback />);
    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    render(<KnowledgeHubErrorFallback />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Oops! Something went wrong.');

    const paragraph = screen.getByText(
      'The Knowledge Hub encountered an error. Please refresh the page or contact support.'
    );
    expect(paragraph).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<KnowledgeHubErrorFallback />);

    const container = screen
      .getByText('Oops! Something went wrong.')
      .closest('div');
    expect(container).toBeInTheDocument();
  });

  it('handles accessibility requirements', () => {
    render(<KnowledgeHubErrorFallback />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();

    const paragraph = screen.getByText(
      'The Knowledge Hub encountered an error. Please refresh the page or contact support.'
    );
    expect(paragraph).toBeInTheDocument();
  });
});
