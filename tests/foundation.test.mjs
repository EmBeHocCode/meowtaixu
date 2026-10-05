import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const at = (path) => resolve(root, path);
const digest = (path) => createHash('sha256').update(readFileSync(at(path))).digest('hex');

test('Vietnamese typography bundles display, body and Chinese font families', () => {
  assert.match(readFileSync(at('index.html'), 'utf8'), /<html lang="vi">/);
  const main = readFileSync(at('src/main.tsx'), 'utf8');
  const css = readFileSync(at('src/sections/Hero/hero.css'), 'utf8');
  for (const fontImport of ['be-vietnam-pro/vietnamese-400.css', 'be-vietnam-pro/vietnamese-500.css',
    'be-vietnam-pro/vietnamese-600.css', 'noto-serif-display/vietnamese-400.css',
    'noto-serif-display/vietnamese-400-italic.css', 'noto-serif-display/vietnamese-500.css']) assert.ok(main.includes(fontImport), fontImport);
  assert.equal(readFileSync(at('public/fonts/noto-serif-tc/noto-serif-tc-xianxia-400.woff2')).toString('ascii', 0, 4), 'wOF2');
  assert.match(css, /\.hero__poem \{[^}]*font-family: var\(--font-editorial\)/);
});

test('Hero and About use corrected identity and distinguish GitHub from nickname', () => {
  const hero = readFileSync(at('src/sections/Hero/Hero.tsx'), 'utf8');
  const about = readFileSync(at('src/sections/About/About.tsx'), 'utf8');
  for (const source of [hero, about]) assert.doesNotMatch(source, /Meow Ngáo|Meow Chill|Gom ý tưởng|giữa nhân gian|Học bằng cách làm|đến điều hữu ích/);
  assert.ok(!hero.includes('Nguyễn Lâm Hùng'));
  assert.ok(about.includes('Nguyễn Lâm Hùng'));
  assert.ok(hero.includes('<h1 id="hero-heading" className="sr-only">Nhập thế hành đạo</h1>'));
  assert.ok(hero.includes('hero-title-desktop.webp'));
  assert.ok(hero.includes('<span lang="zh-Hant">道號</span>'));
  assert.ok(hero.includes('Web · AI Bots · Automation'));
  assert.ok(hero.includes('Lấy sản phẩm làm đường đi,'));
  assert.ok(hero.includes('mượn AI làm pháp khí.'));
  assert.ok(hero.includes('Mây qua núi, đường còn dài.'));
  assert.ok(hero.includes('Ta cứ đi, điều đáng làm thì làm.'));
  assert.doesNotMatch(hero, /<br \/>/);
  assert.ok(hero.includes('01 —</span> NHẬP CẢNH'));
  assert.ok(about.includes('Phàm danh Nguyễn Lâm Hùng, đạo hiệu Meow.'));
  assert.ok(about.includes('web và AI bots'));
  assert.ok(about.includes('Web Products<br />AI Bots<br />Automation<br />AI-assisted Workflow'));
  assert.doesNotMatch(about, /theo học ngành|game và những công cụ nhỏ/);
  assert.doesNotMatch(hero + about, /\b(?:mình|tôi)\b/i);
  assert.match(about, /GitHub<\/span><\/dt><dd lang="en">EmBeHocCode/);
  assert.match(about, /道號<\/span> \/ Đạo hiệu<\/dt><dd>Meow/);
});

test('Hero title artwork is optimized, semantic and protected without disabling body selection', () => {
  const png = readFileSync(at('public/assets/xianxia/title/hero-title-desktop.png'));
  const webp = readFileSync(at('public/assets/xianxia/title/hero-title-desktop.webp'));
  const hero = readFileSync(at('src/sections/Hero/Hero.tsx'), 'utf8');
  const protection = readFileSync(at('src/hooks/useProtectedArtwork.ts'), 'utf8');
  const global = readFileSync(at('src/styles/global.css'), 'utf8');
  assert.equal(png.readUInt32BE(16), 2172);
  assert.equal(png.readUInt32BE(20), 724);
  assert.equal(webp.toString('ascii', 0, 4), 'RIFF');
  assert.equal(webp.toString('ascii', 8, 12), 'WEBP');
  assert.ok(webp.length < 600000);
  assert.match(hero, /className="hero__title-art protected-artwork"/);
  assert.match(hero, /draggable="false"/);
  assert.match(protection, /dragstart/);
  assert.match(protection, /contextmenu/);
  assert.match(global, /\.protected-artwork/);
  assert.doesNotMatch(global, /body[^}]*user-select:\s*none/);
});

