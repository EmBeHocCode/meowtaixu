# About proposal — historical planning reference

This was the initial planning proposal. The user's later Hero/About implementation brief supersedes its approval gate and selects a left narrative / right personal-dossier composition. See `ABOUT_IMPLEMENTATION.md` for the delivered version; no close-up pavilion was generated.

## Concept: a study pavilion in the mist

Descend from the Hero's distant mountains to a quiet cliffside study pavilion in the same world. Preserve midnight blue, ink black, mist gray and a small warm antique-gold accent inside the pavilion. No dashboard cards, rectangular scene boundary, full-screen parchment panel or invented biography.

## Proposed desktop composition

The upper 20–25% remains a porous mist canopy, carrying the Hero landscape into the new view. In the settled view, the left 10–43% holds a readable HTML heading and short biography, over a low-detail ink-dark valley. The right 53–92% holds the pavilion, its roof, stone terrace and a tiny warm-lit study. Rock edges enter from bottom-right; sparse bamboo can frame the opposite edge. Mist separates these depths without covering the text. The pavilion remains the visual anchor; a hanging scroll is not needed for this version.

Text uses normal document flow, selectable HTML, semantic headings and existing approved personal content. Exact biography must be checked against the inventory and confirmed before implementation; do not invent facts.

## Proposed transition (not implemented)

1. Hero stays stable at scroll onset; later the camera gently descends/advances while existing foreground mist thickens across the uneven landscape edge.
2. Far mountains shift more slowly than the near rock plane; the pavilion emerges through the same fog, not a rectangular wipe or blank section background.
3. Motion settles before the biography is read. Do not hijack scroll or require animation completion to access content.

Use layered 2.5D assets with a shared coordinate/compositing plan for the boundary, not two visibly separate canvases. No extra particle system. Mobile uses a compact art composition and fewer moving layers. Reduced motion and WebGL failure keep a complete static landscape and immediately accessible HTML.

## Asset decisions

Paths below are relative to `E:/bio-meowtutien/public/assets/xianxia/`.

| Role | Existing source | Decision |
| --- | --- | --- |
| Distant world / valley | `background/hero-mountains-far.webp`, `background/hero-mountains-mobile.webp` | Reuse at far depth; evaluate crop without enlarging beyond useful detail. |
| Transition and depth fog | `vfx/fog-silk.webp` | Reuse at offset depths. Only consider another fog asset if repetition is visible in an approved prototype. |
| Near framing | `environment/mountain-near-bamboo.webp` | Reuse selectively; its attached rocks are a frame, not a substitute for a terrace. |
| Pavilion continuity reference | `background/mountain-mid-pavilion.webp` | Existing distant pavilion is reference/background only; insufficient close-up detail for the new focal point. |
| Close pavilion and cliff terrace | Proposed `environment/about-cliff-study-pavilion.png` + `.webp` | Needs ImageGen after approval: transparent right-weighted pavilion/terrace layer, coherent roof geometry, subtle warm interior, no text, no character. Generate and inspect this single main asset first. |

The approved master `background/xianxia-midnight-misty-mountains-hero.png` is the style reference for future generation. Do not generate a new moon, sword, character, scroll or particle texture for this concept. Optimize the approved new layer into desktop/mobile WebP derivatives; PNG remains the master. Confirm alpha edges and left-side text clearance before coding About.

## Approval gate

Approve the pavilion-on-right / biography-on-left direction first. Then generate and inspect one pavilion asset, confirm the biography, and only afterward implement the transition and About. This document is not implementation approval.
