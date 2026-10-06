import { useEffect, useRef, type RefObject } from 'react';
import type { HeroMotion } from '../../types/hero';

type Depth = 'background' | 'midground' | 'foreground';
type MotionKind = 'drift' | 'fall' | 'sweep';
type Point = { x: number; y: number };

type Leaf = {
  active: boolean;
  depth: Depth;
  kind: MotionKind;
  sprite: number;
  birth: number;
  duration: number;
  opacity: number;
  scale: number;
  rotationOffset: number;
  flutterPhase: number;
  flutterRate: number;
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
};

export const heroBambooConfig = {
  debug: false,
  desktop: { maxLeaves: 22, initialLeaves: 15, spawnInterval: [0.46, 0.92] as const },
  mobile: { maxLeaves: 9, initialLeaves: 6, spawnInterval: [0.82, 1.35] as const },
  density: { background: 0.34, midground: 0.48, foreground: 0.18 },
  speed: { drift: [8.4, 13.5] as const, fall: [6.5, 10.5] as const, sweep: [3.6, 5.2] as const },
  wind: { calm: 0.08, breeze: 0.24, gust: 0.62, cycleSeconds: 14, gustStart: 10.8, gustEnd: 13.0 },
  rotationIntensity: 0.22,
} as const;

const SPRITES = [
  'leaf-01.webp', 'leaf-02.webp', 'leaf-03.webp', 'leaf-04.webp',
  'leaf-05.webp', 'leaf-06.webp', 'leaf-07.webp', 'leaf-08.webp',
  'leaf-09.webp', 'leaf-10.webp', 'leaf-11.webp', 'leaf-12.webp',
  'leaf-distant.webp', 'leaf-sweep.webp',
].map((name) => `/assets/xianxia/vfx/hero-bamboo/${name}`);

const random = (min: number, max: number) => min + Math.random() * (max - min);
const choose = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const cubic = (a: number, b: number, c: number, d: number, t: number) => {
  const inverse = 1 - t;
  return inverse ** 3 * a + 3 * inverse ** 2 * t * b + 3 * inverse * t ** 2 * c + t ** 3 * d;
};
const cubicDerivative = (a: number, b: number, c: number, d: number, t: number) => {
  const inverse = 1 - t;
  return 3 * inverse ** 2 * (b - a) + 6 * inverse * t * (c - b) + 3 * t ** 2 * (d - c);
};
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

function windAt(clock: number) {
  const phase = clock % heroBambooConfig.wind.cycleSeconds;
  if (phase >= heroBambooConfig.wind.gustStart && phase <= heroBambooConfig.wind.gustEnd) {
    const gustT = (phase - heroBambooConfig.wind.gustStart) / (heroBambooConfig.wind.gustEnd - heroBambooConfig.wind.gustStart);
    return heroBambooConfig.wind.breeze + Math.sin(gustT * Math.PI) * heroBambooConfig.wind.gust;
  }
  if (phase < 3.4) return heroBambooConfig.wind.calm;
  return heroBambooConfig.wind.breeze + Math.sin(phase * 0.55) * 0.05;
}

