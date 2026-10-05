import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { heroAssets } from '../../data/hero-assets';
import type { HeroSceneProps } from '../../types/hero';
import { HeroCameraRig } from '../camera/HeroCameraRig';
import { SpiritMotes } from '../particles/SpiritMotes';

type LayerProps = Pick<HeroSceneProps, 'mobile' | 'motion'> & {
  url: string; z: number; opacity?: number; color?: string; fog?: number; align?: number;
};

function LandscapeLayer({ url, z, motion, opacity = 1, color = '#ffffff', fog = 0, align = 0.5 }: LayerProps) {
  const texture = useTexture(url);
  texture.colorSpace = SRGBColorSpace;
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
  useFrame((_state, delta) => {
    if (!fog || !mesh.current || !material.current) return;
    time.current += Math.min(delta, 0.08);
    mesh.current.position.x = x + Math.sin(time.current * 0.045 + fog) * width * 0.018;
    mesh.current.position.y = -height * 0.14 + Math.sin(time.current * 0.028 + fog) * height * 0.007;
    material.current.opacity = opacity + motion.current.scroll * 0.07;
  });
  return <mesh ref={mesh} position={[x, fog ? -height * 0.14 : 0, z]} renderOrder={z + 10}>
    <planeGeometry args={[coverWidth, coverHeight]} />
    <meshBasicMaterial ref={material} map={texture} transparent depthWrite={false} toneMapped={false} opacity={opacity} color={color} />
  </mesh>;
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
  useTexture([mobile ? heroAssets.mobileFar : heroAssets.far, heroAssets.mid, heroAssets.near, heroAssets.moon, heroAssets.fog]);
  const gl = useThree(state => state.gl);
  useEffect(() => {
    gl.domElement.dataset.heroLayers = 'ready';
    onReady();
  }, [gl, onReady]);

  return <>
    <FrameBudget active={active} mobile={mobile} />
    <HeroCameraRig motion={motion} mobile={mobile} />
    <LandscapeLayer url={mobile ? heroAssets.mobileFar : heroAssets.far} z={-6} mobile={mobile} motion={motion} color="#bcc7d0" align={mobile ? 0.62 : 0.5} />
    <Moon mobile={mobile} />
    <LandscapeLayer url={heroAssets.mid} z={-1} mobile={mobile} motion={motion} color="#b5c1cd" align={mobile ? 0.94 : 0.5} />
    <LandscapeLayer url={heroAssets.fog} z={0} mobile={mobile} motion={motion} opacity={mobile ? 0.12 : 0.2} fog={1} />
    <LandscapeLayer url={heroAssets.near} z={1.5} mobile={mobile} motion={motion} color="#889aa8" align={mobile ? 0.72 : 0.5} />
    {!mobile && <LandscapeLayer url={heroAssets.fog} z={2} mobile={mobile} motion={motion} opacity={0.09} fog={2} />}
    <SpiritMotes mobile={mobile} />
  </>;
}
