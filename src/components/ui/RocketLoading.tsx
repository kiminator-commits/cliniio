import React from 'react';

interface RocketLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const RocketLoading: React.FC<RocketLoadingProps> = ({
  size = 'lg',
  message = 'Data Compilation In Progress...',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* Rocket Ship Animation */}
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-bounce`}>
          <div className="text-6xl">🚀</div>
        </div>
        {/* Trail effect */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-8 bg-gradient-to-t from-orange-400 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-2">
        <h3 className={`font-semibold text-gray-700 ${textSizeClasses[size]}`}>
          {message}
        </h3>
        <p className="text-sm text-gray-500 animate-pulse">
          Preparing your dashboard for takeoff...
        </p>
      </div>

      {/* Loading Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  );
};

export default RocketLoading;
