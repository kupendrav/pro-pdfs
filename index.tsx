import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Remove loading screen after React mounts
const removeLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
  }
};

// Show error if app fails to load
const showError = (error: Error) => {
  const loader = document.getElementById('app-loader');
  if (loader) loader.remove();
  
  rootElement.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;text-align:center;font-family:system-ui,sans-serif;">
      <h1 style="color:#dc2626;margin-bottom:16px;">Failed to load application</h1>
      <p style="color:#666;margin-bottom:8px;">${error.message}</p>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px;max-width:100%;overflow:auto;font-size:12px;color:#333;">${error.stack || ''}</pre>
    </div>
  `;
};

// Safety timeout - if React doesn't render within 10 seconds, something is wrong
setTimeout(() => {
  const loader = document.getElementById('app-loader');
  if (loader && loader.style.opacity !== '0') {
    console.error('App failed to load within timeout period');
    removeLoader();
  }
}, 10000);

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App onReady={removeLoader} />
    </React.StrictMode>
  );
} catch (error) {
  showError(error instanceof Error ? error : new Error(String(error)));
}