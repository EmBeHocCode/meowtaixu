import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { useReducedMotion } from '../../features/reduced-motion/useReducedMotion';
import { useEnvironment } from '../../features/environment';
import { Hero } from '../../sections/Hero/Hero';
import { About } from '../../sections/About/About';
import { Expertise } from '../../sections/Expertise/Expertise';
import { Skills } from '../../sections/Skills/Skills';
import { Focus } from '../../sections/Focus/Focus';
import { Projects } from '../../sections/Projects/Projects';
import { Connect } from '../../sections/Connect/Connect';
import { heroAssets } from '../../data/hero-assets';
import { chapters, chapterIndex, wheelDelta, canScrollInside, WheelGate } from './journey-model';
import { preloadChapterAssets, type ChapterLifecycle } from './chapter-lifecycle';
import './journey.css';

const interactive = 'a,button,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="slider"],[role="button"],[data-journey-input]';
const cinematicLayers = '[data-cinematic-layer], .expertise__backdrop, .expertise__static-artifacts, .expertise__scene, .expertise__content, .expertise__paths, .expertise__annotation, .skills__environment, .skills__scene, .skills__weather, .skills__heading, .skills__archive, .skills__mastery, .journey-placeholder';
const atmosphereRevealTargets = [
  '.hero__bamboo-leaves', '.about__threshold-mist',
  '.expertise__static-artifacts', '.expertise__scene',
  '.skills__scene', '.skills__weather',
].join(', ');
const copyRevealTargets = [
  '.hero__eyebrow', '.hero__metadata', '.hero__positioning', '.hero__poem', '.hero__cta',
  '.hero__calligraphy', '.hero__footer',
  '.about__eyebrow', '.about__section-label', '.about__prose > p',
  '.expertise__eyebrow', '.expertise__title', '.expertise__intro', '.expertise__annotation',
  '.skills__eyebrow', '.skills__heading h2', '.skills__heading > p:not(.skills__eyebrow)',
  '.journey-placeholder__label', '.journey-placeholder h2',
].join(', ');
const headingRevealTargets = '.hero__title-art, .about__lead';
const objectRevealTargets = '.about__dossier, .expertise__path, .skills__artifact, .skills__mastery';
const allRevealTargets = [atmosphereRevealTargets, copyRevealTargets, headingRevealTargets, objectRevealTargets].join(', ');
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function playChapterReveal(chapter: HTMLElement, direction = 1, onComplete?: () => void) {
  const atmosphere = chapter.querySelectorAll<HTMLElement>(atmosphereRevealTargets);
  const copy = chapter.querySelectorAll<HTMLElement>(copyRevealTargets);
  const headings = chapter.querySelectorAll<HTMLElement>(headingRevealTargets);
  const objects = chapter.querySelectorAll<HTMLElement>(objectRevealTargets);
  const allTargets = chapter.querySelectorAll<HTMLElement>(allRevealTargets);
  gsap.set(allTargets, { visibility: 'visible' });
  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.set(allTargets, { clearProps: 'visibility,clipPath,transform,filter,opacity' });
      onComplete?.();
    },
  });
  if (atmosphere.length) timeline.fromTo(atmosphere,
    { opacity: 0, y: 8, filter: 'blur(4px) brightness(.82)' },
    { opacity: 1, y: 0, filter: 'blur(0px) brightness(1)', duration: 0.78, stagger: 0.06, ease: 'power2.out' }, 0.08);
  if (headings.length) timeline.fromTo(headings,
      { opacity: 0, x: direction * 20, clipPath: direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', filter: 'blur(4px)' },
      { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0%)', filter: 'blur(0px)', duration: 0.78, stagger: 0.07, ease: 'power4.out', overwrite: 'auto' }, 0.24);
  if (objects.length) timeline.fromTo(objects,
      { opacity: 0, y: 14, scale: 0.985, filter: 'blur(3px) brightness(.82)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px) brightness(1)', duration: 0.62, stagger: 0.085, ease: 'power3.out', overwrite: 'auto' }, 0.34);
  if (copy.length) timeline.fromTo(copy,
      { opacity: 0, y: 14, filter: 'blur(4px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.05, ease: 'power2.out', overwrite: 'auto' }, 0.42);
  const heroMist = chapter.querySelector<HTMLElement>('.hero__reveal-mist');
  if (heroMist) timeline.fromTo(heroMist, { opacity: 0.42, yPercent: 0 }, { opacity: 0, yPercent: 3, duration: 1.5, ease: 'power2.out' }, 0);
  return timeline;
}

export function HorizontalJourney({ entered, onInitialPrepared }: { entered: boolean; onInitialPrepared: () => void }) {
  // A fresh document always begins at the entrance. Hash navigation still works
  // normally after the journey has mounted, but reload never skips the Hero.
  const initialIndex = useRef(0);
  const [active, setActive] = useState(initialIndex.current);
  const [moving, setMoving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [requested, setRequested] = useState<Set<number>>(() => new Set([initialIndex.current, initialIndex.current - 1, initialIndex.current + 1].filter(index => index >= 0 && index < chapters.length)));
  const [assetReady, setAssetReady] = useState<boolean[]>(() => chapters.map((_, index) => index > 3));
  const [sceneReady, setSceneReady] = useState<boolean[]>(() => chapters.map((_, index) => index === 1 || index > 3));
  const [lifecycles, setLifecycles] = useState<ChapterLifecycle[]>(() => chapters.map((_, index) => requested.has(index) ? 'preloading' : 'unloaded'));
  const reduced = useReducedMotion();
  const { setActiveSection } = useEnvironment();
  const viewport = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const mist = useRef<HTMLDivElement>(null);
  const energy = useRef<HTMLDivElement>(null);
  const chapterMark = useRef<HTMLDivElement>(null);
  const initialRevealPlayed = useRef(false);
  const entranceCompleted = useRef(new Set<number>());
  const entranceLocked = useRef(false);
  const pendingNavigation = useRef<{ index: number; history: boolean } | null>(null);
  const preparedRef = useRef<boolean[]>(chapters.map(() => false));
  const index = useRef(active);
  const navigate = useRef<(next: number, history?: boolean) => void>(() => {});

  const prepare = useCallback((chapter: number) => {
    if (chapter < 0 || chapter >= chapters.length) return;
    setRequested(current => current.has(chapter) ? current : new Set([...current, chapter]));
  }, []);
  const markSceneReady = useCallback((chapter: number) => setSceneReady(current => current[chapter] ? current : current.map((value, index) => index === chapter ? true : value)), []);
  const markHeroSceneReady = useCallback(() => markSceneReady(0), [markSceneReady]);
  const markExpertiseSceneReady = useCallback(() => markSceneReady(2), [markSceneReady]);
  const markSkillsSceneReady = useCallback(() => markSceneReady(3), [markSceneReady]);
  const prepared = chapters.map((_, chapter) => requested.has(chapter) && assetReady[chapter] && (reduced || sceneReady[chapter]));
  preparedRef.current = prepared;

  useEffect(() => {
    let cancelled = false;
    requested.forEach(chapter => {
      if (assetReady[chapter]) return;
      preloadChapterAssets(chapter).then(() => {
        if (cancelled) return;
        setAssetReady(current => current[chapter] ? current : current.map((value, index) => index === chapter ? true : value));
      });
    });
    return () => { cancelled = true; };
  }, [assetReady, requested]);

  useEffect(() => {
    setLifecycles(current => current.map((phase, chapter) => {
      if (chapter === active && entranceCompleted.current.has(chapter)) return moving ? phase : 'active';
      if (prepared[chapter] && (phase === 'unloaded' || phase === 'preloading')) return 'prepared';
      if (requested.has(chapter) && phase === 'unloaded') return 'preloading';
      return phase;
    }));
  }, [active, moving, prepared.join(','), requested]);

  useEffect(() => {
    if (prepared[initialIndex.current]) onInitialPrepared();
  }, [onInitialPrepared, prepared.join(',')]);

  useEffect(() => {
    prepare(active - 1);
    prepare(active + 1);
  }, [active, prepare]);

  useEffect(() => {
    if (reduced) return;
    const timers = [0, 2, 3].filter(chapter => requested.has(chapter) && !sceneReady[chapter]).map(chapter => window.setTimeout(() => markSceneReady(chapter), 8_000));
    return () => timers.forEach(window.clearTimeout);
  }, [markSceneReady, reduced, requested, sceneReady]);

  useEffect(() => {
    const pending = pendingNavigation.current;
    if (!pending || !prepared[pending.index] || entranceLocked.current) return;
    pendingNavigation.current = null;
    navigate.current(pending.index, pending.history);
  }, [prepared.join(',')]);

  useLayoutEffect(() => {
    const host = viewport.current!;
    const rail = track.current!;
    let locked = false;
    let tween: gsap.core.Timeline | undefined;
    let revealTween: gsap.core.Timeline | undefined;
    const place = () => gsap.set(rail, { x: -index.current * host.clientWidth, opacity: 1 });
    const finish = () => {
      locked = false;
      setActive(index.current);
      setMoving(false);
      gsap.set(mist.current, { opacity: 0, x: 0, xPercent: 0, yPercent: 0 });
      gsap.set(energy.current, { opacity: 0, xPercent: 0, scaleX: 1 });
      gsap.set(chapterMark.current, { opacity: 0, scale: 1, clearProps: 'filter' });
      gsap.set(rail.children, { clearProps: 'opacity,filter,transform,transformOrigin' });
      gsap.set(rail.querySelectorAll(cinematicLayers), { clearProps: 'transform,filter,opacity' });
      gsap.set(rail.querySelectorAll(allRevealTargets), { clearProps: 'visibility,clipPath,transform,filter,opacity' });
    };
    const finishEntrance = (chapter: number) => {
      entranceCompleted.current.add(chapter);
      entranceLocked.current = false;
      setLifecycles(current => current.map((phase, position) => position === chapter ? 'active' : phase));
      const pending = pendingNavigation.current;
      if (pending && preparedRef.current[pending.index]) {
        pendingNavigation.current = null;
        navigate.current(pending.index, pending.history);
      }
    };
    const revealFirstEntry = (chapter: number, element: HTMLElement, direction: number) => {
      if (reduced || entranceCompleted.current.has(chapter)) {
        finishEntrance(chapter);
        return;
      }
      entranceLocked.current = true;
      setLifecycles(current => current.map((phase, position) => position === chapter ? 'entering' : phase));
      revealTween = playChapterReveal(element, direction, () => finishEntrance(chapter));
    };
    place();
    const go = (next: number, writeHistory = true) => {
      next = Math.min(chapters.length - 1, Math.max(0, next));
      setMenuOpen(false);
      if (next === index.current) return;
      if (entranceLocked.current || !preparedRef.current[next]) {
        pendingNavigation.current = { index: next, history: writeHistory };
        prepare(next);
        return;
      }
      const previous = index.current;
      const direction = next > previous ? 1 : -1;
      const firstEntry = !entranceCompleted.current.has(next);
      const outgoing = rail.children[previous] as HTMLElement;
      const incoming = rail.children[next] as HTMLElement;
      if (firstEntry && !reduced) {
        gsap.set(incoming.querySelectorAll(allRevealTargets), { visibility: 'hidden', opacity: 0 });
      }
      const outgoingLayers = outgoing.querySelectorAll<HTMLElement>(cinematicLayers);
      const incomingLayers = incoming.querySelectorAll<HTMLElement>(cinematicLayers);
      tween?.kill();
      revealTween?.kill();
      if (rail.contains(document.activeElement)) host.focus({ preventScroll: true });
      index.current = next;
      locked = true;
      setLifecycles(current => current.map((phase, position) => position === previous ? 'inactive' : position === next ? (firstEntry ? 'entering' : 'returning') : phase));
      setMenuOpen(false);
      if (writeHistory) history.pushState(null, '', `#${chapters[next].id}`);
      const x = -next * host.clientWidth;
      const mark = chapterMark.current!;
      mark.querySelector<HTMLElement>('.journey__chapter-mark-index')!.textContent = String(next + 1).padStart(2, '0');
      mark.querySelector<HTMLElement>('.journey__chapter-mark-title')!.textContent = chapters[next].label;
      // Every adjacent chapter uses the same light snapshot transition. Large jumps
      // keep the longer rail travel so their direction remains understandable.
      const lightweightTransition = !reduced && Math.abs(next - previous) === 1;
      const viewDocument = document as ViewTransitionDocument;
      if (lightweightTransition && viewDocument.startViewTransition) {
        document.documentElement.dataset.journeyDirection = direction > 0 ? 'forward' : 'backward';
        // Freeze live canvases before Chrome captures the old chapter snapshot.
        flushSync(() => setMoving(true));
        const transition = viewDocument.startViewTransition(() => {
          gsap.set(rail, { x, opacity: 1 });
          // The live marker is promoted into its own View Transition layer so it
          // remains visible above the scene snapshots during adjacent navigation.
          gsap.set(mark, { opacity: 1, scale: 1, filter: 'blur(0px)' });
          flushSync(() => setActive(next));
        });
        transition.finished.finally(() => {
          delete document.documentElement.dataset.journeyDirection;
          finish();
          if (firstEntry) revealFirstEntry(next, incoming, direction);
          else setLifecycles(current => current.map((phase, position) => position === next ? 'active' : phase));
        });
        return;
      }
      setMoving(true);
      tween = gsap.timeline({ onComplete: () => {
        finish();
        if (firstEntry) revealFirstEntry(next, incoming, direction);
        else setLifecycles(current => current.map((phase, position) => position === next ? 'active' : phase));
      } });
      if (reduced) {
        // No lateral camera motion for motion-sensitive visitors.
        tween.to(rail, { opacity: 0, duration: 0.08 }).set(rail, { x })
          .to(rail, { opacity: 1, duration: 0.12 });
      } else {
        const duration = lightweightTransition ? 0.86 : Math.abs(next - previous) > 1 ? 1.58 : 1.42;
        const stableDepth = next === 2 || next === 3;
        const stableOutgoingDepth = previous === 2 || previous === 3;
        if (lightweightTransition) {
          // Hero, About and Expertise contain large layered scenes. Sliding the entire
          // seven-viewport rail drops frames on mid-range GPUs, so the directional mist
          // masks a short scene cut while content keeps a restrained lateral reveal.
          gsap.set(incoming, { opacity: 0.94, xPercent: 0, scale: 1, clearProps: 'filter,transformOrigin' });
          gsap.set(energy.current, { opacity: 0 });
          tween.to(rail, { opacity: 0.16, duration: 0.22, ease: 'power2.in' }, 0)
            .set(rail, { x }, 0.22)
            .to(rail, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.22)
            .to(outgoing, { opacity: 0.82, duration: 0.2, ease: 'sine.out' }, 0)
            .to(incoming, { opacity: 1, duration: 0.36, ease: 'sine.out' }, 0.22)
            .fromTo(mist.current,
              { x: direction > 0 ? host.clientWidth * 1.04 : -host.clientWidth * 0.04, opacity: 0 },
              { x: direction > 0 ? -host.clientWidth * 0.04 : host.clientWidth * 1.04, opacity: 0.52, duration, ease: 'sine.inOut' }, 0)
            .to(mist.current, { opacity: 0, duration: 0.24, ease: 'sine.out' }, 0.5)
            .fromTo(mark,
              { opacity: 0 },
              { opacity: 0.66, duration: 0.16, ease: 'sine.out' }, 0.18)
            .to(mark, { opacity: 0, duration: 0.2, ease: 'sine.in' }, 0.46);
          return;
        }
        gsap.set(incoming, { opacity: 0.62, xPercent: direction * (stableDepth ? 2.2 : 3.5), scale: stableDepth ? 1 : 0.965, transformOrigin: direction > 0 ? '0% 50%' : '100% 50%' });
        gsap.set(energy.current, { opacity: 0, xPercent: direction > 0 ? 115 : -115, scaleX: 0.72 });
        tween.to(outgoing, { opacity: 0.52, xPercent: direction * -2.2, scale: stableOutgoingDepth ? 1 : 1.035, filter: 'blur(2.1px) brightness(.76)', duration: duration * 0.72, ease: 'power2.in' }, 0)
          .to(incoming, { opacity: 1, xPercent: 0, scale: 1, filter: 'blur(0px) brightness(1)', duration: duration * 0.74, ease: 'power3.out' }, duration * 0.26)
          .to(outgoingLayers, { xPercent: direction * -5, scale: 1.025, duration: duration * 0.8, stagger: 0.035, ease: 'power2.inOut' }, 0)
          .fromTo(incomingLayers,
            { xPercent: direction * 6, scale: 0.985, filter: 'blur(3px)' },
            { xPercent: 0, scale: 1, filter: 'blur(0px)', duration: duration * 0.78, stagger: 0.04, ease: 'power3.out' }, duration * 0.2)
          .to(rail, { x, duration, ease: 'power4.inOut', force3D: true }, 0)
          .fromTo(mist.current,
            { x: direction > 0 ? host.clientWidth * 1.08 : -host.clientWidth * 0.08, yPercent: 4, scale: 0.82 },
            { x: direction > 0 ? -host.clientWidth * 0.08 : host.clientWidth * 1.08, yPercent: -3, scale: 1.16, duration, ease: 'power3.inOut' }, 0)
          .fromTo(mist.current,
            { opacity: 0 },
            { opacity: 0.92, duration: duration * 0.38, ease: 'sine.inOut' }, 0)
          .to(mist.current,
            { opacity: 0, duration: duration * 0.48, ease: 'sine.inOut' }, duration * 0.52)
          .to(energy.current,
            { opacity: 0.88, xPercent: direction > 0 ? 12 : -12, scaleX: 1.08, duration: duration * 0.38, ease: 'power2.in' }, duration * 0.12)
          .to(energy.current,
            { opacity: 0, xPercent: direction > 0 ? -115 : 115, scaleX: 0.82, duration: duration * 0.45, ease: 'power3.out' }, duration * 0.5);
        tween.fromTo(mark,
          { opacity: 0, scale: 0.9, filter: 'blur(8px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.28, ease: 'power3.out' }, duration * 0.28)
          .to(mark, { opacity: 0, scale: 1.045, filter: 'blur(5px)', duration: 0.34, ease: 'power2.in' }, duration * 0.62);
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
      tween?.kill(); revealTween?.kill(); resize.disconnect();
      host.removeEventListener('wheel', wheel); host.removeEventListener('touchstart', start);
      host.removeEventListener('touchmove', move); host.removeEventListener('touchend', end); host.removeEventListener('touchcancel', cancel);
      window.removeEventListener('keydown', key); document.removeEventListener('click', anchor);
      window.removeEventListener('hashchange', restore); window.removeEventListener('popstate', restore);
    };
  }, [entered, reduced]);

  useLayoutEffect(() => {
    if (!entered || !prepared[active] || initialRevealPlayed.current) return;
    const rail = track.current;
    const chapter = rail?.children[index.current] as HTMLElement | undefined;
    if (!chapter) return;
    initialRevealPlayed.current = true;
    entranceLocked.current = true;
    setLifecycles(current => current.map((phase, position) => position === active ? 'entering' : phase));
    if (reduced) {
      entranceCompleted.current.add(active);
      entranceLocked.current = false;
      setLifecycles(current => current.map((phase, position) => position === active ? 'active' : phase));
      return;
    }
    const timeline = playChapterReveal(chapter, 1, () => {
      entranceCompleted.current.add(active);
      entranceLocked.current = false;
      setLifecycles(current => current.map((phase, position) => position === active ? 'active' : phase));
      const pending = pendingNavigation.current;
      if (pending && preparedRef.current[pending.index]) {
        pendingNavigation.current = null;
        navigate.current(pending.index, pending.history);
      }
    });
    return () => { timeline.kill(); };
  }, [active, entered, prepared.join(','), reduced]);

  useEffect(() => { if (!entered) setMenuOpen(false); }, [entered]);
  useEffect(() => {
    setActiveSection(entered ? chapters[active].id : null);
  }, [active, entered, setActiveSection]);
  const content: ReactNode[] = [
    <Hero entered={entered} chapterActive={active === 0 && !moving} prepared={requested.has(0)} onSceneReady={markHeroSceneReady} />,
    <About active={active === 1 && entered && !moving} />,
    <Expertise active={active === 2 && entered && !moving} prepared={requested.has(2)} onSceneReady={markExpertiseSceneReady} />,
    <Skills active={active === 3 && entered && !moving} prepared={requested.has(3)} onSceneReady={markSkillsSceneReady} />,
    <Focus />, <Projects />, <Connect />,
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
        {chapters.map((chapter, i) => <div key={chapter.id} className={`journey__chapter journey__chapter--${chapter.id}`} inert={i !== active} aria-hidden={i !== active} data-phase={i === active ? 'active' : Math.abs(i - active) === 1 ? 'nearby' : 'paused'} data-lifecycle={lifecycles[i]} data-prepared={prepared[i]}>
          {content[i]}
        </div>)}
      </div>
      <div className="journey__temple-atmosphere" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6].map(mote => <i key={mote} style={{ '--mote': mote } as React.CSSProperties} />)}</div>
      <div ref={mist} className="journey__mist protected-artwork" aria-hidden="true">
        <img draggable="false" src={heroAssets.fog} alt="" />
        <img draggable="false" src={heroAssets.fog} alt="" />
      </div>
      <div ref={energy} className="journey__energy" aria-hidden="true"><span /><span /><span /></div>
      <div ref={chapterMark} className="journey__chapter-mark" aria-hidden="true"><span className="journey__chapter-mark-index">01</span><strong className="journey__chapter-mark-title">Nhập cảnh</strong><i /></div>
    </main>
    <footer className="journey__footer" inert={!entered}>
      <button onClick={() => navigate.current(active - 1)} disabled={active === 0 || moving} aria-label="Chương trước">←</button>
      <span aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, '0')} / 07 · {chapters[active].label}</span>
      <button onClick={() => navigate.current(active + 1)} disabled={active === 6 || moving} aria-label="Chương tiếp theo">→</button>
    </footer>
  </div>;
}
