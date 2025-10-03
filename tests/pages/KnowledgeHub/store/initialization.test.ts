import { act } from '@testing-library/react';
import { UserRole } from '@/pages/KnowledgeHub/utils/permissions';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  expectDefaultStoreState,
  expectAdminPermissions,
  mockUser,
} from '../__mocks__/knowledgeHubMocks';

describe('Store Initialization', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderKnowledgeHubStore();

    expectDefaultStoreState(result);
  });

  it('should set current user and update permissions', () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setCurrentUser(mockUser);
    });

    expect(result.current.currentUser).toEqual(mockUser);
    expectAdminPermissions(result);
  });

  it('should handle invalid user role gracefully', () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setCurrentUser({
        id: 'test-user',
        role: 'InvalidRole' as UserRole,
      });
    });

    expect(result.current.currentUser?.role).toBe('User');
    expect(result.current.permissions.canDeleteContent).toBe(false);
  });
});
