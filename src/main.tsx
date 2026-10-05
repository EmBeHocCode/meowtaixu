import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import 'lenis/dist/lenis.css';
import '@fontsource/be-vietnam-pro/latin-400.css';
import '@fontsource/be-vietnam-pro/vietnamese-400.css';
import '@fontsource/be-vietnam-pro/latin-500.css';
import '@fontsource/be-vietnam-pro/vietnamese-500.css';
import '@fontsource/be-vietnam-pro/latin-600.css';
import '@fontsource/be-vietnam-pro/vietnamese-600.css';
import '@fontsource/noto-serif-display/latin-400.css';
import '@fontsource/noto-serif-display/vietnamese-400.css';
import '@fontsource/noto-serif-display/latin-400-italic.css';
import '@fontsource/noto-serif-display/vietnamese-400-italic.css';
import '@fontsource/noto-serif-display/latin-500.css';
import '@fontsource/noto-serif-display/vietnamese-500.css';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root is missing.');

createRoot(root).render(<StrictMode><App /></StrictMode>);
