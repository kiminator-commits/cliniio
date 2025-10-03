import { createSimplifiedKnowledgeHubProviderMock } from '../../mockRegistry';

// Centralized mock for SimplifiedKnowledgeHubProvider
const providerMock = createSimplifiedKnowledgeHubProviderMock();

export const SimplifiedKnowledgeHubProvider =
  providerMock.SimplifiedKnowledgeHubProvider;
export const useSimplifiedKnowledgeHub = providerMock.useSimplifiedKnowledgeHub;
export default SimplifiedKnowledgeHubProvider;
