import { useRef } from 'react';
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
  const mobile = useMediaQuery('(max-width: 767px), (pointer: coarse)');
  const { motion, active } = useHeroMotion(host, reducedMotion);
  return <section ref={host} id="hero" className="hero" lang="vi" aria-labelledby="hero-heading" data-chapter-scroll data-entered={entered} data-reduced-motion={reducedMotion}>
    <div className="hero__art" aria-hidden="true">
      <HeroStatic />
      <SceneRoot entered={entered && prepared} active={active && entered && chapterActive} mobile={mobile} motion={motion} />
      <div className="hero__shade" />
    </div>
    <header className="hero__header">
      <a className="hero__signature" href="#hero" aria-label="Meow — home"><img src="/assets/xianxia/logo/logo-header.png" alt="" width="162" height="54" /><span className="hero__signature-caption">PERSONAL PORTFOLIO</span></a>
      <nav className="hero__nav" aria-label="Hero navigation">
        <a href="#about">Về tôi</a><a href="#projects">Dự án</a><a href="#connect">Kết nối <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
    <div className="hero__content">
      <p className="hero__eyebrow" lang="en"><span aria-hidden="true">01 —</span> PERSONAL PORTFOLIO</p>
      <h1 id="hero-heading">Meow<span className="hero__name-mark" aria-hidden="true">.</span></h1>
      <p className="hero__study">Nguyễn Lâm Hùng</p>
      <p className="hero__study">Sinh viên Thương mại điện tử</p>
      <p className="hero__subtitle" lang="en">E-Commerce · Web Development · AI-assisted Workflow</p>
      <a className="hero__cta" href="#about"><span>Khám phá hành trình</span><span className="hero__cta-arrow" aria-hidden="true">→</span></a>
    </div>
    <div className="hero__calligraphy" aria-hidden="true"><span lang="zh-Hant">入仙境</span><small lang="en">ENTER THE REALM</small></div>
    <footer className="hero__footer">
      <p lang="en">PERSONAL PORTFOLIO <span>WEB · E-COMMERCE · AI</span></p>
      <a href="#about" className="hero__scroll"><span>CUỘN ĐỂ KHÁM PHÁ</span><span aria-hidden="true">↓</span></a>
    </footer>
    {!reducedMotion && <img className="hero__reveal-mist" src={heroAssets.fog} alt="" aria-hidden="true" />}
  </section>;
}
