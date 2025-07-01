const errorLog: string[] = [];

export const logError = (error: unknown, context?: string) => {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
  const entry = `[${new Date().toISOString()}] ${context || 'General'}: ${message}`;
  errorLog.push(entry);
  console.error(entry);
};

export const getErrorLog = () => [...errorLog];
