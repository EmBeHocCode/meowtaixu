# Công pháp handoff

## Support-01 — visual / assets

Status: complete. Scope stayed inside `public/assets/xianxia/techniques/`, one preparation script, and documentation. No core section, scene or interaction file was edited.

### Composition contract

1. Far: `chamber-mountains-far.webp`, low parallax, cover crop.
2. Mid: `chamber-platform-mid.webp`, stronger parallax, aligned right; preserve left/left-center negative space for the section heading.
3. Artifacts: six independent `relic-*.webp` cutouts at varied scale/depth. Do not restore the source sheet as one visible plane.
4. FX: `formation-mist-16f.webp`, 4 × 4 grid, 16 frames, 256 × 256 cells, chronological row-major playback at 10 fps.
5. Near: `chamber-foreground.webp`; talisman animation may replace or supplement its static tags on desktop using `talisman-flutter-16f.webp`, also 4 × 4 / 16 × 256-square frames at 12.5 fps.

Frame index to UV cell: `column = frame % 4`, `row = floor(frame / 4)`. Both 16-frame sheets use frame 0 as the reduced-motion fallback. The formation anchors at center; the talisman anchors at top-center. Do not ping-pong either loop.

### Runtime guidance

- HTML must own all technology names, section copy and mastery states. The raster family intentionally contains no important text.
- On mobile, keep far + mid + one focused relic + static foreground; load the formation loop only if budget allows and omit the talisman loop first.
- For rain, tint the mid platform slightly cooler and raise its specular response in code; do not bake rain into the texture.
- For wind, vary talisman frame rate and shader mist direction rather than translating a still image back and forth.
- Mask/feather the formation plane in shader or CSS if filtering exposes outer pixels. Both source sheets have transparent corners.

### Source masters and regeneration

PNG masters are in the same folder: `chamber-mountains-far.png`, `chamber-platform-mid.png`, `chamber-foreground.png`, `technique-relics-sheet.png`, `formation-mist-16f.png`, and `talisman-flutter-16f.png`. Rerun `python scripts/prepare-technique-assets.py` after changing a master.

Full prompt family is summarized in `docs/ASSET_MANIFEST.md`. Tool mode: built-in ImageGen. Blockers: none for delivery. Visual integration and browser validation remain with main/support-02.
