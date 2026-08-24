import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Optional lightweight telemetry initialization
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN) {
  console.log('[TELEMETRY] Sentry monitoring initialized.');
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[UNHANDLED_REJECTION]', event.reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
