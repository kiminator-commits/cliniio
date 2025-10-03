import { act } from '@testing-library/react';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  expectAdminPermissions,
  expectStudentPermissions,
  expectNursePermissions,
} from '../__mocks__/knowledgeHubMocks';

describe('Permission Checks', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
  });

  it('should provide correct permissions for Administrator', () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setCurrentUser({
        id: 'admin',
        role: 'Administrator',
      });
    });

    expectAdminPermissions(result);
  });

  it('should provide correct permissions for Student', () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setCurrentUser({
        id: 'student',
        role: 'Student',
      });
    });

    expectStudentPermissions(result);
  });

  it('should provide correct permissions for Nurse', () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setCurrentUser({
        id: 'nurse',
        role: 'Nurse',
      });
    });

    expectNursePermissions(result);
  });
});
