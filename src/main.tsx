import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './serviceWorkerRegistration';

// Register service worker for offline caching & PWA compliance
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
