import { expertiseBackground, expertiseDisciplines } from '../../data/expertise';
import { heroAssets } from '../../data/hero-assets';
import { techniques } from '../../data/skills';

export type ChapterLifecycle = 'unloaded' | 'preloading' | 'prepared' | 'entering' | 'active' | 'inactive' | 'returning';

export const criticalAssets: readonly (readonly string[])[] = [
  [heroAssets.far, heroAssets.mobileFar, heroAssets.mid, heroAssets.near, heroAssets.moon, heroAssets.fog, heroAssets.bambooTips, heroAssets.birdFlightSprite, '/assets/xianxia/logo/logo-main.png', '/assets/xianxia/title/hero-title-desktop.webp'],
  [heroAssets.far, heroAssets.mobileFar, heroAssets.mid, heroAssets.near, heroAssets.fog, '/assets/xianxia/props/about-scholar-scroll.webp'],
  [expertiseBackground, heroAssets.fog, ...expertiseDisciplines.map(item => item.asset)],
  ['/assets/xianxia/techniques/chamber-mountains-far.webp', '/assets/xianxia/techniques/chamber-platform-mid.webp', '/assets/xianxia/techniques/chamber-foreground.webp', '/assets/xianxia/techniques/formation-mist-16f.webp', '/assets/xianxia/techniques/talisman-flutter-16f.webp', ...techniques.map(item => item.asset)],
  [], [], [],
];

const imageCache = new Map<string, Promise<void>>();

function preloadImage(source: string) {
  const cached = imageCache.get(source);
  if (cached) return cached;
  const promise = new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => resolve();
    image.onload = () => {
      if ('decode' in image) image.decode().catch(() => undefined).finally(finish);
      else finish();
    };
    // Missing decorative art must not deadlock navigation. Static fallbacks remain,
    // while the asset test suite reports missing repository files separately.
    image.onerror = finish;
    image.src = source;
  });
  imageCache.set(source, promise);
  return promise;
}

export async function preloadChapterAssets(index: number) {
  await Promise.all(criticalAssets[index].map(preloadImage));
  if ('fonts' in document) await document.fonts.ready;
}