test('brand entrance separates the full lockup from the persistent emblem', () => {
  const preloader = readFileSync(at('src/features/preloader/Preloader.tsx'), 'utf8');
  const journey = readFileSync(at('src/components/navigation/HorizontalJourney.tsx'), 'utf8');
  const html = readFileSync(at('index.html'), 'utf8');
  assert.match(preloader, /logo-as\.png/);
  assert.match(preloader, /brandVisible/);
  assert.match(preloader, /reducedMotion \? 550 : 2800/);
  assert.match(readFileSync(at('src/styles/global.css'), 'utf8'), /preloader-brand-reveal 2\.8s ease-in-out/);
  assert.match(journey, /logo-main\.png/);
  assert.doesNotMatch(journey, /logo-as\.png|logo-header\.png/);
  assert.match(html, /<title>Meow — Web, E-Commerce &amp; AI<\/title>/);
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

test('unfinished journey chapters share a bilingual coming-soon state', () => {
  const placeholder = readFileSync(at('src/components/common/ComingSoonChapter.tsx'), 'utf8');
  assert.ok(placeholder.includes('Coming soon'));
  assert.ok(placeholder.includes('即将推出'));
  for (const name of ['Skills', 'Focus', 'Projects', 'Connect']) {
    assert.ok(readFileSync(at(`src/sections/${name}/${name}.tsx`), 'utf8').includes('ComingSoonChapter'));
  }
});

test('Sở tu presents four accessible cultivation disciplines without a card grid', () => {
  const section = readFileSync(at('src/sections/Expertise/Expertise.tsx'), 'utf8');
  const data = readFileSync(at('src/data/expertise.ts'), 'utf8');
  const css = readFileSync(at('src/sections/Expertise/expertise.css'), 'utf8');
  const journey = readFileSync(at('src/components/navigation/HorizontalJourney.tsx'), 'utf8');
  assert.doesNotMatch(section, /ComingSoonChapter/);
  for (const title of ['THƯƠNG ĐẠO', 'KIẾN WEB', 'TRỢ PHÁP AI', 'MƯU HOẠCH']) assert.ok(data.includes(title), title);
  for (const english of ['E-Commerce Mindset', 'Web Product Building', 'AI-assisted Workflow', 'Product Planning']) assert.ok(data.includes(english), english);
  assert.match(section, /aria-pressed=\{selected === index\}/);
  assert.match(section, /className="expertise__path-label"/);
  assert.match(section, /data-journey-input/);
  assert.match(section, /data-chapter-scroll/);
  assert.doesNotMatch(css, /grid-template-columns:\s*repeat\(2/);
  assert.match(css, /Each transparent button covers its relic/);
  assert.match(journey, /<Expertise active=\{active === 2 && entered\} prepared=/);
});

test('Sở tu runtime artwork is optimized WebP with transparent relics', () => {
  const names = ['scripture-hall-midnight', 'merchant-scripture', 'web-construction-tablet', 'ai-jade-talisman', 'product-strategy-scroll'];
  let bytes = 0;
  for (const name of names) {
    const data = readFileSync(at(`public/assets/xianxia/expertise/${name}.webp`));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    bytes += data.length;
  }
  assert.ok(bytes < 1000000, `Sở tu assets: ${bytes} bytes`);
  const world = readFileSync(at('src/scene/environment/ExpertiseWorld.tsx'), 'utf8');
  assert.match(world, /GroundMist/);
  assert.match(world, /EnergyThreads/);
  assert.match(world, /FrameBudget/);
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

test('Hero ambient motion uses compact layered assets and mobile-aware animation branches', () => {
  const runtimeAssets = [
    'vfx/hero-sky-tribulation-glow.webp',
    'environment/hero-bamboo-tips.webp',
    'vfx/hero-spirit-bird-flight-spritesheet.webp',
  ];
  let bytes = 0;
  for (const asset of runtimeAssets) {
    const data = readFileSync(at(`public/assets/xianxia/${asset}`));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    bytes += data.length;
  }
  assert.ok(bytes < 170000, `Hero ambient assets: ${bytes} bytes`);
  const spriteMaster = readFileSync(at('public/assets/xianxia/vfx/hero-spirit-bird-flight-spritesheet.png'));
  assert.equal(spriteMaster.toString('ascii', 1, 4), 'PNG');

  const assets = readFileSync(at('src/data/hero-assets.ts'), 'utf8');
  const world = readFileSync(at('src/scene/environment/HeroWorld.tsx'), 'utf8');
  for (const name of ['skyPulse', 'bambooTips', 'birdFlightSprite']) assert.ok(assets.includes(name), name);
  assert.match(world, /if \(!active \|\| !mesh\.current \|\| !material\.current\) return/);
  assert.match(world, /!mobile && <SpiritBirdFlights active=\{active\}/);
  assert.match(world, /!mobile && <AnimatedOverlay url=\{heroAssets\.bambooTips\}/);
  assert.match(world, /environment\.values\.cloud/);
  assert.match(world, /environment\.thunderPulse/);
  assert.match(world, /float edgeMask = featherX \* featherY/);
  assert.match(world, /texel\.a \* uOpacity \* edgeMask/);
  assert.match(world, /const frame = Math\.floor\(elapsed\.current/);
  assert.match(world, /sampleMovementPath\(path, progress, run\.current\)/);
  assert.match(world, /movementOpacity\(path, progress\)/);
  assert.match(world, /mesh\.current\.scale\.x = direction/);
  assert.doesNotMatch(world, /kind === 'birds'/);
});

test('brand logo derivatives and browser icons have expected PNG dimensions', () => {
  const expected = {
    'logo-header.png': [600, 200],
    'logo-web.png': [256, 256],
    'apple-touch-icon.png': [180, 180],
    'favicon-192.png': [192, 192],
    'favicon-32.png': [32, 32],
    'favicon-16.png': [16, 16],
  };
  for (const [name, [width, height]] of Object.entries(expected)) {
    const png = readFileSync(at(`public/assets/xianxia/logo/${name}`));
    assert.equal(png.toString('ascii', 1, 4), 'PNG');
    assert.equal(png.readUInt32BE(16), width, name);
    assert.equal(png.readUInt32BE(20), height, name);
  }
  const html = readFileSync(at('index.html'), 'utf8');
  assert.match(html, /favicon-32\.png/);
  assert.match(html, /apple-touch-icon\.png/);
});
