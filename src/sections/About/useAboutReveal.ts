import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from '../../features/reduced-motion/useReducedMotion';

// One local scroll-progress seam for a later cinematic transition, not a second scene loop.
export function useAboutReveal(host: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = host.current;
    if (!element || reduced) return;
    let visible = false;
    let frame = 0;
    const paint = () => {
      frame = 0;
      const top = element.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - top) / window.innerHeight));
      element.style.setProperty('--about-descent', String(progress));
    };
    const scroll = () => { if (visible && !frame) frame = requestAnimationFrame(paint); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        element.dataset.revealed = 'true';
        scroll();
      }
    }, { threshold: 0.08 });
    observer.observe(element);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
      cancelAnimationFrame(frame);
      element.style.removeProperty('--about-descent');
      delete element.dataset.revealed;
    };
  }, [host, reduced]);
}
