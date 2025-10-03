import React from 'react';
import { FaCheck } from 'react-icons/fa';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  level: string;
  score: number;
  color: string;
  bgColor: string;
  barColor: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  // Enhanced password strength calculation
  const calculatePasswordStrength = (password: string): StrengthResult => {
    let score = 0;
    const criteria = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noRepeating: !/(.)\1{2,}/.test(password),
      noSequential:
        !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
          password
        ),
    };

    // Calculate score
    if (criteria.length) score += 2;
    if (criteria.lowercase) score += 1;
    if (criteria.uppercase) score += 1;
    if (criteria.numbers) score += 1;
    if (criteria.symbols) score += 1;
    if (criteria.noRepeating) score += 1;
    if (criteria.noSequential) score += 1;

    // Bonus for longer passwords
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Determine strength level
    if (score >= 8)
      return {
        level: 'Excellent',
        score,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
        barColor: 'bg-emerald-500',
      };
    if (score >= 6)
      return {
        level: 'Strong',
        score,
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        barColor: 'bg-green-500',
      };
    if (score >= 4)
      return {
        level: 'Good',
        score,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        barColor: 'bg-yellow-500',
      };
    if (score >= 2)
      return {
        level: 'Fair',
        score,
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        barColor: 'bg-orange-500',
      };
    return {
      level: 'Weak',
      score,
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      barColor: 'bg-red-500',
    };
  };

  const strength = calculatePasswordStrength(password);
  const maxScore = 10;

  if (password.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Password Strength
        </span>
        <span className={`text-sm font-semibold ${strength.color}`}>
          {strength.level}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${strength.barColor}`}
          style={{ width: `${(strength.score / maxScore) * 100}%` }}
        ></div>
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <span>
          Score: {strength.score}/{maxScore}
        </span>
        <span className={strength.color}>
          {Math.round((strength.score / maxScore) * 100)}%
        </span>
      </div>

      {/* Criteria Checklist */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {password.length >= 8 ? (
            <FaCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          )}
          <span
            className={`text-xs ${password.length >= 8 ? 'text-green-700' : 'text-gray-500'}`}
          >
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/[a-z]/.test(password) ? (
            <FaCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          )}
          <span
            className={`text-xs ${/[a-z]/.test(password) ? 'text-green-700' : 'text-gray-500'}`}
          >
            Lowercase letter
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/[A-Z]/.test(password) ? (
            <FaCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          )}
          <span
            className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-700' : 'text-gray-500'}`}
          >
            Uppercase letter
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/\d/.test(password) ? (
            <FaCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          )}
          <span
            className={`text-xs ${/\d/.test(password) ? 'text-green-700' : 'text-gray-500'}`}
          >
            Number
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
            <FaCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          )}
          <span
            className={`text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-700' : 'text-gray-500'}`}
          >
            Special character
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {password.length >= 12 ? (
            <FaCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          )}
          <span
            className={`text-xs ${password.length >= 12 ? 'text-green-700' : 'text-gray-500'}`}
          >
            At least 12 characters (bonus)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {!/(.)\1{2,}/.test(password) ? (
            <FaCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          )}
          <span
            className={`text-xs ${!/(.)\1{2,}/.test(password) ? 'text-green-700' : 'text-gray-500'}`}
          >
            No repeating characters
          </span>
        </div>
      </div>

      {/* Strength Tips */}
      {strength.score < 6 && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <div className="flex items-start space-x-2">
            <svg
              className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <strong>Tip:</strong> Try adding uppercase letters, numbers, and
              special characters to make your password stronger.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
