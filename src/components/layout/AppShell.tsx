import { useCallback, useEffect, useState } from 'react';
import { Preloader } from '../../features/preloader/Preloader';
import { HorizontalJourney } from '../navigation/HorizontalJourney';
import { useProtectedArtwork } from '../../hooks/useProtectedArtwork';

export function AppShell() {
  useProtectedArtwork();
  const [shellReady, setShellReady] = useState(false);
  const [initialChapterReady, setInitialChapterReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const complete = useCallback(() => setEntered(true), []);
  const markInitialChapterReady = useCallback(() => setInitialChapterReady(true), []);

  // Readiness means the semantic shell committed. Decorative WebGL must never gate content.
  useEffect(() => { setShellReady(true); }, []);

  const ready = shellReady && initialChapterReady;

  return (
    <div className="app-shell" data-app-ready={ready} data-entered={entered}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <HorizontalJourney entered={entered} onInitialPrepared={markInitialChapterReady} />
      {!entered && <Preloader ready={ready} onComplete={complete} />}
    </div>
  );
}
