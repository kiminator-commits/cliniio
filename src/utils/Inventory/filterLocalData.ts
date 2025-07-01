export function filterLocalData(data: Array<Record<string, unknown>>, searchQuery: string) {
  if (!searchQuery.trim()) return data;

  const queryLower = searchQuery.toLowerCase();

  return data.filter(item =>
    ['item', 'category', 'toolId', 'supplyId', 'equipmentId', 'hardwareId', 'location'].some(
      key =>
        typeof item[key] === 'string' && (item[key] as string).toLowerCase().includes(queryLower)
    )
  );
}
