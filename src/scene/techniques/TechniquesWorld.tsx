import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Group, MathUtils, Points, PointsMaterial } from 'three';
import { useEnvironment } from '../../features/environment';
import type { TechniquesSceneProps } from '../../types/skills';

const artifactPointerAngles = [2.34, 1.88, 1.83, 1.47, -2.76, -0.68] as const;

function Formation({ active, selected, mobile }: Pick<TechniquesSceneProps, 'active' | 'selected' | 'mobile'>) {
  const group = useRef<Group>(null);
  const glow = useRef<Group>(null);
  const environment = useEnvironment();
  useFrame(({ clock }, delta) => {
    if (!group.current || !glow.current) return;
    const energy = active ? 1 : 0;
    group.current.rotation.z += delta * (0.025 + environment.values.wind * 0.018) * energy;
    const targetRotation = artifactPointerAngles[selected] - selected * Math.PI / 3;
    const rotationDelta = Math.atan2(
      Math.sin(targetRotation - glow.current.rotation.z),
      Math.cos(targetRotation - glow.current.rotation.z),
    );
    glow.current.rotation.z += rotationDelta * (1 - Math.exp(-6 * delta)) * energy;
    const pulse = 0.92 + Math.sin(clock.elapsedTime * 0.7 + selected * 0.4) * 0.025;
    glow.current.scale.setScalar(pulse);
  });
  const x = mobile ? 0.8 : 1.25;
  return <group position={[x, mobile ? 0.45 : 0.15, 0]} rotation={[0.08, -0.1, 0]}>
    <group ref={group}>
      <mesh><torusGeometry args={[2.25, 0.012, 4, 96]} /><meshBasicMaterial color="#7fa992" transparent opacity={0.28 + environment.values.moonlight * 0.12} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 3]}><torusGeometry args={[1.72, 0.008, 4, 64]} /><meshBasicMaterial color="#b59a62" transparent opacity={0.25} /></mesh>
    </group>
    <group ref={glow} rotation={[0, 0, Math.PI / 6]}>
      <mesh
        position={[Math.cos(selected * Math.PI / 3) * .86, Math.sin(selected * Math.PI / 3) * .86, -0.01]}
        rotation={[0, 0, selected * Math.PI / 3]}
      >
        <planeGeometry args={[1.62, 0.012]} />
        <meshBasicMaterial color="#cdb272" transparent opacity={0.28} blending={AdditiveBlending} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map(index => <mesh key={index} position={[Math.cos(index * Math.PI / 3) * 1.72, Math.sin(index * Math.PI / 3) * 1.72, 0]}>
        <circleGeometry args={[index === selected ? 0.075 : 0.038, 10]} />
        <meshBasicMaterial color={index === selected ? '#d1b777' : '#789889'} transparent opacity={index === selected ? 0.78 : 0.32} blending={AdditiveBlending} />
      </mesh>)}
    </group>
  </group>;
}

function Atmosphere({ active, mobile }: Pick<TechniquesSceneProps, 'active' | 'mobile'>) {
  const points = useRef<Points>(null);
  const environment = useEnvironment();
  const geometry = useMemo(() => {
    const count = mobile ? 24 : 52;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = ((i * 47) % 101) / 11 - 4.5;
      positions[i * 3 + 1] = ((i * 29) % 97) / 12 - 3.5;
      positions[i * 3 + 2] = ((i * 13) % 31) / 20;
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(positions, 3));
    return result;
  }, [mobile]);
  useFrame((_state, delta) => {
    if (!points.current || !active) return;
    const material = points.current.material as PointsMaterial;
    points.current.rotation.z += delta * (0.004 + environment.values.wind * 0.008);
    points.current.position.x = MathUtils.damp(points.current.position.x, environment.values.windDirection * 0.16, 2, delta);
    material.opacity = MathUtils.damp(material.opacity, 0.1 + environment.values.fog * 0.18 + environment.values.rain * 0.08, 3, delta);
  });
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <points ref={points} geometry={geometry}><pointsMaterial color="#c4b37d" size={mobile ? 0.018 : 0.024} transparent opacity={0.16} depthWrite={false} blending={AdditiveBlending} /></points>;
}

export function TechniquesWorld(props: TechniquesSceneProps) {
  const { invalidate } = useThree();
  const environment = useEnvironment();
  useEffect(() => { props.onReady(); }, [props.onReady]);
  useEffect(() => {
    if (!props.active || environment.paused) return;
    let frame = 0;
    const tick = () => { invalidate(); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [props.active, environment.paused, invalidate]);
  useEffect(() => invalidate(), [props.selected, environment.values, invalidate]);
  return <><Formation active={props.active} selected={props.selected} mobile={props.mobile} /><Atmosphere active={props.active} mobile={props.mobile} /></>;
}
