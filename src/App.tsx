import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Login from './pages/Login';
import Home from './pages/Home';
import Sterilization from './pages/Sterilization';
import Inventory from './pages/Inventory';
import EnvironmentalClean from './pages/EnvironmentalClean/EnvironmentalCleanPage';
import KnowledgeHub from './pages/KnowledgeHub';
import Settings from './pages/Settings';
import LibraryPage from './pages/library/page';
import { UIProvider } from './contexts/UIContext';
import { UserProvider } from './contexts/UserContext';

function AppContainer() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  return (
    <div
      data-testid="app-container"
      className={
        isLogin
          ? 'min-h-screen bg-background'
          : 'min-h-screen bg-gradient-to-br from-blue-50 to-teal-50'
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sterilization" element={<Sterilization />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/environmental-clean" element={<EnvironmentalClean />} />
        <Route path="/knowledge-hub" element={<KnowledgeHub />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <UIProvider>
        <UserProvider>
          <Router>
            <AppContainer />
          </Router>
        </UserProvider>
      </UIProvider>
    </ErrorBoundary>
  );
}

export default App;