function createLeaf(width: number, height: number, clock: number, gusting: boolean): Leaf {
  const roll = Math.random();
  const depth: Depth = roll < heroBambooConfig.density.background
    ? 'background'
    : roll < heroBambooConfig.density.background + heroBambooConfig.density.midground
      ? 'midground'
      : 'foreground';
  const kind: MotionKind = gusting && Math.random() < 0.72
    ? 'sweep'
    : choose<MotionKind>(['drift', 'drift', 'fall']);
  const direction = Math.random() < 0.82 ? -1 : 1;
  const margin = Math.max(70, width * 0.06);
  let p0: Point;
  let p1: Point;
  let p2: Point;
  let p3: Point;

  if (kind === 'sweep') {
    const startX = direction < 0 ? width + margin : -margin;
    const endX = direction < 0 ? -margin * 1.4 : width + margin * 1.4;
    const startY = random(height * 0.08, height * 0.68);
    const endY = Math.min(height + margin, startY + random(height * 0.12, height * 0.36));
    p0 = { x: startX, y: startY };
    p1 = { x: startX + direction * width * 0.28, y: startY + random(-height * 0.07, height * 0.08) };
    p2 = { x: endX - direction * width * 0.24, y: endY + random(-height * 0.1, height * 0.05) };
    p3 = { x: endX, y: endY };
  } else if (kind === 'fall') {
    const startX = random(width * 0.16, width * 1.02);
    const drift = direction * random(width * 0.09, width * 0.24);
    p0 = { x: startX, y: -margin };
    p1 = { x: startX + drift * 0.2, y: height * 0.26 };
    p2 = { x: startX - drift * 0.35, y: height * 0.68 };
    p3 = { x: startX + drift, y: height + margin };
  } else {
    const fromTop = Math.random() < 0.58;
    const startX = fromTop ? random(width * 0.2, width * 1.02) : direction < 0 ? width + margin : -margin;
    const startY = fromTop ? -margin * 0.6 : random(height * 0.08, height * 0.46);
    const travelX = direction * random(width * 0.26, width * 0.48);
    const travelY = random(height * 0.3, height * 0.56);
    p0 = { x: startX, y: startY };
    p1 = { x: startX + travelX * 0.2, y: startY + travelY * 0.2 };
    p2 = { x: startX + travelX * 0.78, y: startY + travelY * 0.56 };
    p3 = { x: startX + travelX, y: startY + travelY };
  }

  const depthScale = depth === 'background' ? random(0.36, 0.56) : depth === 'midground' ? random(0.64, 0.98) : random(1.08, 1.55);
  const depthOpacity = depth === 'background' ? random(0.16, 0.24) : depth === 'midground' ? random(0.34, 0.52) : random(0.46, 0.64);
  const speedRange = heroBambooConfig.speed[kind];
  return {
    active: true,
    depth,
    kind,
    sprite: depth === 'background' ? 12 : kind === 'sweep' && depth === 'foreground' ? 13 : Math.floor(random(0, 12)),
    birth: clock,
    duration: random(speedRange[0], speedRange[1]) * (depth === 'background' ? 1.18 : depth === 'foreground' ? 0.86 : 1),
    opacity: depthOpacity,
    scale: depthScale,
    rotationOffset: random(-0.14, 0.14),
    flutterPhase: random(0, Math.PI * 2),
    flutterRate: random(1.35, 2.35),
    p0, p1, p2, p3,
  };
}

let spritePromise: Promise<HTMLImageElement[]> | undefined;

function loadSprites() {
  spritePromise ??= Promise.all(SPRITES.map((src) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  })));
  return spritePromise;
}

