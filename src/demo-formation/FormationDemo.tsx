import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  ClampToEdgeWrapping,
  DoubleSide,
  Group,
  InstancedMesh,
  LinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Points,
  SRGBColorSpace,
  Texture,
} from 'three';

const ROOT = '/assets/xianxia/demo-formation/';
const assets = {
  outer: `${ROOT}rings/outer/outer-formation-ring.webp`,
  secondary: `${ROOT}rings/secondary/secondary-moon-ring.webp`,
  inner: `${ROOT}rings/inner/inner-seal-ring.webp`,
  tilted: `${ROOT}rings/tilted/tilted-orbit-ring.webp`,
  upper: `${ROOT}rings/upper/upper-formation.webp`,
  glyphBand: `${ROOT}runes/rune-glyph-band.webp`,
  runeChains: `${ROOT}runes/vertical-rune-chains-8.webp`,
  nodes: `${ROOT}nodes/orbit-seals-8.webp`,
  core: `${ROOT}core/central-core-8f.webp`,
  flame: `${ROOT}flames/spirit-flame-8f.webp`,
  activation: `${ROOT}activation/activation-discharge-8f.webp`,
  ribbon: `${ROOT}energy/ribbons/energy-ribbon-8f.webp`,
  runePulse: `${ROOT}energy/pulses/rune-glow-8f.webp`,
  mist: `${ROOT}mist/seal-mist-pulse-8f.webp`,
} as const;

type LayerKey = 'groundRings' | 'upperArray' | 'runes' | 'nodes' | 'ribbons' | 'flames' | 'particles' | 'mist' | 'core';
type Controls = {
  paused: boolean;
  formationSpeed: number;
  outerSpeed: number;
  secondarySpeed: number;
  innerSpeed: number;
  upperSpeed: number;
  orbitSpeed: number;
  particleAmount: number;
  glow: number;
  mist: number;
  sequenceFps: number;
  layers: Record<LayerKey, boolean>;
};
type Telemetry = { fps: number; calls: number; frame: number; activation: number; sequence: string };

