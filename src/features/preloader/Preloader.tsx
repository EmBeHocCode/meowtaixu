import { useEffect, useRef, useState } from 'react';
import { fadeOut } from '../../animations/transitions/fadeOut';
import { assets } from '../../lib/assets';
import { useReducedMotion } from '../reduced-motion/useReducedMotion';

type PreloaderProps = { ready: boolean; onComplete: () => void };

export function Preloader({ ready, onComplete }: PreloaderProps) {
  const reducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [skip, setSkip] = useState(false);
  const [expired, setExpired] = useState(false);
  const [brandVisible, setBrandVisible] = useState(false);
  const [brandComplete, setBrandComplete] = useState(false);
  const canRevealBrand = ready && (skip || expired || failed || reducedMotion || ended);
  const leaving = brandComplete;

  useEffect(() => {
    if (reducedMotion || ended) return;
    // Only time out stalled playback, never a healthy clip based on total duration.
    let lastTime = 0;
    let lastProgress = performance.now();
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (document.hidden) { lastProgress = performance.now(); return; }
      if (video && video.currentTime > lastTime) {
        lastTime = video.currentTime;
        lastProgress = performance.now();
      } else if (performance.now() - lastProgress >= 12000) {
        setExpired(true);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, ended]);

  useEffect(() => {
    if (reducedMotion) return;
    let active = true;
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => { if (active) setFailed(true); });
    return () => { active = false; video.pause(); };
  }, [reducedMotion]);

  useEffect(() => {
    if (!canRevealBrand) return;
    setBrandVisible(true);
    const timer = window.setTimeout(() => setBrandComplete(true), reducedMotion ? 550 : 2800);
    return () => window.clearTimeout(timer);
  }, [canRevealBrand, reducedMotion]);

  useEffect(() => {
    if (!leaving) return;
    const complete = () => {
      if (document.activeElement === skipRef.current) {
        document.getElementById('main-content')?.focus();
      }
      onComplete();
    };
    if (reducedMotion || !overlayRef.current) {
      complete();
      return;
    }
    // Safety timer also covers a throttled/stopped animation ticker.
    const timer = window.setTimeout(complete, 850);
    const revert = fadeOut(overlayRef.current, complete);
    return () => { window.clearTimeout(timer); revert(); };
  }, [leaving, reducedMotion, onComplete]);

  return (
    <div ref={overlayRef} className="preloader" data-preloader data-state={leaving ? 'leaving' : brandVisible ? 'brand' : 'loading'}>
      {!reducedMotion && <video
        ref={videoRef}
        className="preloader__video"
        src={assets.loadingVideo}
        autoPlay muted playsInline preload="auto"
        aria-hidden="true" tabIndex={-1}
        onEnded={() => setEnded(true)}
        onError={() => setFailed(true)}
      />}
      {brandVisible && <div className="preloader__brand" aria-hidden="true">
        <img className="protected-artwork" draggable="false" src="/assets/xianxia/logo/logo-as.png" alt="" width="2172" height="724" />
      </div>}
      <span className="sr-only" role="status">Loading portfolio</span>
      <button ref={skipRef} className="preloader__skip" onClick={() => setSkip(true)}>Skip intro</button>
    </div>
  );
}
