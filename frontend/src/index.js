import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import './i18n/config';
import { registerServiceWorker } from './serviceWorkerRegistration';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Register service worker for PWA
registerServiceWorker();
