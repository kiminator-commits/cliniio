import { useState } from 'react';

export const useAssistantChat = () => {
  const [messages, setMessages] = useState([]);

  return {
    messages,
    setMessages,
  };
};

export default useAssistantChat;
