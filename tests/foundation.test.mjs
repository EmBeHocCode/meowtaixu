import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const at = (path) => resolve(root, path);
const digest = (path) => createHash('sha256').update(readFileSync(at(path))).digest('hex');

test('Vietnamese typography retains Latin and Vietnamese true-italic font assets', () => {
  assert.match(readFileSync(at('index.html'), 'utf8'), /<html lang="vi">/);
  const css = readFileSync(at('src/sections/Hero/hero.css'), 'utf8');
  assert.match(css, /\.hero__poem \{ font-family: 'Hero Noto Serif'/);
  for (const subset of ['latin', 'vietnamese']) {
    const file = `noto-serif-${subset}-400-italic.woff2`;
    assert.ok(css.includes(file));
    assert.equal(readFileSync(at(`public/fonts/noto-serif/${file}`)).toString('ascii', 0, 4), 'wOF2');
  }
});

test('Hero and About use corrected identity and distinguish GitHub from nickname', () => {
  const hero = readFileSync(at('src/sections/Hero/Hero.tsx'), 'utf8');
  const about = readFileSync(at('src/sections/About/About.tsx'), 'utf8');
  for (const source of [hero, about]) {
    assert.ok(source.includes('Nguyễn Lâm Hùng'));
    assert.doesNotMatch(source, /Meow Ngáo|Meow Chill|Gom ý tưởng|giữa nhân gian|Học bằng cách làm|đến điều hữu ích/);
  }
  assert.ok(hero.includes('E-Commerce · Web Development · AI-assisted Workflow'));
  assert.ok(!hero.includes('className="hero__poem"'));
  assert.match(about, /GitHub<\/dt><dd>EmBeHocCode/);
  assert.match(about, /Nickname<\/span><\/dt><dd>Meow/);
});

test('dossier uses integrated accessible controls and no detached toggle', () => {
  const about = readFileSync(at('src/sections/About/About.tsx'), 'utf8');
  const css = readFileSync(at('src/components/navigation/journey.css'), 'utf8');
  assert.ok(about.includes('Khép hồ sơ'));
  assert.ok(about.includes('aria-controls="about-record"'));
  assert.ok(about.includes('aria-disabled={busy}'));
  assert.ok(about.includes('data-journey-input'));
  assert.doesNotMatch(about + css, /about__toggle/);
});

test('all requested architecture directories exist', () => {
  const directories = [
    'src/app/providers',
    ...['common', 'layout', 'navigation', 'ui'].map(n => `src/components/${n}`),
    ...['Hero', 'About', 'Expertise', 'Skills', 'Focus', 'Projects', 'Connect'].map(n => `src/sections/${n}`),
    ...['camera', 'environment', 'objects', 'particles', 'shaders', 'effects'].map(n => `src/scene/${n}`),
    ...['scroll', 'transitions', 'gsap'].map(n => `src/animations/${n}`),
    ...['preloader', 'audio', 'weather', 'location', 'reduced-motion'].map(n => `src/features/${n}`),
    ...['hooks', 'data', 'lib', 'styles', 'types', 'utils'].map(n => `src/${n}`),
    ...['background', 'environment', 'characters', 'props', 'vfx', 'ui', 'textures', 'models'].map(n => `public/assets/xianxia/${n}`),
    ...['loading', 'audio', 'video'].map(n => `public/media/${n}`),
    'public/fonts', 'docs',
  ];
  for (const dir of directories) assert.ok(statSync(at(dir)).isDirectory(), dir);
});

test('loading video is a nonempty identical copy and original remains', () => {
  assert.equal(statSync(at('bg-load01_sharp.mp4')).size, 3914587);
  assert.equal(digest('public/media/loading/bg-load01_sharp.mp4'), digest('bg-load01_sharp.mp4'));
});

test('existing generated hero image remains intact at its known dimensions', () => {
  const png = readFileSync(at('public/assets/xianxia/background/xianxia-midnight-misty-mountains-hero.png'));
  assert.equal(png.length, 1946339);
  assert.equal(png.readUInt32BE(16), 1672);
  assert.equal(png.readUInt32BE(20), 941);
});

test('required handoff documents exist and are nonempty', () => {
  for (const name of ['ART_DIRECTION', 'ASSET_MANIFEST', 'CURRENT_SITE_INVENTORY']) {
    assert.ok(statSync(at(`docs/${name}.md`)).size > 0);
  }
});

test('approved section baselines, global styling and preloader remain intact', () => {
  const baseline = JSON.parse(readFileSync(at('tests/hero-preservation.json'), 'utf8'));
  for (const [file, hash] of Object.entries(baseline)) assert.equal(digest(file), hash, file);
});

test('About scroll is a compact WebP with an unchanged retained PNG master', () => {
  const data = readFileSync(at('public/assets/xianxia/props/about-scholar-scroll.webp'));
  assert.equal(data.toString('ascii', 0, 4), 'RIFF');
  assert.equal(data.toString('ascii', 8, 12), 'WEBP');
  assert.ok(data.length < 180000);
  const png = readFileSync(at('public/assets/xianxia/props/about-scholar-scroll.png'));
  assert.equal(png.readUInt32BE(16), 1024);
  assert.equal(png.readUInt32BE(20), 1536);
});

test('Hero web assets exist, use WebP and stay below a 700 KB desktop transfer budget', () => {
  const assets = ['background/hero-mountains-far', 'background/mountain-mid-pavilion',
    'environment/mountain-near-bamboo', 'environment/moon-ink-silver', 'vfx/fog-silk'];
  let bytes = 0;
  for (const asset of assets) {
    const data = readFileSync(at(`public/assets/xianxia/${asset}.webp`));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    bytes += data.length;
  }
  assert.ok(bytes < 700000, `Hero assets: ${bytes} bytes`);
  assert.ok(statSync(at('public/assets/xianxia/background/hero-mountains-mobile.webp')).size < 60000);
});
