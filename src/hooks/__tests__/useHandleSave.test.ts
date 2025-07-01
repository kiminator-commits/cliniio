import { renderHook } from '@testing-library/react';
import { useHandleSave } from '../useHandleSave';

describe('useHandleSave', () => {
  it('returns a handleSave function', () => {
    const { result } = renderHook(() =>
      useHandleSave({
        formData: { id: '123', itemName: 'Test Item', category: 'Tools' },
        setFormData: jest.fn(),
        closeModal: jest.fn(),
        isEditMode: false,
      })
    );

    expect(typeof result.current.handleSave).toBe('function');
  });
});
