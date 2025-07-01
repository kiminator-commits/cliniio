import { render, screen } from '@testing-library/react';
import BiologicalIndicatorTest from '../BiologicalIndicatorTest';

describe('BiologicalIndicatorTest', () => {
  it('renders the component', () => {
    render(<BiologicalIndicatorTest />);

    // Just verify the component renders without crashing
    expect(screen.getByTestId).toBeDefined();
  });
});
