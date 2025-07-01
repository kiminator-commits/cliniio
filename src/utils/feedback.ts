type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export const dispatchFeedback = (
  message: string,
  type: FeedbackType = 'info',
  context?: string
) => {
  const formatted = `[${type.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}`;
  console.log(formatted);
  // Extend with a toast/snackbar dispatch if integrated
};
