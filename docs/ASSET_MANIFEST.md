# Asset manifest

## Brand identity

| Asset | Status | Intended use |
| --- | --- | --- |
| `public/assets/xianxia/logo/logo-main.png` | Existing master | Compact personal emblem in the persistent header; also source identity for favicon derivatives. |
| `public/assets/xianxia/logo/logo-as.png` | Existing master | Full MEOW TAIXU lockup shown briefly between the loading video and Hero entrance. |
| `public/assets/xianxia/logo/logo-header.png` | Prepared legacy derivative | Retained but no longer used in the persistent navigation. |
| `public/assets/xianxia/logo/logo-web.png` | Prepared | Optimized square brand mark retained for compact placements. |
| `public/assets/xianxia/logo/favicon-16.png`, `favicon-32.png`, `favicon-192.png` | Prepared | Browser tab and installable-site icons. |
| `public/assets/xianxia/logo/apple-touch-icon.png` | Prepared | iOS home-screen icon. |

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

## Hero ambient motion assets added — 2026-10-06

The original Hero painting and composition remain unchanged. Small transparent derivatives add restrained environmental motion through the existing demand-rendered Three.js scene. Desktop loads the sky, bamboo and bird sprite assets; mobile loads only the sky pulse and existing single fog layer. Reduced-motion keeps the complete static Hero. Birds now use real frame progression and directional flight instead of translating one still image back and forth.

| Exact project-relative path | Origin / bytes | Actual use |
| --- | --- | --- |
| `public/assets/xianxia/vfx/hero-sky-tribulation-glow.webp` | Local transparent derivative of the approved far Hero painting; 34,382 bytes | Localized upper-sky pulse at a deterministic 7.2-second interval; additive opacity remains restrained but visibly readable |
| `public/assets/xianxia/environment/hero-bamboo-tips.webp` | Local transparent derivative of the approved near bamboo layer; 54,572 bytes | Desktop-only minute sway of bamboo tips without moving the foreground rocks |
| `public/assets/xianxia/vfx/hero-distant-spirit-birds.png` | Earlier built-in ImageGen transparent master; 100,034 bytes | Retired source retained for provenance; no longer requested at runtime because it cannot supply true wing motion |
| `public/assets/xianxia/vfx/hero-distant-spirit-birds.webp` | Earlier optimized still derivative; 7,210 bytes | Retired runtime asset retained for provenance; no longer referenced by the Hero |
| `public/assets/xianxia/vfx/hero-spirit-bird-flight-spritesheet.png` | Built-in ImageGen transparent 4 × 2 master; 462,773 bytes | Retained eight-frame source for a right-facing xianxia spirit bird wing cycle |
| `public/assets/xianxia/vfx/hero-spirit-bird-flight-spritesheet.webp` | 1024 × 512 optimized runtime sprite; 67,644 bytes | Eight-frame loop shared by three desktop birds; two fly right and one uses the correctly mirrored left-facing state while travelling left |

Current bird generation direction: exactly eight sequential frames of one consistent right-facing crane-like spirit bird, smooth raised/down/lowered/up wing cycle, Chinese ink-wash midnight blue, transparent 4 × 2 sheet, stable scale and anchor, with no scenery, grid, text, logo or watermark. Runtime UV frame stepping loops continuously; flight position progresses in one dominant direction and wraps only after leaving the viewport. Leftward birds mirror both orientation and path direction. Fog uses continuous UV drift rather than a reversing sine shuttle. Bamboo uses segmented vertex deformation anchored toward the lower portion of its plane, not whole-cutout translation.

## About asset added — 2026-10-05

One built-in ImageGen scroll supplies the personal dossier, while all readable text stays HTML. `public/assets/xianxia/props/about-scholar-scroll.png` is the 1024 × 1536 transparent master; `public/assets/xianxia/props/about-scholar-scroll.webp` is the 800 × 1200 runtime version (140,516 bytes). It is lazy-loaded. Alpha was verified; no CSS geometric scroll substitute is used. About reuses Hero mountains, the distant pavilion, bamboo/rocks and `vfx/fog-silk.webp`; no new environment, moon or particle asset was generated. Prompt and reproduction notes: [ABOUT_IMPLEMENTATION.md](ABOUT_IMPLEMENTATION.md).

