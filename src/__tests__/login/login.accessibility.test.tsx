import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UIProvider } from '../../contexts/UIContext';
import LoginPage from '../../pages/Login';

expect.extend(toHaveNoViolations);

describe('Login Page Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <UIProvider>
          <LoginPage />
        </UIProvider>
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading structure', () => {
    render(
      <MemoryRouter>
        <UIProvider>
          <LoginPage />
        </UIProvider>
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should have proper form labels', () => {
    render(
      <MemoryRouter>
        <UIProvider>
          <LoginPage />
        </UIProvider>
      </MemoryRouter>
    );
    const emailLabel = screen.getByLabelText(/email/i);
    const passwordLabel = screen.getByLabelText(/password/i);
    expect(emailLabel).toBeInTheDocument();
    expect(passwordLabel).toBeInTheDocument();
  });
});
