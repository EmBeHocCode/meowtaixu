# Horizontal journey foundation

Implemented 2026-10-05. Work is confined to `E:/bio-meowtutien`; production was not modified. No dependencies or artwork were added. Only Hero and About have designed compositions; later chapters remain structural headings.

## Navigation ownership

`HorizontalJourney.tsx` owns a viewport-wide flex track and GSAP transform. Chapters are hero, about, expertise, skills, focus, projects, connect. Each occupies one viewport. There is no native horizontal scroll container or continuous ScrollTrigger timeline. The former vertical Lenis provider is not mounted, avoiding competing wheel handlers.

Dominant wheel deltaX/deltaY controls navigation without Shift. A 65px accumulation threshold, one-second transition and 220ms quiet-gap gate prevent one gesture/momentum tail from skipping chapters. ArrowLeft/Right and PageUp/Down navigate; Home/End select endpoints. Modified keys, repeats and interactive controls are excluded. Menu links and footer controls also navigate.

Touch navigation requires a horizontal swipe over 55px, with horizontal displacement greater than 1.25 times vertical displacement. Vertical gestures remain available for content; controls are excluded. Pinch zoom remains enabled.

## Hash, focus and accessibility

Initial hashes are resolved before paint; refresh and direct #about work after the unchanged full-duration intro. Navigation pushes hash history without reload; popstate/hashchange restore position. Legacy #services and #experience resolve to expertise and projects. Inactive chapters are inert and aria-hidden. Focus moves out of a departing chapter to the main viewport; current navigation has aria-current and a polite chapter announcement.

Reduced motion replaces horizontal travel with an 80ms fade out and 120ms fade in. About opens without unroll animation. Semantic content, navigation and static artwork do not require WebGL.

## About and nested content

On first active entry, mist settles for 300ms, the dossier appears, rods separate while parchment expands vertically, rows reveal, then the decorative inscription appears. Click/tap the artifact or its accessible toggle to collapse/reopen. Returning to the chapter preserves open state and does not replay the first reveal. Artifact animation is independent of global navigation.

`.about__reading` is an explicit vertical-overflow exception within stationary scenery. It is bounded below the global header and above the footer. Wheel input remains local while content can scroll; after reaching a boundary, a fresh gesture can navigate. Other chapters do not gain nested scroll automatically. The old `useAboutReveal.ts` vertical-page hook is retained but unused.

## Rendering lifecycle

Chapter wrappers expose active/nearby/paused phases for future section work. Hero Canvas is active only in settled Hero, prepared while Hero/About is selected, and unmounted for farther chapters. About uses cached layered images and a finite GSAP reveal, not a second Canvas or continuous frame loop. No particles or stronger Hero motion were added.

## Changed implementation files

- Navigation: `src/components/navigation/HorizontalJourney.tsx`, `journey-model.ts`, `journey.css`.
- Wiring: `src/components/layout/AppShell.tsx`, `src/app/providers/AppProviders.tsx`.
- Sections: `src/sections/Hero/Hero.tsx`, `src/sections/About/About.tsx`; Expertise/Projects identifiers canonicalized only.
- Verification: `tests/journey.test.mjs`, `tests/hero-preservation.json`, `package.json`, screenshots under `docs/verification/`.
- Documentation: this document, `ART_DIRECTION.md`, historical note in `ABOUT_IMPLEMENTATION.md`.

## Verification and known limits

Unit tests cover chapter aliases/order, dominant wheel axis, gesture locking/momentum, and nested-scroll boundaries. Browser checks cover Hero/About/next placeholder, both wheel axes, keyboard with interactive-control exclusion, deep-link refresh, current navigation, and dossier toggling. Mobile swipe was exercised with synthetic TouchEvents; physical phone/trackpad hardware was not available. Desktop wheel input used browser input dispatch.

Existing THREE.Clock deprecation and approximately 917KB minified lazy scene chunk warning remain. This foundation does not add scene complexity. The folder is not a Git repository, so changed-file reporting is task-scoped rather than a Git diff.

Dev server: http://127.0.0.1:5173/ . Stop at stable Hero + About; do not design later chapters without approval.
