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
import { useEnvironment } from '../../features/environment';
import { WeatherEffects } from './hero/WeatherEffects';
import { createMovementRun, environmentMovementPaths, movementFacing, movementOpacity, sampleMovementPath } from '../../features/environment';
import type { EnvironmentDebugEntity } from '../../features/environment';

type LayerProps = Pick<HeroSceneProps, 'mobile' | 'motion'> & {
  url: string;
  z: number;
  opacity?: number;
  color?: string;
  fog?: number;
  align?: number;
};

function LandscapeLayer({ url, z, motion, opacity = 1, color = '#ffffff', fog = 0, align = 0.5 }: LayerProps) {
  const environment = useEnvironment();
  const texture = useTexture(url);
  texture.colorSpace = SRGBColorSpace;
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial | ShaderMaterial>(null);
  const time = useRef(0);
  const { size } = useThree();
  // Use nominal camera depth so resizing preserves composition, without chasing camera motion.
  const height = 2 * Math.tan(35 * Math.PI / 360) * (12 - z);
  const width = height * (size.width / size.height);
  const aspect = (texture.image as { width: number; height: number }).width / (texture.image as { height: number }).height;
  const coverHeight = Math.max(height, width / aspect) * 1.055;
  const coverWidth = coverHeight * aspect;
  const x = (width - coverWidth) * (align - 0.5);
  useFrame((_state, delta) => {
    if (!fog || !mesh.current || !material.current) return;
    time.current += Math.min(delta, 0.08);
    const shader = material.current as ShaderMaterial;
    shader.uniforms.uTime.value = time.current;
    const density = fog === 3 ? environment.values.cloud * 0.07 : environment.values.fog * (fog === 1 ? 0.16 : 0.08);
    shader.uniforms.uOpacity.value = opacity + motion.current.scroll * 0.07 + density;
    shader.uniforms.uWind.value = environment.values.wind;
  });
  return <mesh ref={mesh} position={[x, fog === 3 ? height * 0.28 : fog ? -height * 0.14 : 0, z]} renderOrder={z + 10}>
    <planeGeometry args={[coverWidth, coverHeight]} />
    {fog ? <shaderMaterial
      ref={material as Ref<ShaderMaterial>}
      transparent depthWrite={false} toneMapped={false}
      uniforms={{
        uMap: { value: texture },
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uDirection: { value: fog === 1 ? 1 : -1 },
        uLayer: { value: fog },
        uWind: { value: 0.1 },
      }}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        varying vec2 vUv;
        uniform sampler2D uMap;
        uniform float uTime;
        uniform float uOpacity;
        uniform float uDirection;
        uniform float uLayer;
        uniform float uWind;
        void main() {
          vec2 flowUv = vUv;
          float flow = 0.6 + uWind * 1.8;
          flowUv.x += sin(uTime * (0.11 + uLayer * 0.018) * flow + vUv.y * 5.2 + uLayer) * (0.018 + uWind * 0.018) * uDirection;
          flowUv.y += sin(uTime * 0.065 * flow + vUv.x * 3.7 + uLayer * 1.8) * (0.006 + uWind * 0.006);
          vec4 texel = texture2D(uMap, clamp(flowUv, 0.0, 1.0));
          float featherX = smoothstep(0.0, 0.16, vUv.x) * smoothstep(0.0, 0.16, 1.0 - vUv.x);
          float featherY = smoothstep(0.0, 0.1, vUv.y) * smoothstep(0.0, 0.1, 1.0 - vUv.y);
          float edgeMask = featherX * featherY;
          gl_FragColor = vec4(texel.rgb, texel.a * uOpacity * edgeMask);
        }
      `}
    /> : <meshBasicMaterial
      ref={material as Ref<MeshBasicMaterial>}
      map={texture} transparent depthWrite={false} toneMapped={false} opacity={opacity} color={color}
    />}
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
  const environment = useEnvironment();
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
      const weatherLight = 0.018 + environment.values.cloud * 0.035 + environment.values.lightning * 0.2;
      (material.current as MeshBasicMaterial).opacity = Math.min(mobile ? 0.14 : 0.26, (pulse + afterglow) * weatherLight + environment.thunderPulse * 0.12);
    } else {
      const shader = material.current as ShaderMaterial;
      shader.uniforms.uTime.value = time.current;
      shader.uniforms.uWind.value = environment.values.wind;
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
      uniforms={{ uMap: { value: texture }, uTime: { value: 0 }, uOpacity: { value: 0.78 }, uWind: { value: 0.1 } }}
      vertexShader={`
        varying vec2 vUv;
        uniform float uTime;
        uniform float uWind;
        void main() {
          vUv = uv;
          vec3 p = position;
          float anchored = smoothstep(0.18, 1.0, uv.y);
          float gust = 0.65 + uWind * 2.4;
          p.x += sin(uTime * (0.42 + uWind * 0.8) + uv.y * 4.2) * anchored * (0.02 + uWind * 0.07) * gust;
          p.y += sin(uTime * 0.31 + uv.x * 3.0) * anchored * (0.006 + uWind * 0.012);
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
  pathName: keyof typeof environmentMovementPaths;
  offset: number;
  scale: number;
};

function BirdFlight({ active, pathName, offset, scale }: BirdFlightProps) {
  const environment = useEnvironment();
  const path = environmentMovementPaths[pathName];
  const run = useRef(createMovementRun(path));
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
  const elapsed = useRef(run.current.durationMs * offset);
  const waiting = useRef(0);
  const lastDebug = useRef(0);
  const lastFrame = useRef(-1);
  const { size } = useThree();
  const depth = -0.25 - (1 - path.depth) * 1.25;
  const height = 2 * Math.tan(35 * Math.PI / 360) * (12 - depth);
  const width = height * size.width / size.height;
  const birdWidth = width * scale * run.current.scale;
  const birdHeight = birdWidth * 0.5;

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_state, delta) => {
    if (!active || !mesh.current) return;
    const deltaMs = Math.min(delta, 0.08) * 1000;
    if (waiting.current > 0) {
      waiting.current -= deltaMs;
      mesh.current.visible = false;
      return;
    }
    mesh.current.visible = true;
    elapsed.current += deltaMs * (0.86 + environment.values.wind * 0.34);
    if (elapsed.current >= run.current.durationMs) {
      waiting.current = run.current.respawnDelayMs;
      run.current = createMovementRun(path);
      elapsed.current = 0;
      mesh.current.visible = false;
      return;
    }
    const progress = elapsed.current / run.current.durationMs;
    const point = sampleMovementPath(path, progress, run.current);
    const direction = movementFacing(path, progress);
    mesh.current.position.x = (point.x - 0.5) * width;
    mesh.current.position.y = (0.5 - point.y) * height;
    mesh.current.rotation.z = Math.sin(elapsed.current * 0.00042 + offset * 4) * 0.018 * direction;
    mesh.current.scale.x = direction;
    (mesh.current.material as MeshBasicMaterial).opacity = 0.62 * movementOpacity(path, progress);

    const frame = Math.floor(elapsed.current * 0.0062) % 8;
    if (frame !== lastFrame.current) {
      const column = frame % 4;
      const row = frame < 4 ? 0.5 : 0;
      texture.offset.set(column * 0.25, row);
      lastFrame.current = frame;
    }
    if (import.meta.env.DEV && elapsed.current - lastDebug.current > 250) {
      lastDebug.current = elapsed.current;
      const detail: EnvironmentDebugEntity = {
        id: `bird-${pathName}-${offset}`,
        pathId: path.id,
        x: point.x,
        y: point.y,
        progress,
        direction,
        speed: 1000 / run.current.durationMs,
        frameIndex: frame,
        depth,
      };
      window.dispatchEvent(new CustomEvent('environment-debug-entity', { detail }));
    }
  });

  return <mesh ref={mesh} position={[0, 0, depth]} renderOrder={10.5 + depth * 0.01}>
    <planeGeometry args={[birdWidth, birdHeight]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} opacity={0.62} blending={AdditiveBlending} />
  </mesh>;
}

