import { useRef, useState } from 'react';
import { SceneRoot } from '../../scene/SceneRoot';
import { HeroStatic } from '../../scene/environment/HeroStatic';
import { heroAssets } from '../../data/hero-assets';
import { useHeroMotion } from '../../hooks/useHeroMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../features/reduced-motion/useReducedMotion';
import './hero.css';

export function Hero({ entered, chapterActive = true, prepared = true }: { entered: boolean; chapterActive?: boolean; prepared?: boolean }) {
  const host = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [titleFailed, setTitleFailed] = useState(false);
  const mobile = useMediaQuery('(max-width: 767px), (pointer: coarse)');
  const { motion, active } = useHeroMotion(host, reducedMotion);
  return <section ref={host} id="hero" className="hero" lang="vi" aria-labelledby="hero-heading" data-chapter-scroll data-entered={entered} data-chapter-active={chapterActive} data-reduced-motion={reducedMotion}>
    <div className="hero__art" aria-hidden="true">
      <HeroStatic />
      <SceneRoot entered={entered && prepared} active={active && entered && chapterActive} mobile={mobile} motion={motion} />
      <div className="hero__shade" />
    </div>
    <header className="hero__header">
      <a className="hero__signature" href="#hero" aria-label="Meow — home"><img className="protected-artwork" draggable="false" src="/assets/xianxia/logo/logo-main.png" alt="" width="1254" height="1254" /><span className="hero__signature-caption">A PERSONAL REALM</span></a>
      <nav className="hero__nav" aria-label="Hero navigation">
        <a href="#about">Thân thế</a><a href="#projects">Bí cảnh</a><a href="#connect">Truyền âm <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
    <div className="hero__content">
      <p className="hero__eyebrow"><span aria-hidden="true">01 —</span> NHẬP CẢNH <small lang="en">ENTER THE REALM</small></p>
      <h1 id="hero-heading" className="sr-only">Nhập thế hành đạo</h1>
      <div className="hero__title-art protected-artwork" aria-hidden="true">
        {titleFailed ? <span className="hero__title-fallback">Nhập thế hành đạo</span> : <picture>
          <source srcSet="/assets/xianxia/title/hero-title-desktop.webp" type="image/webp" />
          <img src="/assets/xianxia/title/hero-title-desktop.png" alt="" draggable="false" fetchPriority="high" decoding="async" width="2172" height="724" onError={() => setTitleFailed(true)} />
        </picture>}
        <span className="hero__title-shimmer" />
      </div>
      <span className="hero__title-line" aria-hidden="true" />
      <div className="hero__metadata">
        <p className="hero__concept"><span lang="zh-Hant">道號</span> <span aria-hidden="true">·</span> <strong>Meow</strong></p>
        <p className="hero__descriptor" lang="en">Web · AI Bots · Automation</p>
      </div>
      <p className="hero__positioning">Lấy sản phẩm làm đường đi, mượn AI làm pháp khí.</p>
      <p className="hero__poem">Mây qua núi, đường còn dài. Ta cứ đi, điều đáng làm thì làm.</p>
      <a className="hero__cta" href="#about"><span>Khám phá hành trình</span><span className="hero__cta-arrow" aria-hidden="true">→</span></a>
    </div>
    <div className="hero__calligraphy" aria-hidden="true"><span lang="zh-Hant">入仙境</span><small lang="en">ENTER THE REALM</small></div>
    <footer className="hero__footer">
      <p lang="en">A PERSONAL REALM <span>WEB · E-COMMERCE · AI</span></p>
      <a href="#about" className="hero__scroll"><span>CUỘN ĐỂ KHÁM PHÁ</span><span aria-hidden="true">↓</span></a>
    </footer>
    {!reducedMotion && <img className="hero__reveal-mist protected-artwork" draggable="false" src={heroAssets.fog} alt="" aria-hidden="true" />}
  </section>;
}
