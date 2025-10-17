import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, test, expect, it } from 'vitest';
import { useCleanup } from '../../src/hooks/useCleanup';

describe('useCleanup', () => {
  it('calls cleanup function on unmount', () => {
    const cleanupMock = vi.fn();

    const TestComponent = () => {
      useCleanup(cleanupMock);
      return <div>Mounted</div>;
    };

    const { unmount } = render(<TestComponent />);
    expect(cleanupMock).not.toHaveBeenCalled();
    unmount();
    expect(cleanupMock).toHaveBeenCalledTimes(1);
  });
});
