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
  const previousOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seen, setSeen] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => () => { labelFade.current?.kill(); }, []);
  useEffect(() => {
    const element = dossier.current;
    if (!element || !active) return;
    const first = !visited.current;
    visited.current = true;
    setSeen(true);
    const rows = element.querySelectorAll('.about__record > *, .about__record dl > div');
    const inscription = element.querySelector('.about__inscription');
    const label = element.querySelector('.about__artifact-label');
    const unchanged = !first && previousOpen.current === open;
    previousOpen.current = open;
    if (reduced || unchanged || first) {
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
  }, [active, open, reduced]);

  return <section ref={host} id="about" className="about" lang="vi" aria-labelledby="about-heading" data-active={active}>
    <div className="about__world" aria-hidden="true">
      <picture><source media="(max-width: 767px)" srcSet={heroAssets.mobileFar} />
        <img className="about__mountains" src={heroAssets.far} alt="" loading="lazy" decoding="async" width="1672" height="941" />
      </picture>
      <img className="about__pavilion" src={heroAssets.mid} alt="" loading="lazy" decoding="async" width="1600" height="900" />
      <img className="about__bamboo" src={heroAssets.near} alt="" loading="lazy" decoding="async" width="1600" height="900" />
    </div>
    <img className="about__threshold-mist" src={heroAssets.fog} alt="" aria-hidden="true" loading="lazy" decoding="async" width="1200" height="675" />
    <div className="about__reading" data-chapter-scroll tabIndex={0} role="region" aria-label="Nội dung Về tôi">
    <div className="about__layout">
      <div className="about__narrative">
        <p className="about__eyebrow" lang="en">ABOUT ME <span aria-hidden="true">—</span></p>
        <h2 id="about-heading" className="about__section-label"><span aria-hidden="true">02 / </span>Về tôi</h2>
        <p className="about__lead">Chào bạn, mình là Meow.</p>
        <div className="about__prose">
          <p>Mình là <strong>Nguyễn Lâm Hùng</strong>, thường dùng tên <strong>Meow</strong> trên các dự án cá nhân. Hiện mình đang học ngành Thương mại điện tử và dành phần lớn thời gian để làm web, công cụ nhỏ và một vài dự án game.</p>
          <p>Mình thích những thứ vừa có phần kỹ thuật, vừa giải quyết được một nhu cầu cụ thể. Vì vậy, các dự án của mình thường xoay quanh web, E-Commerce, automation và AI.</p>
          <p>AI là một phần trong workflow của mình để làm nhanh hơn. Nhưng điều mình quan tâm nhất vẫn là hiểu vấn đề, tìm hướng giải quyết và tự hoàn thiện sản phẩm.</p>
        </div>
      </div>
      <aside ref={dossier} className="about__dossier" aria-label="Thông tin cá nhân" data-seen={seen} data-open={open} data-busy={busy}>
        <div className="about__scroll-shell" aria-hidden="true">{['paper', 'top', 'bottom'].map(part => <img key={part} className={`about__scroll-art about__scroll-art--${part}`} src="/assets/xianxia/props/about-scholar-scroll.webp" alt="" loading="lazy" decoding="async" width="1024" height="1536" />)}</div>
        <div className="about__record" id="about-record" inert={!open || busy} aria-hidden={!open || busy}>
          <p className="about__record-label" lang="en">PERSONAL RECORD</p>
          <h3 id="about-record-heading">Thông tin cá nhân</h3>
          <dl>
            <div><dt><span lang="zh-Hant">姓名</span> / <span lang="en">Name</span></dt><dd>Nguyễn Lâm Hùng</dd></div>
            <div><dt><span lang="zh-Hant">別名</span> / <span lang="en">Nickname</span></dt><dd>Meow</dd></div>
            <div><dt lang="en">GitHub</dt><dd>EmBeHocCode</dd></div>
            <div><dt><span lang="zh-Hant">所在地</span> / <span lang="en">Location</span></dt><dd>TP. Hồ Chí Minh, Việt Nam</dd></div>
            <div><dt><span lang="zh-Hant">專業</span> / <span lang="en">Major</span></dt><dd>Thương mại điện tử<br /><span lang="en">E-Commerce</span></dd></div>
            <div><dt><span lang="zh-Hant">方向</span> / <span lang="en">Focus</span></dt><dd lang="en">Web Products<br />Automation<br />AI-assisted Workflow</dd></div>
          </dl>
        </div>
        <span className="about__inscription" lang="zh-Hant" aria-hidden="true">關於我</span>
        <button type="button" className="about__artifact-control" data-journey-input aria-label={open ? 'Khép hồ sơ' : 'Mở hồ sơ'} aria-expanded={open} aria-controls="about-record" aria-disabled={busy} onClick={() => {
          if (busy) return;
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
