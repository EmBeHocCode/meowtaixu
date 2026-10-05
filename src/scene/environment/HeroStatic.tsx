import { heroAssets } from '../../data/hero-assets';

// Always present behind WebGL: also the complete reduced-motion/context-loss fallback.
export function HeroStatic() {
  return <div className="hero-static" aria-hidden="true" data-hero-static>
    <picture>
      <source media="(max-width: 767px)" srcSet={heroAssets.mobileFar} />
      <img className="hero-static__far" src={heroAssets.far} alt="" fetchPriority="high" decoding="async" width="1672" height="941" />
    </picture>
    <img className="hero-static__moon" src={heroAssets.moon} alt="" width="384" height="384" />
    <img className="hero-static__mid" src={heroAssets.mid} alt="" width="1600" height="900" />
    <img className="hero-static__fog" src={heroAssets.fog} alt="" width="1200" height="675" />
    <img className="hero-static__near" src={heroAssets.near} alt="" width="1600" height="900" />
  </div>;
}
