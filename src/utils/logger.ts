export const Logger = {
  log: (message: string, ...optionalParams: unknown[]) => {
    if (import.meta.env.VITE_APP_ENV !== 'production') {
      console.log(message, ...optionalParams);
    }
  },
  error: (message: string, ...optionalParams: unknown[]) => {
    console.error(message, ...optionalParams);
  },
  warn: (message: string, ...optionalParams: unknown[]) => {
    console.warn(message, ...optionalParams);
  },
};
