import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { dampEnvironment, defaultEnvironmentCycle, environmentDistance, environmentQuality, environmentTarget, sectionActivity } from './environment-model';
import type { EnvironmentProviderOptions, EnvironmentSnapshot, SectionActivity, TimeKind, WeatherKind } from './types';

type EnvironmentContextValue = EnvironmentSnapshot & {
  setWeather: (weather: WeatherKind) => void;
  setTimeOfDay: (time: TimeKind) => void;
  setActiveSection: (section: string | null) => void;
  setPaused: (paused: boolean) => void;
  getSectionActivity: (section: string) => SectionActivity;
};

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export function EnvironmentProvider({
  children,
  initialWeather = 'calm',
  initialTime = 'night',
  transitionMs = 5_000,
  autoCycle = false,
  cycle = defaultEnvironmentCycle,
  cycleDurationMs = 28_000,
  activeSection: controlledSection,
  paused: controlledPaused,
  reducedMotion: controlledReducedMotion,
  mobile: controlledMobile,
}: PropsWithChildren<EnvironmentProviderOptions>) {
  const [weather, setWeather] = useState<WeatherKind>(initialWeather);
  const [timeOfDay, setTimeOfDay] = useState<TimeKind>(initialTime);
  const [localSection, setLocalSection] = useState<string | null>(null);
  const [localPaused, setLocalPaused] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [mediaReducedMotion, setMediaReducedMotion] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mediaMobile, setMediaMobile] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(max-width: 767px), (pointer: coarse)').matches);
  const [thunderPulse, setThunderPulse] = useState(0);
  const [values, setValues] = useState(() => environmentTarget(initialWeather, initialTime));
  const target = useMemo(() => environmentTarget(weather, timeOfDay), [weather, timeOfDay]);
  const targetRef = useRef(target);
  const valuesRef = useRef(values);
  const cycleIndex = useRef(0);
  targetRef.current = target;
  const paused = controlledPaused ?? localPaused;
  const reducedMotion = controlledReducedMotion ?? mediaReducedMotion;
  const mobile = controlledMobile ?? mediaMobile;
  const effectivePaused = paused || documentHidden;

  useEffect(() => {
    const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = matchMedia('(max-width: 767px), (pointer: coarse)');
    const syncReduced = () => setMediaReducedMotion(reducedQuery.matches);
    const syncMobile = () => setMediaMobile(mobileQuery.matches);
    const syncVisibility = () => setDocumentHidden(document.hidden);
    reducedQuery.addEventListener('change', syncReduced);
    mobileQuery.addEventListener('change', syncMobile);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      reducedQuery.removeEventListener('change', syncReduced);
      mobileQuery.removeEventListener('change', syncMobile);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (effectivePaused) return;
    if (reducedMotion) {
      valuesRef.current = targetRef.current;
      setValues(targetRef.current);
      return;
    }
    if (environmentDistance(valuesRef.current, targetRef.current) < 0.001) {
      valuesRef.current = targetRef.current;
      setValues(targetRef.current);
      return;
    }
    let frame = 0;
    let last = performance.now();
    let lastCommit = last;
    const update = (now: number) => {
      const next = dampEnvironment(valuesRef.current, targetRef.current, Math.min(now - last, 100), transitionMs);
      last = now;
      valuesRef.current = next;
      if (now - lastCommit >= 50 || environmentDistance(next, targetRef.current) < 0.001) {
        setValues(next);
        lastCommit = now;
      }
      if (environmentDistance(next, targetRef.current) >= 0.001) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [target, transitionMs, effectivePaused, reducedMotion]);

  useEffect(() => {
    if (!autoCycle || cycle.length === 0 || effectivePaused || reducedMotion) return;
    const advance = () => {
      cycleIndex.current = (cycleIndex.current + 1) % cycle.length;
      const step = cycle[cycleIndex.current];
      setWeather(step.weather);
      setTimeOfDay(step.timeOfDay);
      timer = window.setTimeout(advance, step.durationMs ?? cycleDurationMs);
    };
    const first = cycle[cycleIndex.current];
    setWeather(first.weather);
    setTimeOfDay(first.timeOfDay);
    let timer = window.setTimeout(advance, first.durationMs ?? cycleDurationMs);
    return () => window.clearTimeout(timer);
  }, [autoCycle, cycle, cycleDurationMs, effectivePaused, reducedMotion]);

  useEffect(() => {
    if (effectivePaused || reducedMotion || (weather !== 'heavy' && weather !== 'storm')) {
      setThunderPulse(0);
      return;
    }
    let pulseTimer = 0;
    let decayTimer = 0;
    let resetTimer = 0;
    const schedule = () => {
      const minimum = weather === 'storm' ? 8_000 : 18_000;
      const spread = weather === 'storm' ? 12_000 : 20_000;
      pulseTimer = window.setTimeout(() => {
        setThunderPulse(weather === 'storm' ? 0.72 : 0.22);
        decayTimer = window.setTimeout(() => setThunderPulse(weather === 'storm' ? 0.18 : 0.06), 110);
        resetTimer = window.setTimeout(() => { setThunderPulse(0); schedule(); }, 340);
      }, minimum + Math.random() * spread);
    };
    schedule();
    return () => {
      window.clearTimeout(pulseTimer);
      window.clearTimeout(decayTimer);
      window.clearTimeout(resetTimer);
    };
  }, [weather, effectivePaused, reducedMotion]);

  const setActiveSection = useCallback((section: string | null) => {
    if (controlledSection === undefined) setLocalSection(section);
  }, [controlledSection]);
  const activeSection = controlledSection === undefined ? localSection : controlledSection;
  const setPaused = useCallback((next: boolean) => {
    if (controlledPaused === undefined) setLocalPaused(next);
  }, [controlledPaused]);
  const getSectionActivity = useCallback((section: string) => sectionActivity(section, activeSection), [activeSection]);
  const value = useMemo<EnvironmentContextValue>(() => ({
    weather,
    timeOfDay,
    values,
    activeSection,
    transitioning: environmentDistance(values, target) >= 0.001,
    paused: effectivePaused,
    reducedMotion,
    quality: environmentQuality(reducedMotion, mobile),
    thunderPulse,
    setWeather,
    setTimeOfDay,
    setActiveSection,
    setPaused,
    getSectionActivity,
  }), [weather, timeOfDay, values, activeSection, target, effectivePaused, reducedMotion, mobile, thunderPulse, setActiveSection, setPaused, getSectionActivity]);

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
  const value = useContext(EnvironmentContext);
  if (!value) throw new Error('useEnvironment must be used inside EnvironmentProvider');
  return value;
}

