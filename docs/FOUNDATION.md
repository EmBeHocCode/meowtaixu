# Foundation handoff

Historical snapshot of the completed foundation. The subsequent Hero-only implementation is documented in `HERO_IMPLEMENTATION.md`; statements below about an empty Hero/Canvas describe the earlier milestone.

All implementation is inside `E:\bio-meowtutien`. Production at `E:\bio.mieowparadise.io.vn\public_html` was read only. No deployment, content migration, final visual design, new artwork or real 3D scene was created.

## Run locally

```powershell
cd E:\bio-meowtutien
npm run dev
```

Dev URL: `http://127.0.0.1:5173/`. The server binds only to loopback and uses a strict port so it does not silently move. Stop with Ctrl+C in its terminal. For a clean install use `npm ci --cache .npm-cache` from this project only. Node 22.12+ is required; verified here with Node 24.12.0.

```powershell
npm run typecheck
npm test
npm run build
```

`npm run preview` serves this project's build at `http://127.0.0.1:4173/`. `dist/` is generated locally only, not deployed. Dependencies and npm cache are local to this project. Exact package versions and the transitive graph are recorded in `package.json` and `package-lock.json`.

## Boundaries and lifecycle

| Layer | Responsibility |
| --- | --- |
| App / providers | Own application composition and cleaned-up Lenis lifecycle; native scroll when reduced motion is active |
| AppShell / navigation | Semantic HTML and section anchors; old `services` / `experience` IDs preserved |
| Preloader | Video presentation only; never waits for optional scene, music, weather or external services |
| SceneRoot / SceneCanvas | Lazy-loaded, transparent, empty R3F Canvas, one Drei camera, capped DPR, demand rendering, error/context-loss fallback |
| Feature/resource directories | Reserved with `.gitkeep`, not fake implementations or graphic substitutes |

Readiness means React has committed the semantic app shell. The preloader shows approximately 1 second of playing video before a 0.6-second GSAP fade if the app is ready; it does not wait for the full clip. Media failure exits immediately once ready. An independent 4.5-second deadline forces exit, with an 850 ms fade watchdog. Skip intro is available; reduced motion skips video and fade. Timers, listeners, animations and Lenis are cleaned up for StrictMode/remount safety. The overlay does not capture background pointer input.

The scene is optional. Lack of WebGL, a render/import failure or context loss leaves the HTML usable. Reduced motion renders a static empty scene host instead of allocating WebGL. No meshes, lights, particles, textures, fog or camera motion are present. The test mountain image is not loaded by the application.

## Dependencies installed

Runtime: React 19.3.0, React DOM 19.3.0, Three.js 0.186.1, React Three Fiber 9.8.1, Drei 10.7.9, GSAP 3.15.0, Lenis 1.3.26.

