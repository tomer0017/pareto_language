import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.js';
import './app/styles.css';
// Tablet & desktop presentation — every rule is min-width ≥ 768px, so phones are untouched.
import './app/responsive.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root missing');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
