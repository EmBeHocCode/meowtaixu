import { useEffect, useMemo, useRef, type Ref } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  Mesh,
  MeshBasicMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  ShaderMaterial,
} from 'three';
import { heroAssets } from '../../data/hero-assets';
import type { HeroSceneProps } from '../../types/hero';
import { HeroCameraRig } from '../camera/HeroCameraRig';
import { SpiritMotes } from '../particles/SpiritMotes';

type LayerProps = Pick<HeroSceneProps, 'mobile' | 'motion'> & {
  url: string;
  z: number;
  opacity?: number;
  color?: string;
  fog?: number;
  align?: number;
};

function LandscapeLayer({ url, z, motion, opacity = 1, color = '#ffffff', fog = 0, align = 0.5 }: LayerProps) {
  const sourceTexture = useTexture(url);
  const texture = useMemo(() => fog ? sourceTexture.clone() : sourceTexture, [sourceTexture, fog]);
  texture.colorSpace = SRGBColorSpace;
  if (fog) {
    texture.wrapS = RepeatWrapping;
    texture.needsUpdate = true;
  }
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const time = useRef(0);
  const { size } = useThree();
  // Use nominal camera depth so resizing preserves composition, without chasing camera motion.
  const height = 2 * Math.tan(35 * Math.PI / 360) * (12 - z);
  const width = height * (size.width / size.height);
  const aspect = (texture.image as { width: number; height: number }).width / (texture.image as { height: number }).height;
  const coverHeight = Math.max(height, width / aspect) * 1.055;
  const coverWidth = coverHeight * aspect;
  const x = (width - coverWidth) * (align - 0.5);
  useEffect(() => () => { if (fog) texture.dispose(); }, [fog, texture]);
  useFrame((_state, delta) => {
    if (!fog || !mesh.current || !material.current) return;
    time.current += Math.min(delta, 0.08);
    if (fog) {
      const drift = fog === 1 ? 0.0065 : -0.0038;
      texture.offset.x = (time.current * drift) % 1;
      mesh.current.position.y = -height * 0.14 + Math.sin(time.current * (fog === 1 ? 0.07 : 0.045) + fog) * height * 0.006;
      material.current.opacity = opacity + motion.current.scroll * 0.07;
    }
  });
  return <mesh ref={mesh} position={[x, fog ? -height * 0.14 : 0, z]} renderOrder={z + 10}>
    <planeGeometry args={[coverWidth, coverHeight]} />
    <meshBasicMaterial ref={material} map={texture} transparent depthWrite={false} toneMapped={false} opacity={opacity} color={color} />
  </mesh>;
}

type OverlayKind = 'sky' | 'vegetation';

function AnimatedOverlay({ url, z, kind, active, mobile }: {
  url: string;
  z: number;
  kind: OverlayKind;
  active: boolean;
  mobile: boolean;
}) {
  const texture = useTexture(url);
  texture.colorSpace = SRGBColorSpace;
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial | ShaderMaterial>(null);
  const time = useRef(0);
  const { size } = useThree();
  const height = 2 * Math.tan(35 * Math.PI / 360) * (12 - z);
  const width = height * size.width / size.height;
  const aspect = (texture.image as { width: number; height: number }).width / (texture.image as { height: number }).height;
  const planeHeight = Math.max(height, width / aspect) * 1.055;
  const planeWidth = planeHeight * aspect;

  useFrame((_state, delta) => {
    if (!active || !mesh.current || !material.current) return;
    time.current += Math.min(delta, 0.08);
    if (kind === 'sky') {
      // Reveal the first distant pulse quickly, then repeat on a calm 7.2 s cadence.
      const phase = time.current % 7.2;
      const pulse = Math.exp(-Math.pow((phase - 1.45) / 0.54, 2));
      const afterglow = Math.exp(-Math.pow((phase - 2.25) / 0.42, 2)) * 0.42;
      (material.current as MeshBasicMaterial).opacity = Math.min(mobile ? 0.13 : 0.23, (pulse + afterglow) * (mobile ? 0.13 : 0.23));
    } else {
      (material.current as ShaderMaterial).uniforms.uTime.value = time.current;
    }
  });

  return <mesh ref={mesh} position={[0, 0, z]} renderOrder={kind === 'sky' ? 5 : 13}>
    <planeGeometry args={[planeWidth, planeHeight, kind === 'vegetation' ? 24 : 1, kind === 'vegetation' ? 12 : 1]} />
    {kind === 'sky' ? <meshBasicMaterial
      ref={material as Ref<MeshBasicMaterial>}
      map={texture} transparent depthWrite={false} toneMapped={false} opacity={0}
      blending={AdditiveBlending}
    /> : <shaderMaterial
      ref={material as Ref<ShaderMaterial>}
      transparent depthWrite={false} toneMapped={false}
      uniforms={{ uMap: { value: texture }, uTime: { value: 0 }, uOpacity: { value: 0.78 } }}
      vertexShader={`
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          vUv = uv;
          vec3 p = position;
          float anchored = smoothstep(0.18, 1.0, uv.y);
          p.x += sin(uTime * 0.55 + uv.y * 4.2) * anchored * 0.035;
          p.y += sin(uTime * 0.31 + uv.x * 3.0) * anchored * 0.008;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `}
      fragmentShader={`
        varying vec2 vUv;
        uniform sampler2D uMap;
        uniform float uOpacity;
        void main() {
          vec4 texel = texture2D(uMap, vUv);
          gl_FragColor = vec4(texel.rgb, texel.a * uOpacity);
        }
      `}
    />}
  </mesh>;
}

type BirdFlightProps = {
  active: boolean;
  direction: 1 | -1;
  depth: number;
  phase: number;
  speed: number;
  scale: number;
  y: number;
};

