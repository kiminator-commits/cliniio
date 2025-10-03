import { act } from 'react';
import { useEnvironmentalCleanStore } from '@/pages/EnvironmentalClean/store/environmentalCleanStore';
import { RoomStatusType } from '@/pages/EnvironmentalClean/models';

describe('environmentalCleanStore UI functionality', () => {
  beforeEach(() => {
    act(() => {
      useEnvironmentalCleanStore.setState({
        selectedRoom: null,
        selectedStatus: null,
      });
    });
  });

  it('sets selected room and status', () => {
    const testRoom = {
      id: '303',
      name: 'Room 303',
      status: 'clean' as RoomStatusType,
    };
    act(() => {
      useEnvironmentalCleanStore.getState().setSelectedRoom(testRoom);
      useEnvironmentalCleanStore.getState().setSelectedStatus('in_progress');
    });

    expect(useEnvironmentalCleanStore.getState().selectedRoom).toEqual(
      testRoom
    );
    expect(useEnvironmentalCleanStore.getState().selectedStatus).toBe(
      'in_progress'
    );
  });
});
