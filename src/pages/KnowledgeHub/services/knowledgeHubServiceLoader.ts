export async function getKnowledgeHubService() {
  const module = await import('./knowledgeHubSupabaseService');
  return module;
}
