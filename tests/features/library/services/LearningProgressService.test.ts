import LearningProgressService from '@/services/learningProgressService';

describe('LearningProgressService', () => {
  const service = LearningProgressService.getInstance()!;
  const testId = 'test-item';

  beforeEach(() => {
    localStorage.clear();
  });

  it('should mark an item as inProgress', () => {
    // First add an item to the service
    const testItem = {
      id: testId,
      title: 'Test Item',
      category: 'Test',
      status: 'Not Started' as const,
      description: 'Test description',
      level: 'Beginner',
      duration: '30 min',
      points: 10,
    };
    service.addToMyList(testItem);

    // Now mark it as in progress
    service.markInProgress(testId);
    const status = service.getItemStatus(testId);
    expect(status).toBe('In Progress');
  });

  it('should return notStarted for unknown item', () => {
    expect(service.getItemStatus('unknown')).toBe('Not Started');
  });

  it('should not crash on malformed localStorage data', () => {
    localStorage.setItem('learning-progress', 'not-json');
    expect(() => service.getItemStatus(testId)).not.toThrow();
  });
});
