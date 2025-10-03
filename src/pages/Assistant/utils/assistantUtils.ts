export const formatMessage = (message: string): string => {
  return message.trim();
};

export const generateId = (): string => {
  return Date.now().toString();
};
