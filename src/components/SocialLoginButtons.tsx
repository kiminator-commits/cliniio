import React from 'react';
import { FaGoogle, FaMicrosoft, FaLinkedin } from 'react-icons/fa6';

const SocialLoginButtons = () => {
  const handleOAuthLogin = (provider: 'google' | 'microsoft' | 'linkedin') => {
    // TODO: Implement OAuth login logic
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <button
          onClick={() => handleOAuthLogin('google')}
          tabIndex={0}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <FaGoogle className="h-6 w-6 text-red-500" />
          <span className="ml-2">Google</span>
        </button>
        <button
          onClick={() => handleOAuthLogin('microsoft')}
          tabIndex={0}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <FaMicrosoft className="h-6 w-6 text-blue-600" />
          <span className="ml-2">Microsoft</span>
        </button>
        <button
          onClick={() => handleOAuthLogin('linkedin')}
          tabIndex={0}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <FaLinkedin className="h-6 w-6 text-blue-600" />
          <span className="ml-2">LinkedIn</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
