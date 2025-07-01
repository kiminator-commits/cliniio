module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^react-error-boundary$': '<rootDir>/src/__mocks__/react-error-boundary.tsx',
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  globals: {
    'import.meta': {
      env: {
        VITE_SUPABASE_URL: 'https://psqwgebhxfuzqqgdzcmm.supabase.co',
        VITE_SUPABASE_ANON_KEY:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcXdnZWJoeGZ1enFxZ2R6Y21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODAzNDIsImV4cCI6MjA2NDI1NjM0Mn0.fIXLOK-TsgDtFo4Y483v4xVUH8msaESJm8_2rLw5sys',
      },
    },
  },
  transformIgnorePatterns: ['/node_modules/(?!(util|react-error-boundary)/)'],
};
