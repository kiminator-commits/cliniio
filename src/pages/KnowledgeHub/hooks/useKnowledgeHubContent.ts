import { useKnowledgeHubStore } from '../store/knowledgeHubStore';

export const useKnowledgeHubContent = () => {
  const { selectedCategory, content } = useKnowledgeHubStore();

  return {
    selectedCategory,
    content,
  };
};
