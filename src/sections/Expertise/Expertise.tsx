import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { expertiseBackground, expertiseDisciplines } from '../../data/expertise';
import { useReducedMotion } from '../../features/reduced-motion/useReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ExpertiseSceneRoot } from '../../scene/ExpertiseSceneRoot';
import './expertise.css';

export function Expertise({ active, prepared }: { active: boolean; prepared: boolean }) {
  const [selected, setSelected] = useState(1);
  const [sceneReady, setSceneReady] = useState(false);
  const section = useRef<HTMLElement>(null);
  const visited = useRef(false);
  const reducedMotion = useReducedMotion();
  const mobile = useMediaQuery('(max-width: 767px)');
  const discipline = expertiseDisciplines[selected];

  useEffect(() => {
    if (!active || !section.current || visited.current || reducedMotion) return;
    visited.current = true;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .fromTo('.expertise__veil', { opacity: 0.92 }, { opacity: 0, duration: 0.7 }, 0)
        .fromTo('.expertise__eyebrow, .expertise__title, .expertise__intro', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.68, stagger: 0.08 }, 0.18)
        .fromTo('.expertise__path', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.35)
        .fromTo('.expertise__annotation', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55 }, 0.64);
    }, section);
    return () => context.revert();
  }, [active, reducedMotion]);

  const choose = (index: number) => {
    setSelected(index);
    if (!reducedMotion) gsap.fromTo('.expertise__annotation-copy', { opacity: 0, y: 7 }, { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' });
  };

  return <section
    ref={section}
    id="expertise"
    className="expertise"
    aria-labelledby="expertise-heading"
    data-chapter-scroll
    data-active={active}
    data-scene-ready={sceneReady}
    data-reduced-motion={reducedMotion}
    style={{ '--expertise-background': `url(${expertiseBackground})` } as React.CSSProperties}
  >
    <div className="expertise__backdrop protected-artwork" aria-hidden="true" />
    <div className="expertise__static-artifacts protected-artwork" aria-hidden="true">
      {expertiseDisciplines.map((item, index) => <img key={item.id} src={item.asset} alt="" draggable="false" data-selected={selected === index} />)}
    </div>
    <div className="expertise__scene" aria-hidden="true">
      <ExpertiseSceneRoot active={active} prepared={prepared} mobile={mobile} selected={selected} reducedMotion={reducedMotion} onReady={() => setSceneReady(true)} />
    </div>
    <div className="expertise__shade" aria-hidden="true" />
    <div className="expertise__veil" aria-hidden="true" />

    <div className="expertise__content">
      <p className="expertise__eyebrow"><span>03 — SỞ TU</span><span lang="en">PRACTICED ARTS</span></p>
      <h2 id="expertise-heading" className="expertise__title">Những đạo pháp<br />{' '}đang luyện</h2>
      <p className="expertise__intro">Sở tu không nằm ở một pháp môn duy nhất. Thương đạo giúp nhìn ra giá trị, web biến ý tưởng thành hình, AI rút ngắn đường đi, còn mưu hoạch giữ mọi thứ đi đúng hướng.</p>
      <span className="expertise__chinese" lang="zh-Hant" aria-hidden="true">所修</span>
    </div>

    <div className="expertise__paths" role="group" aria-label="Bốn lĩnh vực đang rèn luyện" data-journey-input>
      {expertiseDisciplines.map((item, index) => <button
        key={item.id}
        type="button"
        className="expertise__path"
        data-id={item.id}
        aria-pressed={selected === index}
        onPointerEnter={() => !mobile && choose(index)}
        onFocus={() => choose(index)}
        onClick={() => choose(index)}
      >
        <span className="expertise__path-label">
          <span>{item.index}</span>
          <strong>{item.title}</strong>
          <small lang="en">{item.english}</small>
        </span>
      </button>)}
    </div>

    <aside className="expertise__annotation" aria-live="polite">
      <div className="expertise__annotation-copy" key={discipline.id}>
        <span className="expertise__annotation-index">{discipline.index} · <span lang="zh-Hant">{discipline.chinese}</span></span>
        <h3>{discipline.title}</h3>
        <p lang="en">{discipline.english}</p>
        <div aria-hidden="true" />
        <p>{discipline.description}</p>
      </div>
    </aside>
  </section>;
}