function configureTexture(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function useAsset(url: string) {
  const source = useTexture(url);
  return useMemo(() => configureTexture(source.clone()), [source]);
}

function useAtlas(url: string) {
  const texture = useAsset(url);
  useEffect(() => {
    texture.repeat.set(0.25, 0.5);
    return () => texture.dispose();
  }, [texture]);
  return texture;
}

function setAtlasFrame(texture: Texture, frame: number) {
  const insetX = 1 / 1024;
  const insetY = 1 / 512;
  texture.repeat.set(0.25 - insetX * 2, 0.5 - insetY * 2);
  texture.offset.set((frame % 4) * 0.25 + insetX, (frame < 4 ? 0.5 : 0) + insetY);
}

function AssetPlane({ url, size, position, rotation, opacity, speed = 0, reverse = false, pulse = 0 }: {
  url: string;
  size: [number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  opacity: number;
  speed?: number;
  reverse?: boolean;
  pulse?: number;
}) {
  const texture = useAsset(url);
  const mesh = useRef<Mesh>(null);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(({ clock }, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.z += delta * speed * (reverse ? -1 : 1);
    if (pulse) {
      const scale = 1 + Math.sin(clock.elapsedTime * 1.35) * pulse;
      mesh.current.scale.setScalar(scale);
    }
  });
  return <mesh ref={mesh} position={position} rotation={rotation}>
    <planeGeometry args={size} />
    <meshBasicMaterial map={texture} transparent opacity={opacity} alphaTest={0.012} depthWrite={false} side={DoubleSide} />
  </mesh>;
}

function AtlasPlane({ url, position, size, fps, elapsed, opacity, rotation = [0, 0, 0], phase = 0, frameOverride }: {
  url: string;
  position: [number, number, number];
  size: [number, number];
  fps: number;
  elapsed: number;
  opacity: number;
  rotation?: [number, number, number];
  phase?: number;
  frameOverride?: number;
}) {
  const texture = useAtlas(url);
  const material = useRef<MeshBasicMaterial>(null);
  const last = useRef(-1);
  useFrame(() => {
    const frame = frameOverride ?? Math.floor((elapsed + phase) * fps) % 8;
    if (frame !== last.current) {
      setAtlasFrame(texture, frame);
      last.current = frame;
    }
    if (material.current) material.current.opacity = opacity;
  });
  return <mesh position={position} rotation={rotation}>
    <planeGeometry args={size} />
    <meshBasicMaterial ref={material} map={texture} transparent opacity={0} alphaTest={0.008} depthWrite={false} side={DoubleSide} blending={AdditiveBlending} />
  </mesh>;
}

function GroundFormation({ controls, elapsed, opacity, speed }: { controls: Controls; elapsed: number; opacity: number; speed: number }) {
  const lower = -Math.PI / 2;
  return <group>
    <AssetPlane url={assets.outer} size={[6.45, 6.45]} position={[0, 0.01, 0]} rotation={[lower, 0, 0]} opacity={opacity * 0.78} speed={0.035 * controls.outerSpeed * speed} />
    <AssetPlane url={assets.secondary} size={[5.15, 5.15]} position={[0, 0.09, 0]} rotation={[lower, 0, 0]} opacity={MathUtils.smoothstep((elapsed - 2.15) / 0.8, 0, 1) * 0.7} speed={0.06 * controls.secondarySpeed * speed} reverse />
    <AssetPlane url={assets.inner} size={[3.72, 3.72]} position={[0, 0.18, 0]} rotation={[lower, 0, 0]} opacity={MathUtils.smoothstep((elapsed - 2.85) / 0.8, 0, 1) * 0.78} speed={0.085 * controls.innerSpeed * speed} pulse={0.012} />
    <AssetPlane url={assets.glyphBand} size={[4.38, 4.38]} position={[0, 0.27, 0]} rotation={[lower, 0, 0]} opacity={MathUtils.smoothstep((elapsed - 4.0) / 0.9, 0, 1) * 0.68} speed={0.045 * controls.secondarySpeed * speed} reverse />
  </group>;
}

function TiltedOrbit({ elapsed, opacity, speed }: { elapsed: number; opacity: number; speed: number }) {
  return <group position={[0, 1.08, 0]} rotation={[-Math.PI / 2 + 0.2, 0.12, -0.06]}>
    <AssetPlane url={assets.tilted} size={[3.35, 3.35]} position={[0, 0, 0]} rotation={[0, 0, elapsed * 0.025]} opacity={opacity * 0.54} speed={speed} />
  </group>;
}

function UpperFormation({ elapsed, opacity, speed }: { elapsed: number; opacity: number; speed: number }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (group.current) group.current.position.y = 2.62 + Math.sin(elapsed * 0.62) * 0.09;
  });
  return <group ref={group}>
    <AssetPlane url={assets.upper} size={[3.12, 3.12]} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} opacity={opacity * 0.62} speed={speed} reverse />
    <AssetPlane url={assets.glyphBand} size={[2.32, 2.32]} position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} opacity={opacity * 0.42} speed={speed * 1.45} />
  </group>;
}

function VerticalRunes({ elapsed, fps, opacity }: { elapsed: number; fps: number; opacity: number }) {
  return <>{Array.from({ length: 6 }, (_, index) => {
    const angle = index / 6 * Math.PI * 2;
    const radius = 1.48;
    return <group key={index} position={[Math.cos(angle) * radius, 1.38 + Math.sin(elapsed * 0.7 + index) * 0.07, Math.sin(angle) * radius]} rotation={[0, -angle + Math.PI / 2, 0]}>
      <AtlasPlane url={assets.runeChains} position={[0, 0, 0]} size={[0.72, 1.42]} fps={fps} elapsed={elapsed} opacity={opacity * 0.66} frameOverride={index % 8} />
    </group>;
  })}</>;
}

