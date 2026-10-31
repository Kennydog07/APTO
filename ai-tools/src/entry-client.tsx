import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { RouterProvider } from './lib/router';
import './index.css';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>
);

// Pre-rendered pages are hydrated; the empty app shell (done page) is rendered fresh.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