function SpiritBirdFlights({ active }: { active: boolean }) {
  return <>
    <BirdFlight active={active} pathName="birdsNear" offset={0.08} scale={0.052} />
    <BirdFlight active={active} pathName="birdsNear" offset={0.53} scale={0.038} />
    <BirdFlight active={active} pathName="birdsFar" offset={0.31} scale={0.031} />
  </>;
}

function Moon({ mobile }: { mobile: boolean }) {
  const environment = useEnvironment();
  const texture = useTexture(heroAssets.moon);
  texture.colorSpace = SRGBColorSpace;
  const { size } = useThree();
  const z = -4;
  const h = 2 * Math.tan(35 * Math.PI / 360) * (12 - z);
  const w = h * size.width / size.height;
  const diameter = h * (mobile ? 0.13 : 0.2);
  return <mesh position={[w * (mobile ? 0.27 : 0.18), h * 0.285, z]} renderOrder={6}>
    <planeGeometry args={[diameter, diameter]} />
    <meshBasicMaterial map={texture} transparent opacity={0.18 + environment.values.moonlight * 0.42} depthWrite={false} toneMapped={false} color="#b5c1c7" />
  </mesh>;
}

function FrameBudget({ active, mobile }: Pick<HeroSceneProps, 'active' | 'mobile'>) {
  const environment = useEnvironment();
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    if (!active || environment.paused) return;
    invalidate();
    const timer = window.setInterval(invalidate, 1000 / (mobile ? 20 : 30));
    return () => window.clearInterval(timer);
  }, [active, mobile, invalidate, environment.paused]);
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
    <LandscapeLayer url={heroAssets.fog} z={-5.55} mobile={mobile} motion={motion} opacity={mobile ? 0.018 : 0.025} fog={3} />
    <Moon mobile={mobile} />
    <LandscapeLayer url={heroAssets.mid} z={-1} mobile={mobile} motion={motion} color="#b5c1cd" align={mobile ? 0.94 : 0.5} />
    {!mobile && <SpiritBirdFlights active={active} />}
    <LandscapeLayer url={heroAssets.fog} z={0} mobile={mobile} motion={motion} opacity={mobile ? 0.12 : 0.2} fog={1} />
    <LandscapeLayer url={heroAssets.near} z={1.5} mobile={mobile} motion={motion} color="#889aa8" align={mobile ? 0.72 : 0.5} />
    {!mobile && <LandscapeLayer url={heroAssets.fog} z={2} mobile={mobile} motion={motion} opacity={0.09} fog={2} />}
    {!mobile && <AnimatedOverlay url={heroAssets.bambooTips} z={2.2} kind="vegetation" active={active} mobile={mobile} />}
    <SpiritMotes mobile={mobile} />
    <WeatherEffects active={active} mobile={mobile} />
  </>;
}
