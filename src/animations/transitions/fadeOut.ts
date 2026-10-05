import { gsap } from '../gsap/gsap';

export function fadeOut(element: HTMLElement, onComplete: () => void) {
  const context = gsap.context(() => {
    gsap.to(element, { opacity: 0, duration: 0.6, ease: 'power1.out', onComplete });
  }, element);
  return () => context.revert();
}
