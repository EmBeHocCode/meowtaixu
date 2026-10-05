# Hero environment asset handoff

Audit date: 2026-10-06. Scope: Hero environment assets and animation integration only. This handoff does not authorize changes to copy, navigation, other sections, deployment, or production-reference files.

## Decision summary

The approved Hero already has the correct painting split for a layered 2.5D scene. Reuse the existing far mountains, pavilion ridge, near rocks, moon, and fog. Do not generate alternate full-scene frames: swapping complete paintings would introduce registration jumps, palette drift, excess memory, and visible looping.

Only the distant bird flight benefits from true multi-frame animation. Fog and cloud movement should remain continuous shader motion, while vegetation should use one isolated alpha cutout with minute vertex displacement. This keeps the original artwork visually stable.

## Reused environment assets

| Exact path | Dimensions | Bytes | Role |
| --- | ---: | ---: | --- |
| `public/assets/xianxia/background/hero-mountains-far.webp` | 1672 x 941 | 108,880 | Opaque night sky and far mountain base |
| `public/assets/xianxia/background/hero-mountains-mobile.webp` | 960 x 540 | 50,752 | Smaller mobile base |
| `public/assets/xianxia/background/mountain-mid-pavilion.webp` | 1600 x 900 | 181,760 | Transparent midground ridge and pavilion |
| `public/assets/xianxia/environment/mountain-near-bamboo.webp` | 1600 x 900 | 152,784 | Transparent near rocks and vegetation frame |
| `public/assets/xianxia/environment/moon-ink-silver.webp` | 384 x 384 | 36,712 | Transparent authored moon |
| `public/assets/xianxia/vfx/fog-silk.webp` | 1200 x 675 | 157,212 | Transparent fog reused at two depths on desktop and once on mobile |

`fog-silk.webp` has genuine alpha (`0..254`). It should be sampled by a feathered UV-flow shader, not duplicated into a frame sequence. The current source is large enough for soft atmospheric motion; authored edge feathering prevents its rectangular bounds from becoming visible.

## Motion derivatives

| Exact path | Dimensions | Bytes | Alpha validation | Frame count / use |
| --- | ---: | ---: | --- | --- |
| `public/assets/xianxia/vfx/hero-sky-tribulation-glow.webp` | 1672 x 941 | 34,382 | RGBA, `0..48` | One localized overlay; deterministic opacity pulse, not a frame animation |
| `public/assets/xianxia/environment/hero-bamboo-tips.webp` | 1672 x 941 | 54,572 | RGBA, `0..255` | One isolated vegetation overlay; subdivided-plane deformation only |
| `public/assets/xianxia/vfx/hero-spirit-bird-flight-spritesheet.webp` | 1024 x 512 | 67,644 | RGBA, `0..255` | Eight frames in a 4 x 2 sheet; desktop distant-life loop |

Runtime derivative overhead is **156,598 bytes** on desktop. Mobile conditionally omits bamboo and birds, so its additional runtime cost is only the **34,382-byte** sky overlay. Existing fog is already part of the Hero budget and is not a new request.

Source/provenance retained outside the runtime path:

- `public/assets/xianxia/vfx/hero-spirit-bird-flight-spritesheet.png` — 1774 x 887, 462,773 bytes, RGBA `0..255`; built-in ImageGen transparent eight-frame master.
- `public/assets/xianxia/vfx/hero-distant-spirit-birds.png` — 2172 x 724, 100,034 bytes, RGBA `0..255`; earlier still master.
- `public/assets/xianxia/vfx/hero-distant-spirit-birds.webp` — 900 x 300, 7,210 bytes, RGBA `0..255`; retired still derivative.

The retired still bird pair must not be loaded together with the sprite sheet. It cannot provide convincing wing motion and is retained only for provenance.

## Why no vegetation or cloud frame sequence

### Vegetation

The near painting combines bamboo with immovable rocks. Warping the complete near layer makes the stone floor breathe, while independently generated full frames would shift leaf edges and expose a painted-image swap. `hero-bamboo-tips.webp` isolates the moving plant pixels so the rock layer stays fixed. Use a low-amplitude, vertically anchored mesh deformation; do not rotate or translate the full 1672 x 941 plane.

### Clouds and mist

The far sky is intentionally baked into the approved base painting. Continuous luminance pulsing through `hero-sky-tribulation-glow.webp` preserves registration exactly. Ground mist already supports smooth two-depth motion from one alpha source. A multi-frame cloud sequence would add texture uploads without improving the current slow movement.

### Distant life

Wing articulation cannot be reproduced by moving one still silhouette without looking like a cutout. The eight-frame sprite is therefore the only true multi-frame asset in this handoff. At 1024 x 512, each runtime cell is 256 x 256. Keep the birds small and distant so minor painterly variation reads as atmospheric life rather than character animation.

## Integration notes

1. Preserve the current z order: far base, sky pulse, moon, mid ridge, distant birds, far fog, near rocks, near fog, bamboo tips, motes. Readable Hero content remains semantic HTML above the canvas.
2. Keep the sky pulse deterministic. Use a restrained first pulse and afterglow; avoid randomized flashes, white lightning, bloom, or changes to the base painting.
3. Drive the bamboo cutout with a subdivided plane and anchor displacement toward the bottom. Recommended visible displacement is at most about `0.035` scene units horizontally and `0.008` vertically.
4. Sample the bird sprite as a 4 x 2 atlas. Use cloned textures per bird, dispose clones on unmount, and mirror the mesh for leftward travel instead of generating a second sheet.
5. Load bamboo and bird textures only on desktop/non-coarse layouts. Pause invalidation and all time advancement whenever Hero is not the active chapter or the document is hidden.

The current scene targets 30 fps on desktop and 20 fps on mobile with demand rendering. Do not raise these caps for atmosphere-only motion.

## Responsive and reduced-motion behavior

- Desktop: full layered fog, isolated bamboo sway, sparse sprite birds, localized sky pulse, existing pointer parallax.
- Mobile/coarse pointer: one fog layer, no bamboo overlay, no birds, no pointer parallax; keep the sky pulse dimmer than desktop.
- `prefers-reduced-motion`: do not mount the animated WebGL Hero. The existing static HTML image stack remains the complete fallback.
- WebGL loss/unavailable: retain the same static composition and all readable content; no critical information belongs to an animated texture.

## Visual QA gates

1. Inspect at 1440 x 900, 1280 x 720, and 390 x 844. No fog rectangle or alpha seam may be visible against the mountains.
2. Watch at least three sky-pulse cycles. The base palette must not flash white or visibly change paintings.
3. Watch one complete pass for all three birds. Check frame registration, wing cadence, left-facing mirroring, and that none crosses the title reading zone at a distracting scale.
4. Toggle away from Hero and hide/show the browser tab. Time-based motion and frame invalidation must pause while inactive and resume without an aggressive entrance replay.
5. Test reduced motion and WebGL fallback. The static Hero must remain visually complete and navigation/content must still work.

## Asset-generation record

No additional image was generated during this audit. The existing derivatives are sufficient, and creating more cloud or vegetation frames would reduce consistency rather than improve it. The bird sprite master was previously created with the built-in ImageGen path; all runtime derivatives are optimized WebP and all critical text remains HTML.