export function HeroBambooLeaves({ active, mobile, motion }: { active: boolean; mobile: boolean; motion: RefObject<HeroMotion> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let cancelled = false;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let previousTime = performance.now();
    let clock = 0;
    let nextSpawn = 0;
    const profile = mobile ? heroBambooConfig.mobile : heroBambooConfig.desktop;
    const leaves: Leaf[] = [];
    const debug = heroBambooConfig.debug || (import.meta.env.DEV && new URLSearchParams(window.location.search).has('leavesDebug'));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    loadSprites().then((sprites) => {
      if (cancelled) return;
      for (let index = 0; index < profile.initialLeaves; index += 1) {
        const leaf = createLeaf(width, height, clock, false);
        leaf.birth -= leaf.duration * random(0.04, 0.82);
        leaves.push(leaf);
      }

      const drawPath = (leaf: Leaf) => {
        context.save();
        context.strokeStyle = 'rgba(240, 196, 99, 0.32)';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(leaf.p0.x, leaf.p0.y);
        context.bezierCurveTo(leaf.p1.x, leaf.p1.y, leaf.p2.x, leaf.p2.y, leaf.p3.x, leaf.p3.y);
        context.stroke();
        context.restore();
      };

      const frame = (time: number) => {
        if (cancelled) return;
        const delta = Math.min(0.034, Math.max(0, (time - previousTime) / 1000));
        previousTime = time;
        clock += delta;
        const wind = windAt(clock);
        const gusting = wind > heroBambooConfig.wind.breeze + 0.14;
        context.clearRect(0, 0, width, height);

        if (clock >= nextSpawn && leaves.filter((leaf) => leaf.active).length < profile.maxLeaves) {
          const burst = gusting ? (mobile ? 1 : 2) : 1;
          for (let count = 0; count < burst && leaves.length < profile.maxLeaves; count += 1) {
            leaves.push(createLeaf(width, height, clock, gusting));
          }
          nextSpawn = clock + random(profile.spawnInterval[0], profile.spawnInterval[1]) * (gusting ? 0.55 : 1);
        }

        const ordered = [...leaves].sort((a, b) => {
          const order: Record<Depth, number> = { background: 0, midground: 1, foreground: 2 };
          return order[a.depth] - order[b.depth];
        });
        for (const leaf of ordered) {
          if (!leaf.active) continue;
          const progress = (clock - leaf.birth) / leaf.duration;
          if (progress >= 1) {
            leaf.active = false;
            continue;
          }
          if (progress < 0) continue;
          const eased = leaf.kind === 'sweep' ? progress * progress * (3 - 2 * progress) : progress;
          const x = cubic(leaf.p0.x, leaf.p1.x, leaf.p2.x, leaf.p3.x, eased);
          const y = cubic(leaf.p0.y, leaf.p1.y, leaf.p2.y, leaf.p3.y, eased);
          const dx = cubicDerivative(leaf.p0.x, leaf.p1.x, leaf.p2.x, leaf.p3.x, eased);
          const dy = cubicDerivative(leaf.p0.y, leaf.p1.y, leaf.p2.y, leaf.p3.y, eased);
          const flutter = Math.sin(clock * leaf.flutterRate + leaf.flutterPhase);
          const depthParallax = leaf.depth === 'background' ? 3 : leaf.depth === 'midground' ? 7 : 12;
          const windOffset = wind * Math.sin(progress * Math.PI) * (leaf.depth === 'foreground' ? 24 : 12);
          const pointerX = (motion.current?.x ?? 0) * depthParallax;
          const pointerY = (motion.current?.y ?? 0) * depthParallax * 0.45;
          const fade = smoothstep(0, 0.09, progress) * (1 - smoothstep(0.82, 1, progress));
          const image = sprites[leaf.sprite];
          const drawWidth = Math.max(22, image.naturalWidth * 0.28 * leaf.scale);
          const drawHeight = drawWidth * (image.naturalHeight / image.naturalWidth);
          const angle = Math.atan2(dy, dx) + leaf.rotationOffset + flutter * heroBambooConfig.rotationIntensity;
          const flutterScale = 0.72 + Math.abs(Math.cos(clock * leaf.flutterRate + leaf.flutterPhase)) * 0.28;

          context.save();
          context.translate(x + pointerX + Math.sign(dx || -1) * windOffset, y + pointerY);
          context.rotate(angle);
          context.scale(1, flutterScale);
          context.globalAlpha = leaf.opacity * fade;
          context.filter = leaf.depth === 'background'
            ? 'blur(1px) saturate(62%) brightness(84%)'
            : leaf.depth === 'foreground' && leaf.kind === 'sweep'
              ? 'blur(0.45px) saturate(78%) brightness(102%)'
              : 'saturate(72%) brightness(96%)';
          context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
          context.restore();
          if (debug) drawPath(leaf);
        }

        for (let index = leaves.length - 1; index >= 0; index -= 1) {
          if (!leaves[index].active) leaves.splice(index, 1);
        }
        animationFrame = requestAnimationFrame(frame);
      };
      animationFrame = requestAnimationFrame(frame);
    }).catch(() => {
      // The environment remains complete if an optional VFX sprite cannot load.
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      context.clearRect(0, 0, width, height);
    };
  }, [active, mobile, motion]);

  return <canvas ref={canvasRef} className="hero__bamboo-leaves" aria-hidden="true" data-cinematic-layer />;
}
