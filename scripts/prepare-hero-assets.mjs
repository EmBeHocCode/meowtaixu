import { createRequire } from 'node:module';
import { copyFileSync, constants, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Re-encode only: artwork is authored by ImageGen, never procedurally substituted.
// Pass a preinstalled sharp module path as argv[2] if sharp is not installed locally.
const sharp = createRequire(import.meta.url)(process.argv[2] || 'sharp');
const generated = 'C:/Users/PC/.codex/generated_images/01a10afd-83a1-7c81-af3f-374a5152688b';
const root = resolve('public/assets/xianxia');
const files = [
  ['exec-8f012cae-09b0-4daf-9d76-132f2c7af8be.png', 'background/mountain-mid-pavilion', 1600],
  ['exec-c8550cbe-5b39-4de3-ab40-7cf40439f725.png', 'environment/mountain-near-bamboo', 1600],
  ['exec-08c6a252-b94a-47dc-ac92-d961f61bd8c1.png', 'environment/moon-ink-silver', 384],
  ['exec-0fc4c8ab-1d24-4e5b-aeb9-239bab8a01ac.png', 'vfx/fog-silk', 1200],
];
for (const [source, name, width] of files) {
  const master = resolve(root, `${name}.png`);
  if (!existsSync(master)) copyFileSync(resolve(generated, source), master, constants.COPYFILE_EXCL);
  const image = sharp(master);
  const metadata = await image.metadata();
  const output = await image.resize({ width, withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 92 }).toFile(resolve(root, `${name}.webp`));
  const stats = await sharp(master).stats();
  console.log(JSON.stringify({ name, ...output, sourceAlpha: metadata.hasAlpha, alphaMin: stats.channels[3]?.min, alphaMax: stats.channels[3]?.max }));
}
const base = resolve(root, 'background/xianxia-midnight-misty-mountains-hero.png');
for (const [name, width] of [['hero-mountains-far', 1672], ['hero-mountains-mobile', 960]]) {
  const info = await sharp(base).resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(resolve(root, `background/${name}.webp`));
  console.log(JSON.stringify({ name, ...info }));
}