function OrbitNodes({ elapsed, opacity, speed }: { elapsed: number; opacity: number; speed: number }) {
  return <>{Array.from({ length: 8 }, (_, index) => {
    const angle = index / 8 * Math.PI * 2 + elapsed * speed * (index % 2 ? -1 : 1);
    const radius = 1.15 + (index % 2) * 0.52;
    return <AtlasPlane key={index} url={assets.nodes} position={[Math.cos(angle) * radius, 0.78 + (index % 3) * 0.42 + Math.sin(elapsed + index) * 0.06, Math.sin(angle) * radius]} size={[0.42, 0.42]} fps={1} elapsed={elapsed} opacity={opacity * 0.9} rotation={[0, -angle + Math.PI / 2, 0]} frameOverride={index} />;
  })}</>;
}

function SpiritFlames({ elapsed, fps, opacity }: { elapsed: number; fps: number; opacity: number }) {
  return <>{Array.from({ length: 5 }, (_, index) => {
    const angle = index / 5 * Math.PI * 2;
    return <group key={index} position={[Math.cos(angle) * 2.05, 0.64 + Math.sin(elapsed * 0.8 + index) * 0.1, Math.sin(angle) * 2.05]} rotation={[0, -angle + Math.PI / 2, 0]}>
      <AtlasPlane url={assets.flame} position={[0, 0, 0]} size={[0.76, 0.76]} fps={fps} elapsed={elapsed} opacity={opacity * 0.72} phase={index * 0.13} />
    </group>;
  })}</>;
}

function EnergyRibbons({ elapsed, fps, opacity, speed }: { elapsed: number; fps: number; opacity: number; speed: number }) {
  return <>{[0, 1, 2].map(index => {
    const angle = elapsed * speed * (0.9 + index * 0.13) + index * Math.PI * 2 / 3;
    return <group key={index} position={[Math.cos(angle) * 0.72, 1.18 + index * 0.35, Math.sin(angle) * 0.72]} rotation={[0, -angle + Math.PI / 2, index % 2 ? -0.12 : 0.12]}>
      <AtlasPlane url={assets.ribbon} position={[0, 0, 0]} size={[1.42, 1.42]} fps={fps} elapsed={elapsed} opacity={opacity * 0.48} phase={index * 0.11} />
    </group>;
  })}</>;
}

