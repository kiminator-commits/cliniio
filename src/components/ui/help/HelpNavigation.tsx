import React from 'react';

interface HelpOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}

interface HelpNavigationProps {
  onOptionClick: (option: HelpOption) => void;
}

export const HelpNavigation: React.FC<HelpNavigationProps> = ({
  onOptionClick,
}) => {
  const helpOptions: HelpOption[] = [
    {
      id: 'ai-assistant',
      icon: <span>🤖</span>,
      title: 'AI Assistant',
      description: 'Get AI-powered help and answers',
      action: 'ai-chat',
    },
    {
      id: 'cliniio-help',
      icon: <span>💬</span>,
      title: 'Cliniio Help',
      description: 'General help and support',
      action: 'cliniio-help',
    },
    {
      id: 'context-help',
      icon: <span>📚</span>,
      title: 'Relevant Information',
      description: 'Standards and protocols for your current task',
      action: 'context-help',
    },
    {
      id: 'product-feedback',
      icon: <span>💡</span>,
      title: 'Product Feedback',
      description: 'Report bugs or suggest improvements',
      action: 'product-feedback',
    },
  ];

  return (
    <div className="p-4 space-y-3">
      {helpOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onOptionClick(option)}
          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[#4ECDC4] hover:bg-[#4ECDC4]/5 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-[#4ECDC4] group-hover:text-white transition-colors">
              {option.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 group-hover:text-[#4ECDC4] transition-colors text-sm">
                {option.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
