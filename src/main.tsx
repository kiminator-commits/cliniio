import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/globals.css';
import './styles/login.css';
import { initializeConsoleControl } from './utils/consoleControl';
import { logger } from './utils/_core/logger';

// Initialize console control for easy logging management
initializeConsoleControl();

// Make logger available globally for console control
if (typeof window !== 'undefined') {
  (window as any).cliniioLogger = logger;
}

// Aggressively unregister all service workers to prevent issues
if ('serviceWorker' in navigator) {
  // Unregister all existing service workers
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered');
    }
  });

  // Also try to unregister the main service worker
  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister();
    console.log('Main service worker unregistered');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
