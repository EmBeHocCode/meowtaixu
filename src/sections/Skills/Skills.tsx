import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { masteryDisciplines, techniques } from '../../data/skills';
import { useEnvironment } from '../../features/environment';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { TechniquesSceneRoot } from '../../scene/techniques/TechniquesSceneRoot';
import './skills.css';

type SkillsProps = { active?: boolean; prepared?: boolean };

export function Skills({ active: controlledActive, prepared: controlledPrepared }: SkillsProps = {}) {
  const environment = useEnvironment();
  const active = controlledActive ?? environment.activeSection === 'skills';
  const prepared = controlledPrepared ?? environment.getSectionActivity('skills') !== 'paused';
  const mobile = useMediaQuery('(max-width: 767px)');
  const reducedMotion = environment.reducedMotion;
  const [selected, setSelected] = useState(3);
  const [sceneReady, setSceneReady] = useState(false);
  const section = useRef<HTMLElement>(null);
  const visited = useRef(false);
  const markSceneReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    if (!active || !section.current || visited.current || reducedMotion) return;
    visited.current = true;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .fromTo('.skills__passage', { opacity: 0.86, xPercent: -8 }, { opacity: 0, xPercent: -28, duration: 0.7 }, 0)
        .fromTo('.skills__heading > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.58, stagger: 0.07 }, 0.18)
        .fromTo('.skills__artifact', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.52, stagger: 0.06 }, 0.3)
        .fromTo('.skills__mastery', { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.56 }, 0.55)
        .fromTo('.skills__track-fill', { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.08 }, 0.66);
    }, section);
    return () => context.revert();
  }, [active, reducedMotion]);

  return <section ref={section} id="skills" className="skills" lang="vi" aria-labelledby="skills-heading" data-chapter-scroll data-active={active} data-scene-ready={sceneReady} data-reduced-motion={reducedMotion} data-weather={environment.weather}>
    <div className="skills__environment protected-artwork" aria-hidden="true">
      <img className="skills__environment-far" src="/assets/xianxia/techniques/chamber-mountains-far.webp" alt="" draggable="false" />
      <img className="skills__environment-mid" src="/assets/xianxia/techniques/chamber-platform-mid.webp" alt="" draggable="false" />
      <div className="skills__frame-fx skills__frame-fx--formation" />
      <div className="skills__frame-fx skills__frame-fx--talisman" />
      <img className="skills__environment-near" src="/assets/xianxia/techniques/chamber-foreground.webp" alt="" draggable="false" />
    </div>
    <div className="skills__scene" aria-hidden="true"><TechniquesSceneRoot active={active} prepared={prepared} mobile={mobile} selected={selected} reducedMotion={reducedMotion} onReady={markSceneReady} /></div>
    <div className="skills__fallback" aria-hidden="true"><i /><i /><i /></div>
    <div className="skills__weather" aria-hidden="true" />
    <div className="skills__passage" aria-hidden="true" />

    <header className="skills__heading">
      <p className="skills__eyebrow"><span>04 / CÔNG PHÁP</span><span lang="en">PRACTICED METHODS</span></p>
      <h2 id="skills-heading">Pháp môn<br />hành dụng</h2>
      <p>Những kỹ thuật đang dùng để đưa ý tưởng thành sản phẩm web hoạt động — từ nền tảng, kiến tạo giao diện đến phương pháp tăng tốc thực thi.</p>
      <span className="skills__chinese" lang="zh-Hant" aria-hidden="true">功法</span>
    </header>

    <div className="skills__archive" role="group" aria-label="Các công nghệ đang sử dụng" data-journey-input>
      {techniques.map((technique, index) => <button className="skills__artifact" type="button" key={technique.id} data-id={technique.id} data-prominence={technique.prominence} aria-pressed={selected === index} onPointerEnter={() => !mobile && setSelected(index)} onFocus={() => setSelected(index)} onClick={() => setSelected(index)}>
        <img className="skills__artifact-art protected-artwork" src={technique.asset} alt="" draggable="false" />
        <span className="skills__artifact-glyph" lang="zh-Hant" aria-hidden="true">{technique.glyph}</span>
        <span className="skills__artifact-copy"><small>{technique.category}</small><strong>{technique.name}</strong><em>{technique.note}</em></span>
      </button>)}
    </div>

    <aside className="skills__mastery" aria-labelledby="mastery-heading">
      <p><span id="mastery-heading">Hành dụng thực tế</span><span lang="en">PRACTICAL MASTERY</span></p>
      <ol>{masteryDisciplines.map(item => <li key={item.id} style={{ '--mastery-stage': item.stage } as React.CSSProperties}>
        <div><strong>{item.name}</strong><small>{item.state}</small></div>
        <span className="skills__track" aria-label={`${item.stage} trên 4 dấu ấn đã khai mở`}><i className="skills__track-fill" />{[1, 2, 3, 4].map(mark => <b key={mark} data-lit={mark <= item.stage} />)}</span>
      </li>)}</ol>
    </aside>
  </section>;
}
