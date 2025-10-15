import React, { useState } from 'react';
import { UnifiedAIService } from '@/services/ai/UnifiedAIService';
import { useAIGuardrails } from '@/hooks/useAIGuardrails';

interface AIChatProps {
  currentContext: string;
  onBack: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ currentContext, onBack }) => {
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([
    {
      role: 'assistant',
      content:
        "Hello! I'm your Cliniio AI assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { checkQuestionRelevance, getRedirectMessage } = useAIGuardrails();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // AI Guardrails - Check if question is relevant to current context
    const isRelevantQuestion = checkQuestionRelevance(
      userMessage,
      currentContext
    );

    if (!isRelevantQuestion) {
      const redirectMessage = getRedirectMessage(currentContext, userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: redirectMessage },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await UnifiedAIService.askAI(
        userMessage,
        `User is on ${currentContext} page and asking for help. Only answer questions related to ${currentContext}.`
      );

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">
              Ask me anything about Cliniio
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-hide">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-[#4ECDC4] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
