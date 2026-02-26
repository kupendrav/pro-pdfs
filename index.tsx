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

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App onReady={removeLoader} />
  </React.StrictMode>
);