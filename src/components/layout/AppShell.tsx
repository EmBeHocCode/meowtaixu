import { useCallback, useEffect, useState } from 'react';
import { Preloader } from '../../features/preloader/Preloader';
import { HorizontalJourney } from '../navigation/HorizontalJourney';
import { useProtectedArtwork } from '../../hooks/useProtectedArtwork';

export function AppShell() {
  useProtectedArtwork();
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const complete = useCallback(() => setEntered(true), []);

  // Readiness means the semantic shell committed. Decorative WebGL must never gate content.
  useEffect(() => { setReady(true); }, []);

  return (
    <div className="app-shell" data-app-ready={ready} data-entered={entered}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <HorizontalJourney entered={entered} />
      {!entered && <Preloader ready={ready} onComplete={complete} />}
    </div>
  );
}
