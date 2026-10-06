import { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas, type RootState } from '@react-three/fiber';
import type { TechniquesSceneProps } from '../../types/skills';
import { TechniquesWorld } from './TechniquesWorld';

export default function TechniquesSceneCanvas(props: TechniquesSceneProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [lost, setLost] = useState(false);
  const onCreated = useCallback(({ gl }: RootState) => {
    gl.setClearColor(0x02070b, 0);
    gl.domElement.dataset.initialized = 'true';
    setCanvas(gl.domElement);
  }, []);
  useEffect(() => {
    if (!canvas) return;
    const onLost = (event: Event) => { event.preventDefault(); setLost(true); };
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [canvas]);
  if (lost) return <div data-scene-status="context-lost" />;
  return <Canvas frameloop="demand" dpr={props.mobile ? 1 : [1, 1.25]} orthographic camera={{ position: [0, 0, 10], zoom: 95, near: 0.1, far: 30 }} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }} onCreated={onCreated} fallback={<div data-scene-status="unavailable" />}>
    <Suspense fallback={null}><TechniquesWorld {...props} /></Suspense>
  </Canvas>;
}
