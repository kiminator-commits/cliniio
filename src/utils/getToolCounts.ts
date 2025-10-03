export interface Tool {
  id: string;
  status?: string; // e.g., 'dirty', 'bath1', 'drying', etc.
  currentPhase?: string; // fallback if status isn't used
}

export interface ToolCounts {
  total: number;
  dirty: number;
  failed: number;
  bath1: number;
  bath2: number;
  drying: number;
  autoclave: number;
  complete: number;
}

export function getToolCounts(tools: Tool[] = []): ToolCounts {
  const counts: ToolCounts = {
    total: tools.length,
    dirty: 0,
    failed: 0,
    bath1: 0,
    bath2: 0,
    drying: 0,
    autoclave: 0,
    complete: 0,
  };

  for (const tool of tools) {
    const phase = tool.status || tool.currentPhase || '';
    if (phase in counts) {
      counts[phase as keyof ToolCounts]++;
    }
  }

  return counts;
}
