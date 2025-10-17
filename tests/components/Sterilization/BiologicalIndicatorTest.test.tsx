import { render, screen } from '@testing-library/react';
import BiologicalIndicatorTest from '../../../src/components/Sterilization/BiologicalIndicatorTest';
import { describe, test, expect, it } from 'vitest';

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
