export async function getTypedSupabaseAdapter() {
  const module = await import('./TypedSupabaseAdapter');
  return module;
}
