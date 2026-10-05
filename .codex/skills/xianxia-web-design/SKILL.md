---
name: xianxia-web-design
description: Design, implement, or revise this repository's personal portfolio in a cinematic Chinese xianxia style. Use whenever working on its UI/UX, visual design, Three.js scenes, page sections, animation, generated visual assets, responsive styling, or art direction. Does not apply to unrelated websites or backend-only work.
---

# Xianxia Web Design

Create an elegant, mystical, premium personal portfolio rooted in cinematic Chinese xianxia, wuxia fantasy, and Chinese ink-wash aesthetics. The site should feel like an atmospheric cultivated world, not a generic fantasy game UI or a dashboard with decorative fantasy styling.

## Scope and preservation

Apply this guidance to the visual work requested for this portfolio. Do not turn a small styling task into an unsolicited site-wide redesign.

Preserve existing project content, personal information, backend behavior, routing, deployment configuration, and working functionality unless a change is necessary for the requested task. Do not invent biography, studies, skills, projects, or contact information. Keep visual-review redesigns within the section being worked on.

## Art direction

Prefer deep ink black, midnight blue, mist gray, jade green, parchment white, and muted antique gold. Use restrained contrast, atmospheric depth, and intentional negative space; avoid flashy neon and indiscriminate glow.

Suitable motifs include mountains, clouds, the moon, temples, bamboo, plum or cherry blossoms, lanterns, talismans, jade, scrolls, swords, and spiritual particles. Select motifs that support the section's composition instead of filling every space with decoration.

## Multilingual language system

Before designing or editing portfolio copy, typography, section composition, or artwork containing text, read [the project language system](../../../docs/LANGUAGE_SYSTEM.md), resolved from this skill directory. It is the canonical reference for section vocabulary, language roles and accessible multilingual composition.

Vietnamese is the primary language for readable personal information, explanations and long-form content. English supports professional subtitles, technology terminology, portfolio labels and short international context. Chinese is a low-frequency decorative xianxia language for poetic headings, seals, cultivation terminology and visual accents; it must never carry critical information alone.

Give Vietnamese the highest readability, English restrained secondary labels, and Chinese occasional large or vertical decorative emphasis. Do not translate every sentence into all three languages or require all three in every section. A visitor unable to read Chinese must still fully understand the portfolio and its actions. Keep primary text semantic HTML with appropriate language tags; hide only genuinely redundant decoration from assistive technology. Check Vietnamese diacritics and Chinese glyph accuracy, including on mobile.

Apply these rules only within the requested task. Do not redesign existing sections, generate new text-bearing art, invent biography, or add a language switcher just to enforce this system.

## Asset-first workflow

Before implementing a major visual section:

1. Identify the visual assets needed for the composition and their roles, including background, foreground, props, and effects.
2. Inspect existing project assets and reuse suitable ones that match the art direction and required resolution.
3. Generate or prepare missing assets before building the section around them. For generated raster artwork, use the available image-generation skill and tools. If proper assets cannot be obtained, explain the limitation rather than quietly shipping geometric substitutes.
4. Store assets in descriptive directories under `public/assets/xianxia/`, using descriptive filenames. Use transparent PNG or WebP when foreground isolation is required.
5. Build the section around the prepared assets and readable content, then perform the visual review below.

Suggested organization; create only directories actually needed:

```text
public/assets/xianxia/
  background/
  environment/
  vfx/
  props/
  ui/
  models/
```

### No generic placeholders as final visuals

Never represent important final visual assets with plain circles, plain rectangles, generic rounded cards, random gradient blobs, or meaningless glowing shapes.

Never fake the moon, mountains, clouds, temples, scrolls, talismans, swords, flowers, or jade ornaments with simple CSS geometric substitutes when a proper asset can be used or generated. Use suitable imagery, authored artwork, or models with recognizable detail and intentional composition.

Temporary layout placeholders must be replaced before presenting a major section as finished. This restriction concerns depicted assets; it does not prohibit ordinary CSS layout, accessible controls, or subtle particle effects serving an intentional atmospheric role.

## Three.js and scene composition

Use Three.js or React Three Fiber for depth, parallax, particles, fog, floating props, camera motion, subtle lighting, and immersive backgrounds. Prefer layered 2.5D scenes when full 3D modeling is unnecessary; use foreground, midground, and background assets to establish depth.

Do not use Three.js for normal readable text or content layout. Keep decorative canvases from intercepting navigation, scrolling, or content interaction. Choose scene complexity according to its visual benefit and runtime cost rather than adding WebGL to every section.

## HTML, content, and usability

Use semantic HTML and CSS for profile information, navigation, project descriptions, skills, and all readable portfolio content. Avoid dashboard-like layouts and collections of unrelated SaaS cards. Integrate sections into the environment through composition, spacing, art, and transitions without compromising text contrast or interaction clarity.

Visitors must quickly understand who the owner is, what they study, their skills, their projects, and how to contact them. Keep this information easy to find without requiring a cinematic animation or scene interaction to complete. Maintain readable type, keyboard access, visible focus, and usable touch targets.

## Animation

Motion should be slow, elegant, and atmospheric. Appropriate examples include drifting clouds, falling petals, subtle bamboo movement, a floating sword, lantern sway, spiritual particles, scroll reveals, mist transitions, and camera motion on scroll.

Avoid excessive bouncing, flashy neon effects, and arcade-style animation. Coordinate motion so it supports the content instead of competing with reading or navigation.

## Responsive design and performance

- Optimize image formats and texture sizes for their actual display size and target device; preserve transparency where needed.
- Lazy-load expensive sections and scene resources without hiding essential portfolio content.
- Reduce particle counts, texture resolution, rendering cost, and motion on mobile. Avoid unnecessarily large WebGL scenes.
- Respect reduced-motion preferences and provide a static alternative for reduced-motion users or unavailable WebGL. Keep content and navigation functional in the fallback.
- Check narrow screens for overflow, awkward art cropping, obscured content, and unusable controls.

## Visual review and completion

After implementing a major section:

1. Run the project using its existing workflow and inspect the actual rendered section in a browser.
2. Review desktop and mobile views, plus static/reduced-motion behavior. Check readability, navigation, image quality, layering, and motion.
3. Compare the result with the intended cinematic Chinese xianxia and ink-wash art direction. Look for geometric stand-ins, generic card grids, decorative clutter, or disconnected sections.
4. Automatically fix generic-looking UI within the requested scope. If the section looks like a normal dashboard with a xianxia skin, redesign its composition and reinspect it.
5. Report what was implemented and verified, and any remaining limitations. If the project cannot run or browser inspection is unavailable, state the blocker and do not claim visual verification.

After three failed attempts to fix the same issue, stop and identify the doubtful assumption instead of continuing blind retries.
