import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock TasksList since it's used in the Home page
jest.mock('@/components/TasksList', () => ({
  __esModule: true,
  default: () => <div data-testid="tasks-list">MockTasksList</div>,
}));

// Mock the pages that are imported in App.tsx
jest.mock('../pages/Login', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page">Login Page</div>,
}));

jest.mock('../pages/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>,
}));

jest.mock('../pages/Sterilization', () => ({
  __esModule: true,
  default: () => <div data-testid="sterilization-page">Sterilization Page</div>,
}));

jest.mock('../pages/Inventory', () => ({
  __esModule: true,
  default: () => <div data-testid="inventory-page">Inventory Page</div>,
}));

jest.mock('../pages/EnvironmentalClean/EnvironmentalCleanPage', () => ({
  __esModule: true,
  default: () => <div data-testid="environmental-clean-page">Environmental Clean Page</div>,
}));

jest.mock('../pages/KnowledgeHub', () => ({
  __esModule: true,
  default: () => <div data-testid="knowledge-hub-page">Knowledge Hub Page</div>,
}));

jest.mock('../pages/Settings', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

jest.mock('../pages/library/page', () => ({
  __esModule: true,
  default: () => <div data-testid="library-page">Library Page</div>,
}));

// Mock the context providers
jest.mock('../contexts/UIContext', () => ({
  UIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ui-provider">{children}</div>
  ),
}));

jest.mock('../contexts/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-provider">{children}</div>
  ),
}));

// Mock ErrorBoundary
jest.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('app-container')).toBeTruthy();
  });
});
