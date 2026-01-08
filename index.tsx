
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './src/App';

console.log('[Index] Script Execution Start');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('[Index] Root element found, creating root');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('[Index] Render method called');
