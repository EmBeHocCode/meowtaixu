import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { expertiseBackground, expertiseDisciplines } from '../../data/expertise';
import { useReducedMotion } from '../../features/reduced-motion/useReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ExpertiseSceneRoot } from '../../scene/ExpertiseSceneRoot';
import './expertise.css';

export function Expertise({ active, prepared, onSceneReady }: { active: boolean; prepared: boolean; onSceneReady?: () => void }) {
  const [selected, setSelected] = useState(1);
  const [sceneReady, setSceneReady] = useState(false);
  const written = useRef<Record<string, number>>({});
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const section = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const mobile = useMediaQuery('(max-width: 767px)');
  const discipline = expertiseDisciplines[selected];
  const descriptionCharacters = useMemo(() => Array.from(discipline.description), [discipline.description]);

  useEffect(() => {
    const current = reducedMotion ? descriptionCharacters.length : (written.current[discipline.id] ?? 0);
    setVisibleCharacters(current);
    if (!active || reducedMotion || current >= descriptionCharacters.length) return;
    const timer = window.setInterval(() => {
      setVisibleCharacters(previous => {
        const next = Math.min(descriptionCharacters.length, previous + 1);
        written.current[discipline.id] = next;
        if (next >= descriptionCharacters.length) window.clearInterval(timer);
        return next;
      });
    }, 24);
    return () => window.clearInterval(timer);
  }, [active, discipline.id, descriptionCharacters, reducedMotion]);

  const choose = (index: number) => {
    setVisibleCharacters(reducedMotion ? Array.from(expertiseDisciplines[index].description).length : (written.current[expertiseDisciplines[index].id] ?? 0));
    setSelected(index);
    const annotation = section.current?.querySelector('.expertise__annotation-copy');
    if (!reducedMotion && annotation) gsap.fromTo(annotation, { opacity: 0, y: 7 }, { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' });
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
      <ExpertiseSceneRoot active={active} prepared={prepared} mobile={mobile} selected={selected} reducedMotion={reducedMotion} onReady={() => { setSceneReady(true); onSceneReady?.(); }} />
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
        <p className="expertise__annotation-description">
          <span aria-hidden="true">{descriptionCharacters.slice(0, visibleCharacters).join('')}</span>
          {visibleCharacters < descriptionCharacters.length && <i className="expertise__ink-cursor" aria-hidden="true" />}
          <span className="sr-only">{discipline.description}</span>
        </p>
      </div>
    </aside>
  </section>;
}
