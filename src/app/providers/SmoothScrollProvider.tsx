import { useEffect, type PropsWithChildren } from 'react';
import { useReducedMotion } from '../../features/reduced-motion/useReducedMotion';
import { createSmoothScroll } from '../../animations/scroll/createSmoothScroll';

export function SmoothScrollProvider({ children }: PropsWithChildren) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    return createSmoothScroll();
  }, [reducedMotion]);

  return children;
}
