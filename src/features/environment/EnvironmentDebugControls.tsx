import { useEffect, useMemo, useState } from 'react';
import { useEnvironment } from './EnvironmentProvider';
import { environmentMovementPaths } from './movement-paths';
import { timeKinds, weatherKinds, type EnvironmentDebugEntity, type TimeKind, type WeatherKind } from './types';

export function EnvironmentDebugControls({ entities = [] }: { entities?: readonly EnvironmentDebugEntity[] }) {
  const enabled = useMemo(() => import.meta.env.DEV && new URLSearchParams(location.search).get('envDebug') === '1', []);
  const environment = useEnvironment();
  const [showPaths, setShowPaths] = useState(true);
  const [reportedEntities, setReportedEntities] = useState<readonly EnvironmentDebugEntity[]>(entities);
  useEffect(() => {
    if (!enabled) return;
    const records = new Map<string, EnvironmentDebugEntity>();
    const receive = (event: Event) => {
      const entity = (event as CustomEvent<EnvironmentDebugEntity>).detail;
      records.set(entity.id, entity);
      setReportedEntities([...records.values()]);
    };
    window.addEventListener('environment-debug-entity', receive);
    return () => window.removeEventListener('environment-debug-entity', receive);
  }, [enabled]);
  if (!enabled) return null;

  return <>
    {showPaths && <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" style={pathOverlayStyle} aria-hidden="true">
      {Object.values(environmentMovementPaths).map(path => {
        const [a, b, c, d] = path.controlPoints;
        return <g key={path.id}>
          <path d={`M ${a.x * 1000} ${a.y * 1000} C ${b.x * 1000} ${b.y * 1000}, ${c.x * 1000} ${c.y * 1000}, ${d.x * 1000} ${d.y * 1000}`} fill="none" stroke="#d1b06c" strokeWidth="2" strokeDasharray="9 8" />
          <circle cx={a.x * 1000} cy={a.y * 1000} r="7" fill="#79c99e" />
          <circle cx={d.x * 1000} cy={d.y * 1000} r="7" fill="#d47766" />
        </g>;
      })}
      {reportedEntities.map(entity => <circle key={entity.id} cx={entity.x * 1000} cy={entity.y * 1000} r="9" fill="#f4dfad" />)}
    </svg>}
    <aside style={panelStyle} aria-label="Environment debug controls">
    <strong style={{ letterSpacing: '0.08em' }}>ENV DEBUG</strong>
    <label style={rowStyle}>Weather
      <select value={environment.weather} onChange={event => environment.setWeather(event.target.value as WeatherKind)}>
        {weatherKinds.map(kind => <option key={kind}>{kind}</option>)}
      </select>
    </label>
    <label style={rowStyle}>Time
      <select value={environment.timeOfDay} onChange={event => environment.setTimeOfDay(event.target.value as TimeKind)}>
        {timeKinds.map(kind => <option key={kind}>{kind}</option>)}
      </select>
    </label>
    <div style={{ display: 'flex', gap: 6 }}>
      <button type="button" onClick={() => environment.setPaused(!environment.paused)}>{environment.paused ? 'Resume' : 'Pause'}</button>
      <button type="button" onClick={() => setShowPaths(value => !value)}>{showPaths ? 'Hide paths' : 'Show paths'}</button>
    </div>
    <small>Section: {environment.activeSection ?? 'unset'} · {environment.transitioning ? 'blending' : 'settled'} · {environment.quality}</small>
    <output style={{ fontVariantNumeric: 'tabular-nums' }}>
      rain {environment.values.rain.toFixed(2)} · wind {environment.values.wind.toFixed(2)} · fog {environment.values.fog.toFixed(2)} · thunder {environment.thunderPulse.toFixed(2)}
    </output>
    {reportedEntities.slice(0, 5).map(entity => <small key={entity.id} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {entity.id}: ({entity.x.toFixed(2)}, {entity.y.toFixed(2)}) · {entity.direction > 0 ? '→' : '←'} · {entity.speed.toFixed(2)} · f{entity.frameIndex} · z{entity.depth.toFixed(2)}
    </small>)}
  </aside></>;
}

const panelStyle = {
  position: 'fixed', right: 12, bottom: 64, zIndex: 9999, display: 'grid', gap: 8,
  width: 270, padding: 12, color: '#f1e7d2', background: 'rgb(5 10 16 / 92%)',
  border: '1px solid #9b855c', font: '12px/1.4 system-ui', pointerEvents: 'auto',
} as const;

const rowStyle = { display: 'grid', gridTemplateColumns: '72px 1fr', alignItems: 'center', gap: 8 } as const;
const pathOverlayStyle = { position: 'fixed', inset: 0, zIndex: 9998, width: '100%', height: '100%', pointerEvents: 'none' } as const;

