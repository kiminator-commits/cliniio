export const sendMessage = async (content: string): Promise<string> => {
  // Simulate AI response
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `AI response to: ${content}`;
};