function BirdFlight({ active, direction, depth, phase, speed, scale, y }: BirdFlightProps) {
  const source = useTexture(heroAssets.birdFlightSprite);
  const texture = useMemo(() => {
    const copy = source.clone();
    copy.colorSpace = SRGBColorSpace;
    copy.wrapS = RepeatWrapping;
    copy.wrapT = RepeatWrapping;
    copy.repeat.set(0.25, 0.5);
    copy.needsUpdate = true;
    return copy;
  }, [source]);
  const mesh = useRef<Mesh>(null);
  const elapsed = useRef(phase * 9);
  const lastFrame = useRef(-1);
  const { size } = useThree();
  const height = 2 * Math.tan(35 * Math.PI / 360) * (12 - depth);
  const width = height * size.width / size.height;
  const birdWidth = width * scale;
  const birdHeight = birdWidth * 0.5;

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_state, delta) => {
    if (!active || !mesh.current) return;
    elapsed.current += Math.min(delta, 0.08);
    const progress = (elapsed.current * speed + phase) % 1;
    const travelX = -width * 0.62 + progress * width * 1.24;
    mesh.current.position.x = direction === 1 ? travelX : -travelX;
    mesh.current.position.y = height * y + Math.sin(elapsed.current * 0.7 + phase * 6) * height * 0.008;
    mesh.current.rotation.z = Math.sin(elapsed.current * 0.42 + phase * 4) * 0.018 * direction;
    mesh.current.scale.x = direction;

    const frame = Math.floor(elapsed.current * (5.4 + phase * 1.2)) % 8;
    if (frame !== lastFrame.current) {
      const column = frame % 4;
      const row = frame < 4 ? 0.5 : 0;
      texture.offset.set(column * 0.25, row);
      lastFrame.current = frame;
    }
  });

  return <mesh ref={mesh} position={[0, height * y, depth]} renderOrder={10.5 + depth * 0.01}>
    <planeGeometry args={[birdWidth, birdHeight]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} opacity={0.62} blending={AdditiveBlending} />
  </mesh>;
}

function SpiritBirdFlights({ active }: { active: boolean }) {
  return <>
    <BirdFlight active={active} direction={1} depth={-0.45} phase={0.08} speed={0.022} scale={0.052} y={0.23} />
    <BirdFlight active={active} direction={1} depth={-0.6} phase={0.53} speed={0.017} scale={0.038} y={0.29} />
    <BirdFlight active={active} direction={-1} depth={-0.75} phase={0.31} speed={0.014} scale={0.031} y={0.19} />
  </>;
}

function Moon({ mobile }: { mobile: boolean }) {
  const texture = useTexture(heroAssets.moon);
  texture.colorSpace = SRGBColorSpace;
  const { size } = useThree();
  const z = -4;
  const h = 2 * Math.tan(35 * Math.PI / 360) * (12 - z);
  const w = h * size.width / size.height;
  const diameter = h * (mobile ? 0.13 : 0.2);
  return <mesh position={[w * (mobile ? 0.27 : 0.18), h * 0.285, z]} renderOrder={6}>
    <planeGeometry args={[diameter, diameter]} />
    <meshBasicMaterial map={texture} transparent opacity={0.54} depthWrite={false} toneMapped={false} color="#b5c1c7" />
  </mesh>;
}

function FrameBudget({ active, mobile }: Pick<HeroSceneProps, 'active' | 'mobile'>) {
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    if (!active) return;
    invalidate();
    const timer = window.setInterval(invalidate, 1000 / (mobile ? 20 : 30));
    return () => window.clearInterval(timer);
  }, [active, mobile, invalidate]);
  return null;
}

export function HeroWorld({ active, mobile, motion, onReady }: HeroSceneProps & { onReady: () => void }) {
  // All textures resolve before the Suspense boundary reveals the complete composition.
  useTexture([
    mobile ? heroAssets.mobileFar : heroAssets.far,
    heroAssets.mid,
    heroAssets.near,
    heroAssets.moon,
    heroAssets.fog,
    heroAssets.skyPulse,
    ...(!mobile ? [heroAssets.bambooTips, heroAssets.birdFlightSprite] : []),
  ]);
  const gl = useThree(state => state.gl);
  useEffect(() => {
    gl.domElement.dataset.heroLayers = 'ready';
    onReady();
  }, [gl, onReady]);

  return <>
    <FrameBudget active={active} mobile={mobile} />
    <HeroCameraRig motion={motion} mobile={mobile} />
    <LandscapeLayer url={mobile ? heroAssets.mobileFar : heroAssets.far} z={-6} mobile={mobile} motion={motion} color="#bcc7d0" align={mobile ? 0.62 : 0.5} />
    <AnimatedOverlay url={heroAssets.skyPulse} z={-5.9} kind="sky" active={active} mobile={mobile} />
    <Moon mobile={mobile} />
    <LandscapeLayer url={heroAssets.mid} z={-1} mobile={mobile} motion={motion} color="#b5c1cd" align={mobile ? 0.94 : 0.5} />
    {!mobile && <SpiritBirdFlights active={active} />}
    <LandscapeLayer url={heroAssets.fog} z={0} mobile={mobile} motion={motion} opacity={mobile ? 0.12 : 0.2} fog={1} />
    <LandscapeLayer url={heroAssets.near} z={1.5} mobile={mobile} motion={motion} color="#889aa8" align={mobile ? 0.72 : 0.5} />
    {!mobile && <LandscapeLayer url={heroAssets.fog} z={2} mobile={mobile} motion={motion} opacity={0.09} fog={2} />}
    {!mobile && <AnimatedOverlay url={heroAssets.bambooTips} z={2.2} kind="vegetation" active={active} mobile={mobile} />}
    <SpiritMotes mobile={mobile} />
  </>;
}
