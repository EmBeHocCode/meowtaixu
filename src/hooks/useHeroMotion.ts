import { useEffect, useRef, useState, type RefObject } from 'react';
import type { HeroMotion } from '../types/hero';

export function useHeroMotion(host: RefObject<HTMLElement | null>, reduced: boolean) {
  const motion = useRef<HeroMotion>({ x: 0, y: 0, scroll: 0 });
  const [active, setActive] = useState(true);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let intersecting = true;
    const updateActive = () => setActive(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      updateActive();
    }, { threshold: 0 });
    observer.observe(element);
    document.addEventListener('visibilitychange', updateActive);
    updateActive();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', updateActive); };
  }, [host]);

  useEffect(() => {
    const element = host.current;
    if (!element || reduced) return;
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = element.getBoundingClientRect();
      motion.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      motion.current.y = -((event.clientY - rect.top) / rect.height - 0.5) * 2;
      element.style.setProperty('--hero-pointer-x', motion.current.x.toFixed(3));
      element.style.setProperty('--hero-pointer-y', motion.current.y.toFixed(3));
    };
    const reset = () => {
      motion.current.x = 0;
      motion.current.y = 0;
      element.style.setProperty('--hero-pointer-x', '0');
      element.style.setProperty('--hero-pointer-y', '0');
    };
    const scroll = () => {
      const rect = element.getBoundingClientRect();
      motion.current.scroll = Math.min(1, Math.max(0, -rect.top / rect.height));
    };
    element.addEventListener('pointermove', pointer, { passive: true });
    element.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    return () => {
      element.removeEventListener('pointermove', pointer);
      element.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', scroll);
      element.style.removeProperty('--hero-pointer-x');
      element.style.removeProperty('--hero-pointer-y');
      motion.current = { x: 0, y: 0, scroll: 0 };
    };
  }, [host, reduced]);

  return { motion, active };
}
