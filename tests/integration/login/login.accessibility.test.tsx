import { screen, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from '../../utils/renderWithProviders';
import LoginPage from '@/pages/Login';
import { describe, test, expect, it } from 'vitest';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Login Page Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(<LoginPage />);
      container = result.container;
    });
    const results = await axe(container!);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading structure', async () => {
    await act(async () => {
      renderWithProviders(<LoginPage />);
    });
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should have proper form labels', async () => {
    await act(async () => {
      renderWithProviders(<LoginPage />);
    });
    const emailLabel = screen.getByLabelText(/email/i);
    const passwordLabel = screen.getByLabelText(/password/i);
    expect(emailLabel).toBeInTheDocument();
    expect(passwordLabel).toBeInTheDocument();
  });
});
