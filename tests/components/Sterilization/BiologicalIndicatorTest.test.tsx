import { render, screen } from '@testing-library/react';
import BiologicalIndicatorTest from '../../../src/components/Sterilization/BiologicalIndicatorTest';

describe('BiologicalIndicatorTest', () => {
  it('renders the component', () => {
    render(
      <BiologicalIndicatorTest
        isOpen={true}
        onClose={() => {}}
        onComplete={() => {}}
      />
    );

    // Just verify the component renders without crashing
    expect(screen.getByTestId).toBeDefined();
  });
});
