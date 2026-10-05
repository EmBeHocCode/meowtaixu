import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, ShaderMaterial } from 'three';

export function SpiritMotes({ mobile }: { mobile: boolean }) {
  const points = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);
  const positions = useMemo(() => {
    const count = mobile ? 8 : 26;
    return new Float32Array(Array.from({ length: count * 3 }, (_, i) => {
      const n = Math.sin((i + 1) * 127.1) * 43758.5453;
      const seed = n - Math.floor(n);
      return i % 3 === 0 ? (seed - 0.5) * 13 : i % 3 === 1 ? (seed - 0.5) * 5 : seed * 1.8 + 1;
    }));
  }, [mobile]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_state, delta) => {
    if (material.current) material.current.uniforms.uTime.value += Math.min(delta, 0.08);
  });
  return <points ref={points} frustumCulled={false} renderOrder={14}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <shaderMaterial ref={material} transparent depthWrite={false} toneMapped={false} uniforms={uniforms}
      vertexShader={`uniform float uTime; varying float vAlpha;
        void main(){ vec3 p=position; p.y += sin(uTime*0.12+position.x)*0.12; p.x += sin(uTime*0.055+position.y)*0.08;
        vAlpha=0.16+0.15*(0.5+0.5*sin(uTime*0.35+position.x*3.0));
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); gl_PointSize=2.2; }`}
      fragmentShader={`varying float vAlpha; void main(){vec2 p=abs(gl_PointCoord-0.5)*2.0;
        float a=max(0.0,1.0-p.x-p.y); gl_FragColor=vec4(0.72,0.63,0.43,a*vAlpha);}`}
    />
  </points>;
}
