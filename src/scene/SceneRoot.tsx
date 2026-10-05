import { lazy, Suspense } from 'react';
import { SceneErrorBoundary } from '../components/common/SceneErrorBoundary';
import { useReducedMotion } from '../features/reduced-motion/useReducedMotion';
import type { HeroSceneProps } from '../types/hero';

const SceneCanvas = lazy(() => import('./SceneCanvas'));

export function SceneRoot({ entered, ...scene }: HeroSceneProps & { entered: boolean }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="hero-scene" aria-hidden="true" data-active={scene.active}>
      {reducedMotion ? <div data-scene-status="reduced-motion" /> : entered ? (
        <SceneErrorBoundary>
          <Suspense fallback={<div data-scene-status="loading" />}><SceneCanvas {...scene} /></Suspense>
        </SceneErrorBoundary>
      ) : null}
    </div>
  );
}
