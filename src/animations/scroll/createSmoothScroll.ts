import Lenis from 'lenis';

// One owned RAF loop; no global ticker mutation. Native touch scrolling remains intact.
export function createSmoothScroll() {
  const lenis = new Lenis({ autoRaf: true, smoothWheel: true, syncTouch: false, anchors: true });
  return () => lenis.destroy();
}
