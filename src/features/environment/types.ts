export const weatherKinds = ['calm', 'drizzle', 'rain', 'heavy', 'storm'] as const;
export const timeKinds = ['day', 'dusk', 'night'] as const;

export type WeatherKind = (typeof weatherKinds)[number];
export type TimeKind = (typeof timeKinds)[number];

export type EnvironmentValues = {
  rain: number;
  wind: number;
  windDirection: number;
  cloud: number;
  fog: number;
  storm: number;
  lightning: number;
  daylight: number;
  moonlight: number;
  warmth: number;
};

export type EnvironmentSnapshot = {
  weather: WeatherKind;
  timeOfDay: TimeKind;
  values: EnvironmentValues;
  activeSection: string | null;
  transitioning: boolean;
  paused: boolean;
  reducedMotion: boolean;
  quality: EnvironmentQuality;
  thunderPulse: number;
};

export type EnvironmentQuality = 'full' | 'reduced' | 'static';
export type SectionActivity = 'active' | 'adjacent' | 'paused';

export type EnvironmentCycleStep = {
  weather: WeatherKind;
  timeOfDay: TimeKind;
  durationMs?: number;
};

export type EnvironmentProviderOptions = {
  initialWeather?: WeatherKind;
  initialTime?: TimeKind;
  transitionMs?: number;
  autoCycle?: boolean;
  cycle?: readonly EnvironmentCycleStep[];
  cycleDurationMs?: number;
  activeSection?: string | null;
  paused?: boolean;
  reducedMotion?: boolean;
  mobile?: boolean;
};

export type EnvironmentPoint = Readonly<{ x: number; y: number }>;

export type MovementPathConfig = Readonly<{
  id: string;
  controlPoints: readonly [EnvironmentPoint, EnvironmentPoint, EnvironmentPoint, EnvironmentPoint];
  durationMs: readonly [number, number];
  respawnDelayMs: readonly [number, number];
  fadeIn: number;
  fadeOut: number;
  depth: number;
  scale: readonly [number, number];
  verticalVariation: number;
}>;

export type MovementRun = Readonly<{
  durationMs: number;
  respawnDelayMs: number;
  phase: number;
  scale: number;
  verticalOffset: number;
}>;

export type EnvironmentDebugEntity = Readonly<{
  id: string;
  pathId: string;
  x: number;
  y: number;
  progress: number;
  direction: -1 | 1;
  speed: number;
  frameIndex: number;
  depth: number;
}>;

