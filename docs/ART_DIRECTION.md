# Art direction

Source of truth: `.codex/skills/xianxia-web-design/SKILL.md`.

## Intended experience

A cinematic Chinese xianxia / ancient cultivation personal portfolio, combining wuxia fantasy, Chinese ink-wash aesthetics, and realistic atmospheric environments. Elegant, mystical and premium; never a fantasy game HUD or a SaaS dashboard with decorative fantasy styling.

## Palette and composition

Prefer deep ink black, midnight blue, mist gray, jade green, parchment white and muted antique gold. Create depth with mountain layers, mist, negative space and restrained contrast. Motifs may include mountains, clouds, moon, temples, bamboo, plum/cherry blossoms, lanterns, talismans, jade, scrolls, swords and spiritual particles. Choose motifs purposefully, not all at once.

Important visual subjects require proper imagery, authored artwork or models. Do not fake them with plain circles, rectangles, rounded cards, random gradient blobs or meaningless glow. Ordinary layout and accessible controls are not depicted artwork.

## Multilingual visual composition

Follow [LANGUAGE_SYSTEM.md](LANGUAGE_SYSTEM.md) for language roles, section vocabulary, typography and accessibility. The three languages are complementary, not equal translations everywhere.

Vietnamese is primary: body content, explanations, personal information and long-form content receive the highest readability and semantic priority. English supplies professional subtitles, technology terminology, portfolio labels and short international context; use restrained uppercase tracking for labels, not every sentence. Chinese supplies occasional large or vertical decorative headings, poetic labels, seals and cultivation atmosphere. It must never carry critical information by itself.

Use multilingual text selectively within the landscape. Avoid repeating each sentence in VN + EN + CN or forcing three-language heading stacks into every section. Visitors unable to read Chinese must still understand the entire portfolio and its actions. Keep meaningful content in HTML; decorative scale must not displace readable Vietnamese text. On mobile, reduce optional accents before reducing primary text readability.

These rules guide future authorized section work. This documentation update does not redesign existing sections or authorize new artwork.

## Asset-first implementation

Identify required assets before building each major section; inspect and reuse suitable existing assets before generating/preparing missing ones. Store descriptive files under `public/assets/xianxia/`. Use transparent PNG/WebP for isolated foreground layers. Prefer layered 2.5D when full modeling offers no meaningful benefit. See `ASSET_MANIFEST.md` for the current asset state.

## Rendering responsibilities

HTML/CSS owns profile, navigation, projects, skills and all readable content. Three.js / React Three Fiber owns atmospheric depth, parallax, fog, particles, floating props, subtle lighting and camera movement. Do not put normal text in WebGL. Future sections should feel integrated into the environment without obscuring content or breaking keyboard/touch use.

Visitors must quickly identify the owner, study direction, skills, projects and contact options. Preserve existing personal information and content; never invent credentials. Production is reference-only, not an output directory.

## Motion and delivery

### Current global navigation: horizontal chapters

The approved journey is Hero → About → Expertise → Skills → Focus → Projects → Connect. A controlled GSAP track travels sideways in one viewport; do not restore a vertical document flow or native horizontal carousel. Reused environmental mist bridges the travel. Stable hashes and semantic HTML remain independent of WebGL. Reduced motion uses a short fade, not lateral camera travel.

About's vertical dossier unroll is local artifact motion, not page scrolling. Mobile/short viewports may explicitly scroll readable About content inside stationary scenery; wheel gestures remain local until a boundary and a fresh gesture. Later chapters remain structural placeholders until separately approved. See [HORIZONTAL_JOURNEY.md](HORIZONTAL_JOURNEY.md).

Use slow cloud drift, petal fall, bamboo movement, lantern sway, floating swords, scroll reveals, mist transitions or restrained scroll-linked camera motion when justified. Avoid bouncing, flashy neon and arcade effects. Respect reduced-motion preferences and make the static experience complete.

Optimize formats/textures, lazy-load expensive sections, limit mobile effects and avoid oversized scenes. Review implemented sections in a running browser on desktop and mobile, including reduced-motion and WebGL failure. Redesign generic-looking compositions only within the requested task scope.

## Foundation snapshot (before Hero implementation)

Only neutral global styling, semantic section headings, navigation, a loading video, smooth-scroll infrastructure and an empty demand-rendered Canvas are implemented. The generated mountain image is catalogued but not mounted. No new art, final layouts, lighting, models, particles, shaders, audio player, weather service or location prompt is implemented.

## Hero implementation — 2026-10-05

The Hero now uses the approved mountain painting as a combined night-sky/far-mountain layer, generated transparent pavilion/mountain and bamboo/rock layers, a textured moon, and translucent fog. Tiny muted-gold motes are deliberately sparse. See `HERO_IMPLEMENTATION.md` for exact assets, prompts, architecture and verification.

Composition is identity at center-left, detailed mountains/pavilion to the right, quiet moon above and framing bamboo/stone at the bottom. HTML text uses parchment white and antique-gold accents without cards or geometric environmental stand-ins. On mobile, the identity stacks and the mountain composition crops toward the pavilion.

At that Hero milestone, no other section was redesigned. No flying sword, extra character, audio or weather implementation was added. Hero reveals after loading with a short content fade and generated mist.

## About implementation — 2026-10-05

The subsequently authorized About section extends the same mountain world into a quiet scholar's record. Existing distant pavilion, mountains, bamboo and mist frame a left-side Vietnamese narrative and a single generated hanging scroll with selectable HTML dossier content on the right. Chinese 關於我 is an occasional vertical decorative accent, English is secondary metadata, and Vietnamese carries the explanation and profile labels. The boundary is blended through mist and feathered artwork rather than a rectangular UI divider. About uses lightweight layered imagery, not a new WebGL scene. See `ABOUT_IMPLEMENTATION.md` for asset provenance, exact scope and verification. No section after About has been implemented.

## Hero + About final polish — 2026-10-05

The loading video now hands off to the full `logo-as.png` lockup before the existing mist-led Hero reveal. The persistent header uses the compact `logo-main.png` emblem. Hero remains visually sparse and adds one short Vietnamese personal note; About uses natural first-person copy and keeps the interactive scroll as its primary artifact. No new environment assets or heavy transitions were added, and chapters after About remain structural placeholders.

The final title pass replaces the visible HTML display title with a transparent authored `Nhập thế hành đạo` artwork while retaining a semantic H1 and readable text fallback. A low-frequency masked shimmer and luminance breath keep it alive without neon or arcade motion; reduced-motion visitors receive a static title. Decorative images use scoped drag, selection, long-press and context-menu protection only—body text, controls and browser shortcuts remain unaffected.
