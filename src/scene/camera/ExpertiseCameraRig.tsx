import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export function ExpertiseCameraRig({ active, mobile }: { active: boolean; mobile: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    if (!active || mobile) return;
    const move = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
      invalidate();
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [active, mobile, invalidate]);

  useFrame((_state, delta) => {
    const factor = Math.min(delta * 2.1, 1);
    const tx = active && !mobile ? pointer.current.x * 0.12 : 0;
    const ty = active && !mobile ? -pointer.current.y * 0.07 : 0;
    camera.position.x += (tx - camera.position.x) * factor;
    camera.position.y += (ty - camera.position.y) * factor;
  });

  return null;
}
