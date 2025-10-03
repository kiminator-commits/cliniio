export async function getSupabaseAdapter() {
  const module = await import('./SupabaseAdapter');
  return module;
}
