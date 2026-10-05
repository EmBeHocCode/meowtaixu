# Asset manifest

Inventory date: 2026-10-05. Paths below are relative to `E:\bio-meowtutien` unless explicitly identified as production references.

## Assets already in the working project

| Asset | Origin/status | Intended use | Notes |
| --- | --- | --- | --- |
| `bg-load01_sharp.mp4` | Existing user-provided root original | Source loading clip | 3,914,587 bytes; retained unchanged. |
| `public/media/loading/bg-load01_sharp.mp4` | Byte-for-byte copy of root original | Full-viewport preloader | Muted autoplay, playsInline, no loop; bounded wait, playback-failure fallback and reduced-motion bypass. |
| `public/assets/xianxia/background/xianxia-midnight-misty-mountains-hero.png` | Previously generated approved ImageGen asset | Master for Hero far mountains + night sky | 1,946,339 bytes; 1672 x 941, approximately 16:9. Preserved unchanged; WebP derivatives are used at runtime. |

## Hero assets added — 2026-10-05

ImageGen built-in mode generated four assets incrementally, each using the approved mountain master as a style reference. PNG masters remain beside WebP derivatives; only WebP is requested by the page. Transparency was verified numerically (alpha min 0, max 255; fog max 254). No new runtime dependency was installed for asset preparation.

| Exact project-relative path | Origin / dimensions / bytes | Actual use |
| --- | --- | --- |
| `public/assets/xianxia/background/hero-mountains-far.webp` | Approved PNG derivative; 1672 x 941; 108,880 bytes | Opaque night sky + far mountains; farthest 2.5D plane and static fallback |
| `public/assets/xianxia/background/hero-mountains-mobile.webp` | Approved PNG derivative; 960 x 540; 50,752 bytes | Smaller mobile far texture and picture source |
| `public/assets/xianxia/background/mountain-mid-pavilion.png` | New ImageGen transparent master | Retained source; not downloaded by app |
| `public/assets/xianxia/background/mountain-mid-pavilion.webp` | 1600 x 900; 181,760 bytes, alpha | Midground ridge, pines and tiny gold-lit pavilion |
| `public/assets/xianxia/environment/mountain-near-bamboo.png` | New ImageGen transparent master | Retained source; not downloaded by app |
| `public/assets/xianxia/environment/mountain-near-bamboo.webp` | 1600 x 900; 152,784 bytes, alpha | Near rock/bamboo frame; strongest parallax layer |
| `public/assets/xianxia/environment/moon-ink-silver.png` | New ImageGen transparent master | Retained source; not downloaded by app |
| `public/assets/xianxia/environment/moon-ink-silver.webp` | 384 x 384; 36,712 bytes, alpha | Detailed restrained moon; no CSS circle |
| `public/assets/xianxia/vfx/fog-silk.png` | New ImageGen transparent master | Retained source; not downloaded by app |
| `public/assets/xianxia/vfx/fog-silk.webp` | 1200 x 675; 157,212 bytes, alpha | Reused at two depths on desktop, once on mobile, and for entry mist |

Runtime Hero image budget: 637,348 bytes desktop, 579,220 bytes with the mobile far texture (before HTTP overhead; browser cache reuses duplicate URLs). Original PNGs are not overwritten. Combined far sky/mountains and one reused fog asset avoid redundant generation. Spirit motes are 2-pixel shader-rendered specks, not environmental objects; no extra texture is needed. No sword or separate character is generated.

Full prompts and implementation detail: `HERO_IMPLEMENTATION.md`. Conversion helper: `scripts/prepare-hero-assets.mjs` (uses already-installed Sharp, resize/re-encode only).

## About asset added — 2026-10-05

One built-in ImageGen scroll supplies the personal dossier, while all readable text stays HTML. `public/assets/xianxia/props/about-scholar-scroll.png` is the 1024 × 1536 transparent master; `public/assets/xianxia/props/about-scholar-scroll.webp` is the 800 × 1200 runtime version (140,516 bytes). It is lazy-loaded. Alpha was verified; no CSS geometric scroll substitute is used. About reuses Hero mountains, the distant pavilion, bamboo/rocks and `vfx/fog-silk.webp`; no new environment, moon or particle asset was generated. Prompt and reproduction notes: [ABOUT_IMPLEMENTATION.md](ABOUT_IMPLEMENTATION.md).

Typography update: `public/fonts/noto-serif/` contains self-hosted Latin/Vietnamese 400 italic WOFF2 files and their license, used for poetic Hero/About text. The older font-selection row below describes the foundation snapshot, not the current italic font state.

## Missing / not yet selected

These are potential future needs, not authorization to generate them all.

| Directory | Missing or undecided asset | Intended use |
| --- | --- | --- |
| `public/assets/xianxia/background/` | Hero covered; future section backgrounds not selected | No further generation requested |
| `public/assets/xianxia/environment/` | Hero moon/pavilion/bamboo covered; blossoms optional and deferred | No further generation requested |
| `public/assets/xianxia/characters/` | No character selected | Reserved; do not invent one |
| `public/assets/xianxia/props/` | Approved swords, lanterns, scrolls or jade, if used | Foreground props |
| `public/assets/xianxia/vfx/` | Hero fog covered; petals optional and deferred | No further generation requested |
| `public/assets/xianxia/ui/` | Authored ornaments, if needed | Environmental section detailing, not generic cards |
| `public/assets/xianxia/textures/` | Optimized authored textures | Future scene materials |
| `public/assets/xianxia/models/` | No models selected | Only if 2.5D is insufficient |
| `public/media/audio/` | Approved music and licensing decision | Future opt-in audio player |
| `public/media/video/` | No additional video requested | Reserved |
| `public/fonts/` | Licensed, Vietnamese-capable font selection | Future readable typography; system font for now |

## Production-only reference assets (not copied)

Read-only source root: `E:\bio.mieowparadise.io.vn\public_html`.

| Existing files / group | Potential preservation use | Cautions |
| --- | --- | --- |
| `assets/tichtuyetavt.png`, `happy1.png`, `avatar.gif`, `avatar-cgirl.png`, `frame/a176.png` | Profile identity | Owner approval before choosing final avatar/frame; not xianxia art by default. |
| `assets/favicon.ico` | Site identity | Not migrated yet. |
| `assets/music/` (33 MP3 files; 32 selected in the script playlist), `music/` (11 MP3 files), `assets/Point The Star.mp3` | Playlist reference | Multiple overlapping collections; do not blindly duplicate. Confirm rights and final playlist. |
| `assets/background.gif`, `backgroud_light.gif` and older variants | Historical backgrounds | Different art direction; do not reuse automatically. |
| `assets/site3d-bg/` | Existing Meow Astral Core demo | Preserve concept/project link, not compiled bundle architecture. |
| `assets/security-lab/` | Existing client-side educational demo | Potential future Projects item; no automatic migration. |
| `assets/mouse-cursor/`, project screenshots, archive files | Reference only | Not required for foundation; do not copy backup/archive material. |

Production references `assets/tichtuyetavt.webp` for preload, but that file was absent from the inspected asset listing. Its `<picture>` also declares `happy1.png` as `image/webp`; verify actual media type during any future migration rather than copying that markup.
