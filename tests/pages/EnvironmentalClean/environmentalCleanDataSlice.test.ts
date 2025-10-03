import { act } from 'react';
import { useEnvironmentalCleanStore } from '@/pages/EnvironmentalClean/store/environmentalCleanStore';
import {
  testRooms,
  testAnalytics,
  testChecklists,
} from './__mocks__/environmentalCleanTestData';

describe('environmentalCleanStore data functionality', () => {
  beforeEach(() => {
    act(() => {
      useEnvironmentalCleanStore.setState({
        rooms: [],
        checklists: [],
        analytics: {
          totalRooms: 0,
          cleanRooms: 0,
          dirtyRooms: 0,
          inProgressRooms: 0,
          cleaningEfficiency: 0,
          averageCleaningTime: 0,
          lastUpdated: '',
        },
        isLoading: false,
        error: null,
      });
    });
  });

  it('setRooms populates store with test rooms', () => {
    act(() => {
      useEnvironmentalCleanStore.getState().setRooms(testRooms);
    });

    expect(useEnvironmentalCleanStore.getState().rooms).toEqual(testRooms);
    expect(useEnvironmentalCleanStore.getState().isLoading).toBe(false);
  });

  it('setChecklists populates store with test checklists', () => {
    act(() => {
      useEnvironmentalCleanStore.getState().setChecklists(testChecklists);
    });

    expect(useEnvironmentalCleanStore.getState().checklists).toEqual(
      testChecklists
    );
    expect(useEnvironmentalCleanStore.getState().isLoading).toBe(false);
  });

  it('setAnalytics populates store with test analytics', () => {
    act(() => {
      useEnvironmentalCleanStore.getState().setAnalytics(testAnalytics);
    });

    expect(useEnvironmentalCleanStore.getState().analytics).toMatchObject({
      totalRooms: testAnalytics.totalRooms,
      cleanRooms: testAnalytics.cleanRooms,
    });
    expect(useEnvironmentalCleanStore.getState().isLoading).toBe(false);
  });

  it('loading state is managed correctly', () => {
    act(() => {
      useEnvironmentalCleanStore.getState().setLoading(true);
    });

    expect(useEnvironmentalCleanStore.getState().isLoading).toBe(true);

    act(() => {
      useEnvironmentalCleanStore.getState().setLoading(false);
    });

    expect(useEnvironmentalCleanStore.getState().isLoading).toBe(false);
  });

  it('error state is managed correctly', () => {
    const testError = 'Test error message';

    act(() => {
      useEnvironmentalCleanStore.getState().setError(testError);
    });

    expect(useEnvironmentalCleanStore.getState().error).toBe(testError);

    act(() => {
      useEnvironmentalCleanStore.getState().setError(null);
    });

    expect(useEnvironmentalCleanStore.getState().error).toBeNull();
  });
});
