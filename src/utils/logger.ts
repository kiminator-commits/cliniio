export const logger = {
  info: (...args: unknown[]) => console.info('[Cliniio]', ...args),
  error: (...args: unknown[]) => console.error('[Cliniio]', ...args),
  warn: (...args: unknown[]) => console.warn('[Cliniio]', ...args),
  debug: (...args: unknown[]) => console.debug('[Cliniio]', ...args),
};
