export const logger = {
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.info('[Cliniio]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.error('[Cliniio]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.warn('[Cliniio]', ...args);
    }
  },
};
