export function getEnv(key: string): string | undefined {
  // Check for Vite's import.meta.env
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { __vite__?: { env?: Record<string, string> } }).__vite__?.env?.[key]
  ) {
    return (window as unknown as { __vite__?: { env?: Record<string, string> } }).__vite__!.env![
      key
    ];
  }

  // Check for Node's process.env
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key];
  }

  return undefined;
}
