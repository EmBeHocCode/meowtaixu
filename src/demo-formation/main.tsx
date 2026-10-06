import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FormationDemo } from './FormationDemo';
import './formation-demo.css';

createRoot(document.getElementById('formation-demo-root')!).render(
  <StrictMode><FormationDemo /></StrictMode>,
);
