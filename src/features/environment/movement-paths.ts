import type { EnvironmentPoint, MovementPathConfig, MovementRun } from './types';

export const environmentMovementPaths = {
  birdsNear: {
    id: 'birds-near',
    controlPoints: [{ x: -0.12, y: 0.42 }, { x: 0.2, y: 0.25 }, { x: 0.68, y: 0.36 }, { x: 1.12, y: 0.18 }],
    durationMs: [15_000, 21_000], respawnDelayMs: [9_000, 22_000], fadeIn: 0.1, fadeOut: 0.12,
    depth: 0.72, scale: [0.9, 1.08], verticalVariation: 0.035,
  },
  birdsFar: {
    id: 'birds-far',
    controlPoints: [{ x: 1.1, y: 0.3 }, { x: 0.82, y: 0.2 }, { x: 0.36, y: 0.3 }, { x: -0.1, y: 0.24 }],
    durationMs: [23_000, 31_000], respawnDelayMs: [16_000, 34_000], fadeIn: 0.12, fadeOut: 0.14,
    depth: 0.34, scale: [0.58, 0.76], verticalVariation: 0.025,
  },
} as const satisfies Record<string, MovementPathConfig>;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;

export function sampleMovementPath(path: MovementPathConfig, progress: number, run?: Pick<MovementRun, 'verticalOffset'>): EnvironmentPoint {
  const t = clamp01(progress);
  const inverse = 1 - t;
  const [a, b, c, d] = path.controlPoints;
  return {
    x: inverse ** 3 * a.x + 3 * inverse ** 2 * t * b.x + 3 * inverse * t ** 2 * c.x + t ** 3 * d.x,
    y: inverse ** 3 * a.y + 3 * inverse ** 2 * t * b.y + 3 * inverse * t ** 2 * c.y + t ** 3 * d.y + (run?.verticalOffset ?? 0),
  };
}

export function movementFacing(path: MovementPathConfig, progress: number): -1 | 1 {
  const before = sampleMovementPath(path, Math.max(0, progress - 0.002));
  const after = sampleMovementPath(path, Math.min(1, progress + 0.002));
  return after.x >= before.x ? 1 : -1;
}

export function movementOpacity(path: MovementPathConfig, progress: number) {
  const t = clamp01(progress);
  const entering = path.fadeIn <= 0 ? 1 : clamp01(t / path.fadeIn);
  const leaving = path.fadeOut <= 0 ? 1 : clamp01((1 - t) / path.fadeOut);
  return Math.min(entering, leaving);
}

export function createMovementRun(path: MovementPathConfig, random: () => number = Math.random): MovementRun {
  return {
    durationMs: mix(path.durationMs[0], path.durationMs[1], random()),
    respawnDelayMs: mix(path.respawnDelayMs[0], path.respawnDelayMs[1], random()),
    phase: random(),
    scale: mix(path.scale[0], path.scale[1], random()),
    verticalOffset: mix(-path.verticalVariation, path.verticalVariation, random()),
  };
}
