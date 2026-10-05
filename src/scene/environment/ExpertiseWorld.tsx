import { Line, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { expertiseDisciplines } from '../../data/expertise';
import { heroAssets } from '../../data/hero-assets';
import type { ExpertiseSceneProps } from '../../types/expertise';
import { ExpertiseCameraRig } from '../camera/ExpertiseCameraRig';

const DESKTOP = [
  { x: 0.08, y: 0.18, h: 0.43, z: -0.5, phase: 0.2 },
  { x: 0.27, y: 0.01, h: 0.5, z: 0.35, phase: 1.7 },
  { x: 0.39, y: 0.2, h: 0.26, z: -0.15, phase: 3.2 },
  { x: 0.28, y: -0.27, h: 0.24, z: 0.75, phase: 4.8 },
] as const;

function Artifact({ index, active, mobile, selected }: ExpertiseSceneProps & { index: number }) {
  const texture = useTexture(expertiseDisciplines[index].asset);
  texture.colorSpace = SRGBColorSpace;
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const time = useRef(index * 1.4);
  const { viewport } = useThree();
  const image = texture.image as { width: number; height: number };
  const ratio = image.width / image.height;
  const point = DESKTOP[index];
  const selectedNow = selected === index;
  const height = mobile ? viewport.height * (selectedNow ? 0.42 : 0.15) : viewport.height * point.h;
  const width = height * ratio;
  const x = mobile
    ? (index - selected) * viewport.width * 0.34
    : viewport.width * point.x;
  const y = mobile ? -viewport.height * 0.06 : viewport.height * point.y;
  const targetOpacity = mobile ? (selectedNow ? 0.96 : 0.12) : (selectedNow ? 1 : 0.58);

  useFrame((_state, delta) => {
    if (!mesh.current || !material.current) return;
    time.current += Math.min(delta, 0.08);
    const drift = active ? Math.sin(time.current * 0.38 + point.phase) * viewport.height * 0.005 : 0;
    mesh.current.position.y = y + drift;
    mesh.current.position.z = point.z + (selectedNow ? 0.32 : 0);
    const focus = selectedNow ? 1.045 : 1;
    mesh.current.scale.x = MathUtils.damp(mesh.current.scale.x, focus, 4, delta);
    mesh.current.scale.y = MathUtils.damp(mesh.current.scale.y, focus, 4, delta);
    material.current.opacity = MathUtils.damp(material.current.opacity, active ? targetOpacity : 0.16, 4, delta);
    material.current.color.set(selectedNow ? '#fff4d8' : '#9eabb0');
  });

  return <mesh ref={mesh} position={[x, y, point.z]} renderOrder={20 + index}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial ref={material} map={texture} transparent depthWrite={false} toneMapped={false} opacity={0} />
  </mesh>;
}

function GroundMist({ active, mobile }: Pick<ExpertiseSceneProps, 'active' | 'mobile'>) {
  const texture = useTexture(heroAssets.fog);
  texture.colorSpace = SRGBColorSpace;
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const { viewport } = useThree();
  const time = useRef(0);
  useFrame((_state, delta) => {
    if (!mesh.current || !material.current) return;
    time.current += Math.min(delta, 0.08);
    mesh.current.position.x = Math.sin(time.current * 0.08) * viewport.width * 0.05;
    material.current.opacity = MathUtils.damp(material.current.opacity, active ? (mobile ? 0.1 : 0.16) : 0.05, 2.5, delta);
  });
  return <mesh ref={mesh} position={[0, -viewport.height * 0.34, 1.3]} renderOrder={30}>
    <planeGeometry args={[viewport.width * 1.35, viewport.height * 0.5]} />
    <meshBasicMaterial ref={material} map={texture} transparent depthWrite={false} toneMapped={false} opacity={0.08} color="#8a9ca6" />
  </mesh>;
}

function EnergyThreads({ active, mobile }: Pick<ExpertiseSceneProps, 'active' | 'mobile'>) {
  const { viewport } = useThree();
  const points = useMemo(() => mobile ? [] : DESKTOP.map((p) => [viewport.width * p.x, viewport.height * p.y, -0.7] as [number, number, number]), [mobile, viewport.width, viewport.height]);
  if (mobile) return null;
  return <Line points={[points[0], points[1], points[3], points[2], points[1]]} color="#c9aa68" transparent opacity={active ? 0.13 : 0.03} lineWidth={0.45} depthWrite={false} />;
}

function FrameBudget({ active, mobile }: Pick<ExpertiseSceneProps, 'active' | 'mobile'>) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    if (!active) return;
    const timer = window.setInterval(invalidate, 1000 / (mobile ? 18 : 28));
    return () => window.clearInterval(timer);
  }, [active, mobile, invalidate]);
  return null;
}

export function ExpertiseWorld(props: ExpertiseSceneProps) {
  const { active, mobile, selected, onReady } = props;
  useTexture(expertiseDisciplines.map((item) => item.asset));
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    gl.domElement.dataset.expertiseLayers = 'ready';
    onReady();
  }, [gl, onReady]);

  return <>
    <FrameBudget active={active} mobile={mobile} />
    <ExpertiseCameraRig active={active} mobile={mobile} />
    <EnergyThreads active={active} mobile={mobile} />
    {expertiseDisciplines.map((item, index) => <Artifact key={item.id} {...props} index={index} selected={selected} />)}
    <GroundMist active={active} mobile={mobile} />
  </>;
}