function FloatingFragments({ elapsed, opacity, speed }: { elapsed: number; opacity: number; speed: number }) {
  const mesh = useRef<InstancedMesh>(null);
  useFrame(() => {
    if (!mesh.current) return;
    const dummy = new Object3D();
    for (let index = 0; index < 12; index += 1) {
      const angle = index / 12 * Math.PI * 2 + elapsed * speed * (index % 2 ? -0.07 : 0.09);
      const radius = 1.2 + (index % 3) * 0.42;
      dummy.position.set(Math.cos(angle) * radius, 0.38 + (index % 4) * 0.43 + Math.sin(elapsed + index) * 0.08, Math.sin(angle) * radius);
      dummy.rotation.set(elapsed * 0.15, -angle, elapsed * 0.2);
      dummy.scale.setScalar(0.7 + index % 2 * 0.5);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[undefined, undefined, 12]}>
    <octahedronGeometry args={[0.055, 0]} />
    <meshBasicMaterial color="#cbb886" transparent opacity={opacity * 0.66} blending={AdditiveBlending} depthWrite={false} />
  </instancedMesh>;
}

function Dust({ count, opacity, speed }: { count: number; opacity: number; speed: number }) {
  const points = useRef<Points>(null);
  const positions = useMemo(() => new Float32Array(Array.from({ length: count * 3 }, (_, i) => {
    const seed = Math.sin((i + 1) * 91.17) * 43758.5453 % 1;
    return i % 3 === 1 ? Math.abs(seed) * 3.5 : seed * 4.6;
  })), [count]);
  useFrame((_state, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.035 * speed;
  });
  return <points ref={points} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color="#d7c28c" size={0.025} transparent opacity={opacity * 0.52} depthWrite={false} blending={AdditiveBlending} />
  </points>;
}

function ActivationClock({ paused, speed, epoch, onTick }: { paused: boolean; speed: number; epoch: number; onTick: (elapsed: number) => void }) {
  const preview = epoch === 0 && new URLSearchParams(location.search).get('activated') === '1' ? 10 : 0;
  const elapsed = useRef(preview);
  const committed = useRef(preview);
  const lastTime = useRef(performance.now());
  useEffect(() => {
    elapsed.current = preview;
    committed.current = preview;
    lastTime.current = performance.now();
    onTick(preview);
  }, [epoch, onTick, preview]);
  useFrame(() => {
    const now = performance.now();
    const delta = (now - lastTime.current) / 1000;
    lastTime.current = now;
    if (!paused) elapsed.current += delta * speed;
    if (elapsed.current - committed.current >= 1 / 30 || paused) {
      committed.current = elapsed.current;
      onTick(elapsed.current);
    }
  });
  return null;
}

function CameraResponse({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  useFrame(({ camera }, delta) => {
    camera.position.x = MathUtils.damp(camera.position.x, pointer.current.x * 0.28, 2.2, delta);
    camera.position.y = MathUtils.damp(camera.position.y, 3.2 + pointer.current.y * 0.15, 2.2, delta);
    camera.lookAt(0, 1.05, 0);
  });
  return null;
}

function Telemetry({ elapsed, fps, onTelemetry }: { elapsed: number; fps: number; onTelemetry: (value: Telemetry) => void }) {
  const { gl } = useThree();
  const sample = useRef({ time: performance.now(), frames: 0 });
  useFrame(() => {
    sample.current.frames += 1;
    const now = performance.now();
    if (now - sample.current.time > 500) {
      const sequence = elapsed < 4 ? 'mist · rings · core' : elapsed < 8.8 ? 'runes · flame · discharge' : 'core · ribbon · flame · mist';
      onTelemetry({
        fps: Math.round(sample.current.frames * 1000 / (now - sample.current.time)),
        calls: gl.info.render.calls,
        frame: Math.floor(elapsed * fps) % 8,
        activation: Math.min(1, elapsed / 8.8),
        sequence,
      });
      sample.current = { time: now, frames: 0 };
    }
  });
  return null;
}

function FormationScene({ controls, epoch, hovered, pointer, onHover, onTelemetry }: {
  controls: Controls;
  epoch: number;
  hovered: boolean;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  onHover: (value: boolean) => void;
  onTelemetry: (value: Telemetry) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const ease = (start: number, duration = 0.9) => MathUtils.smoothstep((elapsed - start) / duration, 0, 1);
  const mistOpacity = ease(0.25, 1.2);
  const fragmentsOpacity = ease(0.8, 0.9);
  const outerOpacity = ease(1.45, 1.1);
  const coreOpacity = ease(3.55, 0.95);
  const orbitOpacity = ease(4.75, 0.9);
  const upperOpacity = ease(5.45, 1.05);
  const verticalOpacity = ease(6.05, 0.95);
  const nodesOpacity = ease(6.65, 0.95);
  const ribbonsOpacity = ease(7.15, 1.0);
  const dischargeAge = elapsed - 7.85;
  const dischargeOpacity = dischargeAge >= 0 && dischargeAge < 1.25 ? Math.sin(dischargeAge / 1.25 * Math.PI) : 0;
  const glow = controls.glow * (hovered ? 1.08 : 1) * (0.92 + Math.sin(elapsed * 1.15) * 0.06);
  const speed = controls.paused ? 0 : controls.formationSpeed;

  return <>
    <color attach="background" args={['#02070c']} />
    <fog attach="fog" args={['#061018', 7, 14]} />
    <CameraResponse pointer={pointer} />
    <ActivationClock paused={controls.paused} speed={controls.formationSpeed} epoch={epoch} onTick={setElapsed} />
    <Telemetry elapsed={elapsed} fps={controls.sequenceFps} onTelemetry={onTelemetry} />
    <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3.45, 96]} />
      <meshBasicMaterial color="#040b10" />
    </mesh>
    <group onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)}>
      {controls.layers.groundRings && <GroundFormation controls={controls} elapsed={elapsed} opacity={outerOpacity * glow} speed={speed} />}
      {controls.layers.core && <>
        <AtlasPlane url={assets.runePulse} position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]} size={[2.05, 2.05]} fps={controls.sequenceFps} elapsed={elapsed} opacity={coreOpacity * glow * 0.38} />
        <AtlasPlane url={assets.core} position={[0, 1.35, 0]} size={[1.34, 1.34]} fps={controls.sequenceFps} elapsed={elapsed} opacity={coreOpacity * glow * 0.9} />
        {dischargeOpacity > 0 && <AtlasPlane url={assets.activation} position={[0, 1.35, 0]} size={[2.5, 2.5]} fps={controls.sequenceFps} elapsed={dischargeAge} opacity={dischargeOpacity * glow * 0.9} />}
      </>}
      {controls.layers.runes && <VerticalRunes elapsed={elapsed} fps={controls.sequenceFps} opacity={verticalOpacity * glow} />}
      {controls.layers.nodes && <OrbitNodes elapsed={elapsed} opacity={nodesOpacity} speed={0.22 * controls.orbitSpeed * speed} />}
      {controls.layers.ribbons && <EnergyRibbons elapsed={elapsed} fps={controls.sequenceFps} opacity={ribbonsOpacity * glow} speed={0.2 * controls.orbitSpeed * speed} />}
      {controls.layers.flames && <SpiritFlames elapsed={elapsed} fps={controls.sequenceFps} opacity={nodesOpacity * glow} />}
      {controls.layers.upperArray && <>
        <TiltedOrbit elapsed={elapsed} opacity={orbitOpacity} speed={0.13 * controls.orbitSpeed * speed} />
        <UpperFormation elapsed={elapsed} opacity={upperOpacity * glow} speed={0.03 * controls.upperSpeed * speed} />
      </>}
      {controls.layers.mist && <>
        <AtlasPlane url={assets.mist} position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, elapsed * 0.025]} size={[5.1, 5.1]} fps={Math.max(3, controls.sequenceFps * 0.55)} elapsed={elapsed} opacity={mistOpacity * controls.mist * 0.2} />
        <AtlasPlane url={assets.ribbon} position={[0, 1.05, -0.9]} size={[3.0, 3.0]} fps={Math.max(3, controls.sequenceFps * 0.55)} elapsed={elapsed} opacity={ribbonsOpacity * controls.mist * 0.1} />
      </>}
      {controls.layers.particles && <>
        <FloatingFragments elapsed={elapsed} opacity={fragmentsOpacity * glow} speed={speed} />
        <Dust count={Math.max(20, Math.round(controls.particleAmount))} opacity={fragmentsOpacity} speed={speed} />
        <Sparkles count={Math.round(controls.particleAmount * 0.32)} scale={[5.2, 3.7, 5.2]} size={1.15} speed={0.12 * speed} opacity={fragmentsOpacity * 0.3} color="#c0d6cf" />
      </>}
    </group>
  </>;
}

