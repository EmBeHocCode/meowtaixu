const asset = (path: string) => `${import.meta.env.BASE_URL}assets/xianxia/${path}`;

export const heroAssets = {
  far: asset('background/hero-mountains-far.webp'),
  mobileFar: asset('background/hero-mountains-mobile.webp'),
  mid: asset('background/mountain-mid-pavilion.webp'),
  near: asset('environment/mountain-near-bamboo.webp'),
  moon: asset('environment/moon-ink-silver.webp'),
  fog: asset('vfx/fog-silk.webp'),
  skyPulse: asset('vfx/hero-sky-tribulation-glow.webp'),
  bambooTips: asset('environment/hero-bamboo-tips.webp'),
  birdFlightSprite: asset('vfx/hero-spirit-bird-flight-spritesheet.webp'),
} as const;