Typography update: `public/fonts/noto-serif/` contains self-hosted Latin/Vietnamese 400 italic WOFF2 files and their license, used for poetic Hero/About text. The older font-selection row below describes the foundation snapshot, not the current italic font state.

## Hero title artwork — 2026-10-05

Built-in ImageGen generated one transparent 3:1 title treatment with the exact Vietnamese wording `Nhập thế hành đạo`. The authored source remains at `public/assets/xianxia/title/hero-title-desktop.png` (2172 × 724; 1,630,816 bytes). The optimized runtime derivative is `public/assets/xianxia/title/hero-title-desktop.webp` (519,944 bytes). Mobile reuses the same responsive asset because it remains legible at the target width; no redundant mobile texture is loaded. Runtime styling deliberately reduces saturation to neutralize low-alpha color fringe while preserving the ivory, antique-gold and moonlit ink treatment.

Final ImageGen prompt: transparent premium xianxia key-art wordmark using only the exact Vietnamese text `Nhập thế hành đạo`; wide 3:1–4:1 composition; ivory, parchment white, pale antique gold, moonlit silver and misty blue-grey; refined brush-calligraphy and classical serif fusion; no swords, dragons, characters, extra symbols, frame or watermark.

## Sở tu assets added — 2026-10-06

Built-in ImageGen produced one environment and four isolated relics for the `03 — SỞ TU` cultivation scripture hall. Critical labels and descriptions remain semantic HTML. PNG masters are retained for future art work; optimized WebP derivatives are the only runtime requests. The runtime set totals 927,208 bytes.

| Exact project-relative path | Origin / dimensions | Actual use |
| --- | --- | --- |
| `public/assets/xianxia/expertise/scripture-hall-midnight.png` | Built-in ImageGen master; 1672 × 941, opaque | Retained master for the distinct mountain scripture hall environment |
| `public/assets/xianxia/expertise/scripture-hall-midnight.webp` | Optimized runtime; 205,542 bytes | Full-bleed hall background and no-WebGL fallback |
| `public/assets/xianxia/expertise/merchant-scripture.png` | Built-in ImageGen master; 1024 × 1536, alpha | Retained source for Thương đạo |
| `public/assets/xianxia/expertise/merchant-scripture.webp` | 700 × 1050; 193,248 bytes, alpha | Layered Thương đạo hanging scripture |
| `public/assets/xianxia/expertise/web-construction-tablet.png` | Built-in ImageGen master; 1024 × 1536, alpha | Retained source for Kiến web |
| `public/assets/xianxia/expertise/web-construction-tablet.webp` | 700 × 1050; 150,940 bytes, alpha | Focal jade/bronze construction tablet |
| `public/assets/xianxia/expertise/ai-jade-talisman.png` | Built-in ImageGen master; 1312 × 1199, alpha | Retained source for Trợ pháp AI |
| `public/assets/xianxia/expertise/ai-jade-talisman.webp` | 820 × 749; 199,790 bytes, alpha | Supporting jade talisman instrument; AI is framed as a tool, not the decision maker |
| `public/assets/xianxia/expertise/product-strategy-scroll.png` | Built-in ImageGen master; 1774 × 887, alpha | Retained source for Mưu hoạch |
| `public/assets/xianxia/expertise/product-strategy-scroll.webp` | 1200 × 600; 177,688 bytes, alpha | Near-depth strategic planning map |

Generation prompts used the `stylized-concept` website-asset recipe: midnight blue/ink-black scripture hall, mist-grey cliffs, restrained antique gold and jade, realistic fantasy fused with Chinese ink wash, no characters, no readable text, no UI, no logos or watermark. Each relic was generated separately with genuine transparency, then alpha-checked after WebP conversion. Existing `public/assets/xianxia/vfx/fog-silk.webp` is reused in Three.js for low ground mist; no redundant fog texture was generated.

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