const initialLayers: Record<LayerKey, boolean> = {
  groundRings: true,
  upperArray: true,
  runes: true,
  nodes: true,
  ribbons: true,
  flames: true,
  particles: true,
  mist: true,
  core: true,
};

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return <label className="formation-panel__slider"><span>{label}</span><output>{value.toFixed(step < 1 ? 1 : 0)}</output><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
}

export function FormationDemo() {
  const [epoch, setEpoch] = useState(0);
  const [hovered, setHovered] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });
  const [telemetry, setTelemetry] = useState<Telemetry>({ fps: 0, calls: 0, frame: 0, activation: 0, sequence: 'loading' });
  const [controls, setControls] = useState<Controls>({
    paused: false,
    formationSpeed: 1,
    outerSpeed: 1,
    secondarySpeed: 1,
    innerSpeed: 1,
    upperSpeed: 1,
    orbitSpeed: 1,
    particleAmount: 150,
    glow: 1,
    mist: 1,
    sequenceFps: 8,
    layers: initialLayers,
  });
  const update = <K extends keyof Controls>(key: K, value: Controls[K]) => setControls(current => ({ ...current, [key]: value }));
  const toggleLayer = (key: LayerKey) => setControls(current => ({ ...current, layers: { ...current.layers, [key]: !current.layers[key] } }));

  return <main className="formation-demo" onPointerMove={event => {
    pointer.current.x = event.clientX / innerWidth * 2 - 1;
    pointer.current.y = -(event.clientY / innerHeight * 2 - 1);
  }}>
    <div className="formation-demo__backdrop" aria-hidden="true" />
    <header className="formation-demo__title">
      <p>LOCAL VFX PROTOTYPE · 法陣</p>
      <h1>Huyền Trận Thí Nghiệm</h1>
      <span>Asset-driven formation · activation · eight-frame VFX</span>
    </header>
    <div className="formation-demo__canvas" aria-label="Mô phỏng pháp trận tu tiên ba chiều">
      <Canvas camera={{ position: [0, 3.2, 7.7], fov: 42, near: 0.1, far: 30 }} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}>
        <Suspense fallback={null}><FormationScene controls={controls} epoch={epoch} hovered={hovered} pointer={pointer} onHover={setHovered} onTelemetry={setTelemetry} /></Suspense>
      </Canvas>
    </div>
    <aside className="formation-panel" aria-label="Điều khiển thử nghiệm pháp trận">
      <div className="formation-panel__heading"><strong>FORMATION LAB</strong><span>{controls.paused ? 'PAUSED' : telemetry.activation < 1 ? 'ACTIVATING' : 'IDLE LOOP'}</span></div>
      <div className="formation-panel__actions">
        <button onClick={() => setEpoch(value => value + 1)}>Replay activation</button>
        <button onClick={() => update('paused', !controls.paused)}>{controls.paused ? 'Resume' : 'Pause'}</button>
      </div>
      <Slider label="Formation speed" value={controls.formationSpeed} min={0.25} max={2} step={0.05} onChange={value => update('formationSpeed', value)} />
      <Slider label="Outer ring" value={controls.outerSpeed} min={0} max={2} step={0.05} onChange={value => update('outerSpeed', value)} />
      <Slider label="Secondary ring" value={controls.secondarySpeed} min={0} max={2} step={0.05} onChange={value => update('secondarySpeed', value)} />
      <Slider label="Inner ring" value={controls.innerSpeed} min={0} max={2} step={0.05} onChange={value => update('innerSpeed', value)} />
      <Slider label="Upper formation" value={controls.upperSpeed} min={0} max={2} step={0.05} onChange={value => update('upperSpeed', value)} />
      <Slider label="Orbit speed" value={controls.orbitSpeed} min={0} max={2} step={0.05} onChange={value => update('orbitSpeed', value)} />
      <Slider label="Sequence FPS" value={controls.sequenceFps} min={3} max={14} step={1} onChange={value => update('sequenceFps', value)} />
      <Slider label="Glow" value={controls.glow} min={0.35} max={1.5} step={0.05} onChange={value => update('glow', value)} />
      <Slider label="Mist" value={controls.mist} min={0} max={1.8} step={0.05} onChange={value => update('mist', value)} />
      <Slider label="Particles" value={controls.particleAmount} min={20} max={300} step={10} onChange={value => update('particleAmount', value)} />
      <fieldset><legend>Layers</legend><div className="formation-panel__layers">{(Object.keys(controls.layers) as LayerKey[]).map(key => <label key={key}><input type="checkbox" checked={controls.layers[key]} onChange={() => toggleLayer(key)} />{key.replace(/([A-Z])/g, ' $1')}</label>)}</div></fieldset>
      <dl className="formation-panel__telemetry"><div><dt>FPS</dt><dd>{telemetry.fps}</dd></div><div><dt>Draw calls</dt><dd>{telemetry.calls}</dd></div><div><dt>Atlas frame</dt><dd>{telemetry.frame + 1} / 8</dd></div><div><dt>Sequence</dt><dd>{telemetry.sequence}</dd></div></dl>
    </aside>
    <p className="formation-demo__note">Development-only route · không thuộc navigation chính</p>
  </main>;
}