Development: Vite 8.3.2, React Vite plugin 6.1.1, TypeScript 7.0.2, `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `@types/three` 0.186.0 and `@types/node` 26.6.4. No router, UI kit, icon pack, physics, postprocessing, test-framework package or state-management library was added. Tests use the built-in Node test runner. Installation audit reported zero vulnerabilities.

## File tree

Existing before this task: `.codex/skills/xianxia-web-design/SKILL.md`, root MP4 and mountain PNG. Everything else below is foundation work. Empty reserved directories contain `.gitkeep` (omitted in this tree for readability). `node_modules/`, `.npm-cache/` and `dist/` are generated/ignored, not source.

```text
E:\bio-meowtutien
|-- .codex/skills/xianxia-web-design/SKILL.md
|-- .gitignore
|-- bg-load01_sharp.mp4
|-- index.html
|-- package.json
|-- package-lock.json
|-- tsconfig.json
|-- vite.config.ts
|-- src/
|   |-- main.tsx
|   |-- app/
|   |   |-- App.tsx
|   |   `-- providers/
|   |       |-- AppProviders.tsx
|   |       `-- SmoothScrollProvider.tsx
|   |-- components/
|   |   |-- common/SceneErrorBoundary.tsx
|   |   |-- layout/AppShell.tsx
|   |   |-- navigation/SectionNavigation.tsx
|   |   `-- ui/
|   |-- sections/
|   |   |-- Hero/Hero.tsx
|   |   |-- About/About.tsx
|   |   |-- Expertise/Expertise.tsx
|   |   |-- Skills/Skills.tsx
|   |   |-- Focus/Focus.tsx
|   |   |-- Projects/Projects.tsx
|   |   `-- Connect/Connect.tsx
|   |-- scene/
|   |   |-- SceneRoot.tsx
|   |   |-- SceneCanvas.tsx
|   |   |-- camera/FoundationCamera.tsx
|   |   |-- environment/
|   |   |-- objects/
|   |   |-- particles/
|   |   |-- shaders/
|   |   `-- effects/
|   |-- animations/
|   |   |-- scroll/createSmoothScroll.ts
|   |   |-- transitions/fadeOut.ts
|   |   `-- gsap/gsap.ts
|   |-- features/
|   |   |-- preloader/Preloader.tsx
|   |   |-- audio/
|   |   |-- weather/
|   |   |-- location/
|   |   `-- reduced-motion/useReducedMotion.ts
|   |-- hooks/useMediaQuery.ts
|   |-- data/sections.ts
|   |-- lib/assets.ts
|   |-- styles/global.css
|   |-- types/sections.ts
|   `-- utils/
|-- public/
|   |-- assets/xianxia/
|   |   |-- background/xianxia-midnight-misty-mountains-hero.png
|   |   |-- environment/
|   |   |-- characters/
|   |   |-- props/
|   |   |-- vfx/
|   |   |-- ui/
|   |   |-- textures/
|   |   `-- models/
|   |-- media/
|   |   |-- loading/bg-load01_sharp.mp4
|   |   |-- audio/
|   |   `-- video/
|   `-- fonts/
|-- tests/foundation.test.mjs
`-- docs/
    |-- ART_DIRECTION.md
    |-- ASSET_MANIFEST.md
    |-- CURRENT_SITE_INVENTORY.md
    |-- FOUNDATION.md
    `-- verification/
        |-- preloader-desktop.png
        |-- foundation-desktop.png
        `-- foundation-mobile.png
```

## Verification (2026-10-05)

| Check | Result |
| --- | --- |
| Strict TypeScript / production build | Passed |
| Node tests | 4/4 passed: directories, identical video SHA-256, existing PNG dimensions/size, required docs |
| Desktop browser | Seven headings, navigation, Lenis active, no horizontal overflow |
| Actual video playback | Time advanced from 0.16 to 1.49 seconds; decoded 1920x1080; autoplay/muted/playsInline true; loop false; object-fit cover |
| Preloader completion | Overlay removed, `data-entered=true`, app visible |
| Canvas | Actual initialized canvas with nonzero drawing buffer; no visual scene |
| Mobile 390x844 | No horizontal overflow; links wrap; all section headings available |
| Reduced-motion reload | No video/Canvas/Lenis, static fallback, app immediately entered |
| Missing video injection | Real missing-media failure in temporary browser state; app still entered and Canvas remained available |
| WebGL context-loss injection | Context-loss fallback activated; all seven sections remained available |
| Navigation | Connect link updates hash to `#connect` and scrolls |

Normal browser startup produced no runtime errors. Failure tests deliberately injected temporary missing-video/context-loss conditions into the test tab only; reload restored normal state. Browser media and viewport emulation were cleared. No website source was modified for failure injection. Screenshots are in `verification/`.

## Known warnings / deferred work

The lazy Three.js chunk is about 913 KB minified / 242 KB gzip, above Vite's 500 KB warning threshold. Main JS is about 315 KB / 103 KB gzip. The scene is already split from the app and does not gate readiness; no assets or real scene have been added. Do not hide the warning by raising the limit. Evaluate rendering-package cost during future scene work.

Three.js reports `THREE.Clock` deprecated (prefer `THREE.Timer`) through the current R3F dependency path. This is a dependency warning, not an application exception; the application does not construct a Clock. Do not patch `node_modules` or suppress warnings. Review upstream compatibility in a future dependency update.

No audio, weather or geolocation requests run. No old-site content or backend implementation has been migrated. Section headings and system typography are intentionally temporary. The xianxia skill governs future art and asset boundaries; UI/UX guidance informed reduced-motion handling and accessible native controls, not a redesign.

Implementation references: [Vite guide](https://vite.dev/guide/), [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas), [Drei camera](https://drei.docs.pmnd.rs/cameras/perspective-camera), [Lenis](https://github.com/darkroomengineering/lenis), [GSAP context cleanup](https://gsap.com/docs/v3/GSAP/gsap.context()/).
