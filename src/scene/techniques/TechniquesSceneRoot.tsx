import { lazy, Suspense } from 'react';
import { SceneErrorBoundary } from '../../components/common/SceneErrorBoundary';
import type { TechniquesSceneProps } from '../../types/skills';

const TechniquesSceneCanvas = lazy(() => import('./TechniquesSceneCanvas'));

export function TechniquesSceneRoot(props: TechniquesSceneProps & { prepared: boolean; reducedMotion: boolean }) {
  const { prepared, reducedMotion, ...scene } = props;
  if (!prepared || reducedMotion) return <div data-scene-status={reducedMotion ? 'reduced-motion' : 'paused'} />;
  return <SceneErrorBoundary><Suspense fallback={<div data-scene-status="loading" />}><TechniquesSceneCanvas {...scene} /></Suspense></SceneErrorBoundary>;
}
