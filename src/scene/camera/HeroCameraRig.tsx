import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import type { HeroSceneProps } from '../../types/hero';

export function HeroCameraRig({ motion, mobile }: Pick<HeroSceneProps, 'motion' | 'mobile'>) {
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.08);
    const target = motion.current;
    // No rotation, large dolly or scroll pinning: the first scroll stays readable.
    camera.position.x = MathUtils.damp(camera.position.x, mobile ? 0 : target.x * 0.12, 1.6, dt);
    camera.position.y = MathUtils.damp(camera.position.y, (mobile ? 0 : target.y * 0.055) - target.scroll * 0.06, 1.6, dt);
    camera.position.z = MathUtils.damp(camera.position.z, 12 - target.scroll * 0.12, 1.4, dt);
  });
  return null;
}
