import React from 'react';
import { evaluatePasswordStrength } from '@/utils/securityUtils';

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showSuggestions = true,
  className = '',
}) => {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very_weak':
        return 'bg-red-500';
      case 'weak':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-blue-500';
      case 'very_strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'very_weak':
        return 'Very Weak';
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      case 'very_strong':
        return 'Very Strong';
      default:
        return 'Unknown';
    }
  };

  const getStrengthWidth = (score: number) => {
    // Ensure the width never exceeds 100% and has a hard stop
    const percentage = Math.min((score / 5) * 100, 100);
    return `${percentage}%`;
  };

  return (
    <div className={`space-y-1 w-full -mr-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-1 w-full">
        <div className="flex justify-between text-xs w-full">
          <span className="text-gray-600">Strength:</span>
          <span
            className={`font-medium ${
              strength.strength === 'very_weak' || strength.strength === 'weak'
                ? 'text-red-600'
                : strength.strength === 'medium'
                  ? 'text-yellow-600'
                  : 'text-green-600'
            }`}
          >
            {getStrengthText(strength.strength)}
          </span>
        </div>

        <div className="bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor(strength.strength)}`}
            style={{ width: getStrengthWidth(strength.score) }}
          />
        </div>

        <div className="text-xs text-gray-500">Score: {strength.score}/5</div>
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <div className="space-y-0.5 w-full">
          {strength.feedback.map((item, index) => (
            <div
              key={index}
              className="text-xs text-gray-700 break-words leading-tight pr-1"
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && strength.suggestions.length > 0 && (
        <div className="space-y-0.5 w-full">
          <div className="text-xs font-medium text-gray-700">Suggestions:</div>
          {strength.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="text-xs text-gray-600 flex items-start break-words leading-tight pr-1"
            >
              <span className="text-blue-500 mr-1 flex-shrink-0">•</span>
              <span className="min-w-0">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
