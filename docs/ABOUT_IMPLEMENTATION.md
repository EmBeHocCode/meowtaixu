# Hero polish and About implementation — 2026-10-05

Scope: Hero typography and About only. Production was read-only. Expertise, Skills, Focus, Projects and Connect remain the original placeholders. No new dependencies, routing, deployment changes, weather, audio or location requests.

## Composition and language

Hero now gives the Vietnamese study line primary readable prominence, followed by a smaller English professional subtitle. Identity, poem, quiet CTA, mountains, restrained moon, Three.js motion and the current full-duration 900px preloader are preserved. The decorative inscription uses `zh-Hant`; its secondary label is ENTER THE REALM.

About places a short Vietnamese narrative on the left and one illustrated scholar's scroll on the right. The scroll is decorative imagery underneath a semantic HTML `aside`, heading and definition list, not a rasterized profile. 關於我 is vertical, decorative and hidden from assistive technology; ABOUT ME is a small English label, with Về tôi as the semantic section heading. No three-language duplication of paragraphs or per-field Chinese translations.

Content comes from the user's supplied brief and read-only `E:/bio.mieowparadise.io.vn/public_html/index.html` (identity at 224–230, About at 323–328, dossier at 343–347). Alias and HCMC location are preserved; no time-sensitive study-year claim was copied. The main narrative is deliberately short for an approximately 20–30 second read; this is an editorial estimate, not a timed user study.

## Assets and rendering

Reuse the Hero far mountains, distant pavilion layer, near bamboo/rock layer and fog. About uses layered HTML images for a lightweight 2.5D composition; no second Canvas or new particle system. Existing Three.js Hero behavior stays unchanged. The pavilion remains a distant environmental detail, not a magnified new building. One generated scroll materially provides the coherent dossier artifact.

Generated through the built-in ImageGen tool, not CLI:

- `public/assets/xianxia/props/about-scholar-scroll.png`: 1024 × 1536 retained master; alpha channel verified, range 0–254.
- `public/assets/xianxia/props/about-scholar-scroll.webp`: 800 × 1200; 140,516 bytes; lazy-loaded runtime derivative.

`scripts/prepare-about-asset.mjs` copies the retained source and performs resize/WebP conversion only, using the already available Sharp runtime. Runtime images reuse browser cache; no additional network font dependency or duplicate scene bundle is added. Dossier art is fitted to the responsive content area; text does not depend on its pixels.

## Generation prompt

Use case: stylized-concept. Asset type: transparent portrait hanging scholar scroll for an elegant cinematic Chinese xianxia portfolio About personal dossier. Generate ONE isolated antique hanging scroll, straight-on orthographic view, tall portrait 2:3 composition. Very dark aged wooden rollers at top and bottom, restrained antique brass end caps, fine ink-blue silk edging, pale warm gray rice-paper interior with subtle real fibers and gently weathered irregular edges. The blank paper writing area occupies at least 75% of width and 80% of height, uniformly pale and low-contrast so dark HTML text will be overlaid. Delicate faded ink mountain brushwork only along the very bottom margin. Lighting subdued cool midnight moonlight, elegant realistic ink-wash fantasy, premium artifact not a game UI frame. Fully visible entire scroll with small transparent margin. Genuine transparent background. NO text, NO characters or calligraphy, NO seals, NO UI, NO glowing shapes, NO neon, NO scenery behind, NO extra props. Palette compatible with midnight blue/ink-black mountains, mist gray and muted gold.

## Transition and motion

**Historical vertical implementation below is superseded by [HORIZONTAL_JOURNEY.md](HORIZONTAL_JOURNEY.md).** The current About is a full-screen horizontal chapter. Its dossier unrolls locally on first entry and can be collapsed/reopened. The old `useAboutReveal` hook is unused; it must not be mounted alongside the journey controller.

About overlaps the Hero tail by 80px. Hero artwork feathers out over its bottom 120px while About feathers in over 80px; the existing fog texture carries the transition. Masks blend existing artwork rather than depict new objects. Fog rises at most 22px with local scroll progress. An IntersectionObserver triggers a once-per-mount content reveal of 12px over 1.25–1.5 seconds; unenhanced content remains visible. Scroll updates are requestAnimationFrame-coalesced and only run while About intersects the viewport. There is no continuous animation loop in About.

The local `--about-descent` property and `useAboutReveal` hook are the extension point for future approved transitions, not an implementation of an advanced camera cinematic. Reduced motion disables reveal and fog translation. Mobile stacks narrative and dossier, removes the near bamboo layer and removes fog movement.

## Files changed / added

| Group | Files |
| --- | --- |
| Hero polish | `src/sections/Hero/Hero.tsx`, `src/sections/Hero/hero.css` |
| About implementation | `src/sections/About/About.tsx`, `src/sections/About/about.css`, `src/sections/About/useAboutReveal.ts` |
| Composition | `src/components/layout/AppShell.tsx` moves About outside the narrow placeholder wrapper |
| Asset pipeline | Scroll PNG/WebP and `scripts/prepare-about-asset.mjs` |
| Tests and docs | `tests/foundation.test.mjs`, `tests/hero-preservation.json`, this document, `ASSET_MANIFEST.md`, `ART_DIRECTION.md`, `ABOUT_CONCEPT.md` |

Only the authorized About hash in the preservation baseline was refreshed; other section, global-style, preloader and loading-video hashes remain as before this task.

## Verification

TypeScript and Vite production build pass; 8/8 existing/extended tests pass. Browser review covers Hero desktop, About desktop (1440px), tablet (768px), mobile (390px) and narrow mobile (320px), with no horizontal overflow. Reduced-motion inspection confirms `animation-name: none` and no fog transform. Chinese is excluded from the accessibility tree without losing any profile information. CTA remains an anchor to #about.

Screenshots are in `docs/verification/`: `hero-language-desktop.png`, `about-desktop.png`, `about-tablet.png`, `about-mobile-narrative.png`, `about-mobile-record.png`, `about-reduced-motion.png`, `hero-about-transition.png`.

Console has no observed application errors. Existing THREE.Clock deprecation and ~917 KB minified lazy scene chunk warning remain; they were not introduced by this work. Dev preview: http://127.0.0.1:5173/ . Stop after About.
