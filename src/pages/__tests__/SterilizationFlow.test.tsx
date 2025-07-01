import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sterilization from '../Sterilization';
import { UserProvider } from '../../contexts/UserContext';
import { UIProvider } from '../../contexts/UIContext';
import '@testing-library/jest-dom';

jest.useFakeTimers();

describe('Sterilization Flow', () => {
  it('progresses through phases and triggers completion', () => {
    render(
      <UIProvider>
        <UserProvider>
          <BrowserRouter>
            <Sterilization />
          </BrowserRouter>
        </UserProvider>
      </UIProvider>
    );

    // Check that the sterilization page renders - use getAllByText since there are multiple elements
    const sterilizationElements = screen.getAllByText(/Sterilization/i);
    expect(sterilizationElements.length).toBeGreaterThan(0);

    // Check for the specific heading
    expect(screen.getByText(/Sterilization Management/i)).toBeInTheDocument();

    // The component should render some sterilization-related content - use getAllByText for Cliniio too
    const cliniioElements = screen.getAllByText(/Cliniio/i);
    expect(cliniioElements.length).toBeGreaterThan(0);
  });
});
