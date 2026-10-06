import { Line, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, MathUtils, Mesh, MeshBasicMaterial, ShaderMaterial, SRGBColorSpace } from 'three';
import { expertiseDisciplines } from '../../data/expertise';
import { heroAssets } from '../../data/hero-assets';
import type { ExpertiseSceneProps } from '../../types/expertise';
import { ExpertiseCameraRig } from '../camera/ExpertiseCameraRig';
import { useEnvironment } from '../../features/environment';

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
  const glow = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const glowMaterial = useRef<MeshBasicMaterial>(null);
  const time = useRef(index * 1.4);
  const { viewport } = useThree();
  const image = texture.image as { width: number; height: number };
  const ratio = image.width / image.height;
  const point = DESKTOP[index];
  const selectedNow = selected === index;
  const height = mobile ? viewport.height * (selectedNow ? 0.64 : 0.1) : viewport.height * point.h;
  const width = height * ratio;
  const x = mobile
    ? (index - selected) * viewport.width * 0.34
    : viewport.width * point.x;
  const y = mobile ? -viewport.height * 0.06 : viewport.height * point.y;
  const targetOpacity = mobile ? 0 : (selectedNow ? 1 : 0.68);

  useFrame((_state, delta) => {
    if (!mesh.current || !glow.current || !material.current || !glowMaterial.current) return;
    time.current += Math.min(delta, 0.08);
    const drift = active ? Math.sin(time.current * 0.38 + point.phase) * viewport.height * 0.005 : 0;
    mesh.current.position.y = y + drift;
    mesh.current.position.z = point.z + (selectedNow ? 0.72 : 0);
    glow.current.position.copy(mesh.current.position);
    const focus = selectedNow ? (mobile ? 1.12 : 1.075) : 1;
    mesh.current.scale.x = MathUtils.damp(mesh.current.scale.x, focus, 4, delta);
    mesh.current.scale.y = MathUtils.damp(mesh.current.scale.y, focus, 4, delta);
    const glowScale = selectedNow ? (mobile ? 1.22 : 1.13) : 1.02;
    glow.current.scale.x = MathUtils.damp(glow.current.scale.x, glowScale, 4, delta);
    glow.current.scale.y = MathUtils.damp(glow.current.scale.y, glowScale, 4, delta);
    material.current.opacity = MathUtils.damp(material.current.opacity, active ? targetOpacity : 0.16, 4, delta);
    glowMaterial.current.opacity = MathUtils.damp(glowMaterial.current.opacity, active && selectedNow && !mobile ? 0.28 : 0, 4, delta);
    material.current.color.set(selectedNow ? '#fff9e9' : '#b6c0c2');
  });

  const renderOrder = selectedNow ? 29 : 20 + index;
  return <>
    <mesh ref={mesh} position={[x, y, point.z]} renderOrder={renderOrder}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={material} map={texture} transparent depthWrite={false} toneMapped={false} opacity={0} />
    </mesh>
    <mesh ref={glow} position={[x, y, point.z]} renderOrder={renderOrder + 1}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={glowMaterial} map={texture} color="#ead49a" transparent depthWrite={false} toneMapped={false} opacity={0} blending={AdditiveBlending} />
    </mesh>
  </>;
}

function GroundMist({ active, mobile }: Pick<ExpertiseSceneProps, 'active' | 'mobile'>) {
  const environment = useEnvironment();
  const texture = useTexture(heroAssets.fog);
  texture.colorSpace = SRGBColorSpace;
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const { viewport } = useThree();
  const time = useRef(0);
  useFrame((_state, delta) => {
    if (!mesh.current || !material.current) return;
    time.current += Math.min(delta, 0.08);
    material.current.uniforms.uTime.value = time.current;
    material.current.uniforms.uWind.value = environment.values.wind;
    material.current.uniforms.uOpacity.value = MathUtils.damp(
      material.current.uniforms.uOpacity.value,
      active ? (mobile ? 0.15 : 0.2) + environment.values.fog * 0.14 : 0.04,
      2.5,
      delta,
    );
  });
  return <mesh ref={mesh} position={[0, -viewport.height * 0.34, 1.3]} renderOrder={30}>
    <planeGeometry args={[viewport.width * 1.35, viewport.height * 0.5]} />
    <shaderMaterial ref={material} transparent depthWrite={false} toneMapped={false}
      uniforms={{ uMap: { value: texture }, uTime: { value: 0 }, uWind: { value: 0.1 }, uOpacity: { value: 0.08 } }}
      vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
      fragmentShader={`
        varying vec2 vUv;
        uniform sampler2D uMap;
        uniform float uTime;
        uniform float uWind;
        uniform float uOpacity;
        void main(){
          vec2 uv=vUv;
          uv.x += sin(uTime*(0.1+uWind*0.2)+vUv.y*5.0)*(.018+uWind*.018);
          uv.y += sin(uTime*.07+vUv.x*3.6)*.006;
          vec4 texel=texture2D(uMap,clamp(uv,0.0,1.0));
          float feather=smoothstep(0.0,.18,vUv.x)*smoothstep(0.0,.18,1.0-vUv.x)*smoothstep(0.0,.12,vUv.y)*smoothstep(0.0,.12,1.0-vUv.y);
          gl_FragColor=vec4(texel.rgb*.82,texel.a*uOpacity*feather);
        }
      `} />
  </mesh>;
}

function EnergyThreads({ active, mobile }: Pick<ExpertiseSceneProps, 'active' | 'mobile'>) {
  const { viewport } = useThree();
  const points = useMemo(() => mobile ? [] : DESKTOP.map((p) => [viewport.width * p.x, viewport.height * p.y, -0.7] as [number, number, number]), [mobile, viewport.width, viewport.height]);
  if (mobile) return null;
  return <Line points={[points[0], points[1], points[3], points[2], points[1]]} color="#c9aa68" transparent opacity={active ? 0.13 : 0.03} lineWidth={0.45} depthWrite={false} />;
}

function FrameBudget({ active, mobile }: Pick<ExpertiseSceneProps, 'active' | 'mobile'>) {
  const environment = useEnvironment();
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    if (!active || environment.paused) return;
    const timer = window.setInterval(invalidate, 1000 / (mobile ? 18 : 28));
    return () => window.clearInterval(timer);
  }, [active, mobile, invalidate, environment.paused]);
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
