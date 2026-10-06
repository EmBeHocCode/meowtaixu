import type { RefObject } from 'react';

export type HeroMotion = { x: number; y: number; scroll: number };
export type HeroSceneProps = {
  mobile: boolean;
  active: boolean;
  motion: RefObject<HeroMotion>;
  onReady?: () => void;
};
