export const ErrorTracker = {
  capture: (error: Error, context: string = '') => {
    // Placeholder for future error tracking integration (e.g. Sentry)
    console.error('Captured error:', { error, context });
  },
};
