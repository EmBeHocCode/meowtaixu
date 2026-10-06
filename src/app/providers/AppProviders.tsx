import { useEffect, type CSSProperties, type PropsWithChildren } from 'react';
import { EnvironmentDebugControls, EnvironmentProvider, useEnvironment } from '../../features/environment';

const worldCycle = [
  { weather: 'calm', timeOfDay: 'night', durationMs: 120_000 },
  { weather: 'drizzle', timeOfDay: 'night', durationMs: 90_000 },
  { weather: 'rain', timeOfDay: 'dusk', durationMs: 110_000 },
  { weather: 'heavy', timeOfDay: 'dusk', durationMs: 70_000 },
  { weather: 'storm', timeOfDay: 'night', durationMs: 45_000 },
  { weather: 'drizzle', timeOfDay: 'day', durationMs: 100_000 },
  { weather: 'calm', timeOfDay: 'day', durationMs: 150_000 },
] as const;

function GlobalEnvironmentBridge() {
  const environment = useEnvironment();
  const { values } = environment;
  const style = {
    '--env-rain': values.rain.toFixed(3),
    '--env-wind': values.wind.toFixed(3),
    '--env-cloud': values.cloud.toFixed(3),
    '--env-fog': values.fog.toFixed(3),
    '--env-daylight': values.daylight.toFixed(3),
    '--env-moonlight': values.moonlight.toFixed(3),
    '--env-warmth': values.warmth.toFixed(3),
  } as CSSProperties;

  useEffect(() => {
    const root = document.documentElement;
    for (const [property, value] of Object.entries(style)) root.style.setProperty(property, String(value));
    root.dataset.weather = environment.weather;
    root.dataset.time = environment.timeOfDay;
    root.dataset.section = environment.activeSection ?? 'loading';
    return () => {
      for (const property of Object.keys(style)) root.style.removeProperty(property);
      delete root.dataset.weather;
      delete root.dataset.time;
      delete root.dataset.section;
    };
  }, [environment.activeSection, environment.timeOfDay, environment.weather, style]);

  return <div className="global-weather" style={style} data-section={environment.activeSection ?? 'loading'} data-weather={environment.weather} aria-hidden="true" />;
}

export function AppProviders({ children }: PropsWithChildren) {
  // HorizontalJourney owns input and interpolation. Do not mount vertical Lenis.
  return <EnvironmentProvider initialWeather="calm" initialTime="night" transitionMs={8_000} autoCycle cycle={worldCycle}>
    <GlobalEnvironmentBridge />
    {children}
    <EnvironmentDebugControls />
  </EnvironmentProvider>;
}
