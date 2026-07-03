import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.jsx';
import { installObservability } from './lib/observability.js';

installObservability();

registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new Event('world-flags-update-ready'));
  },
});

const root = createRoot(document.getElementById('root'));
root.render(<App />);
