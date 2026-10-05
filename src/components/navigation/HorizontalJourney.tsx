import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../../features/reduced-motion/useReducedMotion';
import { Hero } from '../../sections/Hero/Hero';
import { About } from '../../sections/About/About';
import { Expertise } from '../../sections/Expertise/Expertise';
import { Skills } from '../../sections/Skills/Skills';
import { Focus } from '../../sections/Focus/Focus';
import { Projects } from '../../sections/Projects/Projects';
import { Connect } from '../../sections/Connect/Connect';
import { heroAssets } from '../../data/hero-assets';
import { chapters, chapterIndex, wheelDelta, canScrollInside, WheelGate } from './journey-model';
import './journey.css';

const interactive = 'a,button,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="slider"],[role="button"],[data-journey-input]';

export function HorizontalJourney({ entered }: { entered: boolean }) {
  const [active, setActive] = useState(() => Math.max(0, chapterIndex(location.hash)));
  const [moving, setMoving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();
  const viewport = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const mist = useRef<HTMLDivElement>(null);
  const index = useRef(active);
  const navigate = useRef<(next: number, history?: boolean) => void>(() => {});

  useLayoutEffect(() => {
    const host = viewport.current!;
    const rail = track.current!;
    let locked = false;
    let tween: gsap.core.Timeline | undefined;
    const place = () => gsap.set(rail, { x: -index.current * host.clientWidth, opacity: 1 });
    const finish = () => {
      locked = false;
      setMoving(false);
      gsap.set(mist.current, { opacity: 0, x: 0, xPercent: 0, yPercent: 0 });
    };
    place();
    const go = (next: number, writeHistory = true) => {
      next = Math.min(chapters.length - 1, Math.max(0, next));
      setMenuOpen(false);
      if (next === index.current) return;
      const direction = next > index.current ? 1 : -1;
      tween?.kill();
      if (rail.contains(document.activeElement)) host.focus({ preventScroll: true });
      index.current = next;
      locked = true;
      setMoving(true);
      setActive(next);
      setMenuOpen(false);
      if (writeHistory) history.pushState(null, '', `#${chapters[next].id}`);
      const x = -next * host.clientWidth;
      tween = gsap.timeline({ onComplete: finish });
      if (reduced) {
        // No lateral camera motion for motion-sensitive visitors.
        tween.to(rail, { opacity: 0, duration: 0.08 }).set(rail, { x })
          .to(rail, { opacity: 1, duration: 0.12 });
      } else {
        tween.to(rail, { x, duration: 1.15, ease: 'power3.inOut', force3D: true }, 0)
          .fromTo(mist.current,
            { x: direction > 0 ? host.clientWidth : 0, yPercent: 0.8 },
            { x: direction > 0 ? 0 : host.clientWidth, yPercent: -0.6, duration: 1.15, ease: 'power3.inOut' }, 0)
          .fromTo(mist.current,
            { opacity: 0 },
            { opacity: 0.68, duration: 0.5, ease: 'sine.inOut' }, 0)
          .to(mist.current,
            { opacity: 0, duration: 0.65, ease: 'sine.inOut' }, 0.5);
      }
    };
    navigate.current = go;
    const resize = new ResizeObserver(() => { tween?.kill(); place(); finish(); });
    resize.observe(host);
    const restore = () => {
      const next = chapterIndex(location.hash);
      if (next >= 0) go(next, false);
    };
    window.addEventListener('hashchange', restore);
    window.addEventListener('popstate', restore);
    // Canonicalize legacy anchors and initial empty hash without adding history.
    history.replaceState(null, '', `#${chapters[index.current].id}`);
    const gate = new WheelGate();
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || !entered) return;
      const delta = wheelDelta(event.deltaX, event.deltaY, event.deltaMode, host.clientHeight);
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[data-journey-input]')) return;
      const scroller = target?.closest<HTMLElement>('[data-chapter-scroll]');
      if (!locked && Math.abs(event.deltaY) >= Math.abs(event.deltaX) && scroller && /auto|scroll/.test(getComputedStyle(scroller).overflowY) &&
        canScrollInside(scroller.scrollTop, scroller.clientHeight, scroller.scrollHeight, delta)) {
        // Consume the entire gesture locally; a fresh gesture at the edge can leave.
        gate.feed(delta, performance.now(), true);
        return;
      }
      event.preventDefault();
      const direction = gate.feed(delta, performance.now(), locked);
      if (direction) go(index.current + direction);
    };
    const key = (event: KeyboardEvent) => {
      if (!entered || event.altKey || event.ctrlKey || event.metaKey ||
        (event.target instanceof Element && event.target.closest(interactive))) return;
      const destination = event.key === 'Home' ? 0 : event.key === 'End' ? chapters.length - 1 :
        ['ArrowRight', 'PageDown'].includes(event.key) ? index.current + 1 :
        ['ArrowLeft', 'PageUp'].includes(event.key) ? index.current - 1 : undefined;
      if (destination === undefined) return;
      event.preventDefault();
      if (!locked && !event.repeat) go(destination);
    };
    const anchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const next = chapterIndex(link.hash);
      if (next < 0) return;
      event.preventDefault();
      if (entered) go(next);
    };
    let touch: { x: number; y: number; horizontal: boolean } | null = null;
    const start = (event: TouchEvent) => {
      if (!entered || locked || event.touches.length !== 1 || (event.target as Element)?.closest(interactive)) { touch = null; return; }
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, horizontal: false };
    };
    const move = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - touch.x;
      const dy = event.touches[0].clientY - touch.y;
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) touch.horizontal = true;
      if (touch.horizontal) event.preventDefault();
    };
    const end = (event: TouchEvent) => {
      if (!touch) return;
      const dx = event.changedTouches[0].clientX - touch.x;
      const dy = event.changedTouches[0].clientY - touch.y;
      if (!locked && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) go(index.current + (dx < 0 ? 1 : -1));
      touch = null;
    };
    const cancel = () => { touch = null; };
    host.addEventListener('wheel', wheel, { passive: false });
    host.addEventListener('touchstart', start, { passive: true });
    host.addEventListener('touchmove', move, { passive: false });
    host.addEventListener('touchend', end);
    host.addEventListener('touchcancel', cancel);
    window.addEventListener('keydown', key);
    document.addEventListener('click', anchor);
    return () => {
      tween?.kill(); resize.disconnect();
      host.removeEventListener('wheel', wheel); host.removeEventListener('touchstart', start);
      host.removeEventListener('touchmove', move); host.removeEventListener('touchend', end); host.removeEventListener('touchcancel', cancel);
      window.removeEventListener('keydown', key); document.removeEventListener('click', anchor);
      window.removeEventListener('hashchange', restore); window.removeEventListener('popstate', restore);
    };
  }, [entered, reduced]);

  useEffect(() => { if (!entered) setMenuOpen(false); }, [entered]);
  const content: ReactNode[] = [
    <Hero entered={entered} chapterActive={active === 0} prepared={active <= 1} />,
    <About active={active === 1 && entered} />,
    <Expertise />, <Skills />, <Focus />, <Projects />, <Connect />,
  ];
  return <div className="journey" data-active-chapter={chapters[active].id} data-moving={moving} data-reduced-motion={reduced}>
    <header className="journey__header" inert={!entered}>
      <a href="#hero" className="journey__brand" aria-label="Meow — Khởi hành">
        <img className="protected-artwork" draggable="false" src="/assets/xianxia/logo/logo-main.png" alt="" width="1254" height="1254" />
      </a>
      <button className="journey__menu-toggle" aria-expanded={menuOpen} aria-controls="chapter-navigation" onClick={() => setMenuOpen(!menuOpen)}>Chương {String(active + 1).padStart(2, '0')} · Mục lục</button>
      <nav id="chapter-navigation" className="journey__nav" aria-label="Các chương hành trình" data-open={menuOpen}>
        {chapters.map((chapter, i) => <a key={chapter.id} href={`#${chapter.id}`} aria-current={i === active ? 'page' : undefined}>{chapter.label}</a>)}
      </nav>
    </header>
    <main ref={viewport} id="main-content" className="journey__viewport" tabIndex={-1} aria-label="Hành trình portfolio" inert={!entered}>
      <div ref={track} className="journey__track">
        {chapters.map((chapter, i) => <div key={chapter.id} className={`journey__chapter journey__chapter--${chapter.id}`} inert={i !== active} aria-hidden={i !== active} data-phase={i === active ? 'active' : Math.abs(i - active) === 1 ? 'nearby' : 'paused'}>
          {content[i]}
        </div>)}
      </div>
      <div ref={mist} className="journey__mist protected-artwork" aria-hidden="true">
        <img draggable="false" src={heroAssets.fog} alt="" />
      </div>
    </main>
    <footer className="journey__footer" inert={!entered}>
      <button onClick={() => navigate.current(active - 1)} disabled={active === 0 || moving} aria-label="Chương trước">←</button>
      <span aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, '0')} / 07 · {chapters[active].label}</span>
      <button onClick={() => navigate.current(active + 1)} disabled={active === 6 || moving} aria-label="Chương tiếp theo">→</button>
    </footer>
  </div>;
}
