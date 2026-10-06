import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { heroAssets } from '../../data/hero-assets';
import { useReducedMotion } from '../../features/reduced-motion/useReducedMotion';
import './about.css';

export function About({ active = true }: { active?: boolean }) {
  const host = useRef<HTMLElement>(null);
  const dossier = useRef<HTMLElement>(null);
  const labelFade = useRef<gsap.core.Tween | null>(null);
  const visited = useRef(false);
  const autoOpened = useRef(false);
  const userHasChangedDossierState = useRef(false);
  const previousOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => () => { labelFade.current?.kill(); }, []);
  useEffect(() => {
    if (!active || autoOpened.current || userHasChangedDossierState.current) return;
    autoOpened.current = true;
    setOpen(true);
  }, [active]);
  useEffect(() => {
    const element = dossier.current;
    if (!element) return;
    const first = !visited.current;
    const rows = element.querySelectorAll('.about__record > *, .about__record dl > div');
    const inscription = element.querySelector('.about__inscription');
    const label = element.querySelector('.about__artifact-label');
    if (first) {
      // Prepare and paint the adjacent dossier before the journey reaches About.
      // This avoids a React render + image/clip-path paint on the first transition.
      visited.current = true;
      previousOpen.current = open;
      gsap.set(element, { '--unroll': open ? 1 : 0.08, opacity: 1 });
      gsap.set(rows, { opacity: open ? 1 : 0 });
      gsap.set(inscription, { opacity: open ? 0.7 : 0 });
      gsap.set(label, { opacity: 1 });
      return;
    }
    const unchanged = !first && previousOpen.current === open;
    previousOpen.current = open;
    if (reduced || unchanged) {
      gsap.set(element, { '--unroll': open ? 1 : 0.08, opacity: 1 });
      gsap.set(rows, { opacity: open ? 1 : 0 });
      gsap.set(inscription, { opacity: open ? 0.7 : 0 });
      gsap.set(label, { opacity: 1 });
      setBusy(false);
      return;
    }
    setBusy(true);
    const timeline = gsap.timeline({ onComplete: () => setBusy(false) });
    gsap.set(label, { opacity: 0 });
    if (open) {
      gsap.set(rows, { opacity: 0 });
      gsap.set(inscription, { opacity: 0 });
      timeline.to(element, { opacity: 1, duration: 0.25 })
        .to(element, { '--unroll': 1, duration: 0.85, ease: 'power2.inOut' })
        .to(rows, { opacity: 1, stagger: 0.045, duration: 0.3 })
        .to(inscription, { opacity: 0.7, duration: 0.3 })
        .to(label, { opacity: 1, duration: 0.3 });
    } else {
      timeline.to([rows, inscription], { opacity: 0, duration: 0.15 })
        .to(element, { '--unroll': 0.08, duration: 0.65, ease: 'power2.inOut' })
        .to(label, { opacity: 1, duration: 0.3 });
    }
    return () => { timeline.kill(); };
  }, [open, reduced]);

  return <section ref={host} id="about" className="about" lang="vi" aria-labelledby="about-heading" data-active={active}>
    <div className="about__world" aria-hidden="true" data-cinematic-layer>
      <picture><source media="(max-width: 767px)" srcSet={heroAssets.mobileFar} />
        <img className="about__mountains protected-artwork" draggable="false" src={heroAssets.far} alt="" loading="lazy" decoding="async" width="1672" height="941" />
      </picture>
      <img className="about__pavilion protected-artwork" draggable="false" src={heroAssets.mid} alt="" loading="lazy" decoding="async" width="1600" height="900" />
      <img className="about__bamboo protected-artwork" draggable="false" src={heroAssets.near} alt="" loading="lazy" decoding="async" width="1600" height="900" />
    </div>
    <img className="about__threshold-mist protected-artwork" draggable="false" src={heroAssets.fog} alt="" aria-hidden="true" loading="lazy" decoding="async" width="1200" height="675" />
    <div className="about__reading" data-chapter-scroll tabIndex={0} role="region" aria-label="Nội dung Thân thế">
    <div className="about__layout">
      <div className="about__narrative" data-cinematic-layer>
        <p className="about__eyebrow" lang="en">ABOUT ME <span aria-hidden="true">—</span></p>
        <h2 id="about-heading" className="about__section-label"><span aria-hidden="true">02 / </span>THÂN THẾ</h2>
        <p className="about__lead">Phàm danh Nguyễn Lâm Hùng, đạo hiệu Meow.</p>
        <div className="about__prose">
          <p>Sở tu khởi từ Thương mại điện tử, đạo lộ hiện tại nghiêng về web và AI bots. Phần lớn thời gian dành cho việc dựng nên những sản phẩm có thể giải quyết một nhu cầu rõ ràng, từ ý tưởng ban đầu cho tới lúc thực sự dùng được.</p>
          <p>Điều đáng theo đuổi không nằm ở việc viết xong bao nhiêu tính năng, mà ở chỗ hiểu được vấn đề, chọn đúng hướng và khiến thứ được dựng nên có giá trị sử dụng.</p>
          <p>AI được xem như một pháp khí trợ lực — giúp rút ngắn đường đi, tăng tốc thử nghiệm và mở rộng khả năng thực thi. Nhưng phương hướng và quyết định cuối cùng vẫn cần được nắm trong tay.</p>
          <p>Đạo lộ còn dài. Web vẫn là mạch chính; AI là trợ lực đồng hành trên đường tiếp tục xây dựng và hoàn thiện sản phẩm.</p>
        </div>
      </div>
      <aside ref={dossier} className="about__dossier" aria-label="Thông tin cá nhân" data-cinematic-layer data-open={open} data-busy={busy}>
        <div className="about__scroll-shell protected-artwork" aria-hidden="true">{['paper', 'top', 'bottom'].map(part => <img key={part} draggable="false" className={`about__scroll-art about__scroll-art--${part}`} src="/assets/xianxia/props/about-scholar-scroll.webp" alt="" loading="eager" decoding="async" width="1024" height="1536" />)}</div>
        <div className="about__record" id="about-record" inert={!open || busy} aria-hidden={!open || busy}>
          <p className="about__record-label" lang="en">PERSONAL RECORD</p>
          <h3 id="about-record-heading">Thông tin cá nhân</h3>
          <dl>
            <div><dt><span lang="zh-Hant">姓名</span> / Tên thật</dt><dd>Nguyễn Lâm Hùng</dd></div>
            <div><dt><span lang="zh-Hant">道號</span> / Đạo hiệu</dt><dd>Meow</dd></div>
            <div><dt><span lang="zh-Hant">玉簡</span> / <span lang="en">GitHub</span></dt><dd lang="en">EmBeHocCode</dd></div>
            <div><dt><span lang="zh-Hant">所在</span> / Nơi ở</dt><dd>TP. Hồ Chí Minh, Việt Nam</dd></div>
            <div><dt><span lang="zh-Hant">所修</span> / Sở tu</dt><dd>Thương mại điện tử<br /><span lang="en">E-Commerce</span></dd></div>
            <div><dt><span lang="zh-Hant">所行</span> / Đạo lộ</dt><dd lang="en">Web Products<br />AI Bots<br />Automation<br />AI-assisted Workflow</dd></div>
          </dl>
        </div>
        <span className="about__inscription" lang="zh-Hant" aria-hidden="true">關於我</span>
        <button type="button" className="about__artifact-control" data-journey-input aria-label={open ? 'Khép hồ sơ' : 'Mở hồ sơ'} aria-expanded={open} aria-controls="about-record" aria-disabled={busy} onClick={() => {
          if (busy) return;
          userHasChangedDossierState.current = true;
          if (reduced) { setOpen(value => !value); return; }
          setBusy(true);
          labelFade.current = gsap.to(dossier.current!.querySelector('.about__artifact-label'), { opacity: 0, duration: 0.15, onComplete: () => setOpen(value => !value) });
        }}>
          <span className="about__artifact-label">{open ? 'Khép hồ sơ' : 'Mở hồ sơ'}</span>
        </button>
      </aside>
    </div>
    </div>
  </section>;
}
