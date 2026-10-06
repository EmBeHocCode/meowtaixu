import { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas, type RootState } from '@react-three/fiber';
import { HeroWorld } from './environment/HeroWorld';
import type { HeroSceneProps } from '../types/hero';

export default function SceneCanvas({ active, mobile, motion, onReady }: HeroSceneProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [lost, setLost] = useState(false);
  const [painted, setPainted] = useState(false);
  const reveal = useCallback(() => { setPainted(true); onReady?.(); }, [onReady]);
  const onCreated = useCallback(({ gl }: RootState) => {
    gl.setClearColor(0x000000, 0);
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

  return (
    <div className="hero-canvas" data-painted={painted}>
    <Canvas
      frameloop="demand" dpr={mobile ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 12], fov: 35, near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      onCreated={onCreated}
      fallback={<div data-scene-status="unavailable" />}
    >
      <Suspense fallback={null}>
        <HeroWorld active={active} mobile={mobile} motion={motion} onReady={reveal} />
      </Suspense>
    </Canvas>
    </div>
  );
}
