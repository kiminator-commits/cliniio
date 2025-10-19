import React, { useState } from 'react';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import { FaQuestionCircle, FaRobot, FaPaperPlane } from 'react-icons/fa';
import { UnifiedAIService } from '../../services/ai/UnifiedAIService';

export default function Assistant() {
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await UnifiedAIService.askAI(
        userMessage,
        {
          module: 'ai-assistant',
          facilityId: 'unknown',
          userId: 'unknown'
        }
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
    <SharedLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
            <FaQuestionCircle size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#5b5b5b]">
              Help & Assistant
            </h1>
            <p className="text-gray-500 text-sm">
              AI-powered assistance and support for Cliniio users
            </p>
          </div>
        </div>

        {/* AI Chat Interface */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Cliniio..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FaRobot size={20} className="text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800 mb-1">
                AI Assistant Active
              </h3>
              <p className="text-sm text-green-700">
                Your AI assistant is now connected and ready to help! Ask
                questions about Cliniio features, workflows, or get assistance
                with any clinical management tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
