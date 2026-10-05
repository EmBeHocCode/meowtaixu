import type { EnvironmentCycleStep, EnvironmentQuality, EnvironmentValues, SectionActivity, TimeKind, WeatherKind } from './types';

export const weatherTargets: Readonly<Record<WeatherKind, Pick<EnvironmentValues, 'rain' | 'wind' | 'windDirection' | 'cloud' | 'fog' | 'storm' | 'lightning'>>> = {
  calm: { rain: 0, wind: 0.1, windDirection: 0.3, cloud: 0.22, fog: 0.2, storm: 0, lightning: 0 },
  drizzle: { rain: 0.18, wind: 0.2, windDirection: 0.4, cloud: 0.46, fog: 0.34, storm: 0.05, lightning: 0 },
  rain: { rain: 0.5, wind: 0.34, windDirection: 0.5, cloud: 0.66, fog: 0.46, storm: 0.2, lightning: 0 },
  heavy: { rain: 0.78, wind: 0.54, windDirection: 0.7, cloud: 0.84, fog: 0.58, storm: 0.58, lightning: 0.08 },
  storm: { rain: 1, wind: 0.82, windDirection: 0.9, cloud: 0.98, fog: 0.66, storm: 1, lightning: 0.72 },
};

export const timeTargets: Readonly<Record<TimeKind, Pick<EnvironmentValues, 'daylight' | 'moonlight' | 'warmth'>>> = {
  day: { daylight: 1, moonlight: 0.06, warmth: 0.34 },
  dusk: { daylight: 0.42, moonlight: 0.34, warmth: 0.68 },
  night: { daylight: 0.08, moonlight: 0.88, warmth: 0.16 },
};

export const defaultEnvironmentCycle: readonly EnvironmentCycleStep[] = [
  { weather: 'calm', timeOfDay: 'day', durationMs: 28_000 },
  { weather: 'drizzle', timeOfDay: 'dusk', durationMs: 24_000 },
  { weather: 'rain', timeOfDay: 'night', durationMs: 32_000 },
  { weather: 'heavy', timeOfDay: 'night', durationMs: 20_000 },
  { weather: 'storm', timeOfDay: 'night', durationMs: 14_000 },
  { weather: 'drizzle', timeOfDay: 'dusk', durationMs: 22_000 },
] as const;

export function environmentTarget(weather: WeatherKind, timeOfDay: TimeKind): EnvironmentValues {
  return { ...weatherTargets[weather], ...timeTargets[timeOfDay] };
}

export function dampEnvironment(current: EnvironmentValues, target: EnvironmentValues, deltaMs: number, transitionMs: number) {
  const lambda = transitionMs <= 0 ? 1 : 1 - Math.exp(-Math.max(0, deltaMs) * 4.6 / transitionMs);
  const next = {} as EnvironmentValues;
  for (const key of Object.keys(current) as (keyof EnvironmentValues)[]) {
    next[key] = current[key] + (target[key] - current[key]) * lambda;
  }
  return next;
}

export function environmentDistance(a: EnvironmentValues, b: EnvironmentValues) {
  return Math.max(...(Object.keys(a) as (keyof EnvironmentValues)[]).map(key => Math.abs(a[key] - b[key])));
}

export const journeySections = ['hero', 'about', 'expertise', 'skills', 'focus', 'projects', 'connect'] as const;

export function sectionActivity(section: string, activeSection: string | null): SectionActivity {
  if (!activeSection || section === activeSection) return 'active';
  const sectionIndex = journeySections.indexOf(section as (typeof journeySections)[number]);
  const activeIndex = journeySections.indexOf(activeSection as (typeof journeySections)[number]);
  if (sectionIndex < 0 || activeIndex < 0) return 'paused';
  return Math.abs(sectionIndex - activeIndex) === 1 ? 'adjacent' : 'paused';
}

export function environmentQuality(reducedMotion: boolean, mobile: boolean): EnvironmentQuality {
  if (reducedMotion) return 'static';
  return mobile ? 'reduced' : 'full';
}

