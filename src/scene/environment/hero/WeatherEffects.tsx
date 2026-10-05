import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, LineBasicMaterial, Mesh, MeshBasicMaterial } from 'three';
import { useEnvironment } from '../../../features/environment';

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 78.233 + salt * 19.71) * 43758.5453;
  return value - Math.floor(value);
}

export function RainSystem({ active, mobile }: { active: boolean; mobile: boolean }) {
  const { values } = useEnvironment();
  const geometry = useMemo(() => {
    const count = mobile ? 150 : 420;
    const positions = new Float32Array(count * 6);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      seeds[i * 3] = seeded(i, 1);
      seeds[i * 3 + 1] = seeded(i, 2);
      seeds[i * 3 + 2] = seeded(i, 3);
    }
    const next = new BufferGeometry();
    next.setAttribute('position', new BufferAttribute(positions, 3));
    next.userData.seeds = seeds;
    return next;
  }, [mobile]);
  const material = useMemo(() => new LineBasicMaterial({
    color: '#b9ced8', transparent: true, depthWrite: false, opacity: 0,
    blending: AdditiveBlending,
  }), []);
  const elapsed = useRef(0);
  const { viewport } = useThree();

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((_state, delta) => {
    if (!active) return;
    elapsed.current += Math.min(delta, 0.06);
    const positions = geometry.getAttribute('position') as BufferAttribute;
    const seeds = geometry.userData.seeds as Float32Array;
    const rain = values.rain;
    const wind = values.wind;
    const width = viewport.width * 1.22;
    const height = viewport.height * 1.18;
    const fallSpeed = 0.22 + rain * 0.68;
    const slant = 0.035 + wind * 0.16;
    const streak = 0.035 + rain * 0.11;
    for (let i = 0; i < positions.count / 2; i += 1) {
      const seedX = seeds[i * 3];
      const seedY = seeds[i * 3 + 1];
      const seedSpeed = seeds[i * 3 + 2];
      const progress = (seedY + elapsed.current * fallSpeed * (0.72 + seedSpeed * 0.58)) % 1;
      const y = height * (0.5 - progress);
      const x = width * (seedX - 0.5) + progress * width * slant;
      const index = i * 2;
      positions.setXYZ(index, x, y, 3.4);
      positions.setXYZ(index + 1, x - streak * (0.25 + wind), y + streak, 3.4);
    }
    positions.needsUpdate = true;
    material.opacity = Math.max(0, rain - 0.035) * (mobile ? 0.34 : 0.48);
  });

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} renderOrder={18} />;
}

export function ThunderPulse({ active, mobile }: { active: boolean; mobile: boolean }) {
  const { values } = useEnvironment();
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const elapsed = useRef(0);
  const nextPulse = useRef(5.6);
  const pulseStart = useRef(-10);
  const { viewport } = useThree();

  useFrame((_state, delta) => {
    if (!active || !material.current) return;
    elapsed.current += Math.min(delta, 0.08);
    if (values.lightning > 0.18 && elapsed.current >= nextPulse.current) {
      pulseStart.current = elapsed.current;
      nextPulse.current = elapsed.current + 7 + Math.random() * 11;
    }
    const age = elapsed.current - pulseStart.current;
    const first = Math.exp(-Math.pow((age - 0.12) / 0.11, 2));
    const echo = Math.exp(-Math.pow((age - 0.52) / 0.18, 2)) * 0.34;
    material.current.opacity = (first + echo) * values.lightning * (mobile ? 0.11 : 0.17);
  });

  return <mesh ref={mesh} position={[viewport.width * 0.18, viewport.height * 0.16, 3.2]} renderOrder={17}>
    <planeGeometry args={[viewport.width * 0.95, viewport.height * 0.72]} />
    <meshBasicMaterial ref={material} color="#c9e0ed" transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
  </mesh>;
}

export function WeatherEffects({ active, mobile }: { active: boolean; mobile: boolean }) {
  return <>
    <RainSystem active={active} mobile={mobile} />
    <ThunderPulse active={active} mobile={mobile} />
  </>;
}
